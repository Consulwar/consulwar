export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield/Airfield20',
  condition: [
    ['Building/Military/Airfield', 20],
  ],
  title: 'Построить Аэродром 20-го уровня',
  text: '<p>Как ни странно, расходы «на всякую фигню» принесли неожиданный результат – инженерам на испытательном полигоне удалось добиться такой прочности корпуса, что на основе этих наработок был спроектирован новый тип космического истребителя-перехватчика – «Мираж».</p><p>Остаётся только добавить к этой замечательной броне такие же замечательные пушки – и вы получите новый корабль для штурма караванов в сопровождении отряда Клинков. А может быть, даже толпы, кто знает.</p>',
  options: {
    accept: {
      text: 'Ох, умеешь ты уговаривать, Третий.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 1800,
    crystals: 1800,
  },
};
