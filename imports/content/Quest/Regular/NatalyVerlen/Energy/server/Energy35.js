export default {
  id: 'Quest/Regular/NatalyVerlen/Energy/Energy35',
  condition: [
    ['Research/Evolution/Energy', 35],
  ],
  title: 'Исследовать Энергетику 35-го уровня',
  text: '<p>Плазма прекрасно выполняет роль источника энергии, Консул. Однако наши учёные задались целью создать грандиозный комплекс солнечных батарей в открытом космосе. Нам не стоит вечно полагаться на наземные технологии, пора двигаться вперёд, к светлому будущему человечества среди звёзд!</p><p>Ой, что-то меня понесло… В двух словах: Лаборатория собирается запустить на орбиту солнечные батареи, потому что в космосе нет атмосферы, затрудняющей сбор дармовой энергии от нашей звезды.</p>',
  options: {
    accept: {
      text: 'Ты сказала «дармовой»? Держи ресурсы на проект!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 450,
    crystals: 450,
  },
};
