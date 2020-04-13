export default {
  id: 'House/Room/Club',
  isUnique: true,
  title: 'Стриптиз-клуб',
  description: 'Зачем вам соседняя луна, если можно устроить блядки прямо у себя в Палате? Сисек много не бывает, а если и бывает, то это не плохо. И вообще сиськи это не только ценная кожа...',
  effects: {
    Price: [
      {
        textBefore: 'Строительство наземных войск быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 12,
        affect: 'time',
        result() {
          return 5;
        },
      },
    ],
  },
};
