export default {
  id: 'Quest/Regular/NatalyVerlen/Alloy/Alloy70',
  condition: [
    ['Research/Evolution/Alloy', 70],
  ],
  title: 'Исследовать Особые Сплавы 70-го уровня',
  text: '<p>Весть о блестящих кнопках дошла и до обычных людей, Консул. В Жилых Комплексах теперь все хотят полированные ручки и подставки. Уму непостижимо, как нерационально ведут себя люди!</p><p>Но Лаборатория в очередной раз нашла выход из этой странной ситуации — мы снова запустим исследование Основных Сплавов, на сей раз посвящённое безопасности этих поверхностей при контакте. До политиканов мне нет никакого дела, но простых работяг нам будет не хватать. Приказывайте, Консул, и мы всё сделаем.</p>',
  options: {
    accept: {
      text: 'Чёрт, а я тоже приказал такую кнопку себе поставить…',
      mood: 'positive',
    },
  },
  reward: {
    metals: 70,
    crystals: 70,
  },
};