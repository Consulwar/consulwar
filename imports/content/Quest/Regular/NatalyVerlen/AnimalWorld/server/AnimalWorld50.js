export default {
  id: 'Quest/Regular/NatalyVerlen/AnimalWorld/AnimalWorld50',
  condition: [
    ['Research/Evolution/AnimalWorld', 50],
  ],
  title: 'Исследовать В Мире Животных 50-го уровня',
  text: '<p>Одна из обязанностей наших политиков – следить за благоустройством жилых кварталов города. И вот, в очередной раз увлёкшись формой вместо содержания, эти находчивые люди не нашли ничего лучше, чем запретить катание на скейтах, роликах и велосипедах в деловом центре.</p><p>И присовокупили к этому запрет на мытьё в фонтанах. Нет, я знала, что они оторваны от жизни, но чтоб настолько… Вывезу их как-нибудь в парк, где есть фонтаны.</p>',
  options: {
    accept: {
      text: 'Ага, одни будут мыться, а другие – штрафовать. Активный, мать его, отдых.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 90,
    crystals: 90,
  },
};
