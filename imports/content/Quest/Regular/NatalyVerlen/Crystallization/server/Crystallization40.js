export default {
  id: 'Quest/Regular/NatalyVerlen/Crystallization/Crystallization40',
  condition: [
    ['Research/Evolution/Crystallization', 40],
  ],
  title: 'Исследовать Кристаллизацию 40-го уровня',
  text: '<p>Наши лодки для Центра Развлечений так приглянулись инженерам, что они прислали заказ на технологию изготовления дверных и оконных проёмов, стенных панелей и ещё всякого по мелочи.</p><p>И я их прекрасно понимаю, Консул, ведь наш материал не только легче и прочнее обычного, он ещё и негорючий, и экологичный, а это очень важно учитывать при строительстве жилого района. Так что мы уже развернули масштабные работы совместно с инженерами, и, надеюсь, скоро сможем начать налаживать новые производства.</p>',
  options: {
    accept: {
      text: 'Хм… а мне бы тоже тут немножко палату подновить…',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
  },
};
