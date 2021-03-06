export default {
  id: 'Quest/Regular/NatalyVerlen/Nanotechnology/Nanotechnology15',
  condition: [
    ['Research/Evolution/Nanotechnology', 15],
  ],
  title: 'Исследовать Нанотехнологии 15-го уровня',
  text: '<p>Нам удалось построить микросхему, в которой информация записывается с помощью квантовых состояний отдельных атомов. А передача записанной информации будет производиться с помощью фотонов – электричество попросту разрушит всю систему.</p><p>На стенде все работает вполне удовлетворительно, но нам нужны настоящие полевые испытания – и для этого очень пригодятся ваши гаммадроны. Мы снабдим их новыми микрочипами и отправим в бой с немодифицированными дронами.</p>',
  options: {
    accept: {
      text: 'Кто победит, тот и отправится в серийное производство?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 250,
    crystals: 250,
  },
};
