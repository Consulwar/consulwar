export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex/DefenseComplex15',
  condition: [
    ['Building/Military/DefenseComplex', 15],
  ],
  title: 'Построить Оборонный комплекс 15-го уровня',
  text: '<p>Испытания минных полей прошли неплохо, Командир: мы насквозь изрешетили старый транспортник, который играл роль вражеского флота. Осталось проверить, как мины будут реагировать на корабли, внезапно вывалившиеся из гиперпространственного прыжка.</p><p>Согласно моему плану, мы собрали небольшое минное заграждение вдали от оживлённых торговых трасс, в которое сегодня вечером запустим беспилотный гаммадрон. Мы рассчитали всё так, чтобы из окна вашей резиденции был хорошо виден триумф новых технологий.</p>',
  options: {
    accept: {
      text: 'Что ты несёшь, Третий? Какой ещё триумф?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 3200,
    crystals: 3200,
  },
};
