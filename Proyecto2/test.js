const { RegParser } = require('./lib/FAClasses');

const regexpStr = '(0|1|2|3|4|5|6|7|8|9)+(A|B|C|D|E|F)';

const parser = new RegParser(regexpStr);
const { nfa } = parser.parseToNFA();

const { dfa } = nfa.toDFA();
console.log(dfa.validateWord('123F'));
