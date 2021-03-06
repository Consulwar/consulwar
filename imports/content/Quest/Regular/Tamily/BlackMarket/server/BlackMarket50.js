export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket50',
  condition: [
    ['Building/Residential/BlackMarket', 50],
  ],
  title: 'Построить Черный Рынок 50-го уровня',
  text: '<p>Хоть я не слишком хорошо отношусь к пиратам, сегодня они привезли на продажу действительно ценный груз. Каким-то неведомым образом им удалось обобрать грузовой корабль корпорации «Шариф Индастриз», и теперь мы можем купить технологии протезирования в два раза дешевле.</p><p>Естественно, после сделки нам придётся анонимно сдать пиратов корпорации — или ждать, когда за нами придёт их знаменитая служба безопасности.</p>',
  options: {
    accept: {
      text: 'Ай нева аскед фор дыс, ёлы-палы!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 700,
    crystals: 700,
  },
};
