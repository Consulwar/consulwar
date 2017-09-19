export default {
  id: 'Quest/Regular/Tamily/House/House85',
  condition: [
    ['Building/Residential/House', 85],
  ],
  title: 'Построить Жилой Комплекс 85-го уровня',
  text: '<p>Правитель, ко мне снова приходили сумасшедшие архитекторы. Им так понравились те самые квартиры-студии, что они предложили ещё один проект, теперь уже для санузла. Говорят, что при таком развитии науки и техники как-то неловко принимать душ в клетушке метр на два, да ещё и в компании хозяйственной машины. Поэтому они предлагают пристроить к спальне полноценную сауну с роботом-массажистом. Если вам эта идея не кажется бредом, скомандуйте, Консул — и они сразу же начнут сносить лишние стены.</p>',
  options: {
    accept: {
      text: 'И мне одного массажиста пришлите! Консул тоже человек.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 40000,
    crystals: 8000,
  },
};
