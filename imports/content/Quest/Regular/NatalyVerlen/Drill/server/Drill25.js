export default {
  id: 'Quest/Regular/NatalyVerlen/Drill/Drill25',
  condition: [
    ['Research/Evolution/Drill', 25],
  ],
  title: 'Исследовать Бурильный Бур 25-го уровня',
  text: '<p>Некоторые залежи полезных ископаемых, например, металла, находятся не только на земле, но и дне океана. Было бы глупо пренебрегать богатыми залежами только потому, что нас отделяет от них толща солёной воды, Консул. Поэтому наши учёные разработали особые виды шахт – глубоководные.</p><p>Такая шахта располагается на дне, а над ней висит, как поплавок, плавучая платформа, служащая складом, а также первичным заводом по переработке сырья. Да и рабочим будет проще работать посменно – нырнул на работу, вынырнул с работы.</p>',
  options: {
    accept: {
      text: 'Никогда не думал, что на меня будут работать ихтиандры.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
