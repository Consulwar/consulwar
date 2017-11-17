export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket35',
  condition: [
    ['Building/Residential/BlackMarket', 35],
  ],
  title: 'Построить Черный Рынок 35-го уровня',
  text: '<p>У пиратов есть кое-что на продажу, правитель. Где-то они откопали старые обломки мощного ИИ, который не функционировал довольно долгое время. Однако некоторые его части даже в таком состоянии представляют интерес для наших учёных.</p><p>Правда, пираты намекают на какую-то таинственную историю про рыцаря Гуго, сломавшего мощный артефакт одним-единственным вопросом, но я думаю, они просто таким образом набивают цену на свой товар.</p>',
  options: {
    accept: {
      text: 'Спорим, он спросил, почему солнце встаёт на востоке, а заходит на западе?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 15,
    crystals: 16,
  },
};