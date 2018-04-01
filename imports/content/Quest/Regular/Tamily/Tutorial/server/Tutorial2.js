export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial2',
  condition: [
    ['Building/Residential/House', 5],
  ],
  slides: 3,
  helpers: [
    {
      url: '/game/planet/Residential/House',
      condition: {
        target: '.content.building.planet.Residential .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 5,
      },
      target: '.content.building.planet.Residential .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/House',
      target: '.content.building.planet.Residential .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },
    {
      url: '/game/planet/Residential',
      target: '.cw--Menu.cw--MenuUnique  .cw--Menu__item[href*="House"]',
      direction: 'top',
    },
    {
      url: '/game/planet',
      target: 'header .menu .second_menu li.Residential-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .menu .main_menu li.planet',
      direction: 'bottom',
    },
  ],
  title: 'Построить Жилой Комплекс 5-го уровня',
  text: '<p>Любое здание можно улучшать до 100 уровня. Вы сейчас предствили, Консул, как будете уныло тыкать 100 раз подряд кнопку одного здания? К счастью, вам не придётся этого делать, достаточно просто ввести в поле с номером уровня нужное вам число, и наша система автоматически рассчитает, сколько ресурсов вам понадобится. Попробуем на Жилом Комплексе? Выберите Жилой комплекс, введите цифру 5 над кнопкой строительства и нажмите кнопку «Улучшить», чтобы сразу получить 5-й уровень здания.</p>',
  options: {
    accept: {
      text: 'Попробуем…',
      mood: 'positive',
    },
  },
  reward: {
    humans: 1000,
  },
};
