export default {
  id: 'Quest/Regular/NatalyVerlen/Science/Science80',
  condition: [
    ['Research/Evolution/Science', 80],
  ],
  title: 'Исследовать Научный Отдел 80-го уровня',
  text: '<p>Наши генетики снова получили заказ из Центра Развлечений: те прознали про теоретическую реконструкцию организма из нескольких сохранившихся клеток, и теперь хотят добавить в свои парки развлечений доисторических животных – с Земли и с других планет, остатки которых обнаружили многочисленные космические экспедиции.</p><p>С одной стороны, это наименее эффективное использование генной инженерии, с другой стороны, это даст Лаборатории возможность поработать с новым биологическим материалом.</p>',
  options: {
    accept: {
      text: 'Я – за, давно хотел прогуляться по парку Юрского периода!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
