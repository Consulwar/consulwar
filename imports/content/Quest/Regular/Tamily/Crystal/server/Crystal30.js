export default {
  id: 'Quest/Regular/Tamily/Crystal/Crystal30',
  condition: [
    ['Building/Residential/Crystal', 30],
  ],
  title: 'Построить Шахту Кристалла 30-го уровня',
  text: '<p>Ваша шахта пока приносит не слишком много Кристалла, Консул, но мы можем использовать этот факт для того, чтобы ускорить доставку. Летающий дрон гораздо быстрее доберется до склада, и у вас всегда будет небольшой запас ресурсов для строительства.</p><p>К тому же, регистрация груза происходит автоматически, а это значит, что производительность шахты тоже увеличится. Приказывайте, правитель, как только будете готовы.</p>',
  options: {
    accept: {
      text: 'Дрон — это звучит круто! Ради такого и ресурсов не жалко.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 400,
    crystals: 600,
  },
};
