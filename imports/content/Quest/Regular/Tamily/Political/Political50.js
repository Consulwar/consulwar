export default {
  id: 'Quest/Regular/Tamily/Political/Political50',
  condition: [
    ['Building/Residential/Political', 50],
  ],
  title: 'Построить Политический Центр 50-го уровня',
  text: '<p>Неожиданно пертурбациями в Политцентре заинтересовались космические пираты. Они уже вбухали значительные средства в рекламную компанию своей собственной партии, которая, по их словам, решит все экономические и политические проблемы в считанные дни.</p><p>Кажется, пираты не в курсе, как именно у нас происходят так называемые «выборы», а просвещать их в этом вопросе дураков не нашлось. Даже не знаю, что будет, когда они поймут, сколько кредитов выбросили на ветер.</p>',
  options: {
    accept: {
      text: 'Знаешь, Тамили, я тут подумал… Уеду-ка я в отпуск на пару недель. Но ты держи меня в курсе!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 60,
    crystals: 60,
  },
};