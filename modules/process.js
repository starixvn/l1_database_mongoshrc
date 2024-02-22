const process = require("process");

/** @type {{[k: string]: boolean}} */
const locks = {};

const pwd = () => {
    return process.cwd();
};

/**
 * @param {string} directory
 * @returns
 */
const cd = (directory) => {
    return process.chdir(directory);
};

const getProcessTitle = () => {
    return process.title;
};

/**
 * @param {string} title
 */
const setProcessTitle = (title) => {
    process.title = title;
};

/**
 * @param {string} key
 */
const lock = (key) => {
    if (locks[key]) {
        return false;
    }
    locks[key] = true;
    return true;
};

/**
 * @param {string} key
 */
const unlock = (key) => {
    if (!locks[key]) {
        return false;
    }
    delete locks[key];
    return true;
};

module.exports = { cd, pwd, getProcessTitle, setProcessTitle, lock, unlock };
