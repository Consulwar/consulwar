export default {
  id: 'Quest/Daily/Mechanic/TurretProtection',
  title: 'Защита турелей',
  text: ' Привет, Консул. Я достал схемы новой разработки для защиты корабельных турелей. Если кратко — что-то вроде энергетического щита. Одним из компонентов является особая фаза кристалла, существующая в первые несколько секунд после добычи до момента окисления на воздухе. Я готов заплатить, если ты предоставишь мне возможность провести кое-какие эксперименты в шахте.',
  answers: {
    sick: {
      text: 'Турелей? Это же название болезни.',
      fail: 'Кхм, да, Консул, болезни. Пожалуй, я поищу другого напарника для решения этой задачи.',
    },
    doWhatYouWant: {
      text: 'Тсс! Не мешай. Делай, что хочешь.',
      win: 'Как скажешь, Консул. Обеспечь мне беспрепятственный проход во все зоны шахты.',
      fail: 'Не в моих правилах хозяйничать на чужой территории, Консул. Если ты не заинтересован в получении прибыли, то я не буду тебя переубеждать.',
    },
    inYourAsshole: {
      text: 'Если что-то случится, я проведу эксперименты в твоей заднице.',
      win: 'Перспектива, конечно, не самая радужная, но выбора у меня нет, Консул. Я постараюсь сделать всё аккуратно.',
      fail: 'Хо-хо, Консул, аккуратнее с выражениями. Я не один из тех мальчиков, что работают на тебя.',
    },
  },
};
