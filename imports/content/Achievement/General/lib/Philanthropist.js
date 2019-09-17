export default {
  id: 'Achievement/General/Philanthropist',
  title: 'Филантроп',
  description: 'Помог проекту в трудные времена',
  effects: {
    Special: [
      {
        textBefore: 'Бонуса нет — настоящему филантропу он не нужен',
        result() {},
      },
    ],
  },
};
