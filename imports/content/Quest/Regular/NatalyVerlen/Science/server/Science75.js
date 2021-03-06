export default {
  id: 'Quest/Regular/NatalyVerlen/Science/Science75',
  condition: [
    ['Research/Evolution/Science', 75],
  ],
  title: 'Исследовать Научный Отдел 75-го уровня',
  text: '<p>Хотя у нас есть технологии, позволяющие корректировать геном любого человека, этот метод применяется далеко не всегда. Например, гораздо выгоднее вырастить специалиста, чем долго и нудно искать его среди сотен претендентов. И когда я говорю «вырастить» буквально я имею это в виду.</p><p>Лаборатория каждый год отбирает наиболее многообещающий биоматериал и на его основе конструирует геном будущего исследователя. Затем нам остаётся только сдать эмбрион в инкубатор и немного подождать.</p>',
  options: {
    accept: {
      text: 'Немного, ага.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
