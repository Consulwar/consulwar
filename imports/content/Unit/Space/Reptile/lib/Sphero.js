export default {
  id: 'Unit/Space/Reptile/Sphero',
  title: 'Сферо',
  description: 'Сферо – это боевой дрон Рептилий особого назначения. Он достаточно быстрый, чтобы иметь возможность уворачиваться от огня противника, и достаточно мощный, чтобы наносить серьёзный урон небольшим кораблям. А самое опасное в Сферо – это его система наведения, которая откалибрована настолько хорошо, что часто он попадает в боеукладку с первого выстрела… Если вы понимаете, о чём я.',
  basePrice: {
    metals: 6,
    crystals: 2.5,
    time: 30,
  },
  characteristics: {
    damage: {
      min: 40,
      max: 50,
    },
    life: 150,
  },
  targets: [
    'Unit/Space/Human/Gammadrone',
    'Unit/Space/Human/Wasp',
    'Unit/Space/Human/Mirage',
  ],
};
