export default {
  id: 'Unit/Ground/Air/Reptile/Amphisbaena',
  title: 'Амфизбен',
  description: 'Как и флот рептилий, Амфизбен один из лучших представителей господства Рептилий в небе. Быстрый, мощный, мобильный, в небе ему нет равных — и в тоже время он совершенно «картонный». Амфизбен рассчитан на удар в первой волне, где его урон будет очень мощным, после чего наши Бгоневички без проблем порежут большую часть лётной техники Рептилий. Тем не менее первую волну атаки можно смело записывать на счёт Рептилоидов, и во многом именно за счёт Амфизбена.',
  basePrice: {
    humans: 5,
    metals: 100,
    crystals: 45,
    time: 30,
  },
  characteristics: {
    damage: {
      min: 180,
      max: 225,
    },
    life: 350,
  },
  targets: [
    'Unit/Ground/Air/Human/Fast',
    'Unit/Ground/Air/Human/Grandmother',
    'Unit/Ground/Infantry/Human/Fathers',
  ],
};
