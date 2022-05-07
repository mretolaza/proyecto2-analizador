const fs = require('fs');
const { sortBy, reverse } = require('lodash');

const {
  createFileLexer,
  extractFromDoubleQuote,
  isCocolKeyword,
  isSet,
  replaceAll,
  extractCharCode,
} = require('./utils');

const filePath = process.argv.slice(2)[0];
const outFileName = process.argv.slice(2)[1];
const cocol = {};
const regExpChar = [];
const regExpKeyWord = [];
const regExpToken = [];

const getLines = () => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const lines = fileContent.split(/\r?\n/)
    .map((line, index) => {
      let lineStr = replaceAll(line, '  ', '');
      lineStr = replaceAll(lineStr, ' = ', '=');
      lineStr = replaceAll(lineStr, String.fromCharCode(9), '');

      if (lineStr[lineStr.length - 1] === '.') {
        lineStr = lineStr.substring(0, (lineStr.length - 1));
      }

      return {
        line: index,
        value: lineStr,
      };
    });

  return lines;
};

let actualKeyWord = '';
getLines().forEach(({ value }) => {
  value = replaceAll(value, ' ', '');
  if (isCocolKeyword(value)) {
    actualKeyWord = value;
    cocol[actualKeyWord] = [];
  } else if (isSet(cocol[actualKeyWord])) {
    cocol[actualKeyWord].push(value);
  }
});

const convertStringToOr = (str) => {
  if (!isSet(str)) {
    return '';
  }
  let strOr = `(${str[0]}`;
  for (let i = 1; i < str.length; i++) {
    strOr += `|${str[i]}`;
  }
  strOr += ')';

  return strOr;
};

Object.keys(cocol).forEach((key) => {
  if (key === 'CHARACTERS') {
    cocol[key].forEach((line) => {
      const productionName = line.split('=')[0];
      let productionValue = line.split('=')[1];
      if (isSet(productionValue)) {
        // Open production as set
        productionValue = `(${productionValue}`;

        // Replace existing char on actual char
        regExpChar.forEach(({ name, value }) => {
          productionValue = replaceAll(productionValue, name, value);
        });

        let flag = true;

        // Extract all double quotes
        while (flag) {
          const extractResult = extractFromDoubleQuote(productionValue);
          flag = extractResult.found;

          productionValue = replaceAll(productionValue, `"${extractResult.value}"`, convertStringToOr(extractResult.value));
        }

        // Extract CHR()
        flag = true;
        while (flag) {
          const extractResult = extractCharCode(productionValue);
          flag = extractResult.found;

          productionValue = replaceAll(productionValue, `CHR(${extractResult.value})`, String.fromCharCode(extractResult.value));
        }

        // Delete plus
        productionValue = replaceAll(productionValue, '+', '');

        // Close production as set
        productionValue = `${productionValue})`;

        regExpChar.push({
          name: productionName,
          value: productionValue,
        });
      }
    });
  } else if (key === 'KEYWORDS') {
    cocol[key].forEach((line) => {
      const productionName = line.split('=')[0];
      let productionValue = line.split('=')[1];
      if (isSet(productionValue)) {
        let flag = true;

        while (flag) {
          const extractResult = extractFromDoubleQuote(productionValue);
          flag = extractResult.found;

          productionValue = replaceAll(productionValue, `"${extractResult.value}"`, extractResult.value);
        }

        regExpKeyWord.push({
          name: productionName,
          value: productionValue,
        });
      }
    });
  } else if (key === 'TOKENS') {
    cocol[key].forEach((line) => {
      const productionName = line.split('=')[0];
      let productionValue = line.split('=')[1];

      if (isSet(productionValue)) {
        // Remove cocol keyWord
        productionValue = replaceAll(productionValue, 'EXCEPT', '');
        productionValue = replaceAll(productionValue, 'KEYWORDS', '');

        // Remove white spaces
        productionValue = replaceAll(productionValue, ' ', '');

        // Replace CHARACTERS
        reverse(
          sortBy(regExpChar, (char) => char.name.length),
        ).forEach((char) => {
          productionValue = replaceAll(productionValue, char.name, char.value);
        });

        // Add Kleene
        productionValue = replaceAll(productionValue, '{', '(');
        productionValue = replaceAll(productionValue, '}', ')*');

        regExpToken.push({
          name: productionName,
          value: productionValue,
        });
      }
    });
  }
});

createFileLexer(`${__dirname}/output/${outFileName}`, regExpKeyWord, regExpToken);

// eslint-disable-next-line no-console
console.log(`FILE GENERATED SUCCESSFULLY ON: ${__dirname}/output/${outFileName}`);
