import { _ } from 'meteor/underscore';

// Return formated string from number or array of numbers
// If array provided than divide it by delimiter
const formatNumber = function (num, delimiter = ' - ') {
  const result = _.isObject(num) || _.isArray(num) ? num : [num];

  const singlePattern = /^-?\d+(?:\.\d{0,1})?/;
  const doublePattern = /^-?\d+(?:\.\d{0,2})?/;

  const firstMatched = (value, pattern) => value.toString().match(pattern)[0];

  return _(result).map((value) => {
    let res = value;
    if (_.isNumber(res)) {
      res = parseFloat(firstMatched(res, doublePattern));

      if (firstMatched(res, doublePattern).substr(-1) !== '0') {
        res = firstMatched(res, doublePattern);
      } else if (firstMatched(res, singlePattern).substr(-1) !== '0') {
        res = firstMatched(res, singlePattern);
      }
    }
    return res.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }).join(delimiter);
};

const ISO = {
  0: '',
  1: 'K',
  2: 'M',
  3: 'G',
  4: 'T',
  5: 'P',
  6: 'E',
  7: 'Z',
  8: 'Y',
  undefined: 'o_O ??',
};


// count space for every 3 symbols
const countSpacesByLength = number => Math.floor((number - 1) / 3);

// Return number of possible spaces after formatNumber
const countSpaces = number => (
  countSpacesByLength(Math.floor(number).toString().length)
);

const formatNumberWithIso = function(num, limit = 5) {
  if (!_.isNumber(num)) {
    return num;
  }

  let result = Math.round(num);

  // If number with spaces fits the limits
  if (result.toString().length + countSpaces(result) <= limit) {
    return formatNumber(result);
  }

  // Reduce limit by 1, cause we will add a letter in the end
  const newLimit = limit - 1;

  // Divide by 4 to count spaces in final result
  // "1 000 000" — 9 letters, but exponent of 2
  const exponent = Math.ceil((result.toString().length - newLimit) / 4);

  // Result number length after division. It is NOT a string, so not count spaces
  const resultLength = (result.toString().length - (exponent * 3));

  // Left symbols before limit
  // limit - 1 to count a dot in float number
  const leftLength = Math.max(
    newLimit - 1 - resultLength - countSpacesByLength(resultLength),
    0,
  );

  result = parseFloat((result / (1000 ** exponent)).toFixed(leftLength));

  if (ISO[exponent] === undefined) {
    return ISO.undefined;
  }

  return `${formatNumber(result)}${ISO[exponent]}`;
};


export default {
  formatNumber,
  formatNumberWithIso,
};
