export default {
  id: 'Unit/Ground/Enginery/Reptile/Gecko',
  title: 'Геккон',
  description: 'Геккон — очень необычная артиллерия: этакая смесь новейших технологий и процесса работы старого образца. При всей своей напичканности системами наведения и уникальными ходовыми «лапами», позволяющими передвигаться по любой местности, а также быстро разворачивать орудия, установив Геккона в положение Артиллерии, данная техника всё равно стреляет обычными разрывными снарядами. Что не может не радовать нашу Тяжёлую технику, но крайне огорчает нашу пехоту',
  basePrice: {
    humans: 20,
    metals: 1500,
    crystals: 1000,
    time: 480,
  },
  characteristics: {
    damage: {
      min: 7600,
      max: 9500,
    },
    life: 2000,
  },
  targets: [
    'Unit/Ground/Enginery/Human/MotherTank',
    'Unit/Ground/Enginery/Human/HBHR',
    'Unit/Ground/Enginery/Human/EasyTank',
  ],
};
