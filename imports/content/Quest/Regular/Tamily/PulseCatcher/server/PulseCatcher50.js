export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher50',
  condition: [
    ['Building/Residential/PulseCatcher', 50],
  ],
  title: 'Построить Импульсный Уловитель 50-го уровня',
  text: '<p>А вы когда-нибудь слышали про запутанные частицы, правитель? Как правило, это кванты, один из которых зеркально повторяет все события, случившиеся с другим, какое бы расстояние их не разделяло. Забавно, что пока никто толком не понимает, почему так происходит.</p><p>Но зато способов использовать эти частицы становится всё больше – и сегодня одна из них отправится за горизонт событий чёрной дыры. Данные эксперимента будут обрабатываться учёными в новенькой лаборатории Уловителя.</p>',
  options: {
    accept: {
      text: 'А он не рухнет нам всем на голову со всей этой хренью, что вы там уже понастроили?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 700,
    crystals: 700,
  },
};
