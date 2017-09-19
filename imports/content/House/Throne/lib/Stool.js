export default {
  id: 'House/Throne/Stool',
  name: 'Табурет',
  description: 'Вот не совсем понятно, если Аватар Консула во вселенной 42 – это специальный робот-аниматроник, тогда зачем ему удобства в виде всяких Тронов? Ради понтов? Пф! Консул выше этого.',
  effects: {
    Price: [
      {
        textBefore: 'Снижает стоимость постройки на ',
        textAfter: '%',
        priority: 2,
        affect: ['metals', 'crystals'],
        result() {
          return 1;
        },
      },
    ],
  },
  isUnique: true,
};
