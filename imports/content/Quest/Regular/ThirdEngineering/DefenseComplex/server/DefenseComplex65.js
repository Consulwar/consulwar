export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex/DefenseComplex65',
  condition: [
    ['Building/Military/DefenseComplex', 65],
  ],
  title: 'Построить Оборонный комплекс 65-го уровня',
  text: '<p>Испытания новых пушек на основе опытного образца показали отличные результаты, Командир. Поэтому мы решили пойти ещё дальше в своих изысканиях и объединить несколько рельсотронов в одно большое орудие.</p><p>Такая конструкция будет бить в кучу мелких кораблей, словно стоствольный пулемёт – в стаю перелётных птиц. А нам останется только собирать тушки и отправлять их на переработку. По-моему, это очень хорошая перспектива для нашей техники, и довольно жуткая – для  кораблей зеленомордых.</p>',
  options: {
    accept: {
      text: 'Меня всё устраивает, а их мы спрашивать не будем.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2000,
    crystals: 2000,
  },
};
