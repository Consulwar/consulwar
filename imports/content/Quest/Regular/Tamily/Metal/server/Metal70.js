export default {
  id: 'Quest/Regular/Tamily/Metal/Metal70',
  condition: [
    ['Building/Residential/Metal', 70],
  ],
  title: 'Построить Шахту Металла 70-го уровня',
  text: '<p>Добрый день, Консул. На Шахте Металла всё стало настолько спокойно, что рабочие решили попросить у вас разрешения расширить комнату отдыха… Ах да, и поставить там инфопанель. Любят они в перерывах на обед смотреть какие-то «Голые факты» на Первом Космическом. Клянутся, что с обедом и телевизором запросто увеличат объём добываемой руды. Если вы не против потратить немного ресурсов на Шахту, правитель, отдайте распоряжение — и они сами начнут ремонт и закупку всего необходимого.</p>',
  options: {
    accept: {
      text: 'Я бы вот тоже… С инспекцией, что ли, туда нагрянуть?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 200,
    crystals: 40,
  },
};