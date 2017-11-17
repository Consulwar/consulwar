export default {
  id: 'Quest/Regular/NatalyVerlen/Nanotechnology/Nanotechnology35',
  condition: [
    ['Research/Evolution/Nanotechnology', 35],
  ],
  title: 'Исследовать Нанотехнологии 35-го уровня',
  text: '<p>Кстати, а вы знали, Командующий, что наработки нашего отдела уже давно используются космическим флотом? В своё время мы передали им технологию, преодолевающую стандартный квантовый предел в гиперпространстве.</p><p>К сожалению, перегрузки при включении нашего изобретения велики настолько, что разрушают любую электронику, не говоря уже о живых людях. А вот массивные грузы благодаря ей могут доставляться почти мгновенно, поэтому наша система стоит на каждом Траке вашего флота.</p>',
  options: {
    accept: {
      text: 'Честь от Совета, как я погляжу, тоже Траки доставляют.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 390,
    crystals: 165,
  },
};