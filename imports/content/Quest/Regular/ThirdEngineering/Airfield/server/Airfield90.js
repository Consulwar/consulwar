export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield/Airfield90',
  condition: [
    ['Building/Military/Airfield', 90],
  ],
  title: 'Построить Аэродром 90-го уровня',
  text: '<p>Я ведь уже говорил вам, Командир, что ваш Аэродром стал одной из самых крупных военных структур на планете? И персонала для обслуживания этого комплекса требуется всё больше и больше.</p><p>Выход из ситуации, как всегда, очень простой – надо поселить весь персонал вблизи Аэродрома и обеспечить необходимой инфраструктурой. Вот тут наши инженеры набросали примерный план будущего авиагородка, а вам остаётся только утвердить их смету.</p>',
  options: {
    accept: {
      text: 'Парки и школы выкинуть, а остальное делайте.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 10200,
    crystals: 10200,
  },
};
