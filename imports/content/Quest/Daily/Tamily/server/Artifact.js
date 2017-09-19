export default {
  id: 'Quest/Daily/Tamily/Artifact',
  title: 'Древний артефакт',
  text: 'Консул, во время добычи кристалла мы нашли странный древний артефакт. Он светится и мигает, что нам с ним делать?',
  answers: {
    blowup: {
      text: 'Взорвите его, к чему нам лишние проблемы.',
      win: 'Мы уничтожили артефакт. Изучив его сигнал, мы поняли, что ещё полчаса, и он бы выпустил некий древний вирус. Потрясающее чутьё, Консул!',
      fail: 'Артефакт содержал в себе огромное количество энергии. Взрыв оказался сильнее, чем мы думали. Наши плодородные земли уничтожены. Люди будут недовольны, правитель…',
    },
    give: {
      text: 'Дайте его кому-нибудь в руки, древние артефакты любят живую плоть.',
      win: 'Научный отдел отдал артефакт завхозу Петровичу. Артефакт моментально погас и перестал пульсировать. В общем… это, наверное, хорошо.',
      fail: 'Научный отдел отдал артефакт завхозу Петровичу. Артефакт превратился в светящуюся энергию и слился с Петровичем. Петрович взлетел над землёй, сияя ярким светом, он произнёс: «Я есть Альфа и Омега», после чего исчез. И где нам теперь найти другого завхоза?',
    },
    close: {
      text: 'Положите где взяли и закройте шахту.',
      win: 'Когда артефакт поставили на то же место, где нашли, он перестал пульсировать и производить странные и опасные вибрации. Прекрасное решение, Консул!',
      fail: 'Мы сделали, как вы приказали, Консул. Правда, из шахты доносятся странные звуки и выбивается свет,а местные жители стали заметно глупее. Мы полагаем, что это воздействие может быть не только сегодня, в завтрашний день смотреть могут не все. Вернее, смотреть могут не только лишь все, мало кто может… О чёрт, что это было?!',
    },
  },
};
