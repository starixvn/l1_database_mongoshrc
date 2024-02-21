const util = require("util");

/**
 * @template T
 * @param {T} object
 * @returns {T}
 */
const deepFreeze = function (object) {
    if (!object) {
        return object;
    }
    if (typeof object !== "object" && typeof object !== "function") {
        return object;
    }

    for (const value of Object.values(object)) {
        deepFreeze(value);
    }

    Object.freeze(object);
    return object;
};

module.exports = { deepFreeze };
