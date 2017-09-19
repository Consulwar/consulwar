export default {
  id: 'Quest/Regular/NatalyVerlen/Ikea/Ikea20',
  condition: [
    ['Research/Evolution/Ikea', 20],
  ],
  title: 'Исследовать Мебель из Икеа 20-го уровня',
  text: '<p>Теперь, когда у нас все обеспечены работой, нужно подумать и об отдыхе. Население приходит домой после напряжённого рабочего дня и хочет упасть в удобное кресло, а после него – в такую же удобную кровать. Учитывая всё это, наш отдел разработки мебели сконструировал очень мягкие и комфортные образцы.</p><p>Я сама принимала участие в тестировании и могу с уверенностью сказать, что этот отдел поспособствует не только отдыху граждан, но и некоторому взрыву рождаемости. Если вы понимаете, о чём я.</p>',
  options: {
    accept: {
      text: 'О, я понимаю. А где они тестируют?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5500,
    crystals: 5500,
  },
};
