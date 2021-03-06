export default {
  id: 'Quest/Regular/NatalyVerlen/Nanotechnology/Nanotechnology50',
  condition: [
    ['Research/Evolution/Nanotechnology', 50],
  ],
  title: 'Исследовать Нанотехнологии 50-го уровня',
  text: '<p>Микрочипы, а точнее, квантовые компьютеры, созданные на их основе – это ещё не предел изобретательности наших учёных. Они нашли способ настроить фотонные кристаллы внутри системы оповещения внешних Космопортов таким образом, что потеря сигнала практически свелась к нулю.</p><p>Теперь у нас есть возможность общаться с самыми дальними уголками галактики, планетой Совета и даже Землей – и всё это почти без задержек и потери данных. Я бы сказала, что это фантастика, но для нас это рабочий момент.</p>',
  options: {
    accept: {
      text: 'Отлично, соедините меня с Центром развлечений.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 700,
    crystals: 700,
  },
};
