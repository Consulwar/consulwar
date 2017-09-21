export default {
  id: 'Quest/Regular/Tamily/Metal/Metal75',
  condition: [
    ['Building/Residential/Metal', 75],
  ],
  title: 'Построить Шахту Металла 75-го уровня',
  text: '<p>Правитель, а помните нашу «подсадную» бабушку-рептилоида? Ей только что пришел приказ от зелёного начальства: изучить устройство нашего Бурильного Бура. По счастью, как раз в это время какие-то умельцы прикрутили к Буру кофеварку. Фальшивый агент внимательно изучил её устройство и отправил подробные чертежи рептилоидам. Пусть теперь голову поломают, как мы бурили эту Шахту! Правда, теперь Бур придется чинить, но это всё же лучше, чем подарить его устройство врагу. По вашему приказу, Консул, Инженеры закупят детали и приступят к работе.</p>',
  options: {
    accept: {
      text: 'Интересно, где это зеленомордые бурить собрались?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 550,
    crystals: 95,
  },
};
