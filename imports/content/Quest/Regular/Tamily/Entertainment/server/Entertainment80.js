export default {
  id: 'Quest/Regular/Tamily/Entertainment/Entertainment80',
  condition: [
    ['Building/Residential/Entertainment', 80],
  ],
  title: 'Построить Центр Развлечений 80-го уровня',
  text: '<p>В Центрах Развлечений собираются открыть ещё один тематический аттракцион, правитель. На этот раз они замахнулись на космические баталии: команда из нескольких человек «управляет» макетом космического корабля, а робот, загримированный под Адмирала Боллза, отдаёт им приказы и затрещины. Инженеры обещают, что после выходного, проведённого в обществе нашего славного Адмирала, люди будут работать, как бешеные. Если вы одобряете этот смелый план, прикажите улучшить Центры, и чертежи фальшивых линкоров отправятся в работу.</p>',
  options: {
    accept: {
      text: 'Я бы на их месте трансляции устраивал, как с настоящего корабля. Хрен отличишь!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
