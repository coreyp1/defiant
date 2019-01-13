'use strict';

/**
 * Create a Bijective Number system using the provided digits.
 * https://en.wikipedia.org/wiki/Bijective_numeration
 */
class Bijective {
  constructor (digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    this.digits = digits;
    this.base = digits.length;
    return this;
  }

  /**
   * Convert an Integer to bijective digits.
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
