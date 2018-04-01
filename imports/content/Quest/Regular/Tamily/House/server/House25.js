export default {
  id: 'Quest/Regular/Tamily/House/House25',
  condition: [
    ['Building/Residential/House', 25],
  ],
  title: 'Построить Жилой Комплекс 25-го уровня',
  text: '<p>А помните те Жилые Комплексы, что вы приказали построить, правитель? Их уже заселили по полной программе и люди вам очень благодарны! У них всего одна небольшая просьба к вам: так получилось, что при строительстве одного из Комплексов никто не провёл к нему кабель от основной линии электропередачи. Конечно, торговля фонариками и алкоголем процветает в этом районе,но, может быть, всё-таки провести им туда электричество? Уверена, прирост населения не заставит себя долго ждать.</p>',
  options: {
    accept: {
      text: 'А я всегда думал, что прирост от выключения электричества бывает.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 350,
    crystals: 350,
  },
};
