export default {
  id: 'Quest/Regular/NatalyVerlen/Energy/Energy80',
  condition: [
    ['Research/Evolution/Energy', 80],
  ],
  title: 'Исследовать Энергетику 80-го уровня',
  text: '<p>Лаборатория разработала блестящий план для покорения магнитара, Консул: корабли заранее свяжут несколько астероидов в цепь, а потом очень осторожно приблизят и замкнут её вокруг звезды.</p><p>Когда Кольцо будет сформировано, вихревые токи быстро расплавят металл, и он намертво спаяет всю конструкцию. Счёт идёт на метры и секунды, но ваши пилоты должны справиться с этой задачей – не зря же Адмирал посвящает столько времени их подготовке.</p>',
  options: {
    accept: {
      text: 'Тоже очень на это надеюсь.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 70,
    crystals: 70,
  },
};
