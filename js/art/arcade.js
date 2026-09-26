/* Reward Arcade — the cutaway scenes. Eight 960×400 pictures in the series' style (flat gouache on
   paper, one warm-brown line, every object labelled with a hairline pointer), built from a few drawn
   parts: a cabinet, a kid, a painted sign, a scoreboard, a pond. Each scene is a string of SVG. */
(function () {
  "use strict";
  var L = "#4A2E1E", PAPER = "#FBF7EC", SHEET = "#FFFDF6", YEL = "#F4C430", BRICK = "#C8452F", GRASS = "#5FA03C", SKY = "#9CCBEA",
      SAND = "#DDBB8A", LILAC = "#B8A3DC", STEEL = "#B9BDC2", WOOD = "#B8793F", BOARD = "#2F4A3A", CHALK = "#E9F1E4", NOTE = "#FFF1A8",
      SCENE = "#E5F2FA", SKIN = ["#F1C9A5", "#D9A27A", "#9C6B4A"], BRICKD = "#A5321F", CHALKDIM = "#CFE2C4";
  var HAND = "font-family=\"'Patrick Hand',Kalam,system-ui,sans-serif\"", SIGN = "font-family=\"Grandstander,'Patrick Hand',system-ui,sans-serif\" font-weight=\"800\"";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  /* a painted board with paper lettering; 20px and up gets the 2px dark offset copy */
  function sign(x, y, w, h, text, fill, size, tilt) {
    size = size || 20; fill = fill || BRICK;
    var t = tilt ? ' transform="rotate(' + tilt + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')"' : "";
    var ty = y + h / 2 + size * 0.36;
    var shadow = size >= 20 ? '<text x="' + (x + w / 2 + 2) + '" y="' + (ty + 2) + '" ' + SIGN + ' font-size="' + size + '" fill="' + L + '" text-anchor="middle" stroke="none">' + esc(text) + "</text>" : "";
    return '<g' + t + '><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + fill + '" stroke-width="3"/>' +
      '<rect x="' + (x + 5) + '" y="' + (y + 5) + '" width="' + (w - 10) + '" height="' + (h - 10) + '" rx="4" fill="none" stroke="' + PAPER + '" stroke-width="1.5" opacity=".6"/>' +
      shadow + '<text x="' + (x + w / 2) + '" y="' + ty + '" ' + SIGN + ' font-size="' + size + '" fill="' + PAPER + '" text-anchor="middle" stroke="none">' + esc(text) + "</text></g>";
  }
  /* a hand label joined to its object by a hairline */
  function label(text, tx, ty, px, py, anchor) {
    return '<path d="M' + tx + ' ' + ty + 'L' + px + ' ' + py + '" fill="none" stroke-width="1" opacity=".85"/>' +
      '<circle cx="' + px + '" cy="' + py + '" r="2" fill="' + L + '" stroke="none"/>' +
      '<text x="' + tx + '" y="' + (ty - 4) + '" ' + HAND + ' font-size="14.5" fill="' + L + '" text-anchor="' + (anchor || "start") + '" stroke="none">' + esc(text) + "</text>";
  }
  function txt(text, x, y, size, fill, anchor, fam) {
    return '<text x="' + x + '" y="' + y + '" ' + (fam === "sign" ? SIGN : HAND) + ' font-size="' + size + '" fill="' + (fill || L) + '" text-anchor="' + (anchor || "start") + '" stroke="none">' + esc(text) + "</text>";
  }
  /* the arcade hall: paper wall, bunting, a patterned carpet, skirting, pavement, grass */
  function hall(opts) {
    opts = opts || {};
    var s = '<rect x="0" y="0" width="960" height="400" fill="' + SCENE + '"/>';
    /* sun and clouds */
    s += '<circle cx="912" cy="42" r="19" fill="' + YEL + '"/><path d="M904 40q2.5-3 5 0M915 40q2.5-3 5 0M905 47q7 6 14 0" fill="none" stroke-width="1.5"/>';
    s += '<path d="M150 52q-6-14 12-16q6-16 22-10q14-10 24 8q16 2 10 18z" fill="' + SHEET + '"/><path d="M690 46q-5-12 10-14q5-14 19-9q12-9 21 7q14 2 9 16z" fill="' + SHEET + '"/>';
    /* roof strip with bunting */
    s += '<rect x="8" y="84" width="944" height="16" fill="' + BRICK + '" stroke-width="3"/>';
    var b = "";
    for (var x = 26; x < 950; x += 18) b += "M" + x + " " + (x % 36 === 26 % 36 ? "84v8" : "92v8");
    s += '<path d="M8 92H952' + b + '" fill="none" stroke-width="1.2"/>';
    /* side pillars */
    s += '<rect x="14" y="100" width="20" height="252" fill="' + BRICK + '" stroke-width="3"/><rect x="926" y="100" width="20" height="252" fill="' + BRICK + '" stroke-width="3"/>';
    /* wall */
    s += '<rect x="34" y="100" width="892" height="200" fill="' + (opts.wall || PAPER) + '" stroke-width="2.5"/>';
    /* carpet: lilac with paper dots */
    s += '<rect x="34" y="300" width="892" height="40" fill="' + (opts.floor || LILAC) + '" stroke-width="2"/>';
    var d = "";
    for (var i = 0; i < 24; i++) d += '<circle cx="' + (60 + i * 37) + '" cy="' + (312 + (i % 2) * 14) + '" r="3" fill="' + PAPER + '" stroke-width="1"/>';
    s += d;
    s += '<rect x="14" y="340" width="932" height="12" fill="' + WOOD + '" stroke-width="2.5"/>';
    s += '<rect x="-5" y="352" width="970" height="14" fill="' + STEEL + '" stroke-width="2"/><path d="M60 352v14M180 352v14M300 352v14M420 352v14M540 352v14M660 352v14M780 352v14M900 352v14" fill="none" stroke-width="1.5"/>';
    s += '<rect x="-5" y="366" width="970" height="39" fill="' + GRASS + '" stroke-width="2.5"/><path d="M436 382l3-7l3 7l3-7l3 7M498 398l3-7l3 7M930 382l3-7l3 7l3-7l3 7" fill="none" stroke-width="1.5"/>';
    /* two hanging lamps */
    s += '<path d="M300 100v22M660 100v22" fill="none" stroke-width="2"/><path d="M284 122h32l-6 14h-20z" fill="' + YEL + '" stroke-width="2"/><path d="M644 122h32l-6 14h-20z" fill="' + YEL + '" stroke-width="2"/>';
    return s;
  }
  /* an arcade cabinet, about 130 wide and 210 tall at scale 1, standing on the carpet at (x, y=bottom) */
  function cabinet(x, y, o) {
    o = o || {};
    var w = 130, h = 210, top = y - h, body = o.color || SKY, s = '<g transform="translate(' + x + ' ' + top + ')' + (o.scale ? ' scale(' + o.scale + ')' : "") + '">';
    s += '<path d="M8 210V40q0-14 14-14h86q14 0 14 14v170z" fill="' + body + '" stroke-width="2.5"/>';
    /* marquee */
    s += '<rect x="2" y="0" width="126" height="34" rx="5" fill="' + (o.marqueeFill || BRICK) + '" stroke-width="2.5"/>';
    s += '<text x="66" y="24" ' + SIGN + ' font-size="17" fill="' + L + '" text-anchor="middle" stroke="none">' + esc(o.marquee || "HANGMAN") + '</text>';
    s += '<text x="65" y="23" ' + SIGN + ' font-size="17" fill="' + PAPER + '" text-anchor="middle" stroke="none">' + esc(o.marquee || "HANGMAN") + "</text>";
    /* screen */
    s += '<rect x="18" y="44" width="94" height="64" rx="4" fill="' + WOOD + '" stroke-width="2.5"/><rect x="23" y="49" width="84" height="54" rx="3" fill="' + (o.screenFill || BOARD) + '" stroke-width="1.5"/>';
    var lines = o.screen || ["_ e _ _ _ _", "7 lives"];
    s += txt(lines[0], 65, 74, o.screenBig || 17, o.screenColor || SHEET, "middle", "sign");
    if (lines[1]) s += txt(lines[1], 65, 94, 12.5, CHALKDIM, "middle");
    if (o.gameOver) s += '<rect x="30" y="80" width="70" height="16" rx="3" fill="' + BRICK + '" stroke-width="1.5"/>' + txt("GAME OVER", 65, 92, 11, PAPER, "middle", "sign");
    /* control panel */
    s += '<path d="M14 118h102l10 26H4z" fill="' + SAND + '" stroke-width="2.5"/>';
    var jx = o.joyX == null ? 44 : o.joyX, jTop = o.joyTilt ? (jx + o.joyTilt) : jx;
    s += '<path d="M' + jx + ' 136L' + jTop + ' 116" fill="none" stroke-width="3.5"/><circle cx="' + jTop + '" cy="114" r="7" fill="' + BRICK + '" stroke-width="2"/>';
    s += '<circle cx="78" cy="130" r="6" fill="' + YEL + '" stroke-width="2"/><circle cx="96" cy="130" r="6" fill="' + GRASS + '" stroke-width="2"/>';
    /* coin slot */
    s += '<rect x="96" y="150" width="20" height="14" rx="2" fill="' + STEEL + '" stroke-width="2"/><rect x="104" y="153" width="4" height="8" fill="' + L + '" stroke="none"/>';
    if (o.coin) s += '<circle cx="106" cy="146" r="6" fill="' + YEL + '" stroke-width="2"/>';
    /* ticket mouth */
    s += '<rect x="20" y="172" width="42" height="12" rx="2" fill="' + L + '" stroke="none"/>';
    var n = o.tickets == null ? 2 : o.tickets;
    for (var i = 0; i < n; i++) s += '<rect x="' + (8 - i * 16) + '" y="' + (178 + i * 5) + '" width="16" height="10" rx="1.5" fill="' + YEL + '" stroke-width="1.5" transform="rotate(' + (-8 - i * 6) + ' ' + (16 - i * 16) + ' ' + (183 + i * 5) + ')"/>';
    /* game-over light */
    s += '<circle cx="110" cy="178" r="5" fill="' + (o.gameOver ? BRICK : "#E9DDC0") + '" stroke-width="1.5"/>';
    /* service hatch on the right side */
    s += '<rect x="110" y="60" width="14" height="44" rx="2" fill="' + STEEL + '" stroke-width="2"/>';
    if (o.hatchOpen) {
      s += '<path d="M124 60l24 -8v44l-24 8z" fill="' + STEEL + '" stroke-width="2"/>';
      s += '<rect x="126" y="66" width="30" height="24" rx="2" fill="' + NOTE + '" stroke-width="1.5" transform="rotate(6 141 78)"/>' + txt(o.hatchNote || "python", 141, 82, 11, BRICKD, "middle", "sign");
    } else s += '<circle cx="117" cy="82" r="2" fill="' + L + '" stroke="none"/>';
    s += "</g>";
    return s;
  }
  /* a kid, about 70 tall, feet at (x, y). dir: 1 faces right, -1 faces left */
  function kid(x, y, shirt, o) {
    o = o || {};
    var skin = SKIN[o.skin == null ? 1 : o.skin], hair = o.hair || L, dir = o.dir || 1, s = '<g transform="translate(' + x + ' ' + y + ')">';
    /* legs and shoes */
    s += '<path d="M-9 -30v26M9 -30v26" fill="none" stroke-width="7" stroke="' + (o.pants || "#246A9C") + '"/><path d="M-9 -30v26M9 -30v26" fill="none" stroke-width="3"/>';
    s += '<path d="M-14 -4h11v4h-11zM3 -4h11v4h-11z" fill="' + L + '" stroke="none"/>';
    /* body */
    s += '<rect x="-14" y="-58" width="28" height="30" rx="9" fill="' + shirt + '" stroke-width="2.5"/>';
    /* arms */
    var a = o.arms || "down";
    if (a === "joystick") s += '<path d="M14 -50l' + (18 * dir) + ' 10" fill="none" stroke-width="6" stroke="' + skin + '"/><path d="M14 -50l' + (18 * dir) + ' 10" fill="none" stroke-width="2.5"/>';
    else if (a === "up") s += '<path d="M-14 -52l-10 -18M14 -52l10 -18" fill="none" stroke-width="6" stroke="' + skin + '"/><path d="M-14 -52l-10 -18M14 -52l10 -18" fill="none" stroke-width="2.5"/>';
    else if (a === "hold") s += '<path d="M-14 -50l-8 12M14 -50l8 12" fill="none" stroke-width="6" stroke="' + skin + '"/><path d="M-14 -50l-8 12M14 -50l8 12" fill="none" stroke-width="2.5"/>';
    else s += '<path d="M-14 -52l-6 18M14 -52l6 18" fill="none" stroke-width="6" stroke="' + skin + '"/><path d="M-14 -52l-6 18M14 -52l6 18" fill="none" stroke-width="2.5"/>';
    /* head */
    s += '<circle cx="0" cy="-72" r="15" fill="' + skin + '" stroke-width="2.5"/>';
    if (o.cap) s += '<path d="M-15 -76q15 -18 30 0z" fill="' + o.cap + '" stroke-width="2"/><path d="M' + (15 * dir) + ' -76h' + (10 * dir) + '" fill="none" stroke-width="3"/>';
    else s += '<path d="M-15 -74q15 -22 30 0" fill="' + hair + '" stroke-width="2"/>';
    s += '<circle cx="' + (5 * dir) + '" cy="-72" r="1.8" fill="' + L + '" stroke="none"/><circle cx="' + (-3 * dir) + '" cy="-72" r="1.8" fill="' + L + '" stroke="none"/>';
    s += o.mouth === "o" ? '<circle cx="' + (1 * dir) + '" cy="-64" r="2.5" fill="' + BRICKD + '" stroke-width="1"/>' : '<path d="M' + (-4 * dir) + ' -65q' + (5 * dir) + ' 4 ' + (10 * dir) + ' 0" fill="none" stroke-width="1.5"/>';
    if (o.apron) s += '<path d="M-10 -50h20v22h-20z" fill="' + o.apron + '" stroke-width="2"/>';
    s += "</g>";
    return s;
  }
  function scoreboard(x, y, w, h, title, rows) {
    var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + WOOD + '" stroke-width="2.5"/><rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="' + (w - 12) + '" height="' + (h - 12) + '" fill="' + BOARD + '" stroke-width="1.5"/>';
    if (title) s += txt(title, x + w / 2, y + 30, 19, YEL, "middle", "sign");
    (rows || []).forEach(function (r, i) {
      var yy = y + (title ? 56 : 30) + i * 24;
      s += txt(r[0], x + 20, yy, 15, CHALK) + txt(r[1], x + w - 20, yy, 16, r[2] || SHEET, "end", "sign");
    });
    return s;
  }
  function duck(x, y, sc) {
    sc = sc || 1;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><ellipse cx="0" cy="0" rx="12" ry="8" fill="' + YEL + '" stroke-width="2"/><circle cx="10" cy="-9" r="6.5" fill="' + YEL + '" stroke-width="2"/><path d="M16 -9l7 2l-7 3z" fill="' + BRICK + '" stroke-width="1.2"/><circle cx="12" cy="-10.5" r="1.4" fill="' + L + '" stroke="none"/></g>';
  }
  function wrap(id, title, inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 400" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="ra-' + id + '-title"><title id="ra-' + id + '-title">' + esc(title) + '</title>' +
      '<g stroke="' + L + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">' + inner + "</g></svg>";
  }

  var A = {};

  /* ---------- s0: the cabinet ---------- */
  A.s0 = wrap("s0", "A cutaway arcade hall. A kid plays a Hangman cabinet whose coin slot, joystick, front glass, ticket mouth, game-over light and service hatch are each labelled with the OpenEnv method they stand for. A second kid at a second cabinet shows that one connection is one game.",
    hall() + sign(330, 12, 300, 52, "REWARD ARCADE", BRICK, 30) +
    cabinet(300, 340, { screen: ["_ e _ _ _ _", "7 lives"], coin: true, tickets: 3 }) +
    kid(272, 340, GRASS, { arms: "joystick", cap: BRICK, skin: 1 }) +
    cabinet(700, 340, { marquee: "HANGMAN", color: LILAC, screen: ["_ _ n _ _ _", "9 lives"], tickets: 1 }) +
    kid(832, 340, YEL, { arms: "joystick", dir: -1, skin: 2, hair: "#3A2418" }) +
    label("front glass = observation", 120, 160, 322, 178) +
    label("joystick = step(action)", 120, 205, 342, 243) +
    label("the player = the policy", 120, 250, 258, 270) +
    label("ticket mouth = reward", 120, 300, 316, 308) +
    label("service hatch = state()", 520, 205, 417, 212, "start") +
    label("coin slot = reset()", 520, 262, 416, 287, "start") +
    label("game-over light = done", 520, 320, 410, 308, "start") +
    label("one connection = one game", 765, 122, 766, 132, "middle")
  );

  /* ---------- s1: front glass, back panel ---------- */
  A.s1 = wrap("s1", "The same cabinet with its service hatch open. A note reading the secret word is taped inside, and a kid in a red shirt crouches to read it while the front glass shows only blanks. A technician with a clipboard looks on.",
    hall() + sign(300, 12, 360, 52, "SERVICE HATCH: NO LOCK", BRICK, 26) +
    cabinet(380, 340, { screen: ["_ _ t _ _ _", "10 lives"], hatchOpen: true, hatchNote: "python", tickets: 0 }) +
    '<g transform="translate(560 340) scale(1 .78)">' + kid(0, 0, BRICK, { arms: "hold", dir: -1, skin: 0, mouth: "o" }) + "</g>" +
    kid(230, 340, STEEL, { apron: SAND, arms: "hold", skin: 2 }) +
    '<rect x="196" y="262" width="26" height="34" rx="2" fill="' + SHEET + '" stroke-width="2" transform="rotate(-8 209 279)"/><path d="M201 272h16M201 280h16M201 288h10" fill="none" stroke-width="1.2"/>' +
    label("front glass: masked word only", 100, 150, 402, 178) +
    label("the hatch: state(), and in it target_word", 560, 150, 536, 205, "start") +
    label("the Cheater reads the note", 600, 262, 572, 286, "start") +
    label("the technician: your models.py", 60, 210, 214, 262) +
    label("the front glass never says the word", 100, 320, 396, 306)
  );

  /* ---------- s2: shake the joystick ---------- */
  A.s2 = wrap("s2", "A kid yanks a cabinet's joystick sideways before dropping a coin, and the ticket mouth sprays tickets anyway. Signs list the odd inputs: step before a coin, an empty guess, two letters at once.",
    hall() + sign(330, 12, 300, 52, "SHAKE THE JOYSTICK", BRICK, 26) +
    cabinet(420, 340, { screen: ["", "no coin · no word"], screenBig: 14, joyTilt: -16, tickets: 6, gameOver: true, coin: false }) +
    kid(392, 340, YEL, { arms: "joystick", cap: SKY, skin: 0, mouth: "o" }) +
    '<rect x="150" y="150" width="150" height="110" rx="6" fill="' + NOTE + '" stroke-width="2" transform="rotate(-3 225 205)"/>' +
    txt("things a good player", 225, 178, 15, L, "middle") + txt("never sends:", 225, 196, 15, L, "middle") +
    txt("• step before a coin", 160, 220, 14.5, BRICKD) + txt("• an empty guess", 160, 238, 14.5, BRICKD) + txt("• two letters: 'ab'", 160, 256, 14.5, BRICKD) +
    '<rect x="690" y="150" width="160" height="96" rx="6" fill="' + NOTE + '" stroke-width="2" transform="rotate(2 770 198)"/>' +
    txt("what the cabinet paid:", 770, 176, 15, L, "middle") + txt("1.0 tickets, GAME OVER", 770, 200, 16, GRASS === GRASS ? "#3B7422" : L, "middle", "sign") + txt("\"The word was ''\"", 770, 226, 14.5, L, "middle") +
    label("no coin in the slot", 560, 300, 528, 285, "start") +
    label("tickets anyway", 560, 330, 440, 320, "start") +
    label("game-over light on", 560, 262, 530, 308, "start")
  );

  /* ---------- s3: the prize rules ---------- */
  A.s3 = wrap("s3", "The prize counter. Three shelves show three reward rules. The Farmer, a kid holding one letter E, stands beside a mountain of tickets; Frequency, a kid with a modest stack, has actually finished games. A clerk in an apron watches.",
    hall({ wall: "#FFF6DC" }) + sign(360, 12, 240, 52, "PRIZE COUNTER", BRICK, 26) +
    /* the counter */
    '<rect x="560" y="230" width="340" height="110" fill="' + WOOD + '" stroke-width="2.5"/><rect x="560" y="222" width="340" height="12" fill="' + SAND + '" stroke-width="2.5"/>' +
    '<rect x="580" y="120" width="300" height="96" rx="3" fill="' + SHEET + '" stroke-width="2.5"/><path d="M580 152h300M580 184h300" fill="none" stroke-width="2"/>' +
    txt("rule 1 · 1 ticket per win", 594, 142, 14.5, L) + txt("rule 2 · +0.1 per correct letter, every time", 594, 174, 14.5, BRICKD) + txt("rule 3 · +0.5 per NEW letter, capped", 594, 206, 14.5, "#3B7422") +
    kid(730, 340, SAND, { apron: SHEET, arms: "hold", skin: 2 }) +
    /* the farmer and his mountain */
    (function () { var t = ""; for (var i = 0; i < 60; i++) { var cx = 150 + (i % 12) * 17 + (Math.floor(i / 12) % 2) * 8, cy = 330 - Math.floor(i / 12) * 11 - Math.abs(6 - i % 12) * 4; t += '<rect x="' + cx + '" y="' + cy + '" width="16" height="10" rx="1.5" fill="' + YEL + '" stroke-width="1.5" transform="rotate(' + ((i * 37) % 21 - 10) + ' ' + (cx + 8) + ' ' + (cy + 5) + ')"/>'; } return t; })() +
    kid(110, 340, BRICK, { arms: "up", skin: 0, mouth: "o" }) +
    '<rect x="70" y="238" width="26" height="26" rx="4" fill="' + SHEET + '" stroke-width="2"/>' + txt("E", 83, 258, 18, BRICKD, "middle", "sign") +
    kid(440, 340, GRASS, { arms: "hold", skin: 1, cap: YEL }) +
    '<rect x="470" y="318" width="16" height="10" rx="1.5" fill="' + YEL + '" stroke-width="1.5"/><rect x="474" y="308" width="16" height="10" rx="1.5" fill="' + YEL + '" stroke-width="1.5"/>' +
    label("the Farmer: one letter, forever, never a win", 60, 200, 96, 251) +
    label("4.9 tickets a game under rule 2", 250, 246, 240, 290) +
    label("Frequency: wins 2 games in 10", 330, 200, 430, 262, "start") +
    label("the clerk = the rule", 905, 300, 744, 272, "end")
  );

  /* ---------- s4: the tournament ---------- */
  A.s4 = wrap("s4", "A tournament. A big chalkboard scoreboard lists Random A, Random B, Frequency and Cheater with their win rates; the Cheater's 100 percent has a red flag next to it. Below, three kids play three cabinets while an attendant holds a stopwatch.",
    hall() + sign(360, 12, 240, 52, "TOURNAMENT", BRICK, 26) +
    scoreboard(560, 110, 340, 150, "SCOREBOARD", [["Random A", "3%"], ["Random B", "4%"], ["Frequency", "22%", YEL], ["Cheater", "100% !", BRICK]]) +
    '<path d="M880 210v-24l16 6l-16 6" fill="' + BRICK + '" stroke-width="1.5"/>' +
    cabinet(70, 340, { scale: 1, screen: ["_ _ _ _ _ _", "2 lives"], tickets: 0, color: SKY }) + kid(220, 340, SKY, { arms: "joystick", dir: -1, skin: 0 }) +
    cabinet(300, 340, { screen: ["n e _ r a l", "9 lives"], tickets: 2, color: LILAC }) + kid(272, 340, GRASS, { arms: "joystick", skin: 1, cap: BRICK }) +
    cabinet(430, 340, { screen: ["t e n s o r", "won"], tickets: 4, color: SAND, gameOver: true }) + kid(560, 340, BRICK, { arms: "up", dir: -1, skin: 2, mouth: "o" }) +
    kid(880, 340, STEEL, { apron: SAND, arms: "hold", skin: 1 }) +
    '<circle cx="848" cy="284" r="9" fill="' + SHEET + '" stroke-width="2"/><path d="M848 284v-6M848 272v-3" fill="none" stroke-width="2"/>' +
    label("100%: someone read the answer", 600, 300, 884, 208, "start") +
    label("the attendant = the harness", 855, 332, 866, 292, "end")
  );

  /* ---------- s5: arcade vs pond ---------- */
  A.s5 = wrap("s5", "Split scene. On the left, a laptop trainer is wired to a cabinet across the room, one long cable per step. On the right, a pond full of ducklings sits inside a single GPU box next to the trainer, no cable at all.",
    hall({ wall: PAPER }) + sign(330, 12, 300, 52, "ARCADE  vs  POND", BRICK, 26) +
    '<path d="M480 100v240" fill="none" stroke-width="3" stroke-dasharray="10 8"/>' +
    /* left: trainer laptop + cable + cabinet */
    '<rect x="70" y="250" width="110" height="60" rx="4" fill="' + STEEL + '" stroke-width="2.5"/><rect x="60" y="306" width="130" height="10" rx="3" fill="' + STEEL + '" stroke-width="2.5"/><rect x="80" y="258" width="90" height="44" fill="' + BOARD + '" stroke-width="1.5"/>' +
    txt("trainer", 125, 285, 14, CHALK, "middle", "sign") +
    '<path d="M180 280q80 -120 160 0" fill="none" stroke-width="3" stroke="' + BRICK + '"/><path d="M180 280q80 -120 160 0" fill="none" stroke-width="1.2"/>' +
    cabinet(330, 340, { screen: ["_ r a n e", "5 lives"], tickets: 1 }) +
    label("one network hop per step", 130, 190, 205, 232, "middle") +
    label("the LLM thinks ~200 ms a step; the hop is noise", 250, 118, 262, 220, "middle") +
    /* right: GPU box with a pond of ducks */
    '<rect x="520" y="130" width="380" height="200" rx="8" fill="' + STEEL + '" stroke-width="2.5"/><rect x="532" y="142" width="356" height="176" rx="6" fill="' + SKY + '" stroke-width="2"/>' +
    txt("one GPU", 710, 165, 16, L, "middle", "sign") +
    (function () { var t = ""; for (var i = 0; i < 28; i++) t += duck(560 + (i % 7) * 50, 200 + Math.floor(i / 7) * 28, 0.75); return t; })() +
    txt("× 4,096", 850, 305, 16, L, "end", "sign") +
    '<rect x="600" y="336" width="14" height="6" fill="' + GRASS + '" stroke-width="1"/><rect x="620" y="336" width="14" height="6" fill="' + GRASS + '" stroke-width="1"/><rect x="640" y="336" width="14" height="6" fill="' + YEL + '" stroke-width="1"/>' +
    label("every duck steps in the same tensor: no cable", 700, 118, 720, 142, "middle")
  );

  /* ---------- cap: the review board ---------- */
  A.cap = wrap("cap", "The repair bench. Three cabinets wear out-of-order tags: The Answer Sheet, The Ticket Jackpot and Free Play. A technician with a screwdriver waits at a workbench with a magnifier.",
    hall({ wall: "#FFF6DC" }) + sign(360, 12, 240, 52, "REVIEW BOARD", BRICK, 26) +
    cabinet(60, 340, { marquee: "WORDLE", color: SKY, screen: ["c r a n e", "hint: crane"], screenBig: 15, hatchOpen: true, hatchNote: "crane", tickets: 5 }) +
    cabinet(280, 340, { marquee: "FIX THE BUG", color: LILAC, screen: ["12 files edited", "0 tests pass"], screenBig: 12, tickets: 6 }) +
    cabinet(500, 340, { marquee: "SQL BOT", color: SAND, screen: ["", "no coin"], screenBig: 12, tickets: 4, gameOver: true }) +
    (function () { var t = ""; [[110, 300, "OUT OF ORDER"], [330, 300, "OUT OF ORDER"], [550, 300, "OUT OF ORDER"]].forEach(function (p) { t += '<rect x="' + p[0] + '" y="' + p[1] + '" width="100" height="24" rx="3" fill="' + NOTE + '" stroke-width="2" transform="rotate(-6 ' + (p[0] + 50) + ' ' + (p[1] + 12) + ')"/>' + txt(p[2], p[0] + 50, p[1] + 17, 12.5, BRICKD, "middle", "sign"); }); return t; })() +
    '<rect x="700" y="270" width="200" height="14" rx="3" fill="' + WOOD + '" stroke-width="2.5"/><path d="M712 284v56M888 284v56" fill="none" stroke-width="4" stroke="' + WOOD + '"/><path d="M712 284v56M888 284v56" fill="none" stroke-width="2"/>' +
    '<circle cx="740" cy="256" r="12" fill="' + SKY + '" stroke-width="2.5"/><path d="M749 265l12 12" fill="none" stroke-width="4"/><rect x="790" y="250" width="40" height="8" rx="2" fill="' + BRICK + '" stroke-width="2"/><path d="M830 254h22" fill="none" stroke-width="3"/>' +
    kid(820, 340, STEEL, { apron: SAND, arms: "hold", skin: 2 }) +
    label("answer sheet: a hint on the glass", 60, 118, 123, 178, "start") +
    label("ticket jackpot: paid per file touched", 330, 118, 345, 200, "start") +
    label("free play: tickets with no coin", 700, 180, 626, 287, "start") +
    label("your bench", 760, 232, 742, 244, "start")
  );

  window.RA_ART = A;
})();
