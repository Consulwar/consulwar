export default {
  id: 'Quest/Regular/NatalyVerlen/Nanotechnology/Nanotechnology55',
  condition: [
    ['Research/Evolution/Nanotechnology', 55],
  ],
  title: 'Исследовать Нанотехнологии 55-го уровня',
  text: '<p>Учёт и контроль – это не только шахты или торговый порт. Иногда прямо во время боя с чешуйчатыми нужно скрупулёзно подсчитывать потери, чтобы вовремя их восстановить. Речь идёт, конечно же, об Авианосце – настоящей фабрике дронов.</p><p>Здесь проходит и производство, и ремонт, и утилизация отходов, поэтому без отлаженной экспертной системы не обойтись. И я горжусь тем фактом, что каждый Авианосец оснащён нашей системой микрочипов, которые контролируют процесс даже в тяжелейших боевых условиях.</p>',
  options: {
    accept: {
      text: 'Кстати, об отходах – у них обломки ценные?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 1230,
    crystals: 520,
  },
};
