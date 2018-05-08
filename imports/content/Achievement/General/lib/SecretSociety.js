export default {
  id: 'Achievement/General/SecretSociety',
  field: 'chat.dice',
  levels: [1000],
  title: 'Тайное общество',
  description: 'Знает то, чего не знают другие',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' ГГК в час',
        priority: 1,
        affect: 'credits',
        result({ level }) {
          return (level > 0) ? 0.02 : 0;
        },
      },
    ],
  },
};
