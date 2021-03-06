export default {
  id: 'Quest/Regular/Tamily/Crystal/Crystal45',
  condition: [
    ['Building/Residential/Crystal', 45],
  ],
  title: 'Построить Шахту Кристалла 45-го уровня',
  text: '<p>В К-лаборатории, которая находится в шахте Кристалла, возникли некоторые сложности с растворами. Дело в том, что для оружия, энергетики и всего прочего нужны растворы Жидкого Кристалла разной концентрации, а лаборанты часто забывают снабдить этикетками новую партию.</p><p>Система автоматического учёта очень помогла бы в этой сложной ситуации, Консул. Да и выход Кристалла заметно увеличился бы. Так что все работники находятся сейчас в состоянии повышенной готовности и ждут только вашего приказа о начале работ.</p>',
  options: {
    accept: {
      text: 'А там у них лишних этикеток не бывает? Я бы поклеил куда-нибудь…',
      mood: 'positive',
    },
  },
  reward: {
    metals: 600,
    crystals: 600,
  },
};
