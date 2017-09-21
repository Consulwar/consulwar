export default {
  id: 'Quest/Regular/Tamily/TradingPort/TradingPort90',
  condition: [
    ['Building/Residential/TradingPort', 90],
  ],
  title: 'Построить Торговый Порт 90-го уровня',
  text: '<p>Правитель, а вы знали, что при открытии гиперпространственного перехода с очень малой вероятностью можно попасть в другое измерение? Я имею в виду Бездну. Это неприятное место мгновенно сводит с ума экипаж и корабль разбивается. А когда мы призываем в этот мир Потерянных, энергия их злобы протаскивает через портал ошмётки космического мусора.</p><p>Один товарищ решил заработать на этом: ловить сор и продавать в Торговом Порту. Дело прибыльное, но владельцы часто меняются.</p>',
  options: {
    accept: {
      text: 'Небось, засосало не одного ловца. Опасная профессия.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 77,
    crystals: 83,
  },
};
