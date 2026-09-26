# Product

## Platform

web

## Stack

Static HTML/CSS/JS, no build step, no dependencies. Hosted on GitHub Pages from `main` (https://bakulbadwal.github.io/reward-arcade/). Must also work opened straight from the file.

## Users

Primary: the author, an MBA (UVA Darden '27) who knows the AI stack at a map level, has study packs for the Hugging Face Deep RL course (the learner) and the LLM course ch. 12 (the LLM learner), and wants to *learn the environment side by playing* before the OpenEnv course hands-on. Secondary: people he shares it with, as the seventh Hugging Face learning lab next to Policy Pond and Finishing School.

## Product Purpose

Teach what an RL environment for LLM training actually is, and why it is the same object as an eval: a sealed box with three controls (reset, step, state), a scorer inside, and a strict rule about what the player may see. Through direct manipulation: play a real Hangman environment, sort its fields between the front glass and the back panel, send it inputs a good player never would, switch its reward rule and watch which player an optimizer would pick, run a tournament with error bars, and compare the arcade to a robot's in-process simulator. Success: after ~75 minutes he can look at any environment or eval and say what the player sees, what pays, what an optimizer would farm, and whether the numbers are enough to trust.

## Positioning

The bridge between Policy Pond (the learner: REINFORCE, PPO) and Finishing School (the LLM learner: GRPO). Neither teaches the world the learner practices in. Existing material is the OpenEnv course itself (five READMEs and notebooks; its Module 4 code does not run as written and its example game has two real bugs) and eval explainers without the RL side. This lab is for operators: one governing analogy (an arcade), a real environment running in the browser, and the two failure modes that matter in practice, leaks and farmable rewards, made visible.

## Operating Context

Used at a laptop in study sessions and on a phone when shared. Steps run 0–5, then the review board and the field test; people also jump between them. Progress persists in localStorage.

## Capabilities and Constraints

- Six steps (0–5), a review board and a field test. Every number comes from `js/core.js` (pure functions, `window.RA`); `ACCEPTANCE.md` lists the verified values.
- The Hangman environment is the OpenEnv course's Module 4 game, logic for logic, including its bugs: the secret in `state`, a repeated wrong letter charged twice, a free win on `step` before `reset`, an empty guess counted as "in the word", and no step limit. Each is a switch the player can close.
- Deterministic policies (Frequency, Farmer) are evaluated exactly over the ten-word list; stochastic ones (Random, the Cheater's fallback) are simulated with a seeded generator and labelled as such.
- The honesty note (what's exact vs a teaching model) must remain. The step-cost comparison in step 5 is a teaching model with the numbers on sliders.
- The arcade analogy is the confirmed vocabulary: the environment = the cabinet; reset = the coin slot; step = the joystick; observation = the front glass; state = the back panel behind the service hatch; reward = tickets; the reward logic = the ticket counter; the policy = the player; an eval = the tournament scoreboard; training = the kid who plays all summer; a leak = the answer sheet taped inside the hatch; reward hacking = the ticket jackpot glitch.

## Brand Commitments

- Name: **Reward Arcade**.
- Shares the recorded design system of Inference Kitchen and Finishing School (`DESIGN.md`): Busytown cutaway in flat gouache on paper.
- Must not look like "every AI tool" (dark ground, neon or gold accent, glowing cards) or a corporate SaaS dashboard.

## Evidence on Hand

Hugging Face, *Building RL Environments with OpenEnv* (5 modules, commit 57ea985); the OpenEnv source (`meta-pytorch/OpenEnv`, and PyPI `openenv-core` 0.3.0, against which the game was run); TRL's OpenEnv integration docs (`environment_factory`, reward-function tips); a local lab that ran the game and measured every number cited (Frequency wins on exactly 2 of 10 words; the Farmer's returns under three reward rules; the A/A null test). No testimonials, users or metrics exist; don't invent any.

## Product Principles

1. Play first, prose second. Every concept is something you move.
2. Honest about models: exact where exact, labelled where simulated or illustrative.
3. One analogy, used consistently, fading into the real terms.
4. The bugs are the lesson. Every course bug is shown running, then closed by the player.
