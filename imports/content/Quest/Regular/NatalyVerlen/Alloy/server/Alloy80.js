export default {
  id: 'Quest/Regular/NatalyVerlen/Alloy/Alloy80',
  condition: [
    ['Research/Evolution/Alloy', 80],
  ],
  title: 'Исследовать Особые Сплавы 80-го уровня',
  text: '<p>В Шахте Кристалла прослышали про аудитора в вентиляции, Консул. Для них этот сценарий не актуален – там такие температуры около выработки, что никакой служащий не выживет. Но вот роботы иногда сваливаются в мелкие каверны; возможно, стоит их немного подстраховать.</p><p>Но для этой шахты тросы нужны намного тоньше и прочнее, да ещё и тугоплавкие. Понадобится очередной виток исследований Особых Сплавов. С вашего разрешения, Консул, Лаборатория займётся этим.</p>',
  options: {
    accept: {
      text: 'Работайте-работайте, мало ли кто куда свалится в следующий раз.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 80,
    crystals: 80,
  },
};
