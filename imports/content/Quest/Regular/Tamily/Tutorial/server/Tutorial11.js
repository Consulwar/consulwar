export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial11',
  condition: [
    ['Building/Residential/House', 20],
    ['Building/Residential/Metal', 20],
    ['Building/Residential/Crystal', 20],
  ],
  slides: 2,
  title: 'Построить Жилой Комплекс 20-го уровня, Шахту Металла 20-го уровня, Шахту Кристалла 20-го уровня',
  text: '<p>Каждые 20 уровней требования тех зданий и исследований, что вы уже построили, меняются на более дорогие. Поэтому придётся развивать всю колонию равномерно, а также доставать в космосе новые ресурсы. Кстати о ресурсах. Надо бы улучшить Жилой комплекс, Шахту металла и Шахту кристалла до 20-го уровня.</p>',
  options: {
    accept: {
      text: 'Что, и даже не скажешь про бесплатное ускорение?',
      mood: 'positive',
    },
  },
  reward: {
    'Resource/Artifact/Green/RotaryAmplifier': 10,
    'Resource/Artifact/Green/SecretTechnology': 10,
  },
};
