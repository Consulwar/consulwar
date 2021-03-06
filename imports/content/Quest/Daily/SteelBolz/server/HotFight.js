export default {
  id: 'Quest/Daily/SteelBolz/HotFight',
  title: 'Жаркий бой',
  author: 'DiamondDust',
  text: 'Консул, мы в дерьме! Наш флот теснят, и подкрепление может не успеть. У нас осталась всего пара тяжелых кораблей и немного мелочи для отвлекающего манёвра, а из-за астероида уже выруливает седьмой боевой флот рептилий. Мы уже потеряли много боевых единиц, и нам совсем не помешает совет опытного стратега, Консул!',
  answers: {
    passiveDefense: {
      text: 'Отправляю подкрепление! Держитесь! Всю энергию перебросить на щиты!',
      fail: 'Мы выдержали все лобовые атаки, Консул, а потом к нам прилетел Гаммадрон. Не надо так.',
    },
    crazyAttack: {
      text: 'Приведите корабли в боевую готовность, дадим рептилиям бой!',
      fail: 'Флот полностью уничтожен, боевой флот взял курс на вашу планету. Кхм… Удачи, Консул.',
    },
    defenseWithCounterattack: {
      text: 'Всему флоту рассредоточиться! Поиграем в догонялки, но не дайте противнику окружить вас!',
      win: 'Докладываю: все в порядке, к нам пришло подкрепление, Консул! Наверное, я случайно вывел наш разговор на общие частоты, и Совет прислал свои резервные корабли нам на помощь. Кстати, на одном из них было немного ресурсов. Удивительное совпадение, не так ли?',
    },
  },
};
