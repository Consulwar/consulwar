export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard25',
  condition: [
    ['Building/Military/Shipyard', 25],
  ],
  title: 'Построить Верфь 25-го уровня',
  text: '<p>Ваш флот, Командир, успешно атакует патрули и мелкие торговые флоты Рептилий, и наши инженеры заметили, что после боя в космосе остаётся довольно много обломков. Было бы здорово выловить их и доставить на базу – вполне возможно, что наши умельцы смогут извлечь из них полезные ресурсы.</p><p>Но для этого придётся построить особый грузовой корабль. Мы уже работаем над его чертежами, – думаю, у него не будет особо мощного вооружения и брони, ведь он должен, по сути, исполнять только одну функцию.</p>',
  options: {
    accept: {
      text: 'А я уже говорил, что всегда мечтал ковыряться в мусоре?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 350,
    crystals: 350,
  },
};
