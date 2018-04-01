export default {
  id: 'Quest/Regular/NatalyVerlen/Drill/Drill80',
  condition: [
    ['Research/Evolution/Drill', 80],
  ],
  title: 'Исследовать Бурильный Бур 80-го уровня',
  text: '<p>Консул, проблемы с водой в шахте пошли на убыль, однако расслабляться рано – с одной из выработок пришли тревожные вести о кавернах в пластах слоистых пород. До сих пор бурение на всех шахтах металла шло через равномерные прочные породы, поэтому волноваться приходилось только о повышении температуры и давления.</p><p>Теперь, если бур попадёт в одну из каверн во время работы, то велика вероятность того, что мы потеряем часть этого сложного механизма, потому что он просто застрянет в какой-нибудь дыре.</p>',
  options: {
    accept: {
      text: 'А я уже застрял. Помогите!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
