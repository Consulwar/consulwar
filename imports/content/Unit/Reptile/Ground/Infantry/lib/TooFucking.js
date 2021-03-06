export default {
  id: 'Unit/Reptile/Ground/Infantry/TooFucking',
  title: 'Крайне ебучие рептилоиды',
  description: 'Быстрые и смертоносные войска Рептилий. Появляются незаметно, молниеносно вырезают пехоту и так же аккуратно уходят во тьму. Крайне хитры и опасны, без специальной техники с радарами и противопехотным оружием не рекомендуется вступать в бой. Наземным войскам остаётся держать оборону, пехота лишь большими отрядами имеет хоть какие-то шансы против Крайне Ебучих Рептилоидов.',
  basePrice: {
    unires: 240000,
  },
  characteristics: {
    weapon: {
      damage: { min: 5000, max: 7000 },
      signature: 4,
    },
    health: {
      armor: 15000,
      signature: 1,
    },
  },
  targets: [
    'Unit/Human/Ground/Infantry/Lost',
    'Unit/Human/Ground/Infantry/Psiman',
    'Unit/Human/Ground/Infantry/Horizontalbarman',
  ],
  opponents: [
    'Unit/Human/Ground/Infantry/Lost',
    'Unit/Human/Ground/Enginery/HBHR',
    'Unit/Human/Ground/Air/Xynlet',
  ],
};
