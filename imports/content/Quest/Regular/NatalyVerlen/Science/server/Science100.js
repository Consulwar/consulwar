export default {
  id: 'Quest/Regular/NatalyVerlen/Science/Science100',
  condition: [
    ['Research/Evolution/Science', 100],
  ],
  title: 'Исследовать Научный Отдел 100-го уровня',
  text: '<p>У исследований регенерации, которая проводил Научный Отдел, оказался любопытный побочный эффект – мы обнаружили, что некоторые организмы, которые мы изучаем, в меньшей степени подвержены старению и болезням, чем другие.</p><p>Пока достаточно сложно сказать, во что выльются эти исследования, но мысль о том, чтобы жить в несколько раз дольше, мне лично кажется довольно привлекательной. Тем более, что накопленный опыт и знания человека становятся тем ценнее, чем дольше он может их передавать другим.</p>',
  options: {
    accept: {
      text: 'Да, Натали, я тоже согласен на бессмертие ради науки.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 9000,
    crystals: 9000,
  },
};
