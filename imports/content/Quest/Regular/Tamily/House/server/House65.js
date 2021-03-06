export default {
  id: 'Quest/Regular/Tamily/House/House65',
  condition: [
    ['Building/Residential/House', 65],
  ],
  title: 'Построить Жилой Комплекс 65-го уровня',
  text: '<p>Добрый день, правитель! В сегодняшней сводке: Шахта Металла отгрузила продукции… Потери на фронте составили…  Верфь поставила флот, столько-то единиц… Опытный образец утилизатора бытовых отходов сожрал зазевавшегося лаборанта? О! А не поставить ли нам в Жилые Комплексы эти утилизаторы? Сдается мне, работают они отменно. Как только вы отдадите приказ об улучшении, эти полезные штуковины тут же повезут к месту назначения. С такими мощными штуками Комплексы станут ещё привлекательнее для новых поселенцев, а значит, у нас будет больше лаборантов для утилиза… то есть, для технологических испытаний, Консул.</p>',
  options: {
    accept: {
      text: 'Так и вижу: «У вас утилизатор жрёт людей? Уже пакую чемоданы!»',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2000,
    crystals: 2000,
  },
};
