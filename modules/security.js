/**
 * @typedef {import("./type").MongoShell} MongoShell
 * @typedef {import("@mongosh/shell-api").Database} Database
 * @typedef {{user: string, pwd: string}} AuthDocument
 * @typedef {{ env: string, name: string, uri: string, auth: AuthDocument }} ConnectionConfig
 */

const { DBs } = require("./dbs");
const { VAULT, ENVIRONMENTS } = require("../secrets/vault");
const { logError, logVerbose } = require("./log");

/**
 * @this MongoShell
 * @async
 * @param {DBs} dbs
 * @param {string | AuthDocument} principal
 * @returns {Promise<{ ok: number }>}
 */
async function login(dbs, principal = "") {
    const label = "login";
    if (typeof this.Mongo !== "function") {
        logError("`this` is not `global`", label);
        return { ok: 0 };
    }

    const resolvedDBs = dbs || this.dbs;

    if (!(resolvedDBs instanceof DBs)) {
        logError("Invalid DBs instance", label);
        return { ok: 0 };
    }

    const env = resolvedDBs.environment || "default";

    const authenticateDocument = await getAuthDocument.bind(this)(principal, env);
    const { user, pwd } = authenticateDocument;

    const { pwd: newPwd, ok } = await doLogin.bind(this)(resolvedDBs, authenticateDocument);

    if (ok && newPwd !== pwd) {
        VAULT.get(env).set(user, newPwd);
    }
    return { ok };
}

/**
 * @this MongoShell
 * @async
 * @param {string | AuthDocument} principal
 * @param {string} env
 * @returns {Promise<AuthDocument>}
 */
async function getAuthDocument(principal, env) {
    if (typeof this.Mongo !== "function") {
        throw new Error("`this` is not `global`");
    }

    const user = await getUser.bind(this)(principal);
    const pwd = getPwd.bind(this)(user, principal, env);

    return { user, pwd };
}

/**
 * @this MongoShell
 * @async
 * @param {string | AuthDocument} principal
 * @returns {Promise<string>}
 */
async function getUser(principal) {
    if (typeof this.Mongo !== "function") {
        throw new Error("`this` is not `global`");
    }

    const user = typeof principal === "string" ? principal : principal.user;

    if (user) {
        return user;
    }

    if (this.credential && this.credential.user) {
        return this.credential.user;
    }

    console.log("Your username:");
    return await this.passwordPrompt();
}

/**
 * @this MongoShell
 * @async
 * @param {string} user
 * @param {string | AuthDocument} principal
 * @param {string} env
 * @returns {string}
 */
function getPwd(user, principal, env) {
    if (typeof this.Mongo !== "function") {
        throw new Error("`this` is not `global`");
    }

    const pwd = VAULT.get(env).get(user);
    if (pwd) {
        return pwd;
    }

    if (typeof principal === "string") {
        const { user: defaultUser, pwd: defaultPwd } = this.credential;
        return defaultUser === user ? defaultPwd : "";
    }

    return principal.pwd;
}

/**
 * @this MongoShell
 * @async
 * @param {DBs} dbs
 * @param {AuthDocument} authenticateDocument
 * @returns {Promise<AuthDocument & { ok: number }>}
 */
async function doLogin(dbs, authenticateDocument) {
    const label = "doLogin";
    if (typeof this.Mongo !== "function") {
        throw new Error("`this` is not `global`");
    }

    let authResult = { ok: 0 };

    for (const iteration in Array(3).fill(0)) {
        if (Number(iteration) || !authenticateDocument.pwd) {
            authenticateDocument.pwd = await this.passwordPrompt();
        }
        try {
            authResult = await dbs.getDB("admin").auth(authenticateDocument);
            if (authResult.ok) {
                break;
            }
        } catch (error) {
            if (error instanceof Error) {
                error.message = `[${Number(iteration) + 1}] ${error.message}`;
            }
            logError(error, label);
        }
    }
    return { ...authenticateDocument, ...authResult };
}

/**
 * @this MongoShell
 * @async
 * @param {ConnectionConfig | ConnectionConfig[]} connectionConfig
 */
async function attach(connectionConfig) {
    const label = "attach";
    if (typeof this.Mongo !== "function") {
        logError("`this` is not `global`", label);
        return this.db;
    }

    if (connectionConfig instanceof Array) {
        await attachMultiple.bind(this)(connectionConfig);
        return this.db;
    }
    return await attachSingle.bind(this)(connectionConfig);
}

/**
 * @this MongoShell
 * @async
 * @param {ConnectionConfig} connectionConfig
 * @returns {Promise<Database>}
 */
async function attachSingle(connectionConfig) {
    const label = "attachSingle";
    if (typeof this.Mongo !== "function") {
        logError("`this` is not `global`", label);
        return this.db;
    }

    const { env, name, uri, auth } = connectionConfig;
    const dbs = ENVIRONMENTS.get(env).get(name) || (await registerDBs.bind(this)(env, name, uri));

    try {
        await login.bind(this)(dbs, auth);
    } catch (error) {
        logError(error, label);
    }

    return dbs.getDB("admin");
}

/**
 * @this MongoShell
 * @async
 * @param {ConnectionConfig[]} connectionConfigs
 * @returns {Promise<Database[]>}
 */
async function attachMultiple(connectionConfigs) {
    const label = "attachMultiple";
    if (typeof this.Mongo !== "function") {
        logError("`this` is not `global`", label);
        return [this.db];
    }

    const tasks = connectionConfigs.map(attachSingle.bind(this));
    return await Promise.all(tasks);
}

/**
 * @this MongoShell
 * @async
 * @param {string} env
 * @param {string} name
 * @param {string} uri
 */
async function registerDBs(env, name, uri) {
    const label = "registerDBs";

    const { user, pwd } = await getAuthDocument.bind(this)("", env);
    const db = await this.connect(uri, user, pwd);
    const dbs = new DBs(db);
    dbs.name = name;
    dbs.environment = env;
    ENVIRONMENTS.get(env).set(name, dbs);
    logVerbose(`Connect to [${name}] successfully.`, label);

    Object.defineProperty(this, env, {
        get: () => Array.from(ENVIRONMENTS.get(env).values()),
        configurable: true,
    });
    Object.defineProperty(this, name, {
        get: () => ENVIRONMENTS.get(env).get(name),
        configurable: true,
    });
    return dbs;
}

module.exports = { login, attach };
