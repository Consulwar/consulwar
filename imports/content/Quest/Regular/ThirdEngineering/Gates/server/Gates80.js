export default {
  id: 'Quest/Regular/ThirdEngineering/Gates/Gates80',
  condition: [
    ['Building/Military/Gates', 80],
  ],
  title: 'Построить Врата 80-го уровня',
  text: '<p>Это прорыв, Командир! С помощью новейшего оборудования нам удалось-таки расшифровать сигнал и даже установить конкретное местонахождение нескольких «точек выхода» Врат. Как бы безумно это ни звучало, эти точки связаны не только через Врата – они являются частями одного целого.</p><p>И в момент соединения мембранами Врат они начинают работать, как единый механизм. Возможно, что это какое-то оружие. Чтобы понять наверняка, нам нужны схемы древних – они позволят откалибровать Врата более точно.</p>',
  options: {
    accept: {
      text: 'Ну и где я тебе возьму эти схемы? У рептилий отберу?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
