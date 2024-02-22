/** @typedef {import("@mongosh/shell-api").ShellApi} ShellApi */

{
    const global = /** @type {ShellApi} */ (/** @type {unknown} */ (this));
    const { inspect } = require("util");

    global.disableTelemetry();
    global.config.set("displayBatchSize", 3);
    global.config.set("enableTelemetry", false);
    global.config.set(/** @type {any} */ ("inspectDepth"), 8);
    global.config.set(/** @type {any} */ ("showStackTraces"), false);

    inspect.defaultOptions.maxArrayLength = null;
}
