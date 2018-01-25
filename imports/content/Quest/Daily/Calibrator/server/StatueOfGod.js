export default {
  id: 'Quest/Daily/Calibrator/StatueOfGod',
  title: 'Статуя бога Модулятора',
  author: 'ya4ig',
  text: 'Здравствуйте, Консул. Сегодня я к вам с личной просьбой. Я узнал, что во время штурма Марса случился карстовый обвал, который обнажил древнюю статую. Это очень важная находка, Консул! Мы должны заполучить её!',
  answers: {
    exhibit: {
      text: 'Что? Я тут пытаюсь сделать так, чтобы вы сами не стали экспонатами в музеях рептилий!',
      fail: 'Простите, Консул. Я обращусь к Совету.',
    },
    modulator: {
      text: 'Бог Модулятор? Что-то очень знакомое… Я отдам приказ перевезти статую на базу.',
      win: 'У меня тоже такое чувство. Я думаю, она вам пригодится.',
      fail: 'Это оказалась ловушка рептилий. Она нанесла серьёзный ущерб нашей сети.',
    },
    noGods: {
      text: 'Никаких богов в моей колонии!',
      win: 'Жаль, но вы правы. Совет поддержал выше решение и прислал компенсацию за уничтожение статуи с орбиты.',
      fail: 'Это ценный исторический экспонат, но вам, конечно, виднее, Консул.',
    },
  },
};
