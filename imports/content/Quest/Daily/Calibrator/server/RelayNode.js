export default {
  id: 'Quest/Daily/Calibrator/RelayNode',
  title: 'Ретрансляционный узел',
  text: 'Ох, Консул, это вы. Я как раз собирался доложить вам о происшествии на одном из наших ретрансляционных узлов, но совсем закопался с отладкой нового алгоритма шифрования данных. Так вот, внезапно ретранслятор перешёл в режим сна, а затем и вовсе на ручное управление. Мы обойдёмся и без него, но, думаю, стоит разобраться в этой ситуации.',
  answers: {
    badSignal: {
      text: 'Поэтому я уже второй день смотрю помехи вместо ТВ?',
      win: 'Консул, вы натолкнули меня на мысль, и она оказалась верной: один из кабелей в результате пробоя выдавал периодические импульсы, которые невероятным образом сложились в команду перевода ретранслятора в ручное управление.',
      fail: 'Вряд ли, Правитель. Развлекательная, военная и информационная сети не только не связаны между собой, но и имеют сложную систему резервирования.',
    },
    whatsHappen: {
      text: 'Так разберись, в чём там дело. У тебя карт-бланш.',
      win: 'Консул, я не стал привлекать серьезные силы и не зря: оказалось, что это была рядовая неисправность, и наша разведгруппа без проблем устранила её.',
      fail: 'Правитель, я не хотел привлекать такое внимание к столь мелкой проблеме. Да и мне совершенно некогда строить план операции. Мы справимся и без этого ретранслятора.',
    },
    myArmy: {
      text: 'Я отправлю туда часть флота.',
      win: 'Консул, это невероятно. Пришли первые отчёты с места операции: оказалось, что ретранслятор пыталась перенастроить под себя радикально настроенная группа «Межколониального сопротивления». Хорошо, что наш флот быстро разобрался с ними.',
      fail: 'Наш флот не обнаружил на месте ретранслятора абсолютно ничего, Консул. Космические пираты часто воруют подобные устройства, хотя ума не приложу, зачем им этот хлам.',
    },
  },
};
