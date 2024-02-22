/**
 * @param {string} inputString
 * @returns {string}
 */
const percentEncode = (inputString) => {
    const byteBuffer = Buffer.from(inputString).toJSON().data;
    const hexBuffer = byteBuffer.map(toPercentCode);
    return hexBuffer.join("");
};

/**
 * @typedef {"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"A"|"B"|"C"|"D"|"E"|"F"} HexChar
 * @typedef {`%${HexChar}${HexChar}`} PercentCode
 */

/**
 *
 * @param {number} int
 * @returns {PercentCode}
 */
const toPercentCode = (int) => {
    // @ts-ignore
    return `%${int.toString(16)}`;
};

module.exports = { percentEncode };
