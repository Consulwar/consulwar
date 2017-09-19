export default {
  id: 'Quest/Regular/ThirdEngineering/Barracks/Barracks55',
  condition: [
    ['Building/Military/Barracks', 55],
  ],
  title: 'Построить Казармы 55-го уровня',
  text: '<p>А знаете, Командир, легион Турникмэнов, отправляющийся на взлётную площадку для десанта на Землю, выглядит очень внушительно. Но идут они пиздец как медленно, даже если подгонять на Бгоневичках.</p><p>Мы решили переделать пару списанных Мамок под платформы для доставки тяжёлой пехоты – метро они попросту сломают, уже проверяли. Как только вы прикажете, начнём монтировать первые образцы.</p>',
  options: {
    accept: {
      text: '«Боевая Гвардия тяжёлыми шагами идёт, сметая крепости, с огнём в очах!»',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
