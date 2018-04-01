export default {
  id: 'Quest/Regular/Tamily/House/House95',
  condition: [
    ['Building/Residential/House', 95],
  ],
  title: 'Построить Жилой Комплекс 95-го уровня',
  text: '<p>В какое удивительное время мы живем, правитель! Наука обеспечивает нас всем необходимым: вооружением, техникой, ресурсами, жильём… Кстати, о жилье: белым халатам наконец-то удалось собрать работающий прототип синтезатора белка. Не спрашивайте, из чего и как он синтезирует, на этот вопрос в Лаборатории обычно отвечают «военная тайна», но он относительно недорогой, компактный, и самое главное — он работает. А дешёвая еда — лучшее средство для привлечения новых поселенцев. По вашему желанию мы можем оснастить этими приборами все Жилые Комплексы, вам остаётся только приказать.</p>',
  options: {
    accept: {
      text: 'Мои люди должны хорошо питаться! Настройте им там двойную порцию белка.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 8000,
    crystals: 8000,
  },
};
