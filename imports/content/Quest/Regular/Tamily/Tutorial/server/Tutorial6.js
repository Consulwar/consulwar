export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial6',
  condition: [
    ['Building/Residential/House', 10],
    ['Building/Residential/Metal', 10],
    ['Building/Residential/Crystal', 10],
  ],
  slides: 5,
  title: 'Построить Жилой Комплекс 10-го уровня, Шахту Металла 10-го уровня, Шахту Кристалла 10-го уровня',
  text: '<p>Отличная работа, правитель! Теперь вам доступны ещё два основных ресурса, это Металл и Кристалл. Они используются при строительстве и исследованиях, а еще… но не будем забегать вперед. И надо бы улучшить Жилой комплекс, Консул, вам нужно больше людей. Улучшите жилой комплекс до 10 уровня, постройте Шахту металла и Шахту Кристалла 10 уровня каждую.</p>',
  options: {
    accept: {
      text: 'Ресурсы – это хорошо. Лучше только бесплатная ускорялка.',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Wasp': 25,
  },
};
