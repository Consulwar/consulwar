export default {
  id: 'Quest/Daily/SteelBolz/FuckingArtifact',
  title: 'Артефакт, едрить его в корень',
  author: 'DiamondDust',
  text: 'Очень странное происшествие, Консул. На палубе одного из наших кораблей внезапно материализовался человек в розовом пиджаке. Крайне размашисто шагая, он принялся кружить по кораблю, бормоча под нос что-то совершенно невразумительное. При попытке приблизиться к нему мы сталкиваемся с какими-то сферическими объектами, которые он выпускает из своего старомодного оружия. Вреда никакого от него нет, только непонятно, что с ним делать?',
  answers: {
    search: {
      text: 'Это же элементарно, Болз! Надо найти артефакт.',
      win: 'Мы послали парочку гаммадронов на разведку к ближайшей планете и обнаружили следы какого-то древнего артефакта. Вот ваша доля от его продажи на Черном Рынке. А пришелец, по ходу, куда-то испарился сам.',
    },
    unknown: {
      text: 'Что? Я ничего не понял. Расстрелять ублюдка.',
      fail: 'Как только мы хотели исполнить ваш приказ, Консул, из ниоткуда в космосе появился вертолёт и стал обстреливать этого типа! Мы спешно покинули сектор от греха подальше.',
    },
    relic: {
      text: 'А Дона Квинченто там нет? Я бы купил у него парочку картин.',
      fail: 'К сожалению, странный посетитель нас покинул так же, как и появился – внезапно. Мы не успели спросить его про Дона.',
    },
  },
};
