export default {
  id: 'Unit/Reptile/Space/Octopus',
  title: 'Спрут',
  description: 'Несмотря на сплэш-урон Призмы, королём в уничтожении всех и сразу является, конечно же, Спрут. Его особая система вооружения создаёт сильное электромагнитное поле, которое при запуске спиралью закручивается в своего рода электроплазма-шар. Под действием гравитации, вызванной высокой скоростью вращения, этот плазма-шар взрывается в нужной точке, нанося серьёзный урон кораблям внутри взрыва и отключая их электронику. Обычно Спрутов используют для уничтожения кораблей среднего класса – они менее подвижны, и возле них часто много более мелких целей.',
  basePrice: {
    metals: 700000,
    crystals: 100000,
  },
  characteristics: {
    weapon: {
      damage: { min: 72000, max: 88000 },
      signature: 560,
    },
    health: {
      armor: 1500000,
      signature: 2200,
    },
  },
  targets: [
    'Unit/Human/Space/Cruiser',
    'Unit/Human/Space/Frigate',
    'Unit/Human/Space/Carrier',
  ],
  opponents: [
    'Unit/Human/Space/Dreadnought',
    'Unit/Human/Space/Railgun',
    'Unit/Human/Space/Reaper',
  ],
};
