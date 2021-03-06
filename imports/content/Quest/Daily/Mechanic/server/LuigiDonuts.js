export default {
  id: 'Quest/Daily/Mechanic/LuigiDonuts',
  title: 'Пончики от Луиджи',
  text: 'Привет, Консул. Совет нашёл очередной способ испортить мне настроение: заблокировал перевод на один из моих счетов. Я хочу открыть на твоей колонии «Пончики от Луиджи», чтобы закончить все финансовые операции по сделке. Конечно, есть риски, но и я не с пустыми руками пришёл. Что скажешь?',
  answers: {
    doubleChocolate: {
      text: 'Шикарно! С двойным шоколадом будут?',
      win: 'Эм… Вообще я хотел сделать фиктивную фирму-однодневку, но ты оказался прав, Консул: меньше подозрений, запасной вариант всегда под рукой, да и местным, похоже, понравилось.',
      fail: 'Нет, Консул, но будут со вкусом двойных проблем: Совет запросил регистрационные документы на проверку. Кажется, они что-то подозревают. Я сворачиваюсь.',
    },
    beerShop: {
      text: 'Лучше бы пивной ларёк открыл.',
      win: 'Как скажешь, Консул. Всё равно это заведение появится лишь на бумаге. Я сообщу, как только завершу последние транзакции.',
      fail: 'Слишком рискованно, Консул. Питейные заведения требуют особых документов, и есть риск не пройти верификацию. Если ты настаиваешь, то я поищу другой способ.',
    },
    iDontWannaGoToAPrison: {
      text: 'А если меня загребут за отмывание?',
      win: 'Твоего имени в документах нет и не будет, Консул. На худой конец, скажешь, что ты маленькая девочка и боишься играть не по правилам. Ах, нет, не то. Скажешь, что понятия не имеешь, чья это палатка.',
      fail: 'Вряд ли, Консул, ведь от тебя в этой схеме нужна лишь формально выделенная земля. Но если ты так переживаешь, то я поищу другое место.',
    },
  },
};
