export default {
  id: 'Quest/Regular/ThirdEngineering/Gates/Gates85',
  condition: [
    ['Building/Military/Gates', 85],
  ],
  title: 'Построить Врата 85-го уровня',
  text: '<p>Я начинаю думать, Командир, что Врата работают даже тогда, когда мы их отключаем от энергосети. Как иначе объяснить появление в нашем ангаре скромного человека по имени ИОО?</p><p>Он раскланялся с нашим главным инженером, а потом попросил передать Главнокомандующему ФШМу записку, в которой была всего одна строчка: «Не пора ли на Землю, друзья?» И прежде чем мы успели задержать его для допроса, он попросту испарился. А Врата как стояли без питания, так и стоят.</p>',
  options: {
    accept: {
      text: 'Этот умеет без Врат, ему просто очень нужно.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2000,
    crystals: 1280,
  },
};
