export default {
  id: 'Quest/Daily/Tamily/Ghost',
  title: 'Призрак',
  text: 'Консул, извините, что отвлекаю вас, но мне кажется, что я схожу с ума. В моей комнате постоянно падают книги с полок, мне кажется, будто кто-то следит за мной. И часы, Консул, мои часы странно ведут себя. Я не верю в потусторонние силы, но, честно говоря, я больше не вижу объяснений происходящему.',
  answers: {
    whereIsHe: {
      text: 'Проверьте Макконахи',
      win: 'Консул, Вы были правы! Его поймали с поличным и отправили в исправительный лагерь.',
      fail: 'К сожалению, правитель, он оказался ни при чём. Ну что же, буду надеяться, что это закончится само собой.',
    },
    neighbor: {
      text: 'Не удивлюсь, если соседи решили устроить картинную галерею.',
      win: 'Ах, Консул, я такая глупая! Оказалось, что соседи действительно делают ремонт и мой «призрак» — перфоратор «FlugeGeheimen-5000».',
      fail: 'Я бы с радостью поговорила с ними, правитель, но за той стеной никто не живёт.',
    },
    gravity: {
      text: 'Думаю, будет лучше, если ты останешься у меня сегодня ночью.',
      win: 'Ох, Консул, я искренне ценю вашу заботу, но я не смею приносить вам столько хлопот. Лучше я останусь у подруги. Надеюсь, учёные во всем разберутся.',
      fail: 'Но, правитель, как это поможет решить мою проблему?',
    },
  },
};