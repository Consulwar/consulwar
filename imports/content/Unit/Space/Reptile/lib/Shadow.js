export default {
  id: 'Unit/Space/Reptile/Shadow',
  title: 'Тень',
  description: 'Тень. Честно говоря, Великий Консул, Тень Флота Рептилий встречали крайне мало людей, ещё меньше людей остались в живых, чтобы потом рассказать об этой встрече. Насколько нам известно, этот корабль вовсе не невидимый и не полностью чёрный или что-то вроде того, как могло показаться из его названия, вовсе нет. На самом деле Тень прозвали так из-за его уникального основного орудия, которое создаёт небольшую гипердыру в центре вашего корабля. Эта гипердыра очень похожа на чёрную дыру, вот только она не затягивает в себя частицы и свет, а действует немного иначе… Создаёт этакий пузырь, на стенках которого появляется некая энергия… Эх. Короче… Мы, блядь, понятия не имеем, что за хуетой стреляет этот корабль. Но она пиздец какая чёрная и разносит корабли на куски. Надеюсь, вы никогда не встретите этот корабль Рептилий, Консул…',
  basePrice: {
    humans: 150000,
    metals: 30000,
    crystals: 5000,
    time: 60 * 60 * 24 * 3,
  },
  characteristics: {
    damage: {
      min: 400000,
      max: 500000,
    },
    life: 1000000,
  },
  targets: [
    'Unit/Space/Human/Flagship',
    'Unit/Space/Human/Reaper',
    'Unit/Space/Human/Railgun',
  ],
};
