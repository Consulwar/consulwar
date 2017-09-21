export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield/Airfield75',
  condition: [
    ['Building/Military/Airfield', 75],
  ],
  title: 'Построить Аэродром 75-го уровня',
  text: '<p>Командир, докладываю вам, что инженеры смогли перенести схему увеличения грузоподъёмности и на Бабуль тоже. Запаса «пирожков» им теперь хватит на всю линию фронта.</p><p>Мы даже пристроили в хвост несколько герметично задраенных отсеков, в которых можно перевозить капсулы с Потерянными. А что? Чем не большой, желтый, сверкающий пирожок для наших зелёных друзей?</p>',
  options: {
    accept: {
      text: 'Не увлекайся, а то тебя тоже присобачат куда-нибудь для пользы дела.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 84,
    crystals: 84,
  },
};
