export default {
  id: 'Quest/Regular/NatalyVerlen/Drill/Drill35',
  condition: [
    ['Research/Evolution/Drill', 35],
  ],
  title: 'Исследовать Бурильный Бур 35-го уровня',
  text: '<p>Бурильный Бур всем хорош, Консул, но работает он только в одном направлении – том, которое ему задали изначально. Однако в природе полезные ископаемые редко располагаются в одной точке, чаще они «размазаны» длинными пластами на примерно одинаковой глубине.</p><p>Поэтому наши учёные решили немного усовершенствовать Бур и навесили на него датчики для обнаружения залежей Металла. Это сэкономит нам кучу времени и ресурсов, а также позволит не бурить лишних шахт на поверхности планеты.</p>',
  options: {
    accept: {
      text: '«Вас ждёт сплошная экономия, Консул, дайте денег!»',
      mood: 'positive',
    },
  },
  reward: {
    metals: 60,
    crystals: 60,
  },
};