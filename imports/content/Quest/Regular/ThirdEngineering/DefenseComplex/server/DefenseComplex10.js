export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex/DefenseComplex10',
  condition: [
    ['Building/Military/DefenseComplex', 10],
  ],
  title: 'Построить Оборонный комплекс 10-го уровня',
  text: '<p>Одно дело – простые мины, и совсем другое – ионные, Командир. Эти штуки не просто пробьют дыру в нерасторопном корабле, их потенциал намного шире. Когда сработает детонатор, такая мина сгенерирует мощное электромагнитное возмущение, которое, в теории, сначала пробьёт щит, затем похерит всю электронную начинку и только после этого взорвётся.</p><p>Но нужно провести испытания в отрытом космосе, иначе ничего нельзя гарантировать. Придётся, конечно, пожертвовать кое-какими старыми кораблями…</p>',
  options: {
    accept: {
      text: '…и кое-какими старыми инженерами. Шучу. Наверное.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 24,
    crystals: 24,
  },
};
