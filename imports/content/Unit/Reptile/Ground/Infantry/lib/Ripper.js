export default {
  id: 'Unit/Reptile/Ground/Infantry/Ripper',
  title: 'Потрошитель',
  description: 'Самые сильные и выносливые Рептилии проходят специальный курс обучения, после чего им самая дорога в потрошители. Мощные и выносливые солдаты своего Императора, они беспрекословно рвутся в бой, уничтожая на своём пути не только технику, но и легко расправляясь с нашей пехотой. Потрошители — опасные и хитрые юниты, Консул. С ними надо быть осторожнее.',
  basePrice: {
    unires: 1000,
  },
  characteristics: {
    weapon: {
      damage: { min: 60, max: 80 },
      signature: 6,
    },
    health: {
      armor: 100,
      signature: 5,
    },
  },
  targets: [
    'Unit/Human/Ground/Infantry/Horizontalbarman',
    'Unit/Human/Ground/Enginery/Agmogedcar',
    'Unit/Human/Ground/Air/Grandmother',
  ],
  opponents: [
    'Unit/Human/Ground/Infantry/Lost',
    'Unit/Human/Ground/Enginery/HBHR',
    'Unit/Human/Ground/Air/Xynlet',
  ],
};
