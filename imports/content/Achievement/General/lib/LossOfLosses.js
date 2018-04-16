export default {
  id: 'Achievement/General/LossOfLosses',
  field: 'Quests/Daily/Fail',
  levels: [200],
  title: 'Потеря потерь',
  description: 'Зафейлить 200 ежедневных заданий',
  effects: {
    Special: [
      {
        textBefore: 'Поставка ресурсов за ежедневные задания +',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/dailyQuestReward',
        affect: ['crystals', 'metals'],
        result({ level }) {
          return level * 10;
        },
      },
    ],
  },
};
