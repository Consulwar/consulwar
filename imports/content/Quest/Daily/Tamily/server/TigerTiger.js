export default {
  id: 'Quest/Daily/Tamily/TigerTiger',
  title: '«Тигр! Тигр!»',
  text: 'Срочная эвакуация, Правитель! В цирке братьев Раскрашенных из-за сбоя в системе энергоснабжения случилось короткое замыкание, и все магнитные замки на клетках с тиграми вышли из строя. Теперь мне придётся организовывать работы по вывозу всего населения из жилого района, к которому примыкало их здание. Я не говорю уже про сворачивание деятельности центров развлечений. Если мы не поймаем этих тигров до полуночи, Консул, весь район погрузится в коллапс.',
  answers: {
    fear: {
      text: 'Что?! Немедленно запереть все внешние двери и проверить мои покои! Тамили, ты лично отвечаешь за безопасность cвоего Императора.',
      win: 'Я готова нести вахту у ваших дверей всю ночь, если это поможет, Консул.',
      fail: 'Не уверена, что животные смогут взломать вашу систему охраны, правитель. Вы в полной безопасности, чего не скажешь о жителях.',
    },
    guess: {
      text: 'Как ты думаешь, Тамили, что тигры будут искать в жилом районе? Я вот точно знаю, куда бы я пошёл на их месте…',
      win: '…если бы вырвались из клетки? О наука, ну конечно же! Я немедленно затребую тигрицу из другого цирка, а военные в центре развлечений проведут операцию «Ловля на живца».',
      fail: 'Мы, конечно, оцепим все фастфуды и секс-шопы в жилом районе, но я не совсем понимаю, что вы имели в виду, правитель.',
    },
    safari: {
      text: 'Сафари! Собери военных, девочка, дай нам три бгоневичка и пять ящиков хорошего алкоголя. Я лично возглавлю операцию!',
      win: 'Я также распоряжусь о воздушном сопровождении и роте спецназа. Доброй охоты!',
      fail: 'Военные уже распланировали операцию, правитель, и я совершенно уверена, что она не включает в себя алкоголь.',
    },
  },
};
