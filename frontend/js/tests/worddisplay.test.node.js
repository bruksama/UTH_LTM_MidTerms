const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

(async () => {
  console.log("Starting word display unit test (mock DOM)");

  // Minimal mock DOM elements used by GameUI
  const domElements = {};
  function createEl(id) {
    return {
      id,
      classList: {
        _set: new Set(["hidden"]),
        add(cls) {
          this._set.add(cls);
        },
        remove(cls) {
          this._set.delete(cls);
        },
        contains(cls) {
          return this._set.has(cls);
        },
      },
      textContent: "",
    };
  }

  domElements["word-display"] = createEl("word-display");
  domElements["secret-word"] = createEl("secret-word");
  domElements["current-drawer"] = createEl("current-drawer");

  const mockWindow = {
    document: {
      getElementById: (id) => domElements[id] || null,
    },
  };
  // make `window` self-reference available to evaluated script
  mockWindow.window = mockWindow;

  const context = vm.createContext(mockWindow);

  // Load gameUI.js into context
  const gameUIPath = path.resolve(__dirname, "..", "ui", "gameUI.js");
  const gameUISrc = fs.readFileSync(gameUIPath, "utf8");
  try {
    // Wrap the source to attach the GameUI class to the context global
    const wrapper = `(function(){\n${gameUISrc}\n if (typeof GameUI !== 'undefined') { this.GameUI = GameUI; } })();`;
    vm.runInContext(wrapper, context, { filename: gameUIPath });
  } catch (err) {
    console.error("Error evaluating gameUI.js:", (err && err.stack) || err);
    process.exit(2);
  }

  if (typeof context.GameUI !== "function") {
    console.error("GameUI class not found in evaluated context");
    process.exit(2);
  }

  // Create a mock socket that records handlers
  const handlers = {};
  context.mockSocket = {
    on: (event, handler) => {
      handlers[event] = handler;
    },
    emit: () => {},
  };

  // Instantiate GameUI within the context
  vm.runInContext("const ui = new GameUI(mockSocket); this._ui = ui;", context);

  // Call the stored round_started handler as drawer
  const dataDrawer = { is_drawer: true, word: "SECRET_TEST" };
  if (!handlers["round_started"]) {
    console.error("round_started handler not registered");
    process.exit(2);
  }
  await handlers["round_started"].call(context, dataDrawer);

  const wordDisplay = mockWindow.document.getElementById("word-display");
  const secret = mockWindow.document.getElementById("secret-word");

  try {
    assert.ok(wordDisplay, "word-display element missing");
    assert.ok(secret, "secret-word element missing");

    const hasHidden = wordDisplay.classList.contains("hidden");
    assert.strictEqual(
      hasHidden,
      false,
      "word-display should be visible for drawer"
    );
    assert.strictEqual(
      secret.textContent,
      "SECRET_TEST",
      "secret-word text mismatch"
    );

    // Now simulate non-drawer
    const dataViewer = { is_drawer: false, drawer_name: "Alice" };
    await handlers["round_started"].call(context, dataViewer);
    const hiddenAfter = wordDisplay.classList.contains("hidden");
    assert.strictEqual(
      hiddenAfter,
      true,
      "word-display should be hidden for non-drawer"
    );

    console.log("Word display test passed");
    process.exit(0);
  } catch (err) {
    console.error("Word display test failed:", err.message);
    process.exit(2);
  }
})();
