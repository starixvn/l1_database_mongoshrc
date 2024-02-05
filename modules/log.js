const { inspect } = require("util");

/**
 * @param {"V"|"I"|"W"|"E"|"F"} verbosity
 * @param {unknown} message
 * @param {string} [label]
 */
const doLog = (verbosity, message, label = "") => {
    // @ts-ignore
    if (typeof message === "object" && message.code === "SHAPI-10004") {
        return;
    }

    const time = new Date().toISOString();
    const level = ` ${verbosity}  `;
    const subject = `[${pad(label, 10)}]`;
    const content = stringify(message).replace(/\n/g, "\n" + "".padEnd(30));
    console.log(time, level, subject, content);
};

/**
 * @param {unknown} message
 */
const stringify = (message) => {
    if (message instanceof Error) {
        delete message.stack;
        return message.name + "\n" + inspect(message, false, null, true);
    }
    if (message instanceof Object) {
        return inspect(message, false, null, true);
    }
    return String(message);
};

/**
 * @param {string} input
 * @param {number} padLength
 */
const pad = (input, padLength) => {
    return input.padEnd(padLength - 1).padStart(padLength);
};

/**
 * @param {unknown} message
 * @param {string} [label]
 */
const logVerbose = (message, label) => {
    return doLog("V", message, label);
};

/**
 * @param {unknown} message
 * @param {string} [label]
 */
const logInfo = (message, label) => {
    return doLog("I", message, label);
};

/**
 * @param {unknown} message
 * @param {string} [label]
 */
const logWarning = (message, label) => {
    return doLog("W", message, label);
};

/**
 * @param {unknown} message
 * @param {string} [label]
 */
const logError = (message, label) => {
    return doLog("E", message, label);
};

/**
 * @param {unknown} message
 * @param {string} [label]
 */
const logFatal = (message, label) => {
    return doLog("F", message, label);
};

module.exports = { logVerbose, logInfo, logWarning, logError, logFatal };
