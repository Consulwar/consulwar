export default {
  id: 'Unit/Reptile/Ground/Enginery/Crusher',
  title: 'Крушитель',
  description: 'Крушитель чуть более поворотливый, чем наша Мамка, и гораздо меньших размеров. При этом особый наклон брони из странных сплавов, которые мы так и не смогли изучить, позволяет ему держать поразительное количество урона, при этом в ответ выдавая не меньше. И хоть ему не сравниться с нашими Тяжёлыми Танками, стоимость его гораздо ниже… Иначе как объяснить такое огромное количество этой техники в армии Рептилоидов?',
  basePrice: {
    unires: 60000,
  },
  characteristics: {
    weapon: {
      damage: { min: 9000, max: 10000 },
      signature: 60,
    },
    health: {
      armor: 35000,
      signature: 80,
    },
  },
  targets: [
    'Unit/Human/Ground/Enginery/MotherTank',
    'Unit/Human/Ground/Enginery/Grandmother',
    'Unit/Human/Ground/Air/Butterfly',
  ],
};
