export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex/DefenseComplex5',
  condition: [
    ['Building/Military/DefenseComplex', 5],
  ],
  title: 'Построить Оборонный комплекс 5-го уровня',
  text: '<p>Наши военные научились отлично перехватывать вражеские флоты, Командир, но иногда у армии просто не хватает времени и сил, чтобы охранять собственную планету. Поэтому я придумал схему минных заграждений, которые мы поставим аккурат в точках выхода из варпа.</p><p>План такой: я возьму старенький Трак, загружу в него мины и повезу в точку установки. А когда я их выгружу, то просто настрою детонаторы на сигнатуру вражеских кораблей. Очень просто и безопасно!</p>',
  options: {
    accept: {
      text: 'Валяй, но чтобы Трак вернул на базу.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 150,
    crystals: 150,
  },
};
