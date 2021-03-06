export default {
  id: 'Quest/Daily/SoseuhTilps/LostInSpaceSoseuhTilps',
  title: 'Потерянные в космосе',
  author: 'GreyWind',
  text: 'Консул, мне нужен ваш совет для решения непростой ситуации. К нам внезапно прилетела в хлам бухая инженерная бригада Совета. После долгого разбирательства с их страдающим от похмелья начальником, неким Алкашиным Г. М., я выяснил, что они прибыли сюда, чтобы заняться восстановлением повреждений, вызванных «Баней», устроенной прилетавшими рептилиями в, цитирую, «12-цатом квадрате 25-го сектора на 3-м строительном уровне». Но проблема в том, что у нас по указанному адресу нет никаких повреждений.',
  answers: {
    wrongAddress: {
      text: 'Уточните, на какую именно колонию они отправлялись.',
      win: 'Невероятно, Консул! Как оказалось, в соседней колонии по указанному Алкашиным адресу и правда имеются повреждения от налёта рептилий, и они уже пару дней ждут прилёта этой бригады. Я подготовлю их к отправке по верному адресу. А вам были высланы ресурсы в благодарность за помощь с поиском пропавших инженеров.',
      fail: 'Я попытался связаться с ближайшими колониями, но у них либо нет объектов с указанным адресом, либо они находятся в рабочем состоянии.',
    },
    callHippolytus: {
      text: 'Позовите Ипполита!',
      fail: 'Консул, я вызывал всех подчиненных с этим именем, но никто из них не смог нам помочь… Может? вы уточните, какой именно Ипполит вам нужен и зачем?',
    },
    ans3: {
      text: 'Отправьте их помогать на стройку и сообщите в Совет о происшествии.',
      win: 'Отличное решение, Консул! Пока Совет разбирается, куда они должны были попасть на самом деле, мы неплохо продвинулись в строительстве дорог между Жилым и Военным районами города.',
      fail: 'Боюсь, в текущем состоянии эта бригада больше помешает нашим строителям, чем поможет. Я сообщу в Совет, чтобы они поскорее забрали отсюда этих алкашей.',
    },
  },
};
