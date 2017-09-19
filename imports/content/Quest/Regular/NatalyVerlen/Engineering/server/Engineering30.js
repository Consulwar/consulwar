export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering30',
  condition: [
    ['Research/Evolution/Engineering', 30],
  ],
  title: 'Исследовать Оборонную Инженерию 30-го уровня',
  text: '<p>Идея о том, чтобы укрепить щитами заднюю часть турелей, оказалась очень удачной, Командующий. Впрочем, меня это не удивляет, ведь в Лаборатории уже давно ходят легенды о вашем инженерном гении.</p><p>Впрочем, перейдём к делу: как вы знаете, турели могут свободно вращаться в любом направлении, поэтому стоило ввести в систему наведения новые данные об отражающей способности щита и – хоп – турель ловко поворачивается задом к любой угрозе, отбивает её щитом и продолжает стрелять.</p>',
  options: {
    accept: {
      text: 'Чёрт, а я хорош! Надо будет ещё чей-нибудь зад укрепить на досуге.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 9000,
    crystals: 9000,
  },
};
