export default {
  id: 'Quest/Regular/Tamily/Entertainment/Entertainment45',
  condition: [
    ['Building/Residential/Entertainment', 45],
  ],
  title: 'Построить Центр Развлечений 45-го уровня',
  text: '<p>Консул, прекрасные новости про Центры Развлечений! Тематический парк про копание так понравился горожанам, что инженеры решили сделать еще один, на этот раз — про поле боя. Из желающих формируется две команды, одна из которых переодета Рептилоидами, а другая — турникмэнами, а потом командам дают лазерное оружие пониженной мощности и выпускают на арену с развалинами и парой картонных деревьев. Ни о какой тактике, разумеется, не идёт и речи, после начала боя на карте немедленно образуется куча мала. Последний выживший получает жестяную медальку и бесплатный обед. Как вам такая идея, правитель?</p>',
  options: {
    accept: {
      text: 'Отлично! А ставки там кто-нибудь принимает?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 64500,
    crystals: 71000,
  },
};
