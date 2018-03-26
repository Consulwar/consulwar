export default {
  id: 'Quest/Regular/NatalyVerlen/Alloy/Alloy50',
  condition: [
    ['Research/Evolution/Alloy', 50],
  ],
  title: 'Исследовать Особые Сплавы 50-го уровня',
  text: '<p>К нам поступила заявка от транспортного департамента, Командующий. Они хотят сделать систему лёгкого метро, и для этого им нужны по-настоящему лёгкие материалы, к тому же с хорошим запасом прочности.</p><p>Лаборатория уже начала разработку, но для дальнейшей работы нам понадобится углублённое исследование в области Особых Сплавов. Если вы одобряете ход наших мыслей, Командующий, отдайте приказ повысить уровень этого исследования. Вы не пожалеете, я обещаю.</p>',
  options: {
    accept: {
      text: 'Не волнуйся, Натали, твой Император тебя одобряет.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 700,
    crystals: 700,
  },
};
