/**
 * @typedef {import("@mongosh/shell-api").Database} Database
 * @typedef {import("./dbs").DBs} DBs
 * @typedef {import("./type").MongoShell} MongoShell
 */

const { ENVIRONMENTS } = require("../secrets/vault");
const { logError } = require("./log");

const TIME_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T([0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z)$/;

/**
 * @this MongoShell
 */
function getDBs() {
    const label = "getDBs";

    try {
        const mongo = this.db.getMongo();

        /** @type {string} */
        // @ts-ignore
        const name = mongo.__name;
        /** @type {string} */
        // @ts-ignore
        const environment = mongo.__environment;

        Object.assign(this, { dbs: ENVIRONMENTS.get(environment).get(name) });
    } catch (error) {
        logError(error, label);
    }
}

/**
 * @this MongoShell
 * @async
 */
async function prompt() {
    /** @type {string[]} */
    const components = [];

    getDBs.bind(this)();

    try {
        components.push(`[${this.dbs.toString()}]`);
    } catch (error) {
        components.push("(nodb)");
    }

    try {
        components.push(`@${this.db.getName()}`);
    } catch (error) {}

    try {
        const now = TIME_REGEX.exec(new Date().toISOString()) || [];
        components.push(now[1]);
    } catch (error) {}

    try {
        components.push(`·${this.dbs.user}·`);
    } catch (error) {}

    components.push("»");
    return components.filter(Boolean).join(" ") + " ";
}

module.exports = { prompt };
