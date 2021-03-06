export default {
  id: 'Unit/Reptile/Ground/Infantry/Horror',
  title: 'Ужас',
  description: 'На самом деле мало кто видел Ужасов воочию, да ещё и чтобы выжить после этого. Так или иначе их описывают как странные дымящиеся силуэты. К счастью, в наших рядах есть не такие глупые ребята, как те, что держат оружие. Белые халаты объясняют это ментальным воздействием на разум. Ужасы, скорее всего, это высшая форма разведчиков рептилий, которые скрывают свой образ, внушая такие странные видения солдатам нашей армии. И всё же эти создания точно не из воздуха, чему свидетельствуют их ошмётки по всему полю боя после того, как там проработает наша артиллерия.',
  basePrice: {
    unires: 40000,
  },
  characteristics: {
    weapon: {
      damage: { min: 1250, max: 1750 },
      signature: 5,
    },
    health: {
      armor: 4250,
      signature: 3,
    },
  },
  targets: [],
  opponents: [
    'Unit/Human/Ground/Infantry/Lost',
    'Unit/Human/Ground/Enginery/HBHR',
    'Unit/Human/Ground/Air/Xynlet',
  ],
};
