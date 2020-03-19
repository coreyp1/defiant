'use strict';

/**
 * Create a Bijective Number system using the provided digits.
 * See {@link https://en.wikipedia.org/wiki/Bijective_numeration}.
 * @class
 * @memberOf Defiant.util
 */
class Bijective {
  /**
   * @param {string} [digits="ABCDEFGHIJKLMNOPQRSTUVWXYZ"] - The digits to be
   * used. Each digit should be unique in the string.
   */
  constructor (digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    this.digits = digits;
    this.base = digits.length;
    return this;
  }

  /**
   * Convert an Integer to bijective digits.
   * @param {number} number - The integer to convert to a bijective number
   * @returns {string} The bijective representation of the `number`
   */
  toBij(number) {
    number = parseInt(number);
		let str = '';
		while (number > 0) {
			str = this.digits.charAt(((number % this.base) || this.base) - 1) + str;
			number = Math.floor((number - 1) / this.base);
		}
		return str;
  }

  /**
   * Convert bijective digits to an integer.
   * @param {string} number - The bijective number to be converted to an integer
   * @returns {number} The integer value of the bijective number
   */
  toInt(number) {
    var num = 0;
		for (var i = 0; i < number.length; i++) {
			num = num * this.base + this.digits.indexOf(number.charAt(i)) + 1;
		}
		return num;
  }
}

module.exports = Bijective;
