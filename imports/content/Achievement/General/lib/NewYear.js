export default {
  id: 'Achievement/General/NewYear',
  levels: [100, 250, 500, 750, 1000],
  title: [
    'В новую эру',
    'В новую эру 2',
    'В новую эру 3',
  ],
  description: [
    'Провёл новый год в Консулах',
    'Провёл 2 новых года в Консулах',
    'Провёл 3 новых года в Консулах',
  ],
  effects: {
    Special: [
      {
        textBefore: 'Член длиннее на ',
        textAfter: 'см',
        priority: 1,
        result(level) {
          return level;
        },
      },
    ],
  },
};
