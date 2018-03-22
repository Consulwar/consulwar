export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial2',
  condition: [
    ['Building/Residential/House', 5],
  ],
  slides: 3,
  title: 'Построить Жилой Комплекс 5-го уровня',
  text: '<p>Любое здание можно улучшать до 100 уровня. Вы сейчас предствили, Консул, как будете уныло тыкать 100 раз подряд кнопку одного здания? К счастью, вам не придётся этого делать, достаточно просто ввести в поле с номером уровня нужное вам число, и наша система автоматически рассчитает, сколько ресурсов вам понадобится. Попробуем на Жилом Комплексе? Выберите Жилой комплекс, введите цифру 5 над кнопкой строительства и нажмите кнопку «Улучшить», чтобы сразу получить 5-й уровень здания.</p>',
  options: {
    accept: {
      text: 'Попробуем…',
      mood: 'positive',
    },
  },
  reward: {
    humans: 1000,
  },
};
