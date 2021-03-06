export default {
  id: 'Quest/Daily/NatalyVerlen/FightingSpirit',
  title: 'Боевой дух',
  text: 'Консул, у меня есть предложение: кто-то должен вдохновлять наших солдат, гордо шагая впереди строя, крича боевые кличи и превозмогая противника прямо под огнём. Видя такой героизм, солдаты и сами будут рваться совершать подвиги. Как показали исследования, это не только увеличит боевой дух наших солдат, но и повысит их эффективность. Правда, кандидатуры… Скажем так: готовых на такое крайне мало.',
  answers: {
    sendCaptain: {
      text: 'Отправь капитана Типлса.',
      win: 'Вы оказались правы, Консул. В первые же минуты боя солдаты вдохновились настолько, что без страха бросались за ним прямо в пекло, поверив в свою неуязвимость. А все благодаря разработанным мною генераторам мобильного щита.',
      fail: 'Он пытался, Консул… Но в первую же минуту получил лазером в колено. Хорошо хоть ранение было не сильным, и он не остался обычным диванным воякой на всю оставшуюся жизнь. ',
    },
    hatchForWar: {
      text: 'Вырежи люк в Мамке и посади туда Вахаёбовича.',
      win: 'Это, конечно, было странно, когда Вахаёбович стал махать мечом прямо из башни танка, но это сработало! Видя это, солдаты шли в бой, а Вахаёбович смог даже уничтожить танк рептилий в ближнем бою! Правда до сих пор не поняла, как танк в этот самый бой попал…',
      fail: 'Когда лаборанты попытались засунуть Вахаёбовича в люк, он… В общем, теперь мне нужны новые работники, Консул.',
    },
    sendAnderson: {
      text: 'Отправьте на землю Андерсона.',
      fail: 'Консул, простите, но даже в самом лучшем случае Андерсон будет гораздо полезнее, командуя нашим флотом. ',
    },
  },
};
