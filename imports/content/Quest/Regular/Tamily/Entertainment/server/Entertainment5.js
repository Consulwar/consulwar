export default {
  id: 'Quest/Regular/Tamily/Entertainment/Entertainment5',
  condition: [
    ['Building/Residential/Entertainment', 5],
  ],
  title: 'Построить Центр Развлечений 5-го уровня',
  text: '<p>Эффект превзошел все наши ожидания: вы только построили Центр, а людей на различные работы уже требуется гораздо меньше. Давайте улучшим Центр до пятого уровня, например, закупил им натольный теннис или, я не знаю, развивающие игры.</p>',
  options: {
    accept: {
      text: 'Да-да, я так и записываю: стриптиз и однорукие бандиты…',
      mood: 'positive',
    },
  },
  reward: {
    metals: 150,
    crystals: 150,
  },
};
