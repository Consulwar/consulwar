export default {
  id: 'Quest/Regular/NatalyVerlen/Science/Science45',
  condition: [
    ['Research/Evolution/Science', 45],
  ],
  title: 'Исследовать Научный Отдел 45-го уровня',
  text: '<p>Вы были совершенно правы, Консул, когда посоветовали нам провести полевые испытания метода ДНК-шифрования! Я понятия не имею, как именно доставляются материальные носители из штаба на места, но определённо могу сказать, что по дороге они подвергаются чудовищному загрязнению.</p><p>Мы нашли на документе, полученным по обычным армейским каналам, около пятидесяти различных следов ДНК! И я не уверена, что все они получены из отпечатков пальцев. Очевидно, что технологию необходимо ещё дорабатывать.</p>',
  options: {
    accept: {
      text: 'Армия и бумажные документы, Натали. Это было неизбежно.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 600,
    crystals: 600,
  },
};
