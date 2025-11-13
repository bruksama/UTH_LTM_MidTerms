// Node-based unit test for Timer class
const assert = require("assert");
const Timer = require("../ui/timer");

(async () => {
  console.log("Starting Timer unit test");
  let ticks = [];
  let ended = false;

  const t = new Timer(
    3,
    (s) => {
      console.log("tick", s);
      ticks.push(s);
    },
    () => {
      console.log("ended");
      ended = true;
    }
  );

  t.start();

  // Wait for 4 seconds to allow timer to finish
  await new Promise((res) => setTimeout(res, 4200));

  try {
    // Expected ticks: initial immediate 3, then 2,1,0 -> array length 4
    assert.strictEqual(ended, true, "Timer did not call end callback");
    assert.strictEqual(
      ticks.length,
      4,
      "Unexpected tick count: " + ticks.length
    );
    assert.deepStrictEqual(ticks, [3, 2, 1, 0]);
    console.log("Timer test passed");
    process.exit(0);
  } catch (err) {
    console.error("Timer test failed:", err.message);
    process.exit(2);
  }
})();
