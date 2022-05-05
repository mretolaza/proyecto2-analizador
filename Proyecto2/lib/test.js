const { RegParser } = require('./FAClasses');
const { TOKEN_TYPE } = require('./constants');
const LexicalAnalyzer = require('./LexerClass/LexicalAnalyzer');

const filePath = process.argv.slice(2)[0];

const keyWordsRegEx = [{ name: 'if', value: 'if' }, { name: 'while', value: 'while' }];
const tokensRegEx = [{
  name: 'id',
  value: '(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)((a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z))*',
}, {
  name: 'number',
  value: '(0|1|2|3|4|5|6|7|8|9)((0|1|2|3|4|5|6|7|8|9))*',
}, {
  name: 'hexnumber',
  value: '(0|1|2|3|4|5|6|7|8|9)+(A|B|C|D|E|F)((0|1|2|3|4|5|6|7|8|9)+(A|B|C|D|E|F))*(H)',
}];

// Create keyWords DFA
const keyWordsFSM = keyWordsRegEx.map((keyWord) => {
  const parser = new RegParser(keyWord.value);
  const { nfa } = parser.parseToNFA();
  const { dfa } = nfa.toDFA();

  return {
    name: keyWord.name,
    fsm: dfa,
  };
});

// Create tokens DFA
const tokensFSM = tokensRegEx.map((keyWord) => {
  const parser = new RegParser(keyWord.value);
  const { nfa } = parser.parseToNFA();
  const { dfa } = nfa.toDFA();

  return {
    name: keyWord.name,
    fsm: dfa,
  };
});

// Build Lexer
const lexer = new LexicalAnalyzer(filePath, keyWordsFSM, tokensFSM);

let token = lexer.nextToken();

while (token !== TOKEN_TYPE.END) {
  console.log(token);
  token = lexer.nextToken();
}
