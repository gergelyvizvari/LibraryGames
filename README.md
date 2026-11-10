# Library Games

Short, fun learning games for kids: memory, reflexes, words, focus, maths, reading, typing and more.
The home screen is a storybook map; each game is a small scene played in short stages without a clock,
adapts its difficulty to the player, and gives stickers for an album.
A new small game is added every day.

## Run it

```
npm install
npm run dev       # http://localhost:5173
npm test
npm run build     # output in dist/, deployable as a static site (e.g. Vercel)
```

## How it's built

- Vite + React + TypeScript, plain CSS, no backend. Progress is saved in the browser (localStorage).
- Sounds are synthesised with Web Audio, so there are no audio files.
- Installable on a phone (web app manifest).
- `src/kit`: shared building blocks (game frame, timers, sounds, progress, UI pieces).
- `src/games/<id>`: one folder per game, listed in `src/games/registry.ts`.
- `src/i18n`: English and Hungarian (EN/HU button on the map and on the "All games" screen), ready for more languages.

See [ADDING_A_GAME.md](ADDING_A_GAME.md) to add a game and [GAME_IDEAS.md](GAME_IDEAS.md) for what's next.

## Credits

- Flag emojis on Windows come from the "Twemoji Country Flags" font of
  [country-flag-emoji-polyfill](https://github.com/talkjs/country-flag-emoji-polyfill) (code MIT). The flag art is
  [Twemoji](https://github.com/twitter/twemoji), © Twitter, Inc. and other contributors, licensed
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Animal sound credits: `src/games/animal-sounds/sounds/CREDITS.md`.
