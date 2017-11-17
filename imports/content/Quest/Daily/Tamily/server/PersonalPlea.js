export default {
  id: 'Quest/Daily/Tamily/PersonalPlea',
  title: 'Личная просьба',
  text: 'Великий Консул, я прошу вашего прощения за такую наглость, но вы – самый стильный и красивый человек из всех, кого я знаю. К тому же, как известно, вы знаток во всех вопросах во вселенной. Подскажите, пожалуйста, какое платье мне следует надеть сегодня на званый ужин с друзьями?',
  answers: {
    any: {
      text: 'Тамили, ты прекрасно выглядишь в любом платье.',
      win: 'О… вы и вправду так считаете, Консул? Я… я польщена… Спасибо вам…',
      fail: 'Спасибо, конечно, за комплимент, Консул, но я думала, вы подскажете мне нечто более конкретное. Эх… В любом случае, благодарю вас, правитель. Извините, что помешала. ',
    },
    black: {
      text: 'Надень вон то, чёрное с вырезом.',
      win: 'Ох, как же здорово! Я как раз об этом платье и думала. Вы действительно разбираетесь абсолютно во всём, Великий Консул. Вы не перестаёте меня удивлять!',
      fail: 'Вот это чёрное с вырезом? Но оно же не подходит к туфлям. Консул, вы специально хотите подшутить надо мной? У вас очень тонкий юмор, мне это нравится. Ладно… Не буду вас отвлекать от дел своими глупостями…',
    },
    undress: {
      text: 'Надеть?! Мне кажется, тебе лучше будет вообще всё снять с себя.',
      win: 'Снять всё?! О Наука, на секунду я подумала, что вы серьёзно, Консул. Вы такой весёлый! Даже во времена войны с рептилиями, когда все грубые и серьёзные, вы находите радость и свет в своём сердце. Спасибо, что поделились этим со мной, правитель…',
      fail: 'Я очень уважаю вас, Консул, но я не одна из ваших шлюх, уж вы-то должны были знать об этом. Эх… Извините меня за мои глупые вопросы и за мою дерзость, я, пожалуй, пойду.',
    },
  },
};