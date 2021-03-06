export default {
  id: 'Quest/Daily/ThirdEngineering/TheHeavyWind',
  title: 'Шквальный ветер',
  text: 'Добрый день, Консул. Погода сегодня просто ужасная. Наши датчики на одном из мостов регистрируют очень опасный рост амплитуды колебаний под действием шквальных порывов ветра. Мне кажется, было бы уместно предпринять какие-то действия, правитель, иначе могут пострадать люди.',
  answers: {
    think: {
      text: 'Ну ты же у нас главный инженер — думай!',
      win: 'Ох, Консул, спасибо, что привели меня в чувство. Я немного растерялся. Так, сейчас подумаем, что можно сделать. Нужно собрать бригаду.',
      fail: 'Консул, я прекрасно знаю это, но я рассчитывал, что у вас могут быть какие-то идеи. Что же, я постараюсь найти выход из этой ситуации самостоятельно.',
    },
    wait: {
      text: 'Если развалится, что-нибудь предпримем.',
      win: 'Честно говоря, я не сторонник подобных решений, Консул. Сегодня нам повезло, и мост выдержал нагрузку, но в следующий раз всё может пойти по неблагоприятному сценарию.',
      fail: 'Консул, у меня плохие новости: одна из опор моста не выдержала нагрузки и дала серьёзную трещину. Нам всё-таки придётся выслать инженерную бригаду на место происшествия, но теперь её работа будет ещё более опасной.',
    },
    engineeringTeam: {
      text: 'Оцепить мост и послать бригаду.',
      win: 'Консул, бригада на месте, район оцеплен. Ребята устанавливают временные опоры и дополнительные демпфирующие устройства, чтобы снизить амплитуду колебаний.',
      fail: 'К сожалению, мы не успели, Консул — нам не хватило буквально минуты. Несколько опор моста дали трещину, и теперь нам остается только ждать и надеятся, что обрушения не произойдёт.',
    },
  },
};
