/* eslint-disable no-useless-escape */
/* eslint-disable max-classes-per-file */
const { TOKEN_TYPE } = require('../constants');

const isRegChar = (regChar) => (regChar >= 'a' && regChar <= 'z')
        || (regChar >= 'A' && regChar <= 'Z')
        || (regChar === '.')
        || (regChar >= '0' && regChar <= '9')
        || regChar === ' '
        || regChar === '_'
        || regChar === '.';

class Token {
  constructor(type, text) {
    this.type = type;
    this.text = text;
  }
}

const EPSILONTOKEN = new Token(TOKEN_TYPE.EPSILON, 'ε');

class Lexer {
  constructor(regString) {
    this.regString = regString;
    this.index = 0;
  }

  hasNext() {
    if (this.regString) {
      return this.index < this.regString.length;
    }

    return false;
  }

  nextToken() {
    while (this.hasNext()) {
      switch (this.regString[this.index]) {
        case '\\':
          this._consume();
          if (this.hasNext()) {
            switch (this.regString[this.index]) {
              case 'n':
                ++this.index;
                return new Token(TOKEN_TYPE.REGCHAR, '\n');
              case 't':
                ++this.index;
                return new Token(TOKEN_TYPE.REGCHAR, '\t');
              case 'r':
                ++this.index;
                return new Token(TOKEN_TYPE.REGCHAR, '\r');
              case '\\':
                ++this.index;
                return new Token(TOKEN_TYPE.REGCHAR, '\\');
              case 'd':
                ++this.index;
                return new Token(TOKEN_TYPE.EXTEND, '\d');
              case 'w':
                ++this.index;
                return new Token(TOKEN_TYPE.EXTEND, '\w');
              default:
                throw new Error('Expect character after "\\".');
            }
          }
          break;
        case ' ':
          this._consume();
          return new Token(TOKEN_TYPE.REGCHAR, ' ');
        case '\t':
          this._consume();
          return new Token(TOKEN_TYPE.REGCHAR, '\t');
        case '"':
          this._consume();
          return new Token(TOKEN_TYPE.REGCHAR, '"');
        case 'ε':
          this._consume();
          return EPSILONTOKEN;
        case '(':
          this._consume();
          return new Token(TOKEN_TYPE.LBRACK, '(');
        case ')':
          this._consume();
          return new Token(TOKEN_TYPE.RBRACK, ')');
        case '*':
          this._consume();
          return new Token(TOKEN_TYPE.STAR, '*');
        case '|':
          this._consume();
          return new Token(TOKEN_TYPE.OR, '|');
        default:
          if (isRegChar(this.regString[this.index])) {
            return new Token(TOKEN_TYPE.REGCHAR, this.regString[this.index++]);
          }

          throw new Error(`Unknown type of ${this.regString[this.index]}`);
      }
    }
    return new Token(TOKEN_TYPE.END, 'EOF');
  }

  _consume() {
    return ++this.index;
  }
}

module.exports.Lexer = Lexer;
module.exports.EPSILONTOKEN = EPSILONTOKEN;
module.exports.TOKEN_TYPE = TOKEN_TYPE;
module.exports.Token = Token;
