"use strict";

const TagSingle = require('./tagSingle');

class TagPair extends TagSingle {}

TagPair.templateFile = __dirname + '/../html/tagPair.html';
TagPair.variables = [
  'tag',
  'attributes',
  'content',
];

module.exports = TagPair;
