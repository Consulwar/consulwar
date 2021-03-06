export default {
  id: 'Quest/Regular/NatalyVerlen/Energy/Energy30',
  condition: [
    ['Research/Evolution/Energy', 30],
  ],
  title: 'Исследовать Энергетику 30-го уровня',
  text: '<p>А помните кристальную плазму, Консул? Наши исследования продвинулись настолько, что мы теперь можем создавать плазму, пригодную для использования в медицине. «Холодная плазма» прекрасно заживляет глубокие раны, а также дезинфицирует их.</p><p>Мы работаем над тем, чтобы создать несколько портативных установок, которые будут использоваться во время ведения боёв. Возможно, они будут иметь вид ранцев, которые бойцы поддержки будут носить на спине.</p>',
  options: {
    accept: {
      text: 'Ага, и раздавать со словами: «Вот вам немножко аспирина!»',
      mood: 'positive',
    },
  },
  reward: {
    metals: 400,
    crystals: 400,
  },
};
