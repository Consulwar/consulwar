export default {
  id: 'Quest/Regular/Tamily/Entertainment/Entertainment25',
  condition: [
    ['Building/Residential/Entertainment', 25],
  ],
  title: 'Построить Центр Развлечений 25-го уровня',
  text: '<p>Правитель, ближайший к нам Центр Развлечений уже настолько разросся, что люди не успевают обойти его пешком за целый день! По такому случаю они решили организовать у себя автобусные экскурсии. Если вам нравится эта идея, прикажите улучшить центры и такие же экскурсии откроются по всей планете. У меня просто дух захватывает, как подумаю, сколько уже было построено зданий на вашей колонии, правитель!</p>',
  options: {
    accept: {
      text: 'Да, я неплохо поработал, приходится признать.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 350,
    crystals: 350,
  },
};
