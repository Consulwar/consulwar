export default {
  id: 'Quest/Daily/NatalyVerlen/Future',
  title: 'Будущее',
  author: 'Ronax',
  text: 'Консул, мы уловили странный сигнал, но не можем определить его источник. Он слабеет с каждым часом. На другом конце кто-то хочет личной беседы с вами. Он себя не назвал, однако в доказательство своей значимости рассказывает нам секретные материалы, о существовании которых знает лишь малый круг лиц. Сигнал нечеткий, однако он сможет передавать видео-трансляцию.',
  answers: {
    children: {
      text: 'Опять дети по телефонам звонят. Я тут между прочим… а, не важно.',
      win: 'В ходе служебной проверки выяснилось, что хулиганит один из родственников чинуши из Совета. Карательный отряд уже вылетел, но был вынужден вернуться, так как неожиданно получил большое пожертвование на вашу деятельность. Бывают же совпадения, да, Консул?',
      fail: 'Вам стоило бы отнестись к этому серьезно, Консул… Всё. Уже поздно, сигнал пропал',
    },
    aloe: {
      text: 'Переведите вызов в мою Палату. Если спустя 10 минут я всё ещё буду на связи с незнакомцем, отмените все важные мероприятия.',
      fail: 'Это странно, но десять минут назад вы лично позвонили мне и отдали недвусмысленный приказ. Сожалею, но я не могу позволить, чтобы этот разговор состоялся. Временную петлю необходимо разорвать, и как можно скорее.',
    },
    science: {
      text: 'Не можете определить источник? А импульсный уловитель запустить пробовали?',
      win: 'Это было гениально, Командующий! Мы определили точку, которая находится где-то далеко за пределами нашей галактики. Предположительно, она находится в центре чёрной дыры. Это открытие сильно подтолнёт развитие науки на нашей колонии, Консул.',
      fail: 'Мы подключили его для отслеживания сигнала, но что-то пошло не так, и произошёл большой взрыв в атмосфере. В течение минуты мы ещё улавливали темпоральные сдвиги, но они быстро исчезли.',
    },
  },
};
