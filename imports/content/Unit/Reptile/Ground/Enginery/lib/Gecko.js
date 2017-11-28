export default {
  id: 'Unit/Reptile/Ground/Enginery/Gecko',
  title: 'Геккон',
  description: 'Геккон — очень необычная артиллерия: этакая смесь новейших технологий и процесса работы старого образца. При всей своей напичканности системами наведения и уникальными ходовыми «лапами», позволяющими передвигаться по любой местности, а также быстро разворачивать орудия, установив Геккона в положение Артиллерии, данная техника всё равно стреляет обычными разрывными снарядами. Что не может не радовать нашу Тяжёлую технику, но крайне огорчает нашу пехоту',
  basePrice: {
    humans: 20,
    metals: 1500,
    crystals: 1000,
    time: 480,
  },
  characteristics: {
    weapon: {
      damage: { min: 4000, max: 10000 },
      signature: 20,
    },
    health: {
      armor: 16000,
      signature: 70,
    },
  },
  targets: [
    'Unit/Human/Ground/Enginery/MotherTank',
    'Unit/Human/Ground/Enginery/HBHR',
    'Unit/Human/Ground/Enginery/EasyTank',
  ],
};
