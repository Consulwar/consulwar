export default {
  id: 'Quest/Regular/Tamily/Crystal/Crystal85',
  condition: [
    ['Building/Residential/Crystal', 85],
  ],
  title: 'Построить Шахту Кристалла 85-го уровня',
  text: '<p>Правитель, шахты Кристалла рапортуют об успешном освоении всех месторождений, которые находятся относительно неглубоко. Это, конечно, замечательно, но на деле означает, что теперь придётся копать и бурить. Инженеры уже прислали мне смету на новое оборудования для шахт, и она меня совсем не радует.</p><p>Но что делать — ведь вам нужен Кристалл, и потребность эта будет только расти со временем. Поэтому я предлагаю закупить всё необходимое и надеяться на солидную прибавку к добыче. Ну а если что, прикажете всех расстрелять. Шучу. Наверное.</p>',
  options: {
    accept: {
      text: 'Как знать, как знать.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 6000,
    crystals: 6000,
  },
};
