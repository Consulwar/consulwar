export default {
  id: 'Quest/Daily/Calibrator/Fiber',
  title: 'Оптическое волокно',
  text: '…15 N — 001011… MP-211… Ох, Консул, извините, я немного занят. Сегодня мы проводим первое тестирование сверхвысокопроводящего оптического волокна нового поколения. Мы проводим модернизацию линий связи в колонии, и сейчас передаём первое тестовое сообщение по пилотному участку. Может, вы тоже хотите что-то передать? ',
  answers: {
    inMyOffice: {
      text: 'Нет, лучше тяните это волокно сразу в мой офис.',
      fail: 'Консул, я не занимаюсь руководством этого проекта, да и испытания пока что находятся на начальном этапе. ',
    },
    XYZ: {
      text: 'Конечно, есть одно незыблемое слово.',
      win: 'Консул, в приёмном пункте сказали, что получили тестовое слово, так что всё прошло хорошо. Причём новость эту они мне сообщили с улыбками. А что это было за слово?',
      fail: 'К сожалению, Консул, передача не прошла, поскольку слово слишком короткое. постарайтесь придумать что-то длиннее трёх букв.',
    },
    fire: {
      text: 'Давай сам, мне неинтересно.',
      win: 'Ну что же, Консул, я понимаю. Тестирование — достаточно муторная и скучная задача для обычного человека. Я сделаю всё как можно быстрее.',
    },
  },
};
