/**
 * @typedef {import("../modules/dbs").DBs} DBs
 * @typedef {{user: string, pwd: string}} AuthDocument
 */

/** @extends {Map<string, string>} */
class Credentials extends Map {
    /** @param {string} user */
    get(user) {
        return super.get(user) || "";
    }

    /**
     * @param {string} user
     * @returns {AuthDocument}
     */
    getAuth(user) {
        const pwd = this.get(user);
        return { user, pwd };
    }
}

/** @extends {Map<string, Credentials>} */
class Vault extends Map {
    /** @param {string} env */
    get(env) {
        const credentials = super.get(env);
        if (!credentials) {
            const newCredentials = new Credentials();
            this.set(env, newCredentials);
            return newCredentials;
        }
        return credentials;
    }
}

/** @type {Vault} */
const VAULT = new Vault();

/** @extends {Map<string, DBs>} */
class Connections extends Map {}

/** @extends {Map<string, Connections>} */
class Environment extends Map {
    /** @param {string} env */
    get(env) {
        const connections = super.get(env);
        if (!connections) {
            const newConnections = new Connections();
            this.set(env, newConnections);
            return newConnections;
        }
        return connections;
    }
}

/** @type {Environment} */
const ENVIRONMENTS = new Environment();

module.exports = { VAULT, ENVIRONMENTS };
