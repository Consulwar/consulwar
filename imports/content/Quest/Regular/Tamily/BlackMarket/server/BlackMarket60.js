export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket60',
  condition: [
    ['Building/Residential/BlackMarket', 60],
  ],
  title: 'Построить Черный Рынок 60-го уровня',
  text: '<p>О, прибыл пиратский корабль Дона Майлза — известного флибустьера и джентльмена удачи, как он сам себя называет. Чувак совершенно поехал на исторических сказках и всерьёз считает себя потомком древнего убийцы из ордена ассасинов, за которым охотится не менее древний орден… уже не помню, кого.</p><p>Хлама, которого привозит нам Дон, ему аккуратно хватает на еду и топливо, а потом он снова исчезает в бурном океане космоса на месяц-другой.</p>',
  options: {
    accept: {
      text: 'Если золотое яблоко привезёт, купи и отдай учёным. Так, на всякий случай.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 25,
    crystals: 26,
  },
};