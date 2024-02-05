/**
 * @typedef {import("@mongosh/shell-api").ShellApi} ShellApi
 */

const { logError, logVerbose, logWarning } = require("./log");
const { ls, isDirectory, isFile, isValidJs } = require("./file");
const { resolve, basename } = require("path");

/**
 * @this ShellApi
 * @param {string} modulePath
 */
function loadModule(modulePath) {
    const label = "loadModule";
    if (isFile(modulePath)) {
        loadModuleScript.bind(this)(modulePath);
        return;
    }
    if (isDirectory(modulePath)) {
        loadModuleFolder.bind(this)(modulePath);
        return;
    }
    logWarning(`File "${basename(modulePath)} is invalid."`, label);
}

/**
 * @this ShellApi
 * @param {string} modulePath
 */
function loadModuleScript(modulePath) {
    const label = "loadModule";
    if (typeof this.Mongo !== "function") {
        logError("`this` is not `global` - Module is not loaded.", label);
        return;
    }

    if (!isValidJs(modulePath)) {
        logError(`File ${basename(modulePath)} is not a valid javascript file - Module is not loaded.`, label);
        return;
    }

    const module = require(modulePath);
    Object.entries(module).forEach(assignGlobal.bind(this));
    logVerbose(`Module "${basename(modulePath)}" loaded.`, label);
}

/**
 * @this ShellApi
 * @param {string} modulePath
 */
function loadModuleFolder(modulePath) {
    const label = "loadModule";
    if (typeof this.Mongo !== "function") {
        logError("`this` is not `global` - Module is not loaded.", label);
        return;
    }

    ls(modulePath, isDirectory).forEach(loadModuleFolder.bind(this));
    ls(modulePath, isValidJs).forEach(loadModuleScript.bind(this));
    logVerbose(`Folder "${basename(modulePath)}" loaded.`, label);
    return;
}

/**
 * @this ShellApi
 * @param {[string, unknown]} entry
 */
function assignGlobal(entry) {
    const label = "assignGlobal";
    const [name, value] = entry;
    if (typeof this.Mongo !== "function") {
        logError("`this` is not `global` - Module is not loaded.", label);
        return;
    }
    if (typeof value === "function") {
        Object.assign(this, { [name]: value.bind(this) });
        return;
    }
    Object.assign(this, { [name]: value });
}

/**
 * @this ShellApi
 * @param {string} scriptPath
 */
function loadScript(scriptPath) {
    const label = "loadScript";
    if (typeof this.Mongo !== "function") {
        logError("`this` is not `global` - Module is not loaded.", label);
        return;
    }

    const absolutePath = resolve(scriptPath);
    if (!isFile(absolutePath)) {
        logError(`Path "${scriptPath}" is not a file`, label);
        return;
    }

    try {
        this.load(absolutePath);
        logVerbose(`Script "${basename(absolutePath)} loaded."`, label);
    } catch (error) {
        logError(error, label);
    }
}

/**
 * @this ShellApi
 * @param {string} folderPath
 */
function loadFolder(folderPath) {
    const label = "loadFolder";
    if (typeof this.Mongo !== "function") {
        logError("`this` is not `global` - Module is not loaded.", label);
        return;
    }

    const absolutePath = resolve(folderPath);
    if (!isDirectory(absolutePath)) {
        logError(`Path "${folderPath}" is not a directory`, label);
        return;
    }

    try {
        ls(absolutePath, isDirectory).forEach(loadFolder.bind(this));
        ls(absolutePath, isValidJs).forEach(loadScript.bind(this));
        logVerbose(`Folder "${basename(absolutePath)} loaded."`, label);
    } catch (error) {
        logError(error, label);
    }
}

module.exports = { loadModule, loadFolder };
