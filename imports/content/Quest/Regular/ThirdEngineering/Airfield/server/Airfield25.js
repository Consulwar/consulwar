export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield/Airfield25',
  condition: [
    ['Building/Military/Airfield', 25],
  ],
  title: 'Построить Аэродром 25-го уровня',
  text: '<p>Инженеры авиазавода информировали меня, что численность боевого флота колонии достигла солидной отметки. Самое время подумать о ремонтных мастерских, Командир, ведь ваши корабли приходят с поля боя довольно потрёпанными.</p><p>Мы могли бы организовать очень быстрые ремонтные работы, чтобы вы могли сразу же отправлять весь ваш флот обратно в гущу боя. Пилотов, конечно, уже не починишь, но это и не требуется – по крайней мере до тех пор, пока у вас есть Верфь.</p>',
  options: {
    accept: {
      text: 'Золотые слова. Начинайте.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 350,
    crystals: 350,
  },
};
