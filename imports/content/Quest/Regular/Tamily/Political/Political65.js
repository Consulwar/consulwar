export default {
  id: 'Quest/Regular/Tamily/Political/Political65',
  condition: [
    ['Building/Residential/Political', 65],
  ],
  title: 'Построить Политический Центр 65-го уровня',
  text: '<p>Слава науке, мы наконец-то поняли, кто стоял за нападениями на Политцентр, правитель! Оказалось, что это радикальные представители так называемой «Партии пиратов», которые всё-таки выяснили, на что пошли их деньги.</p><p>В общем, наши пиджаки на всю сумму построили в сортире двухметровую хрустальную статую женского пола. С рыбой и веслом. И аргументировали это тем, что им, видите ли, необходимо размышлять о высоком, чтобы отвлечься от политических трудов. В жизни не слышала ничего глупее.</p>',
  options: {
    accept: {
      text: 'От пиджаков тоже бывает польза. Сделайте мне пятиметровую! И чтоб фонтан из рыбы.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 75,
    crystals: 75,
  },
};
