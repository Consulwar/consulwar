export default {
  id: 'Quest/Regular/ThirdEngineering/Factory/Factory50',
  condition: [
    ['Building/Military/Factory', 50],
  ],
  title: 'Построить Военный Завод 50-го уровня',
  text: '<p>Не секрет, что лёгкие танки часто используются в разведке. А для разведки самое главное – быстрые ноги или хороший движок.</p><p>Военный Завод как раз закончил комплектацию экспериментального двигателя для Лёгкого Танка Изи и готов, после соответствующих испытаний, конечно, поставить этот движок на все лёгкие танки, которые будут выпускаться в будущем. Представляю, как вытянутся зеленые морды, когда увидят, как драпает наша разведка…</p>',
  options: {
    accept: {
      text: 'Ну, они ж не просто драпают, а с донесением!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 700,
    crystals: 700,
  },
};
