export default {
  id: 'Quest/Regular/Tamily/Entertainment/Entertainment10',
  condition: [
    ['Building/Residential/Entertainment', 10],
  ],
  title: 'Построить Центр Развлечений 10-го уровня',
  text: '<p>Добрый день, Консул! Из Центра Развлечений прислали заявку на столы для рулетки. Я знаю, что ваш народ работает для блага колонии день и ночь, получая взамен еду и неплохую крышу над головой, но есть у нас также и особая система для вознаграждения совершивших трудовой или ещё какой-нибудь подвиг — обычные кредиты. Это не те ГГК, которые получаете вы, просто слабый эквивалент величия вашей планеты. Вот на этот эквивалент Центр и предлагает устраивать азартные игры. В конце концов, его главная задача — не дать людям ебануться. Отдайте приказ, и инженеры начнут проектировать первые казино.</p>',
  options: {
    accept: {
      text: 'Главное, чтоб я тоже с вами тут не ебанулся. Хотя идея с казино мне нравится.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 3,
    crystals: 2,
  },
};
