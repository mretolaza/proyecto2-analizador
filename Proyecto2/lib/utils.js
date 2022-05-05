/* eslint-disable no-use-before-define */
/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
const { concat } = require('lodash');

const { DFA_NODE_TYPE } = require('../constants');

module.exports.convertToBasicOperators = (str = '') => {
  //  (0|1|2|3|4|5|6|7|8|9)+(A|B|C|D|E|F)((0|1|2|3|4|5|6|7|8|9)+(A|B|C|D|E|F))*(H)
  const positiveGrouped = /\(([^()]+)\)\+/;
  const positive = /[a-z|A-Z|0-9]\+/;
  const positiveGroupedMatch = str.match(positiveGrouped);
  const positiveMatch = str.match(positive);

  if (positiveGroupedMatch !== null) {
    positiveGroupedMatch.forEach((match) => {
      let positiveGroupedStr = match !== null ? match.replace('+', '') : null;
      if (positiveGroupedStr[0] !== '(' && positiveGroupedStr[positiveGroupedStr.length - 1] !== ')') {
        positiveGroupedStr = `(${positiveGroupedStr})`;
      }
      str = str.replace(`${positiveGroupedStr}+`, `${positiveGroupedStr + positiveGroupedStr}*`);
    });
  }
  if (positiveMatch !== null) {
    positiveMatch.forEach((match) => {
      const positiveStr = match !== null ? match.replace('+', '') : null;
      str = str.replace(`${positiveStr}+`, `${positiveStr + positiveStr}*`);
    });
  }

  const unaryGrouped = /\(([^()]+)\)\?/;
  const unary = /[a-z|A-Z|0-9]\?/;
  const unaryGroupedMatch = str.match(unaryGrouped);
  const unaryMatch = str.match(unary);

  if (unaryGroupedMatch !== null) {
    unaryGroupedMatch.forEach((match) => {
      let unaryGroupedStr = match !== null ? match.replace('?', '') : null;
      if (unaryGroupedStr[0] !== '(' && unaryGroupedStr[unaryGroupedStr.length - 1] !== ')') {
        unaryGroupedStr = `(${unaryGroupedStr})`;
      }
      str = str.replace(`${unaryGroupedStr}?`, `(${unaryGroupedStr}|ε)`);
    });
  }
  if (unaryMatch !== null) {
    unaryMatch.forEach((match) => {
      const unaryStr = match !== null ? match.replace('?', '') : null;
      str = str.replace(`${unaryStr}?`, `(${unaryStr}|ε)`);
    });
  }

  return str;
};

module.exports.calculatedFunctions = (syntacticTree) => {
  const calculateOr = (or) => {
    if (or.left.type === DFA_NODE_TYPE.leaf) {
      or.left.nullable = or.left.id === 0;
      or.left.firstPosition = [or.left.id];
      or.left.lastPosition = [or.left.id];
    } else {
      or.left = calculateNode(or.left);
    }

    if (or.right.type === DFA_NODE_TYPE.leaf) {
      or.right.nullable = or.right.id === 0;
      or.right.firstPosition = [or.right.id];
      or.right.lastPosition = [or.right.id];
    } else {
      or.right = calculateNode(or.right);
    }
    or.nullable = or.left.nullable || or.right.nullable;
    or.firstPosition = concat(or.left.firstPosition, or.right.firstPosition);
    or.lastPosition = concat(or.left.lastPosition, or.right.lastPosition);
    return or;
  };

  const calculateGroup = (group) => {
    group.children.forEach((child) => {
      if (child.type === DFA_NODE_TYPE.leaf) {
        child.nullable = child.id === 0;
        child.firstPosition = child.id === 0 ? [] : [child.id];
        child.lastPosition = child.id === 0 ? [] : [child.id];
      } else {
        child = calculateNode(child);
      }
    });

    group.nullable = group.children[group.children.length - 1].nullable;
    group.firstPosition = group.children[group.children.length - 1].firstPosition;
    group.lastPosition = group.children[group.children.length - 1].lastPosition;
    return group;
  };

  const calculateNode = (node) => {
    switch (node.label) {
      case 'GROUP':
        node = calculateGroup(node);
        break;
      case 'CONCAT':
        node = calculateGroup(node);
        let nullable = !!node.children[0].nullable;
        let firstPosition = [];
        let lastPosition = [];
        node.children.forEach((concatChild, index) => {
          nullable = nullable && concatChild.nullable;

          if (index === 0) {
            firstPosition = concatChild.firstPosition;
          } else {
            const beforeChild = node.children[index - 1];
            if (beforeChild.nullable) {
              firstPosition = concat(firstPosition, concatChild.firstPosition);
            }
          }

          if (concatChild.nullable) {
            lastPosition = concat(lastPosition, concatChild.lastPosition);
          } else {
            lastPosition = concatChild.lastPosition;
          }
        });

        node.nullable = nullable;
        node.firstPosition = firstPosition;
        node.lastPosition = lastPosition;
        break;
      case 'KLEEN':
        node = calculateGroup(node);
        node.nullable = true;
        break;
      case 'OR':
        node = calculateOr(node);
        break;
    }

    return node;
  };

  syntacticTree.children.forEach((child) => {
    if (child.type === DFA_NODE_TYPE.leaf) {
      child.nullable = child.id === 0;
      child.firstPosition = child.id === 0 ? [] : [child.id];
      child.lastPosition = child.id === 0 ? [] : [child.id];
    } else {
      child = calculateGroup(child);
    }
  });

  if (syntacticTree.children[0].nullable) {
    syntacticTree.firstPosition = concat(
      syntacticTree.children[0].firstPosition,
      syntacticTree.children[1].firstPosition,
    );
  } else {
    syntacticTree.firstPosition = syntacticTree.children[0].firstPosition;
  }

  if (syntacticTree.children[1].nullable) {
    syntacticTree.lastPosition = concat(
      syntacticTree.children[0].lastPosition,
      syntacticTree.children[1].lastPosition,
    );
  } else {
    syntacticTree.lastPosition = syntacticTree.children[1].lastPosition;
  }

  return syntacticTree;
};
