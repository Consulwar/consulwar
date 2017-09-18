export default {
  id: 'Unit/Ground/Infantry/Reptile/TooFucking',
  title: 'Крайне ебучие рептилоиды',
  description: 'Быстрые и смертоносные войска Рептилий. Появляются незаметно, молниеносно вырезают пехоту и так же аккуратно уходят во тьму. Крайне хитры и опасны, без специальной техники с радарами и противопехотным оружием не рекомендуется вступать в бой. Наземным войскам остаётся держать оборону, пехота лишь большими отрядами имеет хоть какие-то шансы против Крайне Ебучих Рептилоидов.',
  basePrice: {
    humans: 50000,
    time: 1,
  },
  characteristics: {
    damage: {
      min: 16000,
      max: 20000,
    },
    life: 30000,
  },
  targets: [
    'Unit/Ground/Infantry/Human/Lost',
    'Unit/Ground/Infantry/Human/Horizontalbarman',
    'Unit/Ground/Infantry/Human/Fathers',
  ],
};
