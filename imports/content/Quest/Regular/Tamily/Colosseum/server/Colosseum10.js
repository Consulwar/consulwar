export default {
  id: 'Quest/Regular/Tamily/Colosseum/Colosseum10',
  condition: [
    ['Building/Residential/Colosseum', 10],
  ],
  title: 'Построить Колизей 10-го уровня',
  text: '<p>Теперь, когда бои проводятся регулярно и артефакты текут рекой, настала пора поставить в Колизее защиту от мошенничества, правитель, потому что кое-кто использует свои способности для того, чтобы мухлевать со ставками.</p><p>Думаю, после того, как мы поставим сканеры пси-способностей в зале и охрану на выходе, юный Язон динАльт перестанет внушать работникам Колизея, что он только что выиграл крупную сумму кредитов.</p>',
  options: {
    accept: {
      text: 'Ах, Язон! Гхм… Да, ты права, Тамили, мы никому не позволим здесь мухлевать!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2600,
    crystals: 1700,
  },
};
