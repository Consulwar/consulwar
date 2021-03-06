export default {
  id: 'Quest/Regular/NatalyVerlen/Science/Science40',
  condition: [
    ['Research/Evolution/Science', 40],
  ],
  title: 'Исследовать Научный Отдел 40-го уровня',
  text: '<p>Наши учёные решили использовать последовательности нуклеотидов – строительных кирпичиков ДНК – для шифровки важных сообщений.</p><p>Для этого выстраивается длинная цепочка, где каждые три нуклеотида обозначают какую-либо цифру или букву, затем её перемешивают с обычной человеческой ДНК, раствор наносят на бумажный документ и отправляют в соседний отдел на расшифровку. Результаты весьма обнадёживают, Консул, эффективность этого метода шифровки приближается к ста процентам.</p>',
  options: {
    accept: {
      text: 'Попробуйте полевые испытания, вас ждёт сюрприз.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
  },
};
