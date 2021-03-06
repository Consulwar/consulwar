export default {
  id: 'Unit/Reptile/Space/Armadillo',
  title: 'Броненосец',
  description: 'Броненосцы – это корабли отвода огня. Даже суммарный урон у них не такой уж и высокий, зато это настоящие гигантские космические крепости с очень серьёзными показателями брони. Пробить Броненосца сможет далеко не каждый корабль нашего Флота, и придётся серьёзно постараться, чтобы уничтожить Броненосец. Особенно если учесть, как они играют роль этакого фронтлайнера. Броненосцы вылетают вперёд своего флота и двигаются так, чтобы ловить на себя весь урон от ваших кораблей, при этом прикрывая собой основные корабли-орудия флота Рептилий. Это крайне умный ход, Консул. Рептилии – хитрые твари.',
  basePrice: {
    metals: 260000,
    crystals: 80000,
  },
  characteristics: {
    weapon: {
      damage: { min: 2000, max: 2000 },
      signature: 40,
    },
    health: {
      armor: 1000000,
      signature: 8000,
    },
  },
  targets: [
    'Unit/Human/Space/Gammadrone',
    'Unit/Human/Space/Wasp',
    'Unit/Human/Space/Mirage',
  ],
  opponents: [
    'Unit/Human/Space/Reaper',
    'Unit/Human/Space/Dreadnought',
    'Unit/Human/Space/Battleship',
  ],
};
