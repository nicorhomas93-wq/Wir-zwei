export const ANKER_SECTIONS = [
  {
    id: 'kern',
    label: 'Anker',
    lines: [
      'Ich bin da.',
      'Du bist sicher.',
      'Wir stehen.',
      'Wenn der Kopf laut wird,',
      'erinnere dich genau daran.',
    ],
  },
  {
    id: 'halt',
    label: 'Anker',
    lines: [
      'Ich bin da.',
      'Du bist sicher.',
      'Wir stehen.',
      'Egal wann. Egal wie.',
      'Nichts kippt uns.',
      'Wenn Gedanken anfangen zu kreisen → hier beginnen.',
    ],
  },
  {
    id: 'notfall',
    label: 'Notfall – Anker',
    intro: 'Wenn Unruhe entsteht oder Gedanken zu laut werden, folge diesem Ablauf:',
    steps: [
      { title: 'Stopp.', lines: ['Nichts davon ist jetzt real.'] },
      {
        title: 'Ich bin da.',
        lines: ['Du bist nicht allein.', 'Wir stehen.', 'Das bleibt.'],
      },
      {
        title: 'Atmen.',
        lines: ['Langsam. Ruhig.', 'Hier ist Sicherheit.'],
      },
      {
        title: 'Gedanken dürfen laut sein.',
        lines: ['Die Realität bleibt stärker.'],
      },
    ],
  },
] as const
