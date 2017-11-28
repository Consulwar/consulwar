export default {
  id: 'Unit/Reptile/Ground/Enginery/Crusher',
  title: 'Крушитель',
  description: 'Крушитель чуть более поворотливый, чем наша Мамка, и гораздо меньших размеров. При этом особый наклон брони из странных сплавов, которые мы так и не смогли изучить, позволяет ему держать поразительное количество урона, при этом в ответ выдавая не меньше. И хоть ему не сравниться с нашими Тяжёлыми Танками, стоимость его гораздо ниже… Иначе как объяснить такое огромное количество этой техники в армии Рептилоидов?',
  basePrice: {
    humans: 500,
    metals: 6000,
    crystals: 1200,
    time: 180,
  },
  characteristics: {
    damage: {
      min: 1200,
      max: 1500,
    },
    life: 35000,
  },
  targets: [
    'Unit/Human/Ground/Enginery/EasyTank',
    'Unit/Human/Ground/Enginery/Grandmother',
    'Unit/Human/Ground/Enginery/HBHR',
  ],
};
