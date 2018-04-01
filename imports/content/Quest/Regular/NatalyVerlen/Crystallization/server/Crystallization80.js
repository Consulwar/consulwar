export default {
  id: 'Quest/Regular/NatalyVerlen/Crystallization/Crystallization80',
  condition: [
    ['Research/Evolution/Crystallization', 80],
  ],
  title: 'Исследовать Кристаллизацию 80-го уровня',
  text: '<p>Опыты с растягиванием полимеров в жидкой среде прошли очень успешно, Консул. Нам удалось не только получить равномерную структуру нанопор на поверхности материала – мы также обнаружили, что жидкость, которую захватывает полимер по мере растяжения, затем медленно испаряется на протяжении долгого срока.</p><p>Используя это явление, мы можем производить бактерицидные покрытия для лазаретов, а также материалы с парфюмерным эффектом для Центра Развлечений. Не представляю, впрочем, на черта они им.</p>',
  options: {
    accept: {
      text: 'Ничего-то ты не знаешь о жизни, Натали.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
