export default {
  id: 'Quest/Daily/NatalyVerlen/ExperimentalMachine',
  title: 'Экспериментальная установка',
  text: 'Консул, хорошо, что вы здесь. Срочно нужна ваша помощь: одна из наших экспериментальных установок сверхвысокого вакуума вышла из строя. Если в ближайшее время нам не удастся отключить её, то установка породит антипространство с отрицательной плотностью, и Колонии настанет… кхм, пиздец, Консул. Извините за грубость, но других слов у меня нет.',
  answers: {
    disconnect: {
      text: 'Выдерни её из розетки.',
      win: 'Консул, мне так стыдно. В панике я совсем забыла о системе экстренного отключения питания. Хорошо, что вы мне напомнили о ней. Установка обесточена, а мы постепенно снижаем глубину вакуума в камере.',
      fail: 'Консул, это же высокотехнологичное научное оборудование, а не фен. Если бы всё было так просто, то я бы даже не пошла к вам.',
    },
    trash: {
      text: 'Кидайте мусор в камеру.',
      win: 'Консул, должна признать, что это было неожиданное, но очень продуктивное решение. Мусор не дает плотности достигнуть предельных значений, а мы получили отличный утилизатор.',
      fail: 'К сожалению, Консул, это не помогло. Скорость образования вакуума достигла своего предела, но, к нашему счастью, установка не выдержала нагрузки и отключилась полностью. Ну как отключилась — взорвалась и разнесла целый корпус.',
    },
    lostInSpace: {
      text: 'На корабль её и в глубокий космос.',
      win: 'Фух, Консул. Кажется, проблема решена. Было непросто демонтировать установку, но мы успели как раз вовремя. Будем ждать сигналов с нашего наблюдательного поста.',
      fail: 'Консул, как вы себе представляете это? Нам придётся засунуть на корабль целое здание. Боюсь, ваше решение выполнить не выйдет.',
    },
  },
};
