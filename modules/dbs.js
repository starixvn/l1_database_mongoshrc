/**
 * @typedef {import("@mongosh/shell-api").Mongo} Mongo
 * @typedef {import("@mongosh/shell-api").Database} Database
 * @typedef {import("@mongosh/shell-api").Collection} Collection
 * @typedef {import("@mongosh/service-provider-core").Document } Document
 * @typedef {Mongo | Database | Collection | DBs} MongoRef
 * @typedef {{ user: string, db: string }} AuthenticatedUser
 * @typedef {{ role: string, db: string }} AuthenticatedRole
 * @typedef {{
 *      authInfo: {
 *          authenticatedUsers: AuthenticatedUser[],
 *          authenticatedUserRoles: AuthenticatedRole[],
 *      },
 *      ok: number,
 * }} ConnectionStatus
 * @typedef {import("@mongosh/service-provider-core").ListDatabasesOptions} ListDatabasesOptions
 * @typedef {{ _id: string, L: number, stage: string }} Identity
 */

const {
    inspect: { custom },
} = require("util");
const { logError } = require("./log");

/** @constant @type {AuthenticatedUser} */
const NO_USER = { user: "", db: "" };

/**
 * @param {MongoRef} reference
 */
const getMongo = (reference) => {
    if ("_uri" in reference) {
        return reference;
    }
    if ("_mongo" in reference) {
        return reference._mongo;
    }
    throw Error("Invalid Mongo reference");
};

/**
 *
 * @param {DBs} target
 * @param {PropertyKey} property
 * @param {unknown=} receiver
 */
function handleNonExistingDatabase(target, property, receiver) {
    if (!!target._mongo && typeof property === "string" && property[0] !== "_" && !(property in target)) {
        return target._mongo.getDB(property);
    }
    return Reflect.get(target, property, receiver);
}

/**
 * @class
 */
class DBs {
    /** @private @type {Mongo} */
    mongoInstance;
    get _mongo() {
        return this.mongoInstance;
    }

    /** @private @type {string=} */
    replicaSetName;
    get replicaSet() {
        return this.replicaSetName;
    }

    /** @private @type {string=} */
    hostName;
    get me() {
        return this.hostName;
    }

    /** @private @type {boolean=} */
    isWritablePrimary;

    /** @private @type {boolean=} */
    secondary;

    get status() {
        if (this.isWritablePrimary) {
            return "🖋";
        }
        if (this.secondary) {
            return "👁";
        }
        return "⚠";
    }

    /** @private @type {AuthenticatedUser} */
    authenticatedUser = NO_USER;
    get user() {
        const { user, db } = this.authenticatedUser;
        const userDb = db === "admin" ? "" : db;
        return [user, userDb].filter(Boolean).join("@");
    }

    /** @private @type {Identity=} */
    serverIdentity;
    get identity() {
        return this.serverIdentity;
    }

    /** @type {string} */
    get name() {
        // @ts-ignore
        return this._mongo.__name || "default";
    }
    /** @param {string} input */
    set name(input) {
        Object.defineProperty(this._mongo, "__name", {
            value: input || this.replicaSet || "default",
            configurable: false,
            enumerable: false,
        });
    }

    /** @type {string} */
    get environment() {
        // @ts-ignore
        return this._mongo.__environment || "default";
    }
    /** @param {string} input */
    set environment(input) {
        Object.defineProperty(this._mongo, "__environment", {
            value: input || "default",
            configurable: false,
            enumerable: false,
        });
    }

    /**
     * @constructor
     * @param {MongoRef} reference
     */
    constructor(reference) {
        this.mongoInstance = getMongo(reference);

        this.reload();
        this.configureProperties();

        /** @type {ProxyHandler<DBs>} */
        const handler = {
            get: handleNonExistingDatabase,
        };
        const proxy = new Proxy(this, handler);
        return proxy;
    }

    configureProperties() {
        /** @type {PropertyDescriptor} */
        const hiddenDescriptor = {
            configurable: false,
            enumerable: false,
        };

        Object.defineProperty(this, custom, {
            ...hiddenDescriptor,
            value: this.toString,
            writable: false,
        });
    }

    /** @async @private */
    async getMongoInfomation() {
        try {
            const { setName, me, isWritablePrimary, secondary } = await this.adminCommand("hello");
            this.replicaSetName = setName;
            this.hostName = me;
            this.isWritablePrimary = isWritablePrimary;
            this.secondary = secondary;
        } catch (error) {
            logError(error, `[${this.toString()}].getMongoInfomation`);
        }
    }

    /** @async @private */
    async getAuthenticatedUser() {
        try {
            const connectionStatus = /** @type {ConnectionStatus} */ (await this.adminCommand("connectionStatus"));

            /** @type {AuthenticatedUser[]} */
            const authenticatedUsers = connectionStatus.authInfo.authenticatedUsers;
            this.authenticatedUser = authenticatedUsers.length ? authenticatedUsers[0] : NO_USER;
        } catch (error) {
            if (error instanceof Error && error.name === "MongoPoolClosedError") {
                this.getAuthenticatedUser();
                return;
            }
            logError(error, `[${this.toString()}].getAuthenticatedUser`);
        }
    }

    /** @async @private */
    async getServerIdentity() {
        try {
            this.serverIdentity = /** @type {Identity} */ (await this._mongo.getDB("admin").getCollection("identity").findOne());
        } catch (error) {
            // @ts-ignore
            if (error instanceof Error && error.codeName === "Unauthorized") {
                return;
            }
            logError(error, `[${this.toString()}].getServerIdentity`);
        }
    }

    /** @async @private */
    async mapDatabaseNames() {
        try {
            const dbNames = await this.getDBNames();
            for (const db of dbNames) {
                Object.defineProperty(this, db, {
                    get: () => this.getDB(db),
                    configurable: true,
                });
            }
        } catch (error) {
            // @ts-ignore
            if (error instanceof Error && error.codeName === "Unauthorized") {
                return;
            }
            logError(error, `[${this.toString()}].mapDatabaseNames`);
        }
    }

    /** @private @type {boolean} */
    reloading = false;

    /** @async */
    async reload() {
        if (this.reloading) {
            return;
        }
        try {
            this.reloading = true;
            await Promise.allSettled([this.getMongoInfomation(), this.getAuthenticatedUser(), this.getServerIdentity(), this.mapDatabaseNames()]);
        } finally {
            this.reloading = false;
        }
    }

    /** @async @param {string | Document} command */
    async adminCommand(command) {
        return this._mongo.getDB("admin").adminCommand(command);
    }

    /** @param {string} db */
    getDB(db) {
        return this._mongo.getDB(db);
    }

    /** @async @param {ListDatabasesOptions=} options */
    async getDBNames(options) {
        return await this._mongo.getDBNames(options);
    }

    /** @async @param {ListDatabasesOptions=} options */
    async getDBs(options) {
        return await this._mongo.getDBs(options);
    }

    /** @async */
    async setSecondaryOk() {
        return await this._mongo.setSecondaryOk();
    }

    toString() {
        return `${this.status}  ${this.replicaSet || this.me}`;
    }
}

module.exports = { DBs, getMongo };
