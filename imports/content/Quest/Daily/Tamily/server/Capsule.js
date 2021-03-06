export default {
  id: 'Quest/Daily/Tamily/Capsule',
  title: 'Капсула',
  text: 'Консул, произошло странное событие: вчера, когда был метеоритный дождь, одним из небесных тел оказалась капсула. На капсуле есть надпись, она повреждена, но пару символов удалось расшифровать – S#P-17#. Внутри, кажется, что-то живое, и оно пытается вырваться. Мы не знаем, что нам с этим делать и как нам поступить, о великий Консул!',
  answers: {
    fathers: {
      text: 'Постройте вокруг капсулы укреплённый контейнер. Приставьте трёх Папань следить за существом, и пусть моргают по очереди.',
      win: 'Консул, ваша мудрость безгранична, как вселенная. Вы снова всех спасли: как только мы последовали вашим инструкциям, все попытки воздействия от существа прекратились. Как же хорошо, что вы у нас есть!',
      fail: 'Мы сделали всё как вы приказали, правитель, однако с места падения капсулы уже несколько часов мы не получаем никаких сигналов.',
    },
    blowup: {
      text: 'Вы что там, совсем охренели? Взорвите к чертям собачьим эту капсулу!',
      win: 'Как же я сама не догадалась! Пара литров жидкого кристалла решили проблему моментально, и как всегда, благодаря вашему прекрасному плану.',
      fail: 'К сожалению, взрыв повредил только оболочку капсулы, существу удалось вырваться. Нескольких наших он убил сразу, после чего скрылся в пыли. Поисковые отряды всё ещё сканируют местность, но пока ничего…',
    },
    sendBack: {
      text: 'Как можно быстрее отправьте её обратно в космос, эта штука слишком опасна.',
      win: 'Нам удалось пристроить пусковые двигатели к капсуле, после чего она была успешно отправлена туда, откуда прибыла. Надеюсь, оно больше к нам никогда не вернётся.',
      fail: 'Нашим инженерам удалось отправить эту шкатулку пандоры в открытый космос. К несчастью, траектория полёта совпала с траекторией торгового судна. Хоть повреждения и не были критическими, экипаж корабля не отвечает; слышен только скрежет металла.',
    },
  },
};
