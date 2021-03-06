export default {
  id: 'Quest/Regular/ThirdEngineering/Gates/Gates65',
  condition: [
    ['Building/Military/Gates', 65],
  ],
  title: 'Построить Врата 65-го уровня',
  text: '<p>На этот раз Врата открылись прямо посреди поля битвы людей и каких-то существ. Армии – если их можно так назвать – были вооружены крайне примитивно, и в нас натурально полетели стрелы. И копья.</p><p>И наука знает, что ещё бы полетело, но мы успели дать упреждающий залп из здоровой ионной пушки, которая стояла в ангаре для профилактики. В голодранцев с луками мы, конечно, не попали, но зато взорвали вершину горы, которая маячила на горизонте. Будут знать, как связываться с инженерами!</p>',
  options: {
    accept: {
      text: 'Н-да… Никогда не доверял этой истории с кольцом.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2000,
    crystals: 2000,
  },
};
