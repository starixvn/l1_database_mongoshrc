/**
 * @typedef {import("../security").AuthDocument} AuthDocument
 * @typedef {import("../security").ConnectionConfig} ConnectionConfig
 */

const { userInfo, hostname } = require("os");
const { percentEncode } = require("../percent-encode");

/** @type {AuthDocument} */
const credential = { user: "default-username", pwd: "default-password" };

const connectionOptions = `authSource=admin&appName=${percentEncode(userInfo().username)}%40${percentEncode(hostname())}}`;

/** @type {ConnectionConfig[]} */
const connectionStrings = [
    { env: "local", name: "server", uri: `mongodb://host:port/database?${connectionOptions}&replicaSet=ReplSet`, auth: credential },
    { env: "local", name: "server", uri: `mongodb://host:port/database?${connectionOptions}&replicaSet=ReplSet`, auth: credential }
];

module.exports = { credential, connectionStrings };
