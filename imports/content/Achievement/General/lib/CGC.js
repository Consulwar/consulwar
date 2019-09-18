export default {
  id: 'Achievement/General/CGC',
  field: 'resources.gained.cleancredit',
  levels: [1, 10, 25, 50, 100, 150, 200, 300],
  title: [
    'ЧГК 1 уровня',
    'ЧГК 2 уровня',
    'ЧГК 3 уровня',
    'ЧГК 4 уровня',
    'ЧГК 5 уровня',
    'ЧГК 6 уровня',
    'ЧГК 7 уровня',
    'ЧГК 8 уровня',
  ],
  description: [
    'Приобрёл 1 ЧГК',
    'Приобрёл 10 ЧГК',
    'Приобрёл 25 ЧГК',
    'Приобрёл 50 ЧГК',
    'Приобрёл 100 ЧГК',
    'Приобрёл 150 ЧГК',
    'Приобрёл 200 ЧГК',
    'Приобрёл 300 ЧГК',
  ],
  effects: {
    Special: [
      {
        textBefore: 'Это очень редкая валюта',
        result: ({ level }) => (level === 1 ? '' : 0),
      },
    ],
    Price: [
      {
        textBefore: 'Скидки на товары за ЧГК ',
        textAfter: '%',
        priority: 2,
        affect: 'Resource/Artifact/Red/CleanCredit',
        result({ level }) {
          return [
            0,
            0,
            5,
            10,
            15,
            20,
            25,
            30,
            40,
          ][level];
        },
      },
    ],
  },
};
