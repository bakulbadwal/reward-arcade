/* Reward Arcade — UI. Every number shown is computed by window.RA (core.js);
   this file only wires controls to it and draws. */
(function () {
  "use strict";
  var RA = window.RA, GL = window.RA_GLOSSARY || {};
  var $ = function (id) { return document.getElementById(id); };
  var qa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function fmt(n, d) { return Number(n).toLocaleString("en-US", { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d == null ? 0 : d }); }
  function pct(x, d) { return fmt(100 * x, d == null ? 0 : d) + "%"; }
  function pts(x, d) { return fmt(100 * x, d == null ? 1 : d) + " pts"; }

  /* ---------------- persistence (never required) ---------------- */
  var KEY = "reward-arcade-v1";
  var store = { predicts: {}, touched: {}, said: {}, s1: {}, cap: {}, ft: {}, meta: {} };
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function longDate(d) { return ("0" + d.getDate()).slice(-2) + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
  try { var raw = localStorage.getItem(KEY); if (raw) { var got = JSON.parse(raw); if (got && typeof got === "object") Object.keys(store).forEach(function (k) { if (got[k] && typeof got[k] === "object") store[k] = got[k]; }); } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }

  /* ---------------- drawn icons (nav + key map): 24×24, flat fills, line stroke ---------------- */
  function svg(inner) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + inner + "</svg>"; }
  var S = 'stroke="#4A2E1E" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
  var ICONS = {
    cabinet: svg('<path d="M5 22V8q0-2 2-2h10q2 0 2 2v14z" fill="#9CCBEA" ' + S + '/><rect x="4" y="2" width="16" height="5" rx="1.5" fill="#C8452F" ' + S + '/><rect x="8" y="9" width="8" height="5" rx="1" fill="#2F4A3A" ' + S + '/><circle cx="10" cy="18" r="1.6" fill="#F4C430" ' + S + '/><circle cx="14.5" cy="18" r="1.6" fill="#5FA03C" ' + S + '/>'),
    coin: svg('<rect x="3" y="9" width="18" height="10" rx="2" fill="#B9BDC2" ' + S + '/><circle cx="12" cy="7" r="4.5" fill="#F4C430" ' + S + '/><path d="M9 14h6" ' + S + '/>'),
    joystick: svg('<path d="M4 21h16l-2-6H6z" fill="#DDBB8A" ' + S + '/><path d="M12 15V6" ' + S + ' stroke-width="2.6"/><circle cx="12" cy="5" r="3.2" fill="#C8452F" ' + S + '/>'),
    glass: svg('<rect x="3" y="4" width="18" height="14" rx="2" fill="#2F4A3A" ' + S + '/><path d="M6 12h3M11 12h3M16 12h3" stroke="#FFFDF6" stroke-width="2" stroke-linecap="round"/><path d="M9 21h6" ' + S + '/>'),
    hatch: svg('<rect x="4" y="3" width="16" height="18" rx="2" fill="#B9BDC2" ' + S + '/><path d="M12 3v18" ' + S + '/><rect x="13" y="6" width="8" height="12" fill="#FFF1A8" ' + S + '/><circle cx="8" cy="12" r="1.2" fill="#4A2E1E"/>'),
    tickets: svg('<path d="M3 8h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" fill="#F4C430" ' + S + '/><path d="M12 8v10" stroke="#4A2E1E" stroke-width="1.5" stroke-dasharray="2 2"/>'),
    light: svg('<circle cx="12" cy="10" r="6" fill="#C8452F" ' + S + '/><path d="M9 18h6v3H9z" fill="#B9BDC2" ' + S + '/><path d="M12 2v2M5 5l1.5 1.5M19 5l-1.5 1.5" ' + S + '/>'),
    kid: svg('<circle cx="12" cy="7" r="4" fill="#F1C9A5" ' + S + '/><path d="M8 5q4-5 8 0" fill="#4A2E1E" ' + S + '/><rect x="7" y="11" width="10" height="8" rx="3" fill="#5FA03C" ' + S + '/><path d="M9 19v3M15 19v3" ' + S + '/>'),
    board: svg('<rect x="3" y="4" width="18" height="14" rx="1.5" fill="#B8793F" ' + S + '/><rect x="5" y="6" width="14" height="10" fill="#2F4A3A" stroke="none"/><path d="M7 9h6M7 12h9" stroke="#E9F1E4" stroke-width="1.5" stroke-linecap="round"/><path d="M10 18v3M14 18v3" ' + S + '/>'),
    pond: svg('<ellipse cx="12" cy="16" rx="10" ry="5" fill="#9CCBEA" ' + S + '/><ellipse cx="11" cy="13" rx="4" ry="2.6" fill="#F4C430" ' + S + '/><circle cx="14.5" cy="10" r="2.2" fill="#F4C430" ' + S + '/><path d="M16.5 10l2.5 .8-2.5 1z" fill="#C8452F" ' + S + ' stroke-width="1"/>'),
    star: svg('<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" fill="#F4C430" ' + S + '/>'),
    pencil: svg('<path d="M4 20l1-4L16 5l3 3L8 19z" fill="#F4C430" ' + S + '/><path d="M14 7l3 3" ' + S + '/><path d="M5 16l3 3" ' + S + '/>')
  };
  var NAV_ICON = { s0: "cabinet", s1: "hatch", s2: "joystick", s3: "tickets", s4: "board", s5: "pond", cap: "star", ft: "pencil" };

  /* ---------------- nav ---------------- */
  var sections = qa("section");
  function buildNav() {
    var nav = $("nav"); nav.innerHTML = "";
    sections.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.innerHTML = '<span class="ic" aria-hidden="true">' + (ICONS[NAV_ICON[s.id]] || "") + '</span><span class="n">' + s.dataset.n + "</span>" + s.dataset.title + (store.said[s.id] ? '<span class="chk">✓</span>' : "");
      b.onclick = function () { show(s.id); };
      b.dataset.for = s.id;
      nav.appendChild(b);
    });
  }
  function markNav() { var cur = sections.filter(function (s) { return s.classList.contains("on"); })[0]; if (cur) qa("#nav button").forEach(function (b) { b.classList.toggle("on", b.dataset.for === cur.id); }); }
  function show(id) {
    sections.forEach(function (s) { s.classList.toggle("on", s.id === id); });
    markNav();
    var active = document.querySelector("#nav button.on"), nav = $("nav");
    if (active && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
    /* #/s3 rather than #s3: no element has the id "/s3", so the browser never performs its own fragment jump. */
    try { history.replaceState(null, "", "#/" + id); } catch (e) {}
    window.scrollTo(0, 0);
  }

  /* ---------------- engagement: predict + say ---------------- */
  function touch(sec) { store.touched[sec] = (store.touched[sec] || 0) + 1; save(); checkSay(sec); }
  function checkSay(sec) {
    var s = $(sec); if (!s) return;
    var sayEl = s.querySelector(".say"); if (!sayEl) return;
    var preds = qa(".predict", s);
    var allAnswered = preds.every(function (p) { return store.predicts[p.dataset.p] != null; });
    var open = allAnswered && (store.touched[sec] || 0) >= 3;
    var tag = sayEl.querySelector(".tag");
    if (open) {
      if (!sayEl.classList.contains("open")) sayEl.classList.add("open");
      tag.textContent = "Say it out loud";
      if (!store.said[sec]) { store.said[sec] = true; save(); buildNav(); markNav(); }
    } else {
      tag.textContent = "Say it out loud · unlocks after you answer the prediction" + (preds.length > 1 ? "s" : "") + " and play with the controls";
    }
  }
  function initPredicts() {
    qa(".predict").forEach(function (p) {
      var key = p.dataset.p, sec = p.closest("section").id;
      var btns = qa(".opts button", p);
      function reveal(idx) {
        btns.forEach(function (b, i) { b.disabled = true; if (b.hasAttribute("data-right")) b.classList.add("right"); else if (i === idx) b.classList.add("wrong"); });
        p.classList.add("done");
      }
      btns.forEach(function (b, i) { b.type = "button"; b.onclick = function () { store.predicts[key] = i; save(); reveal(i); checkSay(sec); }; });
      if (store.predicts[key] != null) reveal(store.predicts[key]);
    });
  }

  /* ---------------- glossary tooltip ---------------- */
  var tip = $("tip");
  function placeTip(el) {
    var g = GL[el.dataset.g]; if (!g) return;
    tip.innerHTML = "<b>" + esc(g[0]) + "</b><br>" + esc(g[1]) + '<span class="kt">In the arcade: ' + esc(g[2]) + "</span>";
    tip.style.display = "block";
    var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8) + "px";
    var y = r.bottom + 8; if (y + h > window.innerHeight - 8) y = r.top - h - 8;
    tip.style.top = Math.max(8, y) + "px";
  }
  function bindTips(root) {
    qa(".g", root).forEach(function (el) {
      if (el.dataset.bound) return; el.dataset.bound = "1";
      el.tabIndex = 0; el.setAttribute("role", "button");
      el.addEventListener("mouseenter", function () { placeTip(el); });
      el.addEventListener("mouseleave", function () { tip.style.display = "none"; });
      el.addEventListener("focus", function () { placeTip(el); });
      el.addEventListener("blur", function () { tip.style.display = "none"; });
      el.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); if (tip.style.display === "block") tip.style.display = "none"; else placeTip(el); });
    });
  }
  document.addEventListener("click", function () { tip.style.display = "none"; });
  window.addEventListener("scroll", function () { tip.style.display = "none"; }, { passive: true });

  /* ---------------- controls ---------------- */
  function seg(el, opts, val, onChange) {
    el.innerHTML = "";
    var state = { value: val };
    opts.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = o.label; b.dataset.v = o.v;
      if (String(o.v) === String(val)) b.classList.add("on");
      b.onclick = function () { if (b.disabled) return; state.value = o.v; qa("button", el).forEach(function (x) { x.classList.toggle("on", x === b); }); onChange(o.v); };
      el.appendChild(b);
    });
    state.set = function (v) { state.value = v; qa("button", el).forEach(function (x) { x.classList.toggle("on", String(x.dataset.v) === String(v)); }); };
    return state;
  }
  /* one row of the ticket tape */
  function tapeRow(n, call, back, tickets, done, cls) {
    var t = tickets == null ? "–" : fmt(tickets, 1);
    return '<div class="tr' + (cls ? " " + cls : "") + '"><span class="n">' + n + '</span><b>' + esc(call) + '</b><span>' + esc(back) + '</span><span class="tk' + (tickets ? "" : " zero") + '">' + (tickets == null ? "" : "+" + t) + '</span><span class="dn">' + (done === true ? "OVER" : done === false ? "" : done || "") + "</span></div>";
  }
  var TAPE_HEAD = '<div class="th"><span>#</span><span>call</span><span>came back</span><span>tickets</span><span>done</span></div>';

  /* =============== STEP 0 · the cabinet =============== */
  var s0 = { env: RA.makeEnv({ rng: RA.rng(Date.now() & 0xffff) }), mode: "ws", rows: [], calls: 0, games: 0, ret: 0, cur: null, keyState: {} };
  function s0cabinet() {
    var c = $("s0cab");
    c.innerHTML = '<div class="marq">HANGMAN<small>the course\'s Module 4 word game, running here</small></div>' +
      '<div class="screen"><div class="word idle" id="s0word">insert coin</div><div class="msg" id="s0msg"></div><div class="lives" id="s0lives"></div></div>' +
      '<div class="keys" id="s0keys">' + RA.LETTERS.map(function (l) { return '<button type="button" data-l="' + l + '">' + l + "</button>"; }).join("") + "</div>" +
      '<div class="slot"><button class="coin" id="s0coin" type="button">Insert coin · reset()</button><span class="hand muted" id="s0seat">seat: your own WebSocket session</span></div>';
    qa("#s0keys button").forEach(function (b) { b.onclick = function () { s0press(b.dataset.l); }; });
    $("s0coin").onclick = function () { s0coin(); };
  }
  function s0screen(o) {
    var w = $("s0word");
    if (!o) { w.textContent = "insert coin"; w.classList.add("idle"); $("s0msg").textContent = ""; $("s0lives").innerHTML = ""; }
    else {
      w.textContent = o.masked_word.split("").join(" "); w.classList.remove("idle");
      $("s0msg").textContent = o.message;
      var l = ""; for (var i = 0; i < RA.MAX_ATTEMPTS; i++) l += '<i class="' + (i < o.attempts_remaining ? "" : "off") + '"></i>'; $("s0lives").innerHTML = l;
    }
    qa("#s0keys button").forEach(function (b) {
      var st = s0.keyState[b.dataset.l];
      b.classList.toggle("hit", st === "hit"); b.classList.toggle("miss", st === "miss");
      b.disabled = s0.mode === "ws" && (!s0.cur || s0.cur.done);
    });
  }
  function s0stats() {
    $("s0steps").textContent = s0.env.state().step_count;
    $("s0ret").textContent = fmt(s0.ret, 1);
    $("s0done").textContent = s0.cur && s0.cur.done ? "yes" : "no";
    $("s0games").textContent = s0.games;
    $("s0tape").innerHTML = s0.rows.length ? TAPE_HEAD + s0.rows.slice(-12).join("") : '<div class="empty">Nothing yet. Drop a coin.</div>';
    $("s0tape").scrollTop = 1e6;
  }
  function s0coin() {
    s0.cur = s0.env.reset(); s0.games++; s0.calls++; s0.ret = 0; s0.keyState = {};
    s0.rows.push(tapeRow(s0.calls, "reset()", s0.cur.observation.masked_word + "  " + s0.cur.observation.message, null, false, "new"));
    s0screen(s0.cur.observation); s0stats(); touch("s0");
  }
  function s0press(l) {
    if (s0.mode === "http") {
      /* one-off requests: a fresh cabinet answers every call. This page drops a coin for you on each
         one; the real server's /step doesn't even do that (step 2 shows what it does instead). */
      s0.env = RA.makeEnv({ rng: RA.rng((Date.now() + s0.calls) & 0xffff) });
      s0.cur = s0.env.reset(); s0.games++; s0.ret = 0; s0.keyState = {};
    } else if (!s0.cur || s0.cur.done) return;
    s0.calls++;
    var r = s0.env.step(l);
    s0.cur = r; s0.ret += +(r.reward || 0);
    s0.keyState[l] = r.observation.masked_word.indexOf(l) !== -1 ? "hit" : "miss";
    s0.rows.push(tapeRow(s0.calls, (s0.mode === "http" ? "POST /step " : "step(") + "'" + l + "'" + (s0.mode === "http" ? "" : ")"), r.observation.masked_word + "  " + r.observation.message, r.reward, r.done, s0.mode === "http" ? "new" : ""));
    s0screen(r.observation); s0stats(); touch("s0");
  }
  function initS0() {
    s0cabinet();
    seg($("s0mode"), [{ v: "ws", label: "A session (WebSocket): one seat, one game" }, { v: "http", label: "One-off requests (plain HTTP)" }], s0.mode, function (v) {
      s0.mode = v; s0.cur = null; s0.keyState = {}; s0.ret = 0;
      $("s0seat").textContent = v === "ws" ? "seat: your own WebSocket session" : "no seat: every press is a fresh cabinet";
      $("s0coin").disabled = v === "http";
      s0screen(null); s0stats(); s0note(); touch("s0");
    });
    s0note(); s0screen(null); s0stats();
  }
  function s0note() {
    $("s0modenote").innerHTML = s0.mode === "ws"
      ? "<b>The typed client's default.</b> <code>EchoEnv(base_url=…).sync()</code> opens one <code>/ws</code> connection; the server builds one environment instance for it and keeps it until you disconnect. Your game carries from call to call."
      : "<b>The server's plain <code>POST /reset</code> and <code>POST /step</code>.</b> Each call builds a fresh environment, answers, and throws it away, so nothing carries over. (This page also drops a coin for you on each call so you can see a word; the real server's <code>/step</code> doesn't even do that. Step 2 shows what it does instead.)";
  }

  /* =============== STEP 1 · front glass, back panel =============== */
  var FIELDS = [
    { id: "masked_word", ex: '"_e__o_"', secret: false }, { id: "guessed_letters", ex: '["e","o","z"]', secret: false },
    { id: "attempts_remaining", ex: "9", secret: false }, { id: "message", ex: "\"'z' is not in the word.\"", secret: false },
    { id: "episode_id", ex: '"ep-1"', secret: false }, { id: "step_count", ex: "3", secret: false },
    { id: "max_attempts", ex: "10", secret: false }, { id: "target_word", ex: '"tensor"', secret: true }
  ];
  var COURSE_LAYOUT = { masked_word: "obs", guessed_letters: "obs", attempts_remaining: "obs", message: "obs", episode_id: "state", step_count: "state", max_attempts: "state", target_word: "state" };
  var s1 = { sel: null };
  function s1leak() { var b = store.s1.target_word; return b === "obs" ? "obs" : b === "state" ? "state" : "sealed"; }
  function s1render() {
    var tray = $("s1tray"); tray.innerHTML = "";
    var unplaced = FIELDS.filter(function (f) { return !store.s1[f.id]; });
    if (!unplaced.length) tray.innerHTML = '<span class="hint">All eight sorted. Unsorted fields would count as sealed.</span>';
    unplaced.forEach(function (f) { tray.appendChild(s1chip(f)); });
    qa("#s1bins .bin").forEach(function (bin) {
      var box = bin.querySelector(".chips"); box.innerHTML = "";
      FIELDS.filter(function (f) { return store.s1[f.id] === bin.dataset.bin; }).forEach(function (f) { box.appendChild(s1chip(f)); });
      bin.classList.toggle("armed", !!s1.sel);
    });
    var st = FIELDS.filter(function (f) { return store.s1[f.id] === "state"; }), ob = FIELDS.filter(function (f) { return store.s1[f.id] === "obs"; });
    function js(list, secretIn) {
      if (!list.length) return "{ }";
      return "{\n" + list.map(function (f) { var line = '  "' + f.id + '": ' + f.ex; return f.secret ? '<span class="leak">' + esc(line) + "</span>" : esc(line); }).join(",\n") + "\n}";
    }
    $("s1json").innerHTML = js(st);
    $("s1obs").innerHTML = js(ob);
    $("s1cheat").textContent = "–"; $("s1rand").textContent = "–";
    var leak = s1leak(), placed = FIELDS.every(function (f) { return store.s1[f.id]; });
    $("s1verdict").className = "verdict"; $("s1verdict").textContent = placed ? (leak === "sealed" ? "Layout looks sealed. Let the Cheater try it." : "The word is reachable. Let the Cheater try it.") : "Sort all eight fields, then let the Cheater play.";
  }
  function s1chip(f) {
    var b = document.createElement("button"); b.type = "button"; b.className = "chipf" + (f.secret ? " secret" : "") + (s1.sel === f.id ? " sel" : ""); b.draggable = true;
    b.innerHTML = "<code>" + f.id + "</code>";
    b.onclick = function (e) { e.stopPropagation(); s1.sel = s1.sel === f.id ? null : f.id; s1render(); };
    b.addEventListener("dragstart", function (e) { s1.sel = f.id; try { e.dataTransfer.setData("text/plain", f.id); e.dataTransfer.effectAllowed = "move"; } catch (x) {} });
    return b;
  }
  function s1place(bin) { if (!s1.sel) return; store.s1[s1.sel] = bin; s1.sel = null; save(); s1render(); touch("s1"); }
  function initS1() {
    qa("#s1bins .bin").forEach(function (bin) {
      bin.onclick = function () { s1place(bin.dataset.bin); };
      bin.addEventListener("dragover", function (e) { e.preventDefault(); });
      bin.addEventListener("drop", function (e) { e.preventDefault(); var id = null; try { id = e.dataTransfer.getData("text/plain"); } catch (x) {} if (id) s1.sel = id; s1place(bin.dataset.bin); });
    });
    $("s1tray").onclick = function () { if (s1.sel && store.s1[s1.sel]) { delete store.s1[s1.sel]; s1.sel = null; save(); s1render(); } };
    $("s1course").onclick = function () { store.s1 = Object.assign({}, COURSE_LAYOUT); s1.sel = null; save(); s1render(); touch("s1"); };
    $("s1clear").onclick = function () { store.s1 = {}; s1.sel = null; save(); s1render(); };
    $("s1run").onclick = function () {
      var leak = s1leak();
      var c = RA.evaluate(RA.policies.cheater, { leak: leak }, 200, 2), r = RA.evaluate(RA.policies.random, { leak: leak }, 200, 2);
      $("s1cheat").textContent = pct(c.winRate); $("s1cheat").className = "v " + (c.winRate > 0.99 ? "bad" : "good");
      $("s1rand").textContent = pct(r.winRate);
      var v = $("s1verdict"), same = RA.stats.aaTest(c.wins, 200, r.wins, 200).ok;
      if (c.winRate > 0.99) { v.className = "verdict open"; v.textContent = "LEAK OPEN · the Cheater won every game in " + fmt(c.meanSteps, 1) + " guesses. It never played Hangman; it read target_word off the " + (leak === "obs" ? "front glass" : "back panel") + "."; }
      else if (same) { v.className = "verdict closed"; v.textContent = "LEAK CLOSED · the Cheater is no better than Random. Your layout keeps the word on the server."; }
      else { v.className = "verdict open"; v.textContent = "PARTIAL · the Cheater still beats Random by more than noise. Something still leaks."; }
      touch("s1");
    };
    document.addEventListener("click", function (e) { if (s1.sel && !e.target.closest("#s1bins") && !e.target.closest("#s1tray")) { s1.sel = null; s1render(); } });
    s1render();
  }

  /* =============== STEP 2 · shake the joystick =============== */
  var ODD = [
    { id: "pre", label: "Step before a coin", sub: "step('z') on a fresh cabinet", run: function (env) { return [["step('z')", env.step("z")]]; } },
    { id: "empty", label: "An empty guess", sub: "reset, then step('')", run: function (env) { env.reset("python"); return [["reset() → python", null], ["step('')", env.step("")]]; } },
    { id: "two", label: "Two letters at once", sub: "reset, then step('ab')", run: function (env) { env.reset("lambda"); return [["reset() → lambda", null], ["step('ab')", env.step("ab")]]; } },
    { id: "wrong2", label: "Same wrong letter twice", sub: "step('z'), step('z')", run: function (env) { env.reset("python"); return [["reset() → python", null], ["step('z')", env.step("z")], ["step('z')", env.step("z")]]; } },
    { id: "right10", label: "Same right letter, ten times", sub: "step('t') × 10", run: function (env) { env.reset("python"); var out = [["reset() → python", null]]; for (var i = 0; i < 10; i++) out.push(["step('t')", env.step("t")]); return out; } }
  ];
  var s2 = { last: null };
  function s2opts() { return { requireReset: $("s2coin").checked, validate: $("s2valid").checked, guardRepeat: $("s2guard").checked }; }
  function s2run(o) {
    var env = RA.makeEnv(s2opts()), out = o.run(env), rows = [], n = 0, cap = $("s2cap").checked;
    out.forEach(function (pair, i) {
      n++;
      var r = pair[1];
      if (!r) rows.push(tapeRow(n, pair[0], "a fresh game", null, false, "new"));
      else if (r.error) rows.push(tapeRow(n, pair[0], "ERROR: " + r.error, null, "no", "err"));
      else rows.push(tapeRow(n, pair[0], "'" + r.observation.masked_word + "' · " + r.observation.attempts_remaining + " left · " + r.observation.message, r.reward, r.done));
    });
    if (o.id === "right10" && !cap) rows.push(tapeRow("…", "step('t') forever", "no clock: this never ends on its own", 0, false));
    if (o.id === "right10" && cap) rows.push(tapeRow("50", "the harness stops it", "truncated at the cap, not finished", null, "CUT"));
    $("s2tape").innerHTML = TAPE_HEAD + rows.join("");
    $("s2tape").scrollTop = 0;
    qa("#s2odd button").forEach(function (b) { b.classList.toggle("hot", b.dataset.id === o.id); });
    s2.last = o; s2holes(); touch("s2");
  }
  function s2holes() {
    var o = s2opts(), cap = $("s2cap").checked;
    var holes = [
      ["Free win", "step before a coin pays 1.0", o.requireReset],
      ["Free letter", "'' counts as in the word, costs nothing", o.validate],
      ["Wide guess", "'ab' is accepted as a guess", o.validate],
      ["No clock", "a repeated right letter can run forever", cap]
    ];
    $("s2holes").innerHTML = holes.map(function (h) { return '<div class="hole ' + (h[2] ? "shut" : "open") + '"><b>' + h[0] + (h[2] ? " · closed" : " · open") + "</b>" + h[1] + "</div>"; }).join("");
  }
  function initS2() {
    $("s2odd").innerHTML = ODD.map(function (o) { return '<button type="button" data-id="' + o.id + '"><b>' + o.label + "</b>" + o.sub + "</button>"; }).join("");
    qa("#s2odd button").forEach(function (b) { b.onclick = function () { s2run(ODD.filter(function (o) { return o.id === b.dataset.id; })[0]); }; });
    ["s2coin", "s2valid", "s2guard", "s2cap"].forEach(function (id) { $(id).onchange = function () { if (s2.last) s2run(s2.last); else { s2holes(); touch("s2"); } }; });
    $("s2tape").innerHTML = '<div class="empty">Send an odd input and read what the cabinet says.</div>';
    s2holes();
  }

  /* =============== STEP 3 · the prize rules =============== */
  var RULES = [
    { v: "binary", label: "Rule 1 · 1 ticket per win", note: "The course's reward: <b>1.0 on the winning move, 0 otherwise.</b> Hard to game; a player that never wins gets no signal at all." },
    { v: "naive", label: "Rule 2 · +0.1 per correct letter", note: "The course's reward <b>plus 0.1 every time the guessed letter is in the word</b>, repeats included. \"Give partial credit.\"" },
    { v: "fixed", label: "Rule 3 · +0.5 per new letter, capped", note: "The course's reward <b>plus 0.5 × the share of the word's distinct letters this guess newly revealed.</b> Partial credit for progress only; it can add up to 0.5 a game and no more." }
  ];
  var s3 = { rule: "binary" };
  var PAIRS_PER_WORD = 100, PAIR_SEED = 5;
  function s3opts() { return { reward: s3.rule, guardRepeat: $("s3guard").checked }; }
  function s3render() {
    var cap = +$("s3cap").value, o = s3opts();
    $("s3capv").textContent = cap;
    $("s3rulenote").innerHTML = RULES.filter(function (r) { return r.v === s3.rule; })[0].note;
    var rows = [
      Object.assign({ how: "simulated, 300 games" }, RA.evaluate(RA.policies.random, o, 300, 11, cap)),
      Object.assign({ how: "exact" }, RA.exact(RA.policies.frequency, o, cap)),
      Object.assign({ how: "exact" }, RA.exact(RA.policies.farmer, o, cap))
    ];
    var maxRet = Math.max.apply(null, rows.map(function (r) { return r.meanRet; }).concat([0.05]));
    var pick = rows.reduce(function (a, b) { return b.meanRet > a.meanRet ? b : a; });
    var best = rows.reduce(function (a, b) { return b.winRate > a.winRate ? b : a; });
    $("s3chart").innerHTML = rows.map(function (r) {
      return '<div class="pcol' + (r === pick ? " best" : "") + '"><div class="pv">' + fmt(r.meanRet, 2) + '</div>' + (r === pick ? '<div class="pick">← the optimizer picks</div>' : "") + '<div class="bar" style="height:' + Math.max(2, 100 * r.meanRet / maxRet * 0.78) + '%"></div><div class="pn">' + r.policy + "</div></div>";
    }).join("");
    var v = $("s3verdict"), agree = pick.policy === best.policy;
    v.className = "verdict " + (agree ? "closed" : "open");
    v.textContent = "The optimizer would pick " + pick.policy + ". The best player is " + best.policy + ". The reward " + (agree ? "agrees with the goal." : "DISAGREES with the goal.");
    $("s3tab").innerHTML = "<tr><th>player</th><th>avg tickets</th><th>win rate</th><th>hit the " + cap + "-move cap</th><th>how</th></tr>" + rows.map(function (r) {
      return "<tr><td><b>" + r.policy + "</b></td><td><b>" + fmt(r.meanRet, 3) + "</b></td><td>" + pct(r.winRate, 1) + "</td><td>" + pct(r.truncRate) + '</td><td class="ex">' + r.how + "</td></tr>";
    }).join("");
    var pr = RA.pairDiffRate(RA.policies.random, o, PAIRS_PER_WORD, PAIR_SEED, cap), pf = RA.pairDiffRate(RA.policies.frequency, o, 5, PAIR_SEED, cap);
    function box(name, p, sub) {
      var cls = p.rate === 0 ? " none" : p.rate > 0.5 ? " lots" : "", n = 40, k = Math.round(p.rate * n), dots = "";
      for (var i = 0; i < n; i++) dots += '<i class="' + (i < k ? "d" : "") + '"></i>';
      return '<div class="pairbox"><b>' + name + ', two games on one word</b><div class="big' + cls + '">' + pct(p.rate, 1) + '</div><span>of ' + fmt(p.total) + " pairs scored differently · " + sub + '</span><div class="pairrow">' + dots + "</div></div>";
    }
    $("s3pairs").innerHTML = box("Random", pr, "simulated") + box("Frequency", pf, "deterministic: identical every time");
  }
  function initS3() {
    seg($("s3rule"), RULES, s3.rule, function (v) { s3.rule = v; s3render(); touch("s3"); });
    $("s3guard").onchange = function () { s3render(); touch("s3"); };
    $("s3cap").oninput = function () { s3render(); };
    $("s3cap").onchange = function () { touch("s3"); };
    s3render();
  }

  /* =============== STEP 4 · the tournament =============== */
  var s4 = { seed: 21 };
  function s4render() {
    var n = +$("s4n").value, leak = $("s4leak").checked ? "state" : "sealed", s = s4.seed;
    $("s4nv").textContent = fmt(n);
    var A = RA.evaluate(RA.policies.random, { leak: leak }, n, s), B = RA.evaluate(RA.policies.random, { leak: leak }, n, s + 1);
    var F = RA.evaluate(RA.policies.frequency, { leak: leak }, n, s + 2), C = RA.evaluate(RA.policies.cheater, { leak: leak }, n, s + 3);
    var rows = [["Random A", A, "the floor", ""], ["Random B", B, "the floor, again", ""], ["Frequency", F, "the candidate", "gold"], ["Cheater", C, "the red flag", C.winRate > 0.99 ? "red" : ""]];
    $("s4board").innerHTML = '<div class="bt">TOURNAMENT · ' + fmt(n) + " games a head</div>" + rows.map(function (r) {
      var e = r[1], se = RA.stats.binomSE(e.wins, e.n), lo = Math.max(0, e.winRate - se), hi = Math.min(1, e.winRate + se);
      return '<div class="brow"><div class="bn">' + r[0] + "<small>" + r[2] + '</small></div><div class="btrack"><div class="bfill ' + r[3] + '" style="width:' + (100 * e.winRate) + '%"></div><div class="err" style="left:' + (100 * lo) + "%;width:" + (100 * (hi - lo)) + '%"></div>' + (r[0] === "Frequency" ? '<div class="truth" style="left:20%"><span>true 20%</span></div>' : "") + '</div><div class="bv">' + pct(e.winRate, 1) + "<small>± " + pts(se) + " (1 SE)</small></div></div>";
    }).join("");
    var aa = RA.stats.aaTest(A.wins, n, B.wins, n), ab = $("s4aa");
    ab.className = "aa " + (aa.ok ? "pass" : "fail");
    ab.innerHTML = "<b>A/A test</b> · Random A − Random B = " + pts(aa.diff) + ", standard error of the difference " + pts(aa.se) + " (pooled over " + fmt(2 * n) + " games; alarm at 3.5 SE) → " + (aa.ok ? "<b>PASS</b>: same player, same score, within noise." : "<b>FAIL</b>: the harness itself is biased; stop and debug before reading any other row.");
    var fl = $("s4flag");
    if (C.winRate > 0.99) { fl.style.display = ""; fl.innerHTML = "<b>Red flag.</b> The Cheater scores 100%: this tournament can be won without playing. Its cabinet keeps the word on the back panel (step 1). Untick the course's cabinet to seal it."; }
    else { fl.style.display = ""; fl.className = "callout co-g"; fl.innerHTML = "<b>Sealed.</b> The Cheater falls to Random's level: no answer to read. (It's just Random with extra steps now.)"; }
    if (C.winRate > 0.99) fl.className = "callout co-w";
    var gap = F.winRate - (A.winRate + B.winRate) / 2, seg2 = Math.sqrt(RA.stats.binomSE(F.wins, n) * RA.stats.binomSE(F.wins, n) + RA.stats.binomSE(A.wins + B.wins, 2 * n) * RA.stats.binomSE(A.wins + B.wins, 2 * n));
    $("s4find").innerHTML = "<b>Finding.</b> Frequency beats Random by " + pts(gap) + " (about " + fmt(gap / Math.max(seg2, 1e-9), 1) + " standard errors). Would you ship that claim at this sample size? Frequency's <i>own</i> reading, " + pct(F.winRate, 1) + ", sits " + pts(Math.abs(F.winRate - 0.2)) + " from the truth.";
    var runs = [], mn = 1, mx = 0;
    for (var i = 0; i < 10; i++) { var w = RA.evaluate(RA.policies.frequency, { leak: leak }, n, s + 10 + i).winRate; runs.push(w); mn = Math.min(mn, w); mx = Math.max(mx, w); }
    var top = Math.max(0.4, mx * 1.15);
    $("s4spread").innerHTML = runs.map(function (w) { return '<i class="' + (w === mx ? "hi" : w === mn ? "lo" : "") + '" style="height:' + (100 * w / top) + '%" title="' + pct(w, 1) + '"></i>'; }).join("");
    $("s4spreadcap").innerHTML = "<span>lowest run " + pct(mn, 1) + "</span><span>truth 20%</span><span>highest run " + pct(mx, 1) + "</span>";
  }
  function initS4() {
    $("s4n").oninput = function () { s4render(); };
    $("s4n").onchange = function () { touch("s4"); };
    $("s4leak").onchange = function () { s4render(); touch("s4"); };
    $("s4reseed").onclick = function () { s4.seed += 100; s4render(); touch("s4"); };
    s4render();
  }

  /* =============== STEP 5 · arcade vs pond =============== */
  var MS = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500], NETMS = [0, 0.1, 0.5, 1, 2, 5, 10, 20, 30, 50, 100], ENVS = [1, 16, 64, 256, 1024, 4096, 16384], STEPS = [1, 6, 24, 50, 100, 1000];
  var PRESETS = { llm: { pol: 11, env: 8, net: 8, envs: 2, steps: 1 }, duck: { pol: 1, env: 1, net: 8, envs: 5, steps: 2 } };
  var s5 = { preset: "llm" };
  function msf(x) { return x >= 1000 ? fmt(x / 1000, 1) + " s" : x < 1 ? fmt(x, 2) + " ms" : fmt(x, x < 10 ? 1 : 0) + " ms"; }
  function s5vals() { return { policyMs: MS[+$("s5pol").value], envMs: MS[+$("s5env").value], netMs: NETMS[+$("s5net").value], envs: ENVS[+$("s5envs").value], steps: STEPS[+$("s5steps").value] }; }
  function s5render() {
    var v = s5vals(), c = RA.stepCost(v);
    $("s5polv").textContent = msf(v.policyMs); $("s5envv").textContent = msf(v.envMs); $("s5netv").textContent = msf(v.netMs); $("s5envsv").textContent = fmt(v.envs); $("s5stepsv").textContent = fmt(v.steps);
    function box(name, sub, x, hot) {
      var w = x.wall || 1;
      return '<div class="abox"><b>' + name + '</b><div class="sub2">' + sub + '</div><div class="stackbar"><div class="pol" style="width:' + (100 * x.policy / w) + '%">player</div><div class="envt" style="width:' + (100 * x.env / w) + '%">game</div><div class="net" style="width:' + (100 * x.net / w) + '%">' + (x.net ? "network" : "") + '</div></div>' +
        '<div class="out"><div>one step · <b>' + msf(x.wall) + '</b></div><div>network share · <b class="' + (hot && x.netShare > 0.5 ? "hot" : "") + '">' + pct(x.netShare, 1) + '</b></div><div>env-steps/s · <b>' + fmt(Math.round(x.stepsPerSec)) + '</b></div><div>one rollout · <b>' + msf(x.rolloutMs) + "</b></div></div></div>";
    }
    $("s5arch").innerHTML = box("The arcade: a cabinet per environment, over the network", "OpenEnv: containers, one WebSocket hop per step", c.service, true) + box("The pond: every environment in the trainer's process", "mjlab: all " + fmt(v.envs) + " environments as one tensor, no hop", c.inproc, false);
    var sh = c.service.netShare;
    $("s5note").innerHTML = sh > 0.5 ? "<b>The network owns the clock</b> (" + pct(sh) + " of every step). A hop per step would slow this training " + fmt(c.service.wall / c.inproc.wall, 1) + "× against keeping the environments in-process. This is a pond."
      : "<b>The player owns the clock.</b> The hop is " + pct(sh, 1) + " of a step, so isolating the environment in its own container costs almost nothing, and buys a crash-proof, sandboxed, reusable game. This is an arcade.";
  }
  function s5apply(p) { $("s5pol").value = p.pol; $("s5env").value = p.env; $("s5net").value = p.net; $("s5envs").value = p.envs; $("s5steps").value = p.steps; }
  function initS5() {
    var pseg = seg($("s5preset"), [{ v: "llm", label: "Wordle with a 1.7B LLM (Module 5)" }, { v: "duck", label: "Microduck: 4,096 ducks (Policy Pond)" }, { v: "custom", label: "Custom" }], s5.preset, function (v) { s5.preset = v; if (PRESETS[v]) s5apply(PRESETS[v]); s5render(); touch("s5"); });
    ["s5pol", "s5env", "s5net", "s5envs", "s5steps"].forEach(function (id) { $(id).oninput = function () { s5.preset = "custom"; pseg.set("custom"); s5render(); }; $(id).onchange = function () { touch("s5"); }; });
    s5apply(PRESETS.llm); s5render();
  }

  /* =============== REVIEW BOARD =============== */
  var CASES = [
    { id: "c1", title: "Cabinet 1 · The Answer Sheet", story: "A Wordle environment, forked for a debugging session. After training, the model solves <b>every</b> word in one guess.",
      evidence: '{ "observation": { "prompt": "Guess a 5-letter word", "hint": "crane", "feedback": "" }, "reward": 0.0, "done": false }',
      sym: "100% in one guess. The model's first output is always the word in <code>hint</code>.",
      causes: ["The model is very good at Wordle", "The answer is on the front glass: a leak", "The reward is too generous", "Groups are too small"], cause: 1,
      causeWhy: ["Nobody solves Wordle in one guess without reading the answer. A perfect score is a bug report, not a result.", "Yes. A debug field put the answer on the observation. The model learned to copy it, which is exactly what an optimizer should do with what you gave it.", "The reward is fine: 1 for a solve. Cutting it changes nothing; the answer is still there to read.", "Group size can't create an answer out of nothing. The model reads the hint whatever the group."],
      fixes: ["Lower the reward for a first-guess solve", "Hide the hint in the client's parser", "Remove the hint from the server's observation; keep the word private", "Add a repetition penalty"], fix: 2,
      fixWhy: ["A smaller prize for the same cheat is still a cheat. The model will still read the hint.", "The server still sends it; anyone can write another client. Secrets stay on the server (step 1).", "Right. Delete the field where it's built. The word stays a private attribute the verifier reads and nothing serializes.", "There's no repetition. The model guesses once, correctly, because it can see the word."] },
    { id: "c2", title: "Cabinet 2 · The Ticket Jackpot", story: "A code-repair environment pays <b>+0.1 for every test file the agent touches</b> (to reward \"engaging with the tests\") plus 1.0 when the failing test passes. After training, the agent edits every test file in the repo and fixes nothing.",
      evidence: "reward = 1.0 * tests_now_pass + 0.1 * files_touched\nfiles_touched per episode: 12 → 40 → 61 (rising) · tests_now_pass: 0 → 0 → 0",
      sym: "Average tickets climb every epoch. The pass rate stays at zero.",
      causes: ["The agent needs more training", "The reward pays for activity, not progress: it's farmable", "The repo is too hard", "The step cap is too low"], cause: 1,
      causeWhy: ["More training makes it worse: the optimizer is doing its job on the reward it was given.", "Yes. Touching a file pays every time and never runs out. That's step 3's Farmer: hold one button, collect forever.", "Difficulty explains a zero pass rate; it doesn't explain rising reward with zero passes. Something is paying for nothing.", "A higher cap would let it touch more files and earn more. The cap is the only thing limiting the farm."],
      fixes: ["Penalize editing more than 10 files", "Pay only for newly passing tests, and cap the shaping", "Train longer with a bigger group", "Remove all shaping and pay only for the final fix"], fix: 1,
      fixWhy: ["Whack-a-mole: the agent farms 10 files instead of 61, or finds the next thing that pays. You patched the world around a bad reward.", "Right. Pay for progress (a test that now passes and didn't before), once, with a ceiling. Rule 3 from step 3.", "Longer training on the same reward finds the same jackpot faster.", "Defensible, and TRL's own experiments favour it, but on a task this hard nearly every episode scores 0 and the group teaches nothing (step 3's group of 2). A capped progress reward keeps a signal alive without a jackpot."] },
    { id: "c3", title: "Cabinet 3 · Free Play", story: "A SQL environment. Someone patched the rollout to \"recover from crashes\" by retrying <code>step()</code> without calling <code>reset()</code> again. Overnight the pass rate jumped from 31% to 100%.",
      evidence: "trace: step(sql) → error → retry step(sql) on a fresh instance → { \"reward\": 1.0, \"done\": true, \"message\": \"correct (expected '')\" }",
      sym: "100% after the retry patch. Every retried episode is a one-step win with an empty expected answer.",
      causes: ["The retry fixed a real bug, the model improved", "step() before reset() pays a win: an empty task looks solved", "The SQL checker is too lenient in general", "The model memorized the dataset"], cause: 1,
      causeWhy: ["A patch to the harness can't teach the model SQL overnight. The jump is in the plumbing.", "Yes. A fresh instance has no task; the checker compares the answer to an empty expectation and passes it. Step 2's free win, in production.", "The checker is fine on a real task; it only passes the empty case. The bug is that an empty case can be reached.", "Memorization shows up as gradual gains on seen items, not a one-night jump on retries."],
      fixes: ["Make the checker fail empty answers", "Raise an error on step() before reset(), and never skip reset() on retry", "Lower the reward to 0.5", "Increase max_completion_length"], fix: 1,
      fixWhy: ["Helpful, but it only closes this one path. A cabinet with no task loaded should refuse to play at all.", "Right. Refuse the move before the coin (the server raises, the client sees an error, no reward), and fix the retry to start a real episode.", "Half a ticket for a fake win is still a fake win.", "The episode isn't being cut short; it's being won without a task."] }
  ];
  function capRender() {
    $("capcases").innerHTML = CASES.map(function (c) {
      var st = store.cap[c.id] || {};
      function pick(kind, opts, right, whys) {
        var chosen = st[kind];
        return '<div class="pick' + (chosen != null ? " done" : "") + '" data-c="' + c.id + '" data-k="' + kind + '"><div class="lbl">' + (kind === "cause" ? "Name the cause" : "Pick the fix") + '</div><div class="opts">' +
          opts.map(function (o, i) { var cls = chosen == null ? "" : i === right ? " right" : i === chosen ? " wrong" : ""; return '<button type="button" data-i="' + i + '" class="' + cls.trim() + '"' + (chosen != null ? " disabled" : "") + ">" + o + "</button>"; }).join("") +
          '</div><div class="why">' + (chosen != null ? (chosen === right ? "<b>Right.</b> " : "<b>Not that.</b> " + whys[chosen] + " <b>The cause:</b> ") + whys[right] : "") + "</div></div>";
      }
      return '<div class="case"><h3>' + c.title + '</h3><p class="lede sm">' + c.story + '</p><div class="lbl">evidence</div><div class="jsonbox">' + esc(c.evidence) + '</div><div class="sym"><b>Symptom.</b> ' + c.sym + "</div>" +
        pick("cause", c.causes, c.cause, c.causeWhy) + pick("fix", c.fixes, c.fix, c.fixWhy) +
        '<div class="fixed"' + (st.cause === c.cause && st.fix === c.fix ? "" : " hidden") + ">Back in service</div></div>";
    }).join("");
    qa("#capcases .pick button").forEach(function (b) {
      b.onclick = function () {
        var p = b.closest(".pick"), id = p.dataset.c, k = p.dataset.k;
        store.cap[id] = store.cap[id] || {}; store.cap[id][k] = +b.dataset.i; save(); capRender(); touch("cap"); checkHS();
      };
    });
    var all = CASES.every(function (c) { var st = store.cap[c.id] || {}; return st.cause === c.cause && st.fix === c.fix; });
    $("capstamp").hidden = !all;
    if (all && !store.said.capAll) { store.said.capAll = true; save(); }
  }
  function initCap() { capRender(); }

  /* =============== FIELD TEST =============== */
  var FT = [
    { ph: "e.g. 3", q: "Step 0: switch to <b>one-off requests</b> and press five different letters. How many games did those five presses touch?", a: function () { return 5; }, tol: 0, d: 0 },
    { ph: "e.g. 50", q: "Step 1: load the course's layout and let the Cheater play. Its win rate, in percent?", a: function () { return 100; }, tol: 0.5, d: 0 },
    { ph: "e.g. 9", q: "Step 2: all switches off, send <b>the same wrong letter twice</b>. Attempts left after the second press?", a: function () { return 8; }, tol: 0, d: 0 },
    { ph: "e.g. 1.20", q: "Step 3: rule 2 (+0.1 per correct letter), guard off, cap 50. The Farmer's average tickets (2 decimals)?", a: function () { return RA.exact(RA.policies.farmer, { reward: "naive" }, 50).meanRet; }, tol: 0.006, d: 2 },
    { ph: "e.g. 0.450", q: "Step 3: rule 3 (+0.5 per new letter), guard off, cap 50. Frequency's average tickets (3 decimals)?", a: function () { return RA.exact(RA.policies.frequency, { reward: "fixed" }, 50).meanRet; }, tol: 0.0015, d: 3 },
    { ph: "e.g. 12.0", q: "Step 3: rule 1, guard off, cap 50. In the group-of-2 panel, what share of Random's pairs scored differently (1 decimal, percent)?", a: function () { return 100 * RA.pairDiffRate(RA.policies.random, { reward: "binary" }, PAIRS_PER_WORD, PAIR_SEED, 50).rate; }, tol: 0.06, d: 1 },
    { ph: "e.g. 25", q: "Step 4: Frequency's <b>true</b> win rate, in percent (not one run's reading)?", a: function () { return 100 * RA.exact(RA.policies.frequency, {}, 50).winRate; }, tol: 0.5, d: 0 },
    { ph: "e.g. 42.0", q: "Step 5: the <b>Microduck</b> preset. The network's share of one arcade-style step (1 decimal, percent)?", a: function () { var p = PRESETS.duck; return 100 * RA.stepCost({ policyMs: MS[p.pol], envMs: MS[p.env], netMs: NETMS[p.net], envs: ENVS[p.envs], steps: STEPS[p.steps] }).service.netShare; }, tol: 0.06, d: 1 }
  ];
  function parseNum(v) { return parseFloat(String(v).replace(/[−–]/g, "-").replace(/[,%\s]/g, "")); }
  function fnum(n, d) { return fmt(n, d).replace(/^-/, "−"); }
  function checkHS() {
    var ok = store.said.capAll && (store.meta.ftBest || 0) >= 6;
    $("hscard").hidden = !ok;
    if (ok) {
      if (!store.meta.hsDate) { store.meta.hsDate = longDate(new Date()); save(); }
      $("hsdate").textContent = store.meta.hsDate; $("hsscore").textContent = store.meta.ftBest + " / " + FT.length;
    }
  }
  function initFT() {
    $("ftq").innerHTML = FT.map(function (f, i) {
      return '<div class="fq"><div class="fqt"><span class="num">' + (i + 1) + ".</span> " + f.q + '</div><input type="text" inputmode="decimal" id="ft' + i + '" aria-label="Answer ' + (i + 1) + '" placeholder="' + esc(f.ph || "") + '"><span class="res" id="ftr' + i + '"></span></div>';
    }).join("");
    FT.forEach(function (f, i) { if (store.ft[i] != null) $("ft" + i).value = store.ft[i]; });
    $("ftgo").onclick = function () {
      var score = 0;
      FT.forEach(function (f, i) {
        var v = $("ft" + i).value, t = f.a(), n = parseNum(v), ok = v !== "" && !isNaN(n) && Math.abs(n - t) <= f.tol + 1e-12;
        store.ft[i] = v; if (ok) score++;
        $("ftr" + i).innerHTML = v === "" ? '<span class="muted">skipped</span>' : ok ? '<span class="ok">✓ right</span>' : '<span class="bad">✗</span> <span class="muted">answer: ' + esc(fnum(t, f.d)) + "</span>";
      });
      store.meta.ftBest = Math.max(store.meta.ftBest || 0, score); save();
      $("ftscore").innerHTML = "<b>" + score + " / " + FT.length + "</b>" + (score === FT.length ? " · perfect game." : score >= 6 ? " · nearly there." : "");
      if (score >= 6 && !store.said.ft) { store.said.ft = true; save(); buildNav(); markNav(); }
      checkHS();
      if (!$("hscard").hidden && score >= 6) $("hscard").scrollIntoView({ behavior: "smooth", block: "start" });
    };
    $("hsprint").onclick = function () { window.print(); };
    checkHS();
    $("reset").onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} try { history.replaceState(null, "", location.pathname); } catch (e) {} location.reload(); };
  }

  /* ---------------- art ---------------- */
  function renderArt() {
    var A = window.RA_ART || {};
    qa(".scene[data-art]").forEach(function (el) {
      var s = A[el.dataset.art];
      if (typeof s === "string" && s && !el.firstChild) {
        el.innerHTML = '<div class="scene-in">' + s + "</div>";
        var hint = document.createElement("div"); hint.className = "swipe-hint"; hint.setAttribute("aria-hidden", "true"); hint.textContent = "swipe the picture →";
        el.parentNode.insertBefore(hint, el.nextSibling);
      }
    });
  }

  /* ---------------- boot ---------------- */
  renderArt();
  qa(".kmap .k[data-i]").forEach(function (el) { el.innerHTML = ICONS[el.dataset.i] || ""; });
  buildNav();
  initPredicts();
  [initS0, initS1, initS2, initS3, initS4, initS5, initCap, initFT].forEach(function (init) {
    try { init(); } catch (e) { if (window.console) console.error("Reward Arcade: a step failed to start", e); }
  });
  bindTips(document);
  sections.forEach(function (s) { checkSay(s.id); });
  function hashId() { return (location.hash || "").replace(/^#\/?/, ""); }
  var start = hashId(), legacyHash = !!location.hash && location.hash.indexOf("#/") !== 0;
  var startOk = !!($(start) && $(start).tagName === "SECTION");
  if (legacyHash) { try { history.replaceState(null, "", location.pathname + location.search + (startOk ? "#/" + start : "")); } catch (e) {} }
  show(startOk ? start : "s0");
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  if (legacyHash && startOk) {
    window.addEventListener("load", function () {
      var top = function () { window.scrollTo(0, 0); };
      setTimeout(top, 0);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(function () { requestAnimationFrame(top); }); });
    });
  }
  window.addEventListener("hashchange", function () { var id = hashId(); if ($(id) && $(id).tagName === "SECTION" && !$(id).classList.contains("on")) show(id); });
  window.RAApp = { show: show, CASES: CASES, FT: FT, PRESETS: PRESETS, MS: MS, NETMS: NETMS, ENVS: ENVS, STEPS: STEPS };
})();
