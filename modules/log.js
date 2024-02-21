const { inspect } = require("util");

/**
 * @typedef {"debug" | "info" | "log" | "warning" | "error" | "fatal" | "critical"} SeverityLevel
 * @typedef {(typeof SEVERITY_LABEL)[SeverityLevel]} SeverityLabel
 * @typedef {(typeof SEVERITY_ORDINAL)[SeverityLevel]} SeverityOrdinal
 */

const SEVERITY_LABEL = /** @type {const} */ ({
    debug: "D",
    info: "I",
    log: "-",
    warning: "W",
    error: "E",
    fatal: "F",
    critical: "F",
});

const SEVERITY_ORDINAL = /** @type {const} */ ({
    debug: -1,
    info: 0,
    log: 0,
    warning: 1,
    error: 2,
    fatal: 3,
    critical: 3,
});

const LABEL_ORDINAL = /** @type {const} */ ({
    D: -1,
    I: 0,
    "-": 0,
    W: 1,
    E: 2,
    F: 3,
});

/** @type {SeverityOrdinal} */
let loggerSeverityOrdinal = 0;

/** @param {SeverityLevel | SeverityLabel | SeverityOrdinal} verbosity */
const setVerbose = (verbosity) => {
    switch (verbosity) {
        case "debug":
        case "info":
        case "log":
        case "warning":
        case "error":
        case "fatal":
        case "critical":
            loggerSeverityOrdinal = SEVERITY_ORDINAL[verbosity];
            break;
        case "D":
        case "I":
        case "-":
        case "W":
        case "E":
        case "F":
            loggerSeverityOrdinal = LABEL_ORDINAL[verbosity];
            break;
        case -1:
        case 0:
        case 1:
        case 2:
        case 3:
            loggerSeverityOrdinal = verbosity;
            break;
    }

    return loggerSeverityOrdinal;
};

/**
 * @param {SeverityLevel} verbosity
 * @param {unknown} message
 * @param {string} [label]
 */
const doLog = (verbosity, message, label = "") => {
    // @ts-ignore
    if (message && typeof message === "object" && message.code === "SHAPI-10004") {
        return;
    }
    if (SEVERITY_ORDINAL[verbosity] < loggerSeverityOrdinal) {
        return;
    }

    const time = new Date().toISOString();
    const level = ` ${SEVERITY_LABEL[verbosity]}  `;
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
const logDebug = (message, label) => {
    return doLog("debug", message, label);
};

/**
 * @param {unknown} message
 * @param {string} [label]
 */
const logInfo = (message, label) => {
    return doLog("info", message, label);
};

/**
 * @param {unknown} message
 * @param {string} [label]
 */
const logWarning = (message, label) => {
    return doLog("warning", message, label);
};

/**
 * @param {unknown} message
 * @param {string} [label]
 */
const logError = (message, label) => {
    return doLog("error", message, label);
};

/**
 * @param {unknown} message
 * @param {string} [label]
 */
const logFatal = (message, label) => {
    return doLog("fatal", message, label);
};

module.exports = { setVerbose, logDebug, logInfo, logWarning, logError, logFatal };
