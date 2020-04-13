export default {
  id: 'House/Throne/StripStool',
  isUnique: true,
  title: 'Эротический табурет',
  description: 'На этом стуле любой аватар будет выглядеть суперэротично. Поставь наконец этот предмет интерьера посреди Палаты и получи +5 к эротичности. А ещё в постаменте есть лампочки!',
  effects: {
    Price: [
      {
        textBefore: 'Подготовка наземных войск дешевле на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 2,
        affect: ['metals', 'crystals'],
        result() {
          return 5;
        },
      },
    ],
  },
};
