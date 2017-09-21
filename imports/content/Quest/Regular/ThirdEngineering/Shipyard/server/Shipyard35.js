export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard35',
  condition: [
    ['Building/Military/Shipyard', 35],
  ],
  title: 'Построить Верфь 35-го уровня',
  text: '<p>А вы заметили, Командир, что теперь зеленокожие стали летать более мощными флотами? Толпы, орды и даже тучи мелких кораблей – это ужасно раздражает, не правда ли? Как раз для борьбы с этим явлением и был изобретён крейсер, у которого всегда есть ответ в виде мощной ионной пушки.</p><p>Просто не забывайте прикрывать его от атак кораблями сопровождения, и этот монстр запросто сметёт всё на своём пути. А вам останется только подбирать обломки и пересчитывать трофейные ресурсы.</p>',
  options: {
    accept: {
      text: 'Я могу еще и добивать выживших, если что.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 42,
    crystals: 42,
  },
};
