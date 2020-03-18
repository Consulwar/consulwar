export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial24',
  condition: [
    ['Statistic/containers.open', 1],
  ],
  slides: 6,
  helpers: [
    {
      url: '/game/planet/Residential/SpacePort',
      condition: {
        target: '.cw--ContainerRewardOpener .cw--ContainerRewardOpener__actions .cw--ContainerRewardOpener__action_open',
        exists: true,
      },
      target: '.cw--ContainerRewardOpener .cw--ContainerRewardOpener__actions .cw--ContainerRewardOpener__action_open',
      direction: 'right',
    },
    {
      url: '/game/planet/Residential/SpacePort',
      condition: {
        target: '.cw--ContainerRewardOpener .cw--ContainerRewardOpener__actions .cw--ContainerRewardOpener__action_grab',
        exists: true,
      },
      target: '.cw--ContainerRewardOpener .cw--ContainerRewardOpener__actions .cw--ContainerRewardOpener__action_grab',
      direction: 'right',
    },
    {
      url: '/game/planet/Residential/SpacePort',
      condition: {
        target: '.cw--ModalConfirm__action_accept',
        exists: true,
      },
      target: '.cw--ModalConfirm__action_accept',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Residential/SpacePort',
      condition: {
        target: '.cw--ContainerPopup',
        exists: true,
      },
      target: '.cw--ContainerList .cw--ContainerList__item',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/SpacePort',
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_blue',
      direction: 'top',
    },

    {
      url: '/game/planet/Residential',
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="SpacePort"]',
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
  title: 'Купить белый контейнер и открыть его',
  text: '<p>Мне сообщили, что вам доступны специальные контейнеры. Они находятся в здании Космопорта. Специальная синяя кнопка откроет вам доступ к меню покупки контейнеров. Купите один белый или любой другой контейнер и откройте его. Контейнеры привозят контрабандисты, иногда в этих контейнерах может быть что-то ооочень полезное. А иногда нет. Как повезет.</p>',
  options: {
    accept: {
      text: 'Контейнеры? Кажется, я знаю название вашего издателя…',
      mood: 'positive',
    },
  },
  reward: {
    honor: 500,
    humans: 2000,
    metals: 2500,
    crystals: 1500,
  },
};
