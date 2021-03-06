export default {
  id: 'Quest/Regular/Tamily/Political/Political95',
  condition: [
    ['Building/Residential/Political', 95],
  ],
  title: 'Построить Политический Центр 95-го уровня',
  text: '<p>Вы будете удивлены, правитель, но теперь у нас действительно всегда есть добровольцы. Выяснилось, что если кто-то из наших серых пиджаков вылетает из Политцентра за неудовлетворительное качество работы, то потом ему становится практически невозможно подняться по любой карьерной лестнице, так как репутация шагает впереди него.</p><p>А в случае, если он удачно попадёт в число тех, кто самоотверженно сражался за нашу родную планету, то все его долги обществу как бы сгорают.</p>',
  options: {
    accept: {
      text: 'А если попадёт неудачно, то сгорает он сам… Вин-вин ситуэйшн!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 8000,
    crystals: 8000,
  },
};
