export default {
  id: 'Quest/Daily/Mechanic/Bootlegging',
  title: 'Нелегальный алкоголь',
  text: 'Консул, я слышал, ты не прочь пропустить пару стаканчиков после тяжёлого рабочего дня. У меня есть знакомый, который готов достать несколько бутылок отличного «Шато Бордо де Блевуанье» по очень скромной цене без посредников. Скажу прямо: я с ним никогда не работал, так что за качество отвечать не могу.',
  answers: {
    iLikeThisIdea: {
      text: 'Дешёвое бухлишко? Давай номер.',
      win: 'Ну как всё прошло, Консул? Я вижу, что ты сэкономил неплохую сумму.',
      fail: 'Я никак не могу связаться с ним, Консул. Я дам знать, как только он объявится.',
    },
    strangeName: {
      text: 'Название какое-то подозрительное.',
      win: 'Согласен, Консул, но на вкус вроде бы ничего. Да и голова не болит. Хотя я не знаю, в каких количествах ты планируешь его употреблять.',
      fail: 'Я просто предлагаю, Консул. Если тебя смущает название, то можешь не брать. Всё просто.',
    },
    iGotMyOwn: {
      text: 'Нет, у меня свои каналы.',
      fail: 'Ну что же, Консул, это твоё право. Я просто предложил вариант.',
    },
  },
};
