import { ink } from '../../kit/icon'
import type { Sticker } from '../../kit/types'

// Won one at a time by finishing stages. Drawn like game icons, on the 48 × 48 grid.
export const stickers: Sticker[] = [
  {
    name: 'sticker.cookie',
    icon: [
      ['base', '#ecbd6f', <circle cx="24" cy="24" r="18" />],
      ['detail', '#6b4031', <path d="M15 17a2.6 2.6 0 1 0 .1 0Z M30 14a2.6 2.6 0 1 0 .1 0Z M33 27a2.6 2.6 0 1 0 .1 0Z M22 31a2.6 2.6 0 1 0 .1 0Z M23 21a2.2 2.2 0 1 0 .1 0Z" />],
      ['shine', '#fff', <path d="M10 21 A14 14 0 0 1 21 10 A16 16 0 0 0 10 21Z" />],
    ],
  },
  {
    name: 'sticker.muffin',
    icon: [
      ['accent', '#e2607e', <path d="M13 26 H35 L32 43 H16 Z" />],
      ['base', '#fff6dc', <path d="M10 27 C8 15 40 15 38 27 Z" />],
      ['detail', '#d9506a', <circle cx="24" cy="12" r="4.5" />],
      ['detail', '#8364e4', <path d="M17 21a1.6 1.6 0 1 0 .1 0Z M30 22a1.6 1.6 0 1 0 .1 0Z M24 23a1.6 1.6 0 1 0 .1 0Z" />],
    ],
  },
  {
    name: 'sticker.milk',
    icon: [
      ['accent', '#ff6b6b', <path d="M28 3 L32 4 L27 24 L23 23 Z" />],
      ['base', '#dff1fb', <path d="M14 10 H34 L31 43 H17 Z" />],
      ['detail', '#fff', <path d="M15.2 22 H32.8 L31 41 H17 Z" />],
      ['shine', '#fff', <path d="M18 13 h3 l1 6 h-3 Z" />],
    ],
  },
  {
    name: 'sticker.full',
    icon: [
      ['accent', '#f08aa6', <path d="M13 13 L9 3 L19 9 Z M35 13 L39 3 L29 9 Z" />],
      ['base', '#8364e4', <path d="M7 42 V22 C7 12 14 6 24 6 C34 6 41 12 41 22 V42 Z" />],
      ['detail', '#e6dcfd', <ellipse cx="24" cy="31" rx="10" ry="9" />],
      ['detail', '#f08aa6', <path d="M24 37 C17 32 20 26 24 29.5 C28 26 31 32 24 37 Z" />],
      ['base', ink, <path d="M14 17 q3.5 3.5 7 0 l-.5 1.5 q-3 2.5 -6 0 Z M27 17 q3.5 3.5 7 0 l-.5 1.5 q-3 2.5 -6 0 Z" />],
    ],
  },
]
