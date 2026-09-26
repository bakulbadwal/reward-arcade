/* Reward Arcade — the machine.
   Pure functions only; every number on the page comes from here, and the acceptance
   checks (ACCEPTANCE.md) call these directly through window.RA.

   The Hangman environment is the OpenEnv course's Module 4 word game, logic for logic
   (module-4/README.md, commit 57ea985), with the course's own bugs kept in and each
   one made a switch. Rewards are per step; a game's return is the sum. */
(function () {
  "use strict";

  /* ---------- the ten words, as the course lists them ---------- */
  var WORDS = ["python", "neural", "tensor", "matrix", "vector", "kernel", "lambda", "signal", "binary", "cipher"];
  var FREQ_ORDER = "etaoinshrdlcumwfgypbvkjxqz";
  var MAX_ATTEMPTS = 10;

  /* ---------- a small seeded generator (mulberry32), so every simulation is repeatable ---------- */
  function rng(seed) {
    var a = (seed >>> 0) || 1;
    var r = function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    r.int = function (n) { return Math.floor(r() * n); };
    r.pick = function (arr) { return arr[r.int(arr.length)]; };
    return r;
  }

  /* ---------- the cabinet ----------
     opts (all default to the course's behaviour):
       reward       "binary" (course) | "naive" (+0.1 every time the guess is in the word) |
                    "fixed"  (+0.5 × share of the word's distinct letters this guess NEWLY revealed)
       guardRepeat  false (course README: a repeated wrong letter costs again) | true (the notebook's
                    guard: a repeated letter is free and pays 0)
       validate     false (course) | true (reject anything but one letter a–z, like a raised error)
       requireReset false (course) | true (step before reset is an error, not a free win)
       leak         "state" (course: the word sits in state) | "obs" (the word rides on the observation
                    as a hint) | "sealed" (server-side only)
       rng          a generator for reset()'s word draw (defaults to Math.random) */
  function makeEnv(opts) {
    opts = opts || {};
    var reward = opts.reward || "binary", guardRepeat = !!opts.guardRepeat, validate = !!opts.validate;
    var requireReset = !!opts.requireReset, leak = opts.leak || "state", draw = opts.rng || Math.random;
    var target = "", guessed = [], remaining = MAX_ATTEMPTS, stepCount = 0, episodeId = null, episodes = 0;

    function has(l) { return guessed.indexOf(l) !== -1; }
    function mask() { var out = ""; for (var i = 0; i < target.length; i++) out += has(target[i]) ? target[i] : "_"; return out; }
    function distinct(w) { var s = {}; for (var i = 0; i < w.length; i++) s[w[i]] = 1; return Object.keys(s).length; }
    function shaping(letter, isNew) {
      var inWord = target.indexOf(letter) !== -1;   /* Python's `letter in target`: substring; "" is always in */
      if (reward === "naive") return inWord ? 0.1 : 0;
      if (reward === "fixed") return (inWord && isNew && letter.length === 1) ? 0.5 / distinct(target) : 0;
      return 0;
    }
    function obs(done, rew, message) {
      var o = { masked_word: mask(), guessed_letters: guessed.slice().sort(), attempts_remaining: remaining, message: message };
      if (leak === "obs") o.hint = target;
      return { observation: o, reward: rew, done: done };
    }
    var env = {
      reset: function (word) {
        target = word || WORDS[Math.floor(draw() * WORDS.length)];
        guessed = []; remaining = MAX_ATTEMPTS; stepCount = 0; episodes++;
        episodeId = "ep-" + episodes;
        return obs(false, null, "Guess letters in a " + target.length + "-letter word!");
      },
      /* The course's step(), line for line, plus the switches. */
      step: function (guess) {
        if (requireReset && !target) return { error: "call reset() before step()" };
        var letter = String(guess == null ? "" : guess).toLowerCase().replace(/^\s+|\s+$/g, "");
        if (validate && !/^[a-z]$/.test(letter)) return { error: "guess must be one letter a-z, got " + JSON.stringify(guess) };
        stepCount++;
        if (guardRepeat && has(letter)) return obs(false, 0, "Already guessed '" + letter + "'. Try another.");
        var isNew = !has(letter);
        guessed.push(letter);
        var message, inWord = target.indexOf(letter) !== -1;
        if (inWord) message = "'" + letter + "' is in the word!";
        else { remaining -= 1; message = "'" + letter + "' is not in the word."; }
        var masked = mask(), won = masked.indexOf("_") === -1, lost = remaining <= 0, done = won || lost, rew;
        if (won) { rew = 1; message = "You got it! The word was '" + target + "'."; }
        else if (lost) { rew = 0; message = "Out of attempts. The word was '" + target + "'."; }
        else rew = 0;
        rew += shaping(letter, isNew);
        return obs(done, rew, message);
      },
      state: function () {
        var s = { episode_id: episodeId, step_count: stepCount, max_attempts: MAX_ATTEMPTS };
        if (leak === "state") s.target_word = target;
        return s;
      },
      /* What a player holding the client can learn about the word. "" means nothing. */
      peek: function (o) { if (leak === "state") return target; if (leak === "obs" && o && o.hint != null) return o.hint; return ""; },
      target: function () { return target; },   /* for the acceptance checks only; not part of the API */
      opts: { reward: reward, guardRepeat: guardRepeat, validate: validate, requireReset: requireReset, leak: leak }
    };
    return env;
  }

  /* ---------- the players ---------- */
  var LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
  var policies = {
    random: function (r) {
      r = r || rng(1);
      return { name: "Random", stochastic: true, begin: function () {},
        act: function (o) { var left = LETTERS.filter(function (c) { return o.guessed_letters.indexOf(c) === -1; }); return left.length ? r.pick(left) : "a"; } };
    },
    frequency: function () {
      return { name: "Frequency", stochastic: false, begin: function () {},
        act: function (o) { for (var i = 0; i < FREQ_ORDER.length; i++) if (o.guessed_letters.indexOf(FREQ_ORDER[i]) === -1) return FREQ_ORDER[i]; return "a"; } };
    },
    /* Reads the answer off the back panel (or the front glass) when it's there; plays Random otherwise. */
    cheater: function (r) {
      var fb = policies.random(r || rng(3)), p = { name: "Cheater", stochastic: true, usedLeak: false };
      p.begin = function () { fb.begin(); };
      p.act = function (o, env) {
        var secret = env ? env.peek(o) : "";
        for (var i = 0; i < secret.length; i++) if (o.guessed_letters.indexOf(secret[i]) === -1) { p.usedLeak = true; return secret[i]; }
        return fb.act(o, env);
      };
      return p;
    },
    /* Finds one letter that's in the word, then guesses it forever. Never wins. */
    farmer: function () {
      var crop = null;
      return { name: "Farmer", stochastic: false, begin: function () { crop = null; },
        act: function (o) {
          if (crop === null) { var hits = o.guessed_letters.filter(function (c) { return o.masked_word.indexOf(c) !== -1; }); if (hits.length) crop = hits[0]; }
          if (crop) return crop;
          for (var i = 0; i < FREQ_ORDER.length; i++) if (o.guessed_letters.indexOf(FREQ_ORDER[i]) === -1) return FREQ_ORDER[i];
          return "a";
        } };
    }
  };

  /* ---------- one game ----------
     cap: the harness's step limit (the course has none; the lab used 50). A game that hits it is
     "truncated": cut off by the clock, not finished. */
  function playEpisode(env, policy, cap, word) {
    cap = cap || 50;
    policy.begin();
    var r = env.reset(word), ret = 0, steps = 0, guesses = [], errors = 0;
    while (!r.done && steps < cap) {
      var g = policy.act(r.observation, env);
      var nxt = env.step(g);
      steps++;
      if (nxt.error) { errors++; guesses.push(g + " ✗"); continue; }   /* an error pays nothing and the game goes on */
      r = nxt; ret += +(r.reward || 0); guesses.push(g);
    }
    var won = !!r.done && r.observation.masked_word.indexOf("_") === -1;
    return { won: won, ret: ret, steps: steps, truncated: !r.done, guesses: guesses, errors: errors, word: env.target() };
  }

  /* ---------- many games (simulated; seeded) ---------- */
  function evaluate(makePolicy, envOpts, n, seed, cap) {
    var r = rng(seed || 7), env = makeEnv(Object.assign({}, envOpts, { rng: r })), pol = makePolicy(rng((seed || 7) * 31 + 11));
    var wins = 0, ret = 0, steps = 0, trunc = 0, returns = [];
    for (var i = 0; i < n; i++) { var e = playEpisode(env, pol, cap); wins += e.won ? 1 : 0; ret += e.ret; steps += e.steps; trunc += e.truncated ? 1 : 0; returns.push(e.ret); }
    return { n: n, wins: wins, winRate: wins / n, meanRet: ret / n, meanSteps: steps / n, truncRate: trunc / n, returns: returns, policy: pol.name, stochastic: pol.stochastic };
  }

  /* ---------- exact expectation for a deterministic player: one game per word, words drawn uniformly ---------- */
  function exact(makePolicy, envOpts, cap) {
    var env = makeEnv(Object.assign({}, envOpts, { rng: function () { return 0; } })), pol = makePolicy();
    var rows = WORDS.map(function (w) { var e = playEpisode(env, pol, cap, w); return { word: w, won: e.won, ret: e.ret, steps: e.steps, truncated: e.truncated, guesses: e.guesses }; });
    var wins = rows.filter(function (x) { return x.won; }).length;
    return { rows: rows, winRate: wins / WORDS.length, wins: wins, meanRet: rows.reduce(function (s, x) { return s + x.ret; }, 0) / WORDS.length,
      meanSteps: rows.reduce(function (s, x) { return s + x.steps; }, 0) / WORDS.length, truncRate: rows.filter(function (x) { return x.truncated; }).length / WORDS.length, policy: pol.name };
  }

  /* ---------- statistics ---------- */
  var stats = {
    /* standard error of a win rate from wins out of n (binomial) */
    binomSE: function (wins, n) { var p = wins / n; return Math.sqrt(Math.max(p * (1 - p), 0) / n); },
    /* A/A null test: the same player twice must score the same within noise. Pooled binomial SE over
       all games; alarm at k standard errors (3.5 by default: a correct harness false-alarms ~0.01%). */
    aaTest: function (winsA, nA, winsB, nB, k) {
      k = k || 3.5;
      var p = (winsA + winsB) / (nA + nB), se = Math.sqrt(Math.max(p * (1 - p), 1e-12) * (1 / nA + 1 / nB));
      var diff = winsA / nA - winsB / nB;
      return { ok: Math.abs(diff) <= k * Math.max(se, 1 / Math.min(nA, nB)), diff: diff, se: se, k: k };
    },
    mean: function (xs) { return xs.reduce(function (s, x) { return s + x; }, 0) / xs.length; },
    /* standard error of a mean from a list of per-game values */
    seMean: function (xs) { if (xs.length < 2) return 0; var m = stats.mean(xs), v = xs.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (xs.length - 1); return Math.sqrt(v / xs.length); }
  };

  /* ---------- GRPO's question: do two games by the SAME player on the SAME word score differently?
     If they never differ, a group of 2 is always a tie and the advantage is always 0. ---------- */
  function pairDiffRate(makePolicy, envOpts, pairsPerWord, seed, cap) {
    var r = rng(seed || 5), env = makeEnv(Object.assign({}, envOpts, { rng: r })), pol = makePolicy(rng((seed || 5) * 17 + 3));
    var differ = 0, total = 0;
    WORDS.forEach(function (w) {
      for (var i = 0; i < pairsPerWord; i++) {
        var a = playEpisode(env, pol, cap, w).ret, b = playEpisode(env, pol, cap, w).ret;
        total++; if (Math.abs(a - b) > 1e-9) differ++;
      }
    });
    return { rate: differ / total, differ: differ, total: total };
  }

  /* ---------- step 5: where a rollout's wall time goes (a teaching model) ----------
     One rollout step, for N environments advancing together, costs the policy's time plus the
     environment's time plus, for a service, one network round trip. Times are per step in ms. */
  function stepCost(c) {
    var envs = Math.max(1, c.envs || 1), steps = Math.max(1, c.steps || 1);
    var service = { policy: c.policyMs, env: c.envMs, net: c.netMs };
    var inproc = { policy: c.policyMs, env: c.envMs, net: 0 };
    function fin(x) {
      var wall = x.policy + x.env + x.net;
      return { policy: x.policy, env: x.env, net: x.net, wall: wall, netShare: wall > 0 ? x.net / wall : 0,
        rolloutMs: wall * steps, stepsPerSec: wall > 0 ? 1000 / wall * envs : Infinity };
    }
    return { service: fin(service), inproc: fin(inproc), envs: envs, steps: steps };
  }

  window.RA = {
    WORDS: WORDS, FREQ_ORDER: FREQ_ORDER, MAX_ATTEMPTS: MAX_ATTEMPTS, LETTERS: LETTERS,
    rng: rng, makeEnv: makeEnv, policies: policies, playEpisode: playEpisode, evaluate: evaluate, exact: exact,
    stats: stats, pairDiffRate: pairDiffRate, stepCost: stepCost
  };
})();
