export default {
  id: 'Quest/Regular/ThirdEngineering/Barracks/Barracks30',
  condition: [
    ['Building/Military/Barracks', 30],
  ],
  title: 'Построить Казармы 30-го уровня',
  text: '<p>Третий Инженерный на посту! После учений новобранцам нужно как следует отдохнуть, Командир. А в наших нынешних Казармах не предусмотрена комната политинформации.</p><p>Так что по вашему приказу мы немедленно начнём её сооружать и снабжать всем необходимым для хорошего отдыха и тщательной промывки мозгов. В конце концов, это армия, а не институт благородных девиц, нам нужна дисциплина и сознательность.</p>',
  options: {
    accept: {
      text: 'О, у вас есть целый институт девиц!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 400,
    crystals: 400,
  },
};
