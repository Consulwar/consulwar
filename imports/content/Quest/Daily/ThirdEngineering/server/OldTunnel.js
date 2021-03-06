export default {
  id: 'Quest/Daily/ThirdEngineering/OldTunnel',
  title: 'Старый тоннель',
  text: 'Здравствуйте, Консул! У нас небольшая заминка в ходе реконструкции одного из лабораторных комплексов: под зданием оказался старый тоннель. Мы не можем продолжать работы, потому что есть риск обрушения. Вы не могли бы взглянуть, правитель?',
  answers: {
    takeSomeRocks: {
      text: 'Завалите его камнями.',
      win: 'Консул, Ваше решение сработало! Мы смогли успешно реконструировать здание.',
      fail: 'К сожалению, Консул, этот тоннель оказался старой системой канализации, которую мы перекрыли. Бурлящие потоки говн хлынули на улицы. Кажется, у нас намечается серьёзная уборка.',
    },
    whatIsIt: {
      text: 'Разберитесь, что это за тоннель.',
      win: 'Консул, отличные новости: мы наши начало и конец тоннеля. Оказалось, что это был неудачный подкоп к колониальному банку: грабители так и остались лежать под одним из обрушившихся валунов.',
      fail: 'Мы послали внутрь нескольких разведчиков, но уже третий день от них нет никаких сигналов, Консул. Боюсь, что у нас проблемы.',
    },
    destroy: {
      text: 'Снести к херам и здание, и тоннель.',
      win: 'Мудрое решение, Консул. Наши расчеты показали, что здание обрушилось бы при любой попытке заделать тоннель. Теперь мы ищем новое место под лабораторный комплекс.',
      fail: 'Консул, одна из наших машин ушла под землю при попытке подобраться к зданию. Кажется, нам придётся проводить снос с воздуха, а это повлечёт дополнительные затраты и опасность для окружающего массива зданий.',
    },
  },
};
