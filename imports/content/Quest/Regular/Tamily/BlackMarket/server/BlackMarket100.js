export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket100',
  condition: [
    ['Building/Residential/BlackMarket', 100],
  ],
  title: 'Построить Черный Рынок 100-го уровня',
  text: '<p>Правитель, к Рынку только что пришвартовался Кирдык-Крузер «Чёрнозуб». Сдаётся мне, мы поимели сомнительную честь принимать знаменитого корсара, грозу космоса, самого модного орка современности — капитана Бадрукка.</p><p>Я быстренько организую ему дорожку и цветы, а заодно предупрежу охрану, чтобы не очень пялилась на его зубы и знамена, и что у него там ещё понатыкано.</p>',
  options: {
    accept: {
      text: 'И поляну накрой, раз уж на то пошло. И не беспокой нас дня три.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4100,
    crystals: 4200,
  },
};
