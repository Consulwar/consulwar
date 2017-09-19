export default {
  id: 'Quest/Daily/NatalyVerlen/DeadOrAlive',
  title: 'Квантовый кот',
  text: 'Консул, произошло небольшое недоразумение в блоке 9А. Вы же в курсе, что там проводят эксперименты по прикладным применениям квантовой теории? В момент проведения одного из опытов лабораторный кот Васька заскочил на стол и оказался в суперпозиции квантовых состояний «жив-мёртв». Вахтерша Петровна будет очень недовольна.',
  answers: {
    callSchrodinger: {
      text: 'Позвоните Шрёдингеру, я-то тут причём?',
      win: 'Скажу честно, Консул, я сомневалась, что простой сантехник сможет нам помочь, но оказалось, что его прадед занимался как раз подобными вопросами. Странная семейка. Главное, что Петровна ничего не заподозрила.',
      fail: 'Трубку так никто и не взял, и нам пришлось во всем признаться Петровне.',
    },
    newCat: {
      text: 'Достаньте ей другого кота.',
      win: 'В спешке я совсем не подумала об этом, Консул. Надеюсь, мы сможем её отвлечь, пока наши сотрудники бегают по улицам в поисках похожего кота.',
      fail: 'Если бы всё было так просто, Консул, то я бы не пришла к вам. Петровну не проведешь: своего кота она узнает из тысячи по словам, по глазам, по голосу.',
    },
    callMatron: {
      text: 'Заманите и её на стол.',
      win: 'Рискованное решение, Консул, но оно удивительным образом разрешило ситуацию. Петровна забрала своего кота и исчезла в пространственно-временном континууме, бороздя просторы квантового мира. Жаль, что придётся искать новую вахтёршу.',
      fail: 'Петровна наотрез отказалась лезть на стол, а вдобавок ещё и заметила квантованного Ваську. На вашем месте я бы подготовилась к серьёзному разговору, потому что она собиралась идти к вам.',
    },
  },
};
