export default {
  id: 'Quest/Regular/ThirdEngineering/Laboratory/Laboratory65',
  condition: [
    ['Building/Military/Laboratory', 65],
  ],
  title: 'Построить Лабораторию 65-го уровня',
  text: '<p>Командир, похоже, нам ужасно повезло. В нашем рукаве галактики вот-вот взорвётся сверхновая, и Лаборатория, естественно, хочет отправить оборудование и людей на расстояние в световой час от взрыва. Говорят, никто ещё не подбирался так близко.</p><p>А если вы дадите немного ресурсов, то наши учёные смогут даже изучить вещество в ядре этой нестабильной звезды! Они планируют сделать это, послав зонд прямо в эпицентр взрыва через гипертоннель. Конечно, эксперимент рискованный, но очень перспективный.</p>',
  options: {
    accept: {
      text: 'Второй конец тоннеля сюда не тяните только.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2000,
    crystals: 2000,
  },
};
