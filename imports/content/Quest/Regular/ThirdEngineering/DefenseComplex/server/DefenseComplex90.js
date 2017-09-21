export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex/DefenseComplex90',
  condition: [
    ['Building/Military/DefenseComplex', 90],
  ],
  title: 'Построить Оборонный комплекс 90-го уровня',
  text: '<p>Мы построили очень хорошую систему безопасности для нашей планеты, Командир. Мины и турели, плазменные пушки на земле и рейлганы на орбите – всё это очень круто, но чего-то этой системе не хватает…</p><p>Может быть, огромной орбитальной станции с мощной бронёй, которая одна сможет удерживать внушительный флот противника в то время, как наша доблестная артиллерия будет поливать огнём все, до чего смогут дотянутся наши лазерные прицелы? Думаю, у такой махины будет много поклонников среди инженеров.</p>',
  options: {
    accept: {
      text: 'Думаю, в восторге будут даже замшелые старушки.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 152,
    crystals: 152,
  },
};
