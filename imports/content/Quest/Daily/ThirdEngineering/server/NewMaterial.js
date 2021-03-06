export default {
  id: 'Quest/Daily/ThirdEngineering/NewMaterial',
  title: 'Новый материал',
  text: 'Консул, рад вас видеть! Совсем недавно нам удалось получить абсолютно новый материал. Если нам удастся сделать его более стабильным, то мы сможем значительно сократить затраты на строительство новых зданий. Вы не могли бы узнать у Совета насчёт разрешения на проведение испытаний на одной из их орбитальных станций?',
  answers: {
    iDontLikeThis: {
      text: 'Я им не доверяю, проводите испытания здесь.',
      win: 'Консул, мы опасались, что исследования могут выйти из-под контроля и нанести серьёзный вред окружающей инфраструктуре, но, кажется, всё прошло гладко. Осталось только обработать данные.',
      fail: 'Консул, к сожалению, лаборатория уничтожена. И мы, скажу я вам, ещё легко отделались. Я не зря просил вас узнать про орбитальную станцию.',
    },
    maybeLater: {
      text: 'Вылетайте, а я свяжусь с Советом. Попозже.',
      fail: 'Консул, мы прибыли на одну из орбитальных станций Совета, но охрана попросту не пустила нас внутрь. Наверное, какие-то сбои в системе связи.',
    },
    okIllDoIt: {
      text: 'Лучше разнесите что-нибудь у них, чем в моей колонии.',
      win: 'Консул, разрешение получено, и мы выдвигаемся через несколько часов. Спасибо вам.',
      fail: 'К сожалению, Консул, Совет счел наши исследования слишком опасными и не дал согласие на наше размещение на станции. Жаль, что так вышло, но спасибо вам за помощь!',
    },
  },
};
