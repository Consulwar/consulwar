export default {
  id: 'Quest/Regular/NatalyVerlen/Crystallization/Crystallization30',
  condition: [
    ['Research/Evolution/Crystallization', 30],
  ],
  title: 'Исследовать Кристаллизацию 30-го уровня',
  text: '<p>Не секрет, что в авиационной и космической промышленности существует большая потребность в лёгких, прочных и износостойких материалах. Все эти свойства можно получить, используя композитные материалы на основе жидких кристаллов, Консул.</p><p>Термостойкая обшивка, силовая конструкция, теплоизолирующие покрытия – всё это можно усовершенствовать в нашей лаборатории с помощью новых технологий. И это не просто слова – мы принимаем активное участие в испытаниях новых самолётов и космических кораблей.</p>',
  options: {
    accept: {
      text: 'Обломки собираете, что ли?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 6000,
    crystals: 6000,
  },
};
