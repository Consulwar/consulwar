export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher30',
  condition: [
    ['Building/Residential/PulseCatcher', 30],
  ],
  title: 'Построить Импульсный Уловитель 30-го уровня',
  text: '<p>Пока идёт подготовка к поиску импульсного излучения, правитель, учёные не сидят сложа руки. Например, на Уловителе был запущен ещё один прибор, который будет наблюдать за свойствами вакуума.</p><p>Я не вдавалась в подробности, описанные в заявке, – честно говоря, там было слишком много букв, – но основной посыл состоял в том, чтобы наблюдать всякие космологические штуки. Скопления галактик, далёкие сверхновые, чёрные дыры – все эти объекты могут многое рассказать учёным.</p>',
  options: {
    accept: {
      text: 'Когда расскажут, как добывать артефакты пачками, сразу беги ко мне с докладом.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 3500,
    crystals: 3500,
  },
};
