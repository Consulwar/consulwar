export default {
  id: 'Unit/Space/Reptile/Sphero',
  title: 'Сферо',
  description: 'Сферо – это боевой дрон Рептилий особого назначения. Он достаточно быстрый, чтобы иметь возможность уворачиваться от огня противника, и достаточно мощный, чтобы наносить серьёзный урон небольшим кораблям. А самое опасное в Сферо – это его система наведения, которая откалибрована настолько хорошо, что часто он попадает в боеукладку с первого выстрела… Если вы понимаете, о чём я.',
  basePrice: {
    metals: 70,
    crystals: 30,
  },
  characteristics: {
    weapon: {
      damage: { min: 5, max: 7 },
      signature: 7,
    },
    health: {
      armor: 10,
      signature: 6,
    },
  },
  targets: [
    'Unit/Space/Human/Gammadrone',
    'Unit/Space/Human/Cruiser',
    'Unit/Space/Human/Battleship',
  ],
};
