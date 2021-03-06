export default {
  id: 'Quest/Daily/Mechanic/DistressCall',
  title: 'Сигнал бедствия',
  text: 'Привет, Консул. На моем дешифраторе сигналов появилось странное сообщение, похожее на сигнал бедствия. Проблема в том, что оно исходит из туманности, где были замечены корабли рептилоидов. Я готов заплатить за военный эскорт до места события и обратно. Кто знает, что мы можем там найти.',
  answers: {
    iDontWanna: {
      text: 'Я не хочу отправлять свои корабли в неизвестность.',
      win: 'Что же, Консул, я расшифровал сигнал до конца, и он оказался ловушкой. Я превратился бы в космическую пыль, если бы выдвинулся туда. Возьми эти ресурсы в качестве благодарности.',
      fail: 'Пока я искал новое сопровождение, кто-то опередил меня. Ходят слухи, что он сорвал очень хороший куш.',
    },
    soundsGood: {
      text: 'Вперёд! Искать в космосе приключения на свою задницу!',
      win: 'Затея действительно была рискованная, но, на мой вкус, окупилась с лихвой. Вот твоя часть, Консул.',
      fail: 'Жаль, что всей нашей добычей стал аварийный передатчик. Не расстраивайся, Консул, в следующий раз повезёт.',
    },
    goGoPowerConsuls: {
      text: 'Вылетаем, поджарим пару чешуйчатых задниц.',
      win: 'Ух, ну и заварушка! Я до сих пор не понимаю, каким образом на твоих кораблях нет ни единой царапины. Особая космическая магия. Хорошо, что судно оказалось под завязку забито ресурсами. Вот твоя часть.',
      fail: 'Я абсолютно не ожидал такого количества рептилий. Хорошо, что нам удалось сохранить флот и уйти от погони.',
    },
  },
};
