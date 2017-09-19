export default {
  id: 'Quest/Regular/Tamily/Colosseum/Colosseum100',
  condition: [
    ['Building/Residential/Colosseum', 100],
  ],
  title: 'Построить Колизей 100-го уровня',
  text: '<p>Устроители давно ломали голову в попытках изобрести самый кровавый и зрелищный турнир, и придумали! Они отправили в Бездну Потерянных с приказом доставить самого скромного и маленького демона, чтобы против него сражались победители всех предыдущих турниров.</p><p>И Потерянные не подвели – они притащили какую-то жуткую красную бабайку, которая называет себя сыном Ангрона. Военные клянутся, что новый турнир затмит все предыдущие, Консул, и я им почему-то верю.</p>',
  options: {
    accept: {
      text: 'Если не затмит, я их самих отправлю к этому Андрону.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 421000,
    crystals: 289000,
  },
};
