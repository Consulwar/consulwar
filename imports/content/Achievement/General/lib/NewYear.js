export default {
  id: 'Achievement/General/NewYear',
  title: 'В новую эру',
  description: 'Провёл новый год в Консулах',
  effects: {
    Special: [
      {
        textBefore: 'С ',
        textAfter: '% шансом каждый караван становится новогодним',
        condition: 'Unique/fleetBattleAddCreditsChance',
        priority: 1,
        affect: 'chance',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 5 : 0;
        },
      },
    ],
  },
};
