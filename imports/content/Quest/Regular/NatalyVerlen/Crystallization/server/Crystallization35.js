export default {
  id: 'Quest/Regular/NatalyVerlen/Crystallization/Crystallization35',
  condition: [
    ['Research/Evolution/Crystallization', 35],
  ],
  title: 'Исследовать Кристаллизацию 35-го уровня',
  text: '<p>Консул, я знаю, что у нас тут серьёзное учреждение, но иногда нужно отвлечься от работы и поехать, например, в Центр Развлечений. Это я к тому, что нам пришла заявка на изготовление лодок из наших новеньких композитных материалов на основе жидкого кристалла.</p><p>Такие лодки могут быть любой формы, размера, любого цвета – хоть радужные. Вместе с тем, они будут прочнее стали, лёгкие и стойкие к различным загрязнениям. Как ни посмотри, наш новый материал послужит хорошему и нужному делу.</p>',
  options: {
    accept: {
      text: 'Э-э-э… Ну хорошо, только радужными их не делай, пожалуйста.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 65,
    crystals: 65,
  },
};
