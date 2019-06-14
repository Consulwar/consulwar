export default {
  id: 'Unit/Human/Ground/Infantry/Horizontalbarman',
  title: 'Турникмэн',
  description: 'Качаешься ты такой на турничке, и тут опа! — планета с колен поднимается и на войну с Рептилоидами отправляется. Дрыщавых Папань, увы, не нагрузишь тяжёлым вооружением, так что другие мастера «бесполезной траты человеческого потенциала» пришлись весьма кстати. Благодаря своей недюжинной физической силе и практически полному отсутствию мозгов, Турникмэны крайне полезны в качестве тяжёлой пехоты с большими пушками. И если Папки, по сути, являются живым щитом между ордами рептилоидов и вашей Консульской задницей, то Турникмэны — это ваш мощный плевок в сторону техники ящерок. Вооружённые и обученные (в меру своих сил), они отлично справляются с авиацией и лёгкими танками, а если поблизости всё уже уничтожено, то возьмутся и за артиллерию.',
  basePrice: {
    humans: 1,
    metals: 285,
    crystals: 170,
    time: 333,
  },
  queue: 'Ground/Infantry',
  characteristics: {
    weapon: {
      damage: { min: 175, max: 225 },
      signature: 26,
    },
    health: {
      armor: 42,
      signature: 6,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Air/Amphibian',
    'Unit/Reptile/Ground/Enginery/Patron',
    'Unit/Reptile/Ground/Enginery/Crusher',
  ],
  requirements() {
    return [
      ['Building/Military/Barracks', 28],
      ['Research/Evolution/Alloy', 20],
    ];
  },
};
