/**
 * @typedef {import("@mongosh/shell-api").ShellApi} ShellApi
 * @typedef {import("@mongosh/shell-api").Database} Database
 * @typedef {import("./dbs").DBs} DBs
 * @typedef {import("./security").AuthDocument} AuthDocument
 * @typedef {typeof import("./bi")} BIModule
 * @typedef {typeof import("./dbs")} DBsModule
 * @typedef {typeof import("./file")} FileModule
 * @typedef {typeof import("./load")} LoadModule
 * @typedef {typeof import("./log")} LogModule
 * @typedef {typeof import("./object")} ObjectModule
 * @typedef {typeof import("./percent-encode")} PercentEncodeModule
 * @typedef {typeof import("./process")} ProcessModule
 * @typedef {typeof import("./prompt")} PromptModule
 * @typedef {typeof import("./security")} SecurityModule
 * @typedef {ShellApi &
 *  BIModule &
 *  DBsModule &
 *  FileModule &
 *  LoadModule &
 *  LogModule &
 *  ObjectModule &
 *  PercentEncodeModule &
 *  ProcessModule &
 *  PromptModule &
 *  SecurityModule &
 *  {
 *      db: Database,
 *      dbs: DBs,
 *      credential: AuthDocument,
 *  }} MongoShell
 */

module.exports = {};
