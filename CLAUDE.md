# Library Games

Kids' learning games collection. Read ADDING_A_GAME.md before creating or changing a game; it holds the contract,
the fun checklist and the kit reference. Game ideas backlog: GAME_IDEAS.md.

- Run `npm test` and `npm run build` before every commit; both must pass.
- All visible text goes through `strings.ts` / `src/i18n` (English and Hungarian; every game ships both, see ADDING_A_GAME.md).
- Keep each game self-contained in `src/games/<id>/`; shared code belongs in `src/kit/`.
