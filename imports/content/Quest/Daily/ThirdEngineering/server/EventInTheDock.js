export default {
  id: 'Quest/Daily/ThirdEngineering/EventInTheDock',
  title: 'Происшествие в доке',
  text: 'Консул, у нас небольшое происшествие. В грузовом отсеке северного дока пилот большегруза не рассчитал габариты и зацепил верхнюю балку. Корабль разбит, груз поврежден, а док держится на обломках корабля. Не могли бы вы взглянуть? Нужен план действий.',
  answers: {
    clearing: {
      text: 'Пошли бригаду, пусть расчистят завал.',
      win: 'Операция была достаточно рискованной, Консул, но, кажется, всё прошло успешно. Мы сумели зафиксировать балку на временных опорах и извлечь корабль.',
      fail: 'Консул, увы, у меня плохие новости. Во время работ конструкция дока не выдержала нагрузки и обвалилась окончательно. Мы пытаемся достать из под завала людей, но, боюсь, им уже не помочь.',
    },
    explosion: {
      text: 'Взорвите остатки дока дистанционно.',
      win: 'Консул, мы всё выполнили. Конструкция действительно была ужасно нестабильна, и контролируемый взрыв, пожалуй, был единственным верным решением.',
      fail: 'Консул, это ужасно! На корабле оказался нелегальный запас горючих материалов, который сдетонировал во время нашего взрыва. В общем, мы разнесли почти всё северное крыло дока.',
    },
    autoVideoRecorder: {
      text: 'У него был видеорегистратор? Выйдет крутое видео!',
      fail: 'Консул, увы, тратить силы на поиски регистратора в такой ситуации — крайне неразумный шаг.',
    },
  },
};
