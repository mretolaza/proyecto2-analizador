module.exports.TOKEN_TYPE = {
  LBRACK: '(',
  RBRACK: ')',
  STAR: '*',
  OR: '|',
  END: 'EOF',
  EPSILON: 'ε',
  BLANK: ' ',
  DOUBLE_QUOTE: '"',
  ESCAPE: '\\',
  EXTEND: '\d\w',
  UNKNOWN: 'unknown',
  REGCHAR: 'a-z0-9_ \n\t\r',
};

module.exports.REG_TREE_TYPE = {
  Alternative: 'Alternative',
  Char: 'Char',
  Group: 'Group',
  Or: 'Disjunction',
  Kleen: 'Repetition',
};

module.exports.DFA_NODE_TYPE = {
  increased: '#',
  leaf: 'leaf',
  node: 'node',
  root: 'root',
};

module.exports.ASCII = {
  space: 32,
  tab: 9,
};
