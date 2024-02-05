const fs = require("fs");
const path = require("path");

/**
 * @typedef {(file: fs.Dirent) => boolean} FileFilter
 */

/**
 * @typedef {Object} FileInfo
 * @property {!string} baseName
 * @property {!string} name
 * @property {!boolean} isDirectory
 * @property {!number} size
 */

/**
 * List files' name in a directory
 * @param {string} directory
 * @param {FileFilter} filter
 */
const ls = (directory, filter = selectAll) => {
    const dirName = directory || ".";
    return readDirectory(dirName, filter).map(toFileFullPath);
};

/**
 * List files in a directory
 * @param {string} directory
 * @param {FileFilter} filter
 * @returns {FileInfo[]}
 */
const listFiles = (directory, filter = selectAll) => {
    return readDirectory(directory, filter).map(toFileInfo);
};

/**
 * Read directory content and filter
 * @param {string} directory
 * @param {FileFilter} filter
 * @returns
 */
const readDirectory = (directory, filter) => {
    if (!directory) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).filter(filter);
};

/** @type {FileFilter} */
const selectAll = () => true;

/**
 * @param {string} directory
 * @param {string} name
 * @returns {string}
 */
const getFullPath = (directory, name) => {
    return path.resolve(path.join(directory, name));
};

/**
 * @param {fs.Dirent} dirent
 * @returns {FileInfo}
 */
const toFileInfo = (dirent) => {
    const name = getFullPath(dirent.path, dirent.name);

    /** @type {FileInfo} */
    return {
        baseName: dirent.name,
        name,
        isDirectory: dirent.isDirectory(),
        size: getFileSize(name),
    };
};

/**
 * @param {fs.Dirent} dirent
 * @returns {string}
 */
const toFileFullPath = (dirent) => {
    return path.resolve(path.join(dirent.path, dirent.name));
};

/**
 * @param {string} file
 */
const getFileSize = (file) => {
    return fs.statSync(file).size;
};

/**
 * @param {string | fs.Dirent} input
 */
const isDirectory = (input) => {
    if (typeof input === "string") {
        return isPathDirectory(input);
    }
    if (input instanceof fs.Dirent) {
        return input.isDirectory();
    }
    return false;
};

/**
 * @param {string | fs.Dirent} input
 */
const isFile = (input) => {
    if (typeof input === "string") {
        return isPathFile(input);
    }
    if (input instanceof fs.Dirent) {
        return input.isFile();
    }
    return false;
};

/**
 * @param {string} filePath
 */
const isPathDirectory = (filePath) => {
    const stat = fs.statSync(filePath);
    return stat.isDirectory();
};

/**
 * @param {string} filePath
 */
const isPathFile = (filePath) => {
    const stat = fs.statSync(filePath);
    return stat.isFile();
};

/** @param {string | fs.Dirent} file */
const isValidJs = (file) => {
    const filePath = file instanceof fs.Dirent ? toFileFullPath(file) : file;

    if (!isFile(filePath)) {
        return false;
    }

    const { ext, name } = path.parse(filePath);
    if (ext !== ".js") {
        return false;
    }
    if (path.extname(name) === ".template") {
        return false;
    }
    return true;
};

module.exports = { listFiles, ls, isDirectory, isFile, isValidJs };
