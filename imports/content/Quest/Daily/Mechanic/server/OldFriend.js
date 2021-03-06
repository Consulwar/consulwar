export default {
  id: 'Quest/Daily/Mechanic/OldFriend',
  title: 'Старый знакомый',
  text: 'Привет, Консул. Ко мне обратился мой старый знакомый. Он занимал один из постов в экономическом блоке Совета и работал, как оказалось, не всегда честно. Теперь Совет желает «просто поговорить» с ним. Совет начал прочёсывать колонии, и твоя — последняя в списке. Если ты предоставишь ему убежище на несколько дней, то получишь неплохое вознаграждение.',
  answers: {
    cleft: {
      text: 'Идёт, вот координаты расселины на юге колонии.',
      win: 'Он просил передать слова благодарности и вот эту посылку. Вряд ли мы услышим о нём вновь.',
      fail: 'Когда он приземлился в указанном месте, дикие животные напали на него и разорвали бедолагу в клочья. К сожалению, трупы не выписывают чеки, Консул.',
    },
    imTheKing: {
      text: 'Не царское это дело – преступников прятать.',
      fail: 'Это твоё решение, Консул. Я найду заинтересованного в доходе человека.',
    },
    godfather: {
      text: 'Ты прилетаешь и просишь что-то у меня, но просишь без уважения, не предлагаешь мне дружбу, даже не называешь меня «Консул»',
      fail: 'В следующий раз можешь просто отказаться, чтобы я не терял время на выслушивание твоих речей. Время — деньги, Консул.',
    },
  },
};
