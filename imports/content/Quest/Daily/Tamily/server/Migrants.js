export default {
  id: 'Quest/Daily/Tamily/Migrants',
  title: 'Мигранты',
  text: 'Консул, жители Колонии недовольны из-за ухудшившейся ситуации с мигрантами. Они требуют ограничить число приезжих и жалуются на беспорядки и хамское поведение со стороны «гостей». Я не сомневаюсь, что вы сможете найти выход из этой ситуации.',
  answers: {
    deport: {
      text: 'Собери всех и отправь на соседнюю колонию.',
      win: 'Это было не просто, Консул, но мы выполнили ваше указание. Жители довольны таким суровым решением, но вот Совет, кажется, не очень. Надеюсь, они закроют глаза на это.',
      fail: 'Увы, мы не смогли выполнить ваше указание, Консул: начались столкновения с охраной и забастовки, информация о которых дошла до Совета. Они уже выслали контактную группу для встречи с вами, правитель.',
    },
    work: {
      text: 'Займи мигрантов чем-нибудь полезным.',
      win: 'Вы как всегда на высоте, правитель! Мы направили свободные рабочие руки на тяжёлые и не слишком привлекательные производства, уборку улиц. И жители, и мигранты довольны.',
    },
    courses: {
      text: 'Организуй курсы по взаимному уважению.',
      win: 'Очень тонкое решение, Консул. Я боялась, что оно не сработает, но, кажется, всё идет просто превосходно: социальная напряжённость спадает.',
      fail: 'К сожалению, Консул, нам нужны другие методы решения этой проблемы. За месяц курсы посетили всего несколько человек, а социальная напряжённость сильно выросла.',
    },
  },
};
