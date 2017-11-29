export default {
  id: 'Unit/Reptile/Ground/Air/Amphisbaena',
  title: 'Амфизбен',
  description: 'Как и флот рептилий, Амфизбен один из лучших представителей господства Рептилий в небе. Быстрый, мощный, мобильный, в небе ему нет равных — и в тоже время он совершенно «картонный». Амфизбен рассчитан на удар в первой волне, где его урон будет очень мощным, после чего наши Бгоневички без проблем порежут большую часть лётной техники Рептилий. Тем не менее первую волну атаки можно смело записывать на счёт Рептилоидов, и во многом именно за счёт Амфизбена.',
  basePrice: {
    unires: 15000,
  },
  characteristics: {
    weapon: {
      damage: { min: 5000, max: 7000 },
      signature: 60,
    },
    health: {
      armor: 2500,
      signature: 30,
    },
  },
  targets: [
    'Unit/Human/Ground/Air/Fast',
    'Unit/Human/Ground/Air/Xynlet',
    'Unit/Human/Ground/Air/Butterfly',
  ],
};
