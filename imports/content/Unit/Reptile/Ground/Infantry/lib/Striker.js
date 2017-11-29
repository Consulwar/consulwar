export default {
  id: 'Unit/Reptile/Ground/Infantry/Striker',
  title: 'Ударник',
  description: 'Ударники — это основа Рептилоидной армии. Они опасны и многочисленны — Император Рептилий не считая отсылает их миллионами на поле боя. У нас мало информации о том, откуда у чешуйчатых такое количество солдат, и как они умудряются пополнять их ряды так быстро. Кто-то поговаривал о клонировании, кто-то о некой матке Рептилий… Что звучит ещё глупее. Однако факт остаётся фактом — рептилий несметное количество, а ударники пусть и не самая серьёзная боевая единица, но они уж точно посильнее наших папань, к тому же превосходят нас количеством.',
  basePrice: {
    unires: 95,
  },
  characteristics: {
    weapon: {
      damage: { min: 2, max: 4 },
      signature: 5,
    },
    health: {
      armor: 12,
      signature: 3,
    },
  },
  targets: [
    'Unit/Human/Ground/Infantry/Fathers',
    'Unit/Human/Ground/Infantry/Horizontalbarman',
    'Unit/Human/Ground/Infantry/Psiman',
  ],
};
