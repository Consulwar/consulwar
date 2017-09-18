export default {
  id: 'Unit/Ground/Infantry/Reptile/Ripper',
  title: 'Потрошитель',
  description: 'Самые сильные и выносливые Рептилии проходят специальный курс обучения, после чего им самая дорога в потрошители. Мощные и выносливые солдаты своего Императора, они беспрекословно рвутся в бой, уничтожая на своём пути не только технику, но и легко расправляясь с нашей пехотой. Потрошители — опасные и хитрые юниты, Консул. С ними надо быть осторожнее.',
  basePrice: {
    humans: 1,
    metals: 1000,
    crystals: 600,
    time: 5,
  },
  characteristics: {
    damage: {
      min: 36,
      max: 45,
    },
    life: 22,
  },
  targets: [
    'Unit/Ground/Enginery/Human/EasyTank',
    'Unit/Ground/Enginery/Human/MotherTank',
    'Unit/Ground/Air/Human/Xynlet',
  ],
};
