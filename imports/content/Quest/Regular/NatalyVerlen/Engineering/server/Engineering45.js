export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering45',
  condition: [
    ['Research/Evolution/Engineering', 45],
  ],
  title: 'Исследовать Оборонную Инженерию 45-го уровня',
  text: '<p>Каждый раз, когда ко мне заходит Третий со своим новым проектом, он говорит: «Новая пушка – действительно мощная! Она действительно может перевернуть ход битвы!» И что самое раздражающее, он оказывается прав, потому что новая пушка всегда мощнее, чем предыдущая, имеет больше возможностей и меньше недостатков.</p><p>Но я много бы отдала, Консул, чтобы запустить в него куском композитной брони, когда он в следующий раз появится в отделе, полный энтузиазма и энергии.</p>',
  options: {
    accept: {
      text: 'А-а, так тебя он тоже раздражает? Передай-ка мне вон ту табуретку.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 600,
    crystals: 600,
  },
};
