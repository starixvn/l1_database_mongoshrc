/**
 * @typedef {import("@mongosh/shell-api").ShellApi} ShellApi
 * @typedef {import("@mongosh/shell-api").Database} Database
 * @typedef {import("./dbs").DBs} DBs
 * @typedef {import("./security").AuthDocument} AuthDocument
 * @typedef {ShellApi & {
 *  db: Database,
 *  dbs: DBs,
 *  credential: AuthDocument,
 * }} MongoShell
 */

module.exports = {};
