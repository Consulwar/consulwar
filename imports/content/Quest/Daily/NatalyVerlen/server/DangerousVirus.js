export default {
  id: 'Quest/Daily/NatalyVerlen/DangerousVirus',
  title: 'Опасный вирус',
  text: 'Консул, у нас проблемы: в одной из лабораторий произошла утечка опасного вируса. Заражённые теряют способность адекватно мыслить, воспринимать критику, а в любых конфликтных ситуациях переходят на личности и активно пытаются вычислить местонахождение собеседника по IP. Нужно что-то срочно делать.',
  answers: {
    thisIsNormal: {
      text: 'Вирус? У нас это нормальное поведение.',
      win: 'Нам повезло, Консул. Мы оцепили здание и ограничили заражённых от внешних раздражителей. В итоге, все симптомы пошли на убыль, а затем и вовсе исчезли.',
      fail: 'Нормальное? Что же у Вас за первобытное общество, Консул? Ладно, я постараюсь сама найти решение.',
    },
    disseminate: {
      text: 'Им уже не помочь. Распидорасить.',
      win: 'Было нелегко, но мы справились, Консул. На редкость агрессивное поведение заражённых доставило нам немало проблем, но, кажется, их всех удалось нейтрализовать.',
      fail: 'Консул, даже мне кажется, что это решение чересчур жёсткое. Мы попробуем нейтрализовать заражённых и изучить. Возможно, найдём способ устранить все последствия.',
    },
    antidote: {
      text: 'Отловите одного и сделайте антидот.',
      win: 'Было нелегко, но мы справились, Консул. После распыления антидота заражённые, кажется, постепенно приходят в себя. На всякий случай мы поместили их в карантин.',
      fail: 'Консул, у меня печальные новости: заражённые оказали серьёзное сопротивление. Пришлось превратить их в пыль.',
    },
  },
};
