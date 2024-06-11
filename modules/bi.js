/** @typedef {{ mongo_name: string, sql_name: string }} BINameMapping */

/** @typedef {typeof ColType[keyof ColType]} BIColumnType */
/** @typedef {BINameMapping & BIColumnType} BIColumn */

const ColType = /** @type {const} */ ({
    OID: { mongo_type: `bson.ObjectId`, sql_type: `objectid` },
    STR: { mongo_type: `string`, sql_type: `varchar` },
    FLOAT: { mongo_type: `float64`, sql_type: `float` },
    INT: { mongo_type: `int`, sql_type: `int` },
    INT64: { mongo_type: `int64`, sql_type: `int` },
    BOOL: { mongo_type: `bool`, sql_type: `boolean` },
    DATE: { mongo_type: `date`, sql_type: `timestamp` },
    FILTER: { mongo_type: `mongo.Filter`, sql_type: `varchar` },
});
module.exports = { ColType };

/** @typedef {BINameMapping & { pipeline?: string, columns: BIColumn[] }} BITable */

/** @typedef {{name: string, tables: BITable[]}} BIDatabase */

/** @typedef {{databases: BIDatabase[]}} BISchema */
