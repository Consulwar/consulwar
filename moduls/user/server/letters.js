Meteor.startup(function() {
'use strict';

Game.User.convertUsernameToPlainname = function(name) {
  var result = '';
  for (var i = 0; i < name.length; i++) {
    result += letters[ name[i] ] ? letters[ name[i] ] : name[i]; 
  }
  return result;
};

var letters = {
  // Small english letters are equal
  'a': 'a',
  'b': 'b',
  'c': 'c',
  'd': 'd',
  'e': 'e',
  'f': 'f',
  'g': 'g',
  'h': 'h',
  'i': 'i',
  'j': 'i',
  'k': 'k',
  'l': 'l',
  'm': 'm',
  'n': 'n',
  'o': 'o',
  'p': 'p',
  'q': 'q',
  'r': 'r',
  's': 's',
  't': 't',
  'u': 'u',
  'v': 'v',
  'w': 'w',
  'x': 'x',
  'y': 'y',
  'z': 'z',

  // Capital english letter -> small ones
  'A': 'a',
  'B': 'b',
  'C': 'c',
  'D': 'd',
  'E': 'e',
  'F': 'f',
  'G': 'g',
  'H': 'h',
  'I': 'i',
  'J': 'i',
  'K': 'k',
  'L': 'l',
  'M': 'm',
  'N': 'n',
  'O': 'o',
  'P': 'p',
  'Q': 'q',
  'R': 'r',
  'S': 's',
  'T': 't',
  'U': 'u',
  'V': 'v',
  'W': 'w',
  'X': 'x',
  'Y': 'y',
  'Z': 'z',

  // Numbers
  '1': 'l',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': 'b',
  '7': '7',
  '8': '8',
  '9': '9',
  '0': 'o',

  // Russian letters
  'а': 'a',
  'б': 'b',
  'в': 'в',
  'г': 'г',
  'д': 'д',
  'е': 'e',
  'ё': 'ё',
  'ж': 'ж',
  'з': '3',
  'и': 'и',
  'й': 'й',
  'к': 'k',
  'л': 'л',
  'м': 'm',
  'н': 'н',
  'о': 'o',
  'п': 'n',
  'р': 'p',
  'с': 'c',
  'т': 't',
  'у': 'y',
  'ф': 'ф',
  'х': 'x',
  'ц': 'u',
  'ч': '4',
  'ш': 'w',
  'щ': 'w',
  'ь': 'b',
  'ы': 'bl',
  'ъ': 'b',
  'э': 'э',
  'ю': 'ю',
  'я': 'я',

  // Russian capital letters
  'А': 'a',
  'Б': 'b',
  'В': '8',
  'Г': 'г',
  'Д': 'д',
  'Е': 'e',
  'Ё': 'ё',
  'Ж': 'ж',
  'З': '3',
  'И': 'и',
  'Й': 'й',
  'К': 'k',
  'Л': 'л',
  'М': 'm',
  'Н': 'h',
  'О': 'o',
  'П': 'n',
  'Р': 'p',
  'С': 'c',
  'Т': 't',
  'У': 'y',
  'Ф': 'ф',
  'Х': 'x',
  'Ц': 'u',
  'Ч': '4',
  'Ш': 'w',
  'Щ': 'w',
  'Ь': 'b',
  'Ы': 'bl',
  'Ъ': 'b',
  'Э': 'э',
  'Ю': 'ю',
  'Я': 'я'
};

});