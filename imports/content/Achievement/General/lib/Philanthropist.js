export default {
  id: 'Achievement/General/Philanthropist',
  title: 'Филантроп',
  description: 'Помог проекту в трудные времена',
  effects: {
    Special: [
      {
        textBefore: '',
        textAfter: '',
        priority: 1,
        result({ level }) {
          return (
            (level === 1)
              ? 'Бонуса нет — настоящему филантропу он не нужен'
              : 0
          );
        },
      },
    ],
  },
};
