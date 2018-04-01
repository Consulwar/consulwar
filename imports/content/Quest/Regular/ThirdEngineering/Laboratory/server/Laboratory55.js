export default {
  id: 'Quest/Regular/ThirdEngineering/Laboratory/Laboratory55',
  condition: [
    ['Building/Military/Laboratory', 55],
  ],
  title: 'Построить Лабораторию 55-го уровня',
  text: '<p>Лаборатория анонсировала новые исследования космоса вокруг нашей планеты, Командир. Оказывается, магнитное поле, которое помогает нам не изжариться под ультрафиолетовым излучением звезды, каким-то образом ухитряется поймать и удерживать большое количество радиоактивных космических частиц.</p><p>И вот это уже представляет серьезную проблему для флота обороны, потому что ему приходится тратить щиты на защиту от радиационных поясов сразу после выхода на орбиту.</p>',
  options: {
    accept: {
      text: 'Я щас сделаю умное лицо и просто дам тебе ресурсов.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 800,
    crystals: 800,
  },
};
