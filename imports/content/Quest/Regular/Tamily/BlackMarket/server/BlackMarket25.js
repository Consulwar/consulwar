export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket25',
  condition: [
    ['Building/Residential/BlackMarket', 25],
  ],
  title: 'Построить Черный Рынок 25-го уровня',
  text: '<p>Правитель, на Рынок выкинули яйца. Ой, простите, — на Чёрный Рынок привезли интересных зародышей в яйцах, напоминающих куриные. Только там не птицы, а что-то вроде ящериц с крупными головами.</p><p>В описании говорится, что при правильном уходе такая ящерка может вырасти до десяти метров в длину. Центр Развлечений уже заинтересовался этим лотом, и у них есть план для нового тематического парка.</p>',
  options: {
    accept: {
      text: 'Ох-хо-хо, наймите ящеркам дрессировщика. Из военных.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 350,
    crystals: 350,
  },
};
