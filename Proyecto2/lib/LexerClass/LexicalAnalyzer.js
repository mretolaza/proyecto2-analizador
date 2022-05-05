const fs = require('fs');

const { ASCII, TOKEN_TYPE } = require('../constants');

const getWords = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const words = [];

  const lines = fileContent.split(/\r?\n/)
    .map((line, index) => ({
      index: (index + 1),
      line,
    }));

  lines.forEach(({ index, line }) => {
    let wordPosition = 0;
    let word = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char.charCodeAt() !== ASCII.space && char.charCodeAt() !== ASCII.tab) {
        if (word.length === 0) {
          wordPosition = i + 1;
        }
        word += char;

        // Save last word in line
        if ((i + 1) === line.length) {
          wordPosition = i + 1;
          words.push({
            line: index,
            position: wordPosition,
            word,
          });
        }
      } else if (word.length > 0) {
        words.push({
          line: index,
          position: wordPosition,
          word,
        });
        i--;
        wordPosition = 0;
        word = '';
      } else if (char.charCodeAt() === ASCII.tab) {
        const charCodeWord = `CHR(${char.charCodeAt(0)})`;
        wordPosition = i + 1;
        words.push({
          line: index,
          position: wordPosition,
          word: charCodeWord,
        });
        wordPosition = 0;
        word = '';
      }
    }
  });

  return words;
};

class LexicalAnalyzer {
  constructor(filePath, keyWords, tokens) {
    this.words = getWords(filePath);
    this.keyWords = keyWords;
    this.tokens = tokens;
    this.index = 0;
  }

  nextToken() {
    if (this.index < this.words.length) {
      const word = this.words[this.index++];
      const token = {
        type: TOKEN_TYPE.UNKNOWN,
        ...word,
      };

      try {
        for (let i = 0; i < this.keyWords.length; i++) {
          const { name: tokenName, fsm } = this.keyWords[i];

          if (fsm.validateWord(word.word)) {
            token.type = tokenName;
            break;
          }
        }

        // Just if token not recognized yet
        if (token.type === TOKEN_TYPE.UNKNOWN) {
          for (let i = 0; i < this.tokens.length; i++) {
            const { name: tokenName, fsm } = this.tokens[i];
            if (fsm.validateWord(word.word)) {
              token.type = tokenName;
              break;
            }
          }
        }
        return token;
      } catch (err) {
        return token;
      }
    }
    return TOKEN_TYPE.END;
  }
}

module.exports = LexicalAnalyzer;
