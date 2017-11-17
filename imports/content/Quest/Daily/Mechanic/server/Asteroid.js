export default {
  id: 'Quest/Daily/Mechanic/Asteroid',
  title: 'Астероид',
  text: 'Привет, Консул. Мои источники сообщили, что на днях мимо твоей колонии пройдёт астероид. На нём есть небольшие залежи крайне редкого и сверхпрочного минерала — чакнорисцита. Ходят легенды, что он выкристаллизовался из пота великого героя прошлого. Твои инженеры помогут мне с добычей, а я обещаю хорошо заплатить.',
  answers: {
    thugStyle: {
      text: 'Забирай вон тех, что сидят на корточках.',
      win: 'Команда, конечно, поначалу выглядела неубедительно, но оказалось, что дело своё знает. Вот твоя часть, Консул.',
      fail: 'Увы, Консул, мы три часа пытались растолкать заниженный крейсер, слушали хиты Вити М-158, сквозь тонировку всматривались в тёмные глубины космоса, но в итоге пропустили астероид.',
    },
    okGo: {
      text: 'Хорошо, я подготовлю команду инженеров к вылету.',
      win: 'Всё прошло как нельзя лучше, Консул. Приятно иметь деловые отношения с хорошими партнёрами.',
      fail: 'Минерал оказался гораздо твёрже, чем я предполагал, Консул. Нам не удалось достать его из недр астероида.',
    },
    chuckIsBack: {
      text: 'По рукам. Это же просто камень, что может случиться?',
      fail: 'Консул, это повреждённое послание — всё, что осталось от твоей команды: «Пшш… Достань меня. Достань меня, крутой парень… Пшш… Покажи, насколько ты крут. И вот это значит добывать? Пшш… Вот что значит добывать! Пшш…». Неловко вышло.',
    },
  },
};