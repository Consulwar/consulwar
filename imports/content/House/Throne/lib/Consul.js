export default {
  id: 'House/Throne/Consul',
  title: 'Трон Консула',
  description: 'У каждого правителя должен быть свой Трон. Этот Трон был специально изготовлен для вашего аватара, Консул. Это один из символов вашей власти, вашей непоколебимой воли и справедливых решений. Вы уникальны, и этот трон – ваш.',
  effects: {
    Income: [
      {
        textBefore: '',
        textAfter: ' грамм кристалла в час',
        priority: 1,
        affect: 'crystals',
        result() {
          return 10;
        },
      },
    ],
  },
};
