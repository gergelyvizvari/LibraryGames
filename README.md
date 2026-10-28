# Library Games

Short, fun learning games for kids: memory, reflexes, words, focus, maths, reading, typing and more.
Each game takes about a minute, adapts its difficulty to the player, and tracks records and stars.
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
- `src/i18n`: English and Hungarian (EN/HU button on the home screen), ready for more languages.

See [ADDING_A_GAME.md](ADDING_A_GAME.md) to add a game and [GAME_IDEAS.md](GAME_IDEAS.md) for what's next.
