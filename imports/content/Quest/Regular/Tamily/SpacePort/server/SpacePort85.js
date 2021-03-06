export default {
  id: 'Quest/Regular/Tamily/SpacePort/SpacePort85',
  condition: [
    ['Building/Residential/SpacePort', 85],
  ],
  title: 'Построить Космопорт 85-го уровня',
  text: '<p>Сегодня у нас в Космопорте важный гость — доктор Бетругер. Он прибыл из далёкого мира, с которым, по его словам, можно наладить связь через телепорт. Но для того, чтобы поставить надёжные врата, ему понадобится помощь наших учёных.</p><p>Представьте, правитель, как упростится торговля, если у нас будут собственные врата в другой… Куда же вы, Консул?</p>',
  options: {
    accept: {
      text: 'Тамили, мне понадобится дробовик. И бензопила. А Космопорт теперь придётся ремонтировать.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 6000,
    crystals: 6000,
  },
};
