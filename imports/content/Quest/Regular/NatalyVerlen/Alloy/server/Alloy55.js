export default {
  id: 'Quest/Regular/NatalyVerlen/Alloy/Alloy55',
  condition: [
    ['Research/Evolution/Alloy', 55],
  ],
  title: 'Исследовать Особые Сплавы 55-го уровня',
  text: '<p>Одно из самых интересных зданий в вашем жилом районе, Консул, это Колизей. Со временем, правда, он пришёл в некоторый упадок – кое-где красуются надписи на стенах, пара кресел вырвана с мясом, дымовые шашки повредили экран…</p><p>Для ремонта понадобится несколько очень прочных конструкций, и вот тут наш отдел Особых Сплавов может серьёзно помочь инженерам. Вам остаётся просто отдать приказ, и наша Лаборатория начнет исследование Сплавов для Колизея.</p>',
  options: {
    accept: {
      text: 'Давайте быстрее, я уже ставку на сегодня сделал.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 800,
    crystals: 800,
  },
};
