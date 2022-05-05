module.exports.TOKEN_TYPE = {
  LBRACK: '(',
  RBRACK: ')',
  STAR: '*',
  OR: '|',
  END: 'EOF',
  EPSILON: 'ε',
  BLANK: ' ',
  REGCHAR: 'a-z0-9',
  INCREASED: '#',
  UNKNOWN: 'UNKNOWN',
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
