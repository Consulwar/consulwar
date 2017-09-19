export default {
  id: 'Quest/Regular/Tamily/Entertainment/Entertainment90',
  condition: [
    ['Building/Residential/Entertainment', 90],
  ],
  title: 'Построить Центр Развлечений 90-го уровня',
  text: '<p>Представляете, правитель, на планете уже так много Центров Развлечений, что они даже соревнуются друг с другом. Один, например, собирается открыть у себя школу стриптиза, потому что, мол, просто раздеться под музыку может каждый дурак, а сделать настоящее шоу может не каждый и этому надо специально обучаться. По-моему, дурацкое нововведение, однако если оно по какой-то причине вызвало ваш интерес, отдайте распоряжение — и я выделю им субсидии под строительство.</p>',
  options: {
    accept: {
      text: 'Ну, мы же должны поддерживать Центры, а то народ ебанётся!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 1500000,
    crystals: 1400000,
  },
};
