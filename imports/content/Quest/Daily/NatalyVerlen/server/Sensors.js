export default {
  id: 'Quest/Daily/NatalyVerlen/Sensors',
  title: 'Датчики',
  text: 'Долгое время наши еноты-разведчики ковырялись в помойках врага, попутно снимая видео о передвижениях войск и техники. Но учёные давно хотели поставить на них что-то более современное, чтобы выяснить местонахождение подземных хранилищ и маршруты транспортных перевозок. Для этого нам понадобятся специальные датчики, которые не будут «фонить» в окружающую среду: мы ведь не хотим, чтобы рептилоиды догадались о том, какую роль играют в разведке наши пушистые друзья.',
  answers: {
    muon: {
      text: 'Поставьте на них мюонные детекторы. Если они работают на таможне, то и тут должны.',
      win: 'Мы немедленно начнём разработку компактного варианта мюонного детектора.',
      fail: 'Вообще-то, для построения модели нужно, чтобы детекторы находились над и под сканируемым объектом, Консул. Наши еноты хороши, но они не волшебники.',
    },
    neutrino: {
      text: 'Поставьте на них детекторы нейтрино, должно сработать.',
      fail: 'Простите, Консул, но тогда нам придётся прикрепить к каждому еноту бронированный бак с водой. Рептилоиды могут что-то заподозрить.',
    },
    infra: {
      text: 'Просто снабдите их тепловизорами – я всегда хотел посмотреть на голых рептилоидов.',
      win: 'Тепловизоры енотов проявили подземные транспортные магистрали, водные коммуникации и… помойки. Тоже результат.',
      fail: 'Голый рептилоид в тепловизоре выглядит, как что-то зелёное в чём-то красном. Если вас возбуждают подобные картины, могу порекомендовать вам галерею абстрактного искусства.',
    },
  },
};
