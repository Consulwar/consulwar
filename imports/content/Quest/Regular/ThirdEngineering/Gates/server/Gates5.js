export default {
  id: 'Quest/Regular/ThirdEngineering/Gates/Gates5',
  condition: [
    ['Building/Military/Gates', 5],
  ],
  title: 'Построить Врата 5-го уровня',
  text: '<p>Первое пробное включение Врат прошло не совсем так, как мы планировали: координаты сбились, и Врата открылись посреди океана, прямо перед огромной волной. Инженеры сразу же обесточили пульт и теперь откачивают воду из всех помещений.</p><p>Что интересно, в воде оказались обломки корабля неизвестной конструкции и труп древнего гуманоидного астронавта. Как его занесло на планету с такими неблагоприятными условиями, да ещё и в опасной близости от чёрной дыры?</p>',
  options: {
    accept: {
      text: 'Я бы рассказал тебе, но тут замешано будущее человечества.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 21,
    crystals: 14,
  },
};
