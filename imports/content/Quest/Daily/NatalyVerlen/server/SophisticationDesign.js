export default {
  id: 'Quest/Daily/NatalyVerlen/SophisticationDesign',
  title: 'Дизайнерские изыски',
  text: 'У нас проблема, Командующий. Для разработки новой линии мебели мы наняли лучшего дизайнера, отправили ему наши пожелания (вы их подписывали, помните?), но по истечении срока он выдал нам какие-то ужасные рисуночки со связанными женщинами в роли мебели! Что нам делать, Консул?',
  answers: {
    technicalTask: {
      text: 'Упс. А я всё думал, куда делась моя подборка БДСМ порно! Видимо, случайно отправили дизайнеру взамен техзадания.',
      fail: 'Как это безответственно, Консул. Нам придётся заплатить дизайнеру и замять скандал, который уже подняли феминистки.',
    },
    oldButKinky: {
      text: 'Это же шибари! Древнее, но очень концептуальное искусство связывания. Требую первую партию новой мебели сразу же поставить в мой тронный зал!',
      win: 'Ну, если вы так на это смотрите… Я действительно далека от различных веяний искусства и целиком полагаюсь на ваш вкус.',
      fail: 'Но задача-то состояла в функционале новой мебели и использовании её в детских учреждениях! Это ваше шибари неприемлемо.',
    },
    dontPay: {
      text: 'Ну, если результат не соответствует техзаданию – просто не платите ему.',
      win: 'Действительно. Дизайнер, конечно, скандалил, но затем согласился не только выполнить работу согласно техзаданию, но и сделал на свои услуги скидку из-за сорванных сроков.',
      fail: 'Это, конечно, очевидное решение. Вот только сроки сорваны, а мебели нет. Мы терпим убытки.',
    },
  },
};