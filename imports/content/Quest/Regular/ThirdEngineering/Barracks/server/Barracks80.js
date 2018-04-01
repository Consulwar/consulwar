export default {
  id: 'Quest/Regular/ThirdEngineering/Barracks/Barracks80',
  condition: [
    ['Building/Military/Barracks', 80],
  ],
  title: 'Построить Казармы 80-го уровня',
  text: '<p>Когда вы наладите врата в Бездну, Командир, то путём нехитрой, но очень ресурсоёмкой манипуляции вы сможете получить первых Потерянных. Казармы надо подготовить к этим элитным солдатам, потому что по совместительству они – жуткие монстры.</p><p>Думаю, на всякий случай стоит перестроить самую дальнюю часть – там, в тишине и покое, Потерянные будут ждать ваших приказов. По вашей команде, Консул, мы и начнём.</p>',
  options: {
    accept: {
      text: 'Что-то мне сейчас стало как-то не по себе.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
