export default {
  id: 'Quest/Regular/Tamily/House/House80',
  condition: [
    ['Building/Residential/House', 80],
  ],
  title: 'Построить Жилой Комплекс 80-го уровня',
  text: '<p>Консул, доброго дня! У нас возникла небольшая накладка с поставками для военных — в производственном отделе Казарм сделали большую партию датчиков движения, но увы, она вся оказалась бракованной. Исправный датчик показывает движение рептилоидов и никак не реагирует на людей, а у этих все наоборот. Переделывать будет дороже, чем выпустить новое, и военные предложили поставить эти штуки в Жилые Комплексы. Но не просто поставить, а связать их с системами освещения: говорят, это позволит значительно сэкономить на электричестве, а это даст нам ещё один Комплекс и приток людей. Если вы не против попробовать, просто распорядитесь улучшить Комплексы, и оборудование немедленно начнут устанавливать.</p>',
  options: {
    accept: {
      text: 'А в ладоши хлопать они не пробовали?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
