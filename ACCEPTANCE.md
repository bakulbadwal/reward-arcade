# Reward Arcade: acceptance criteria

Written before the build (2026-09-26). Numeric checks are asserted against `window.RA` (the pure module, `js/core.js`), and were also run under Node against the same file. The environment's behaviour was first checked against the real OpenEnv server (PyPI `openenv-core` 0.3.0, FastAPI + WebSocket client) in the author's local lab on 2026-09-25; the numbers below are the lab's numbers, reproduced by `core.js`.

## A. The machine is right

| # | Check | Expected | Result |
|---|---|---|---|
| A1 | Frequency (e t a o i n s h r d l …) on the course's ten words, binary reward | wins on exactly **neural** and **tensor**: win rate **20%**, mean return **0.200**, 13.7 moves a game | ✓ |
| A2 | Frequency, rule 2 (+0.1 per correct letter, repeats included) | mean return **0.670** | ✓ (0.67) |
| A3 | Frequency, rule 3 (+0.5 × share of distinct letters newly revealed) | mean return **0.603** | ✓ (0.6033) |
| A4 | The Farmer (find one correct letter, repeat it), binary, 50-move cap | return **exactly 0**, win rate 0, every game truncated at the cap (the null case: a player that never wins must score 0) | ✓ |
| A5 | The Farmer, rule 2 | mean return **4.92** (per word: 4.9, 5, 5, 4.9, 5, 5, 4.8, 4.8, 4.8, 5 = 0.1 × (50 − first-hit index)) | ✓ |
| A6 | The Farmer, rule 3 | mean return **0.087** (8 words × 0.5/6 + 2 words × 0.5/5, over 10) | ✓ |
| A7 | The Farmer, rule 2, with the notebook's guard (repeats return early with 0) | **0.1** (one correct letter paid once) | ✓ |
| A8 | Random over 5,000 seeded games, binary | win rate ≈ **2.1%** (true rate ≈ 2.35% by exact calculation in the lab review), ~12.7 moves a game | ✓ |
| A9 | The Cheater with the word in `state` (course) / on the observation / sealed | **100% / 100% / ≈ Random's level** | ✓ (1.00 / 1.00 / 0.026) |
| A10 | Two Random games on the same word score differently, binary vs rule 3 (300 pairs per word) | **≈ 4.5%** vs **≈ 79%**; Frequency **0%** (deterministic) | ✓ (0.045 / 0.789 / 0) |
| A11 | `step('z')` before any `reset()` | reward **1.0**, done, message "You got it! The word was ''." (the course's free win; verified on the real server) | ✓ |
| A12 | `step('')` after reset | "'' is in the word!", attempts unchanged (Python's substring test) | ✓ |
| A13 | `step('z')`, `step('z')` | attempts **9 → 8** (the README charges a repeated wrong letter again) | ✓ |
| A14 | `step('ab')` on *lambda* | accepted; "'ab' is not in the word."; one attempt spent | ✓ |
| A15 | With `requireReset` / `validate` on | `step` before reset → error; `step('')` → error; no reward paid | ✓ |
| A16 | A/A test (pooled binomial SE, alarm at 3.5 SE): 5/250 vs 3/250 · 40/250 vs 3/250 | **PASS** (diff 0.8 pts, SE 1.1) · **FAIL** (diff 14.8 pts, SE 2.5). False-alarm rate on a correct harness ≈ 0.01% (40,000-trial simulation, in the lab) | ✓ |
| A17 | Step-cost model, LLM preset (200 / 20 / 30 ms, 64 envs, 6 steps) | one step 250 ms, network share **12.0%**, rollout 1.5 s | ✓ |
| A18 | Step-cost model, Microduck preset (0.1 / 0.1 / 30 ms, 4,096 envs, 24 steps) | network share **99.3%**; a hop per step is ~150× slower than in-process | ✓ |

## B. It teaches (every step)

- B1 Every step (0–5 and the review board) is interactive, with visuals updating live.
- B2 Every step has at least one **predict → reveal** sticky note, answered before the result is shown.
- B3 Every step ends with a **"say it out loud"** chalkboard line that unlocks after the predictions and some interaction.
- B4 The arcade analogy is introduced in step 0. Every technical term has a hover/tap tooltip with its plain meaning and its arcade equivalent.
- B5 Every step has a "Covers" line naming the OpenEnv course module (and, where used, the TRL doc or sibling lab).
- B6 An honesty note says what's exact, what's simulated and what's a teaching model.

## C. Review board and field test

- C1 Three cabinets (an answer sheet on the observation → remove it server-side; a per-file-touched reward → pay only for newly passing tests, capped; a retry that skips reset → raise on step before reset). Each has one right cause and one right fix, and each wrong option has a stated reason it fails (a smaller prize for the same cheat, hiding the field in the client, whack-a-mole penalties, longer training, a leaner checker that closes only one path).
- C2 A field test of 8 questions answered by operating the widgets, graded automatically with tolerance. Run 2026-09-26 with the right answers (5 · 100 · 8 · 4.92 · 0.603 · 4.3 · 20 · 99.3): **8 / 8**.
- C3 A high-score card appears once all three cabinets are fixed and the best field-test score is 6/8 or better; it carries the date and the score and prints on its own page.

## D. It works

- D1 Opens straight from the file (no server, no build step, no fetch of local files).
- D2 Zero console errors across all steps (checked 2026-09-26 in Chrome).
- D3 Usable at 375 px wide with no horizontal page scroll.
- D4 Styling follows the recorded design system in `DESIGN.md` (inherited from Inference Kitchen and Finishing School: Busytown cutaway, warm paper, one brown outline, Grandstander / Patrick Hand / Andika).
- D5 Progress persists across reloads (localStorage, wrapped so it degrades safely).
- D6 One illustrated 960×400 cutaway scene per step (0–5) and the review board, every object labelled.
- D7 The hash is written as `#/s3`, never `#s3`, so the browser performs no fragment jump of its own; `history.scrollRestoration` is set to manual.
- D8 An end-to-end scripted run (2026-09-26) exercised every widget: coin + keys in both modes; the course layout → LEAK OPEN (Cheater 100%, Random 4%) and the sealed layout → LEAK CLOSED (4% vs 4%); step before a coin → "+1.0 OVER", then an error once "require a coin" is on; rule 2 → "the optimizer would pick Farmer … DISAGREES"; the sealed tournament → "the Cheater falls to Random's level"; the Microduck preset → "the network owns the clock (99%)"; all three cabinets fixed; field test 8/8; high score posted.
