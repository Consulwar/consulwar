export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher5',
  condition: [
    ['Building/Residential/PulseCatcher', 5],
  ],
  title: 'Построить Импульсный Уловитель 5-го уровня',
  text: '<p>Эта штука, которую строят инженеры, оказалась не такой уж и бесполезной, правитель. Учёные уже нашпиговали Уловитель всякими датчиками и приборами для отслеживания космических лучей. Я и не знала, что в космосе бывают лучи.</p><p>Это, наверное, очень красивое зрелище. А ещё совершенно непонятно, почему все сооружения для космических исследований имеют такую вытянутую, я бы даже сказала, продолговатую форму? Может, это как-то помогает приборам ловить импульсы Вселенной?</p>',
  options: {
    accept: {
      text: 'О да, детка, эта форма создана самой природой. Кхем… Исключительно для импульсов Вселенной.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 150,
    crystals: 150,
  },
};
