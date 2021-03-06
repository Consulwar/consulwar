export default {
  id: 'Quest/Daily/Calibrator/Grey',
  title: 'Онлайн-симпозиум',
  text: 'Ох, здравствуйте, Консул. Вчера на ежегодном онлайн-симпозиуме калибраторов обсуждалась проблема многопотоковой глубокоуровневой обработки плотно интегрированных пакетов данных. Одна участница представила работы, в которых ей удалось выполнить сложные операции с тремя и более пакетами и довести все пакеты до полной расшифровки. Настоящий профессионал, не так ли?',
  answers: {
    thisIsSasha: {
      text: 'Кажется, я знаю, о ком ты говоришь. Её Саша зовут?',
      win: 'Ничего себе, Консул. Не ожидал, что вы интересуетесь такими вопросами. Её действительно зовут Саша. Саша Уайт.',
      fail: 'Нет, Консул, её зовут Ашвакара Ганди. Кажется, родом из колонии Хиндия. Кстати, их подходы к написанию алгоритмов обработки данных заводят в тупик многих ведущих специалистов.',
    },
    SuchWow: {
      text: 'Какая проблема? Да-да, очень важные новости.',
      win: 'Приятно видеть, Консул, что помимо узкоспециализированных профессионалов, о важных научных достижения знают и простые люди.',
      fail: 'Кажется, вам не очень-то интересно, Консул. Ну что же, это действительно специфичная новость. Я должен возвращаться к работе.',
    },
    maybeSomeAnimals: {
      text: 'Люблю многопоточность. А внедрения животных в обработку не было?',
      win: 'Нет, Консул, но вы могли бы подготовить доклад к следующему заседанию, если ваша идея действительно стоящая.',
      fail: 'Боюсь, Консул, ваша идея не найдёт достойной реализации. Живой организм всегда подразумевает фактор спонтанности, а это непозволительная роскошь для нас.',
    },
  },
};
