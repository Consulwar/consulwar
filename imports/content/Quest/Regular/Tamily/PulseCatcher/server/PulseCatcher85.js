export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher85',
  condition: [
    ['Building/Residential/PulseCatcher', 85],
  ],
  title: 'Построить Импульсный Уловитель 85-го уровня',
  text: '<p>Как вы знаете, правитель, найти отличия между нейтронной звездой и кварковой, исходя только из наблюдений, почти невозможно, но учёные всё-таки нашли способ увидеть, что находится внутри таких звёзд.</p><p>Всё оказалось просто и элегантно: нужно просто найти двойную систему из нейтронных звёзд в состоянии, близком к коллапсу, и тщательно пронаблюдать эффекты от их столкновения. Даже если обе звезды окажутся нейтронными, мы всё равно получим много информации об их строении и физике.</p>',
  options: {
    accept: {
      text: 'Осталось только подтолкнуть пару звёзд в галактике. Или наш Уловитель и это может?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 90,
    crystals: 90,
  },
};