export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering95',
  condition: [
    ['Research/Evolution/Engineering', 95],
  ],
  title: 'Исследовать Оборонную Инженерию 95-го уровня',
  text: '<p>Слава науке, наши инженеры смогли разобраться с аварийной ситуацией, которую создали разлетевшиеся бронелисты. Это было нелегко: листы благополучно миновали Станцию, но после этого они начали дрейфовать на орбите, всё больше отдаляясь друг от друга.</p><p>Внезапно мы получили двести потенциально смертельно опасных объектов, угрожающих всем сооружениям и кораблям вблизи планеты. Но все закончилось хорошо – последний лист только что был успешно установлен и надёжно закреплён.</p>',
  options: {
    accept: {
      text: 'Так вот почему два дня все бегали и кричали в рации!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 220,
    crystals: 220,
  },
};