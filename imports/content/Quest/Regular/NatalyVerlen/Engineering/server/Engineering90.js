export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering90',
  condition: [
    ['Research/Evolution/Engineering', 90],
  ],
  title: 'Исследовать Оборонную Инженерию 90-го уровня',
  text: '<p>Грузовой корабль, который вёз броню для Космической Станции, только что передал аварийный сигнал. Кажется, один из инженеров увлёкся спором о том, как именно нужно разгружать листы брони, и случайно нажал кнопку освобождения груза еще до того, как они успели пристыковаться.</p><p>В общем, первыми обосравшимися на орбите космонавтами можно официально считать экипаж станции после того, как они увидели пачку бронелистов, летящих прямо на них красивым веером.</p>',
  options: {
    accept: {
      text: 'И я могу их понять!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 7000,
    crystals: 7000,
  },
};
