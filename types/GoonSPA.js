'use strict';

const FabricSPA = require('@fabric/http/types/spa');

/**
 * Goon.VC SPA: GOON SQUAD invite page (QT hero + PERMAFLEET voice panel).
 * Edit _renderWith() below to change the page.
 */
class GoonSPA extends FabricSPA {
  /**
   * Build the full HTML document.
   * @param {string} [html=''] - Ignored; output is static. Kept for API compatibility.
   * @returns {string} Full document string.
   */
  _renderWith (html = '') {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>GOON SQUAD</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="GOON SQUAD — Star Citizen voice. Hop into Permafleet." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style type="text/css">
      :root {
        --void: #050A18;
        --navy: #0A1228;
        --text: #E8F4FF;
        --muted: #8AA4B8;
        --accent: #8EBFD0;
        --accent-dim: rgba(142, 191, 208, 0.45);
        --cyan: #00D4FF;
        --cyan-soft: #7FE9FF;
        --signal: #78ECFF;
        --glass: rgba(5, 12, 28, 0.72);
        --line: var(--accent-dim);
      }

      *, *::before, *::after { box-sizing: border-box; }

      html, body {
        margin: 0;
        min-height: 100%;
        background: var(--void);
        color: var(--text);
        font-family: "Rajdhani", sans-serif;
        font-weight: 500;
        -webkit-font-smoothing: antialiased;
      }

      a { color: var(--accent); text-decoration: none; }
      a:hover { color: #fff; }

      .page {
        position: relative;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .hero-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
        background: var(--void) center/cover no-repeat;
        background-image: url("./hero-quantum.jpg");
        transform: scale(1.06);
        animation: kenburns 28s ease-in-out infinite alternate;
      }

      .hero-scrim {
        position: fixed;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background:
          radial-gradient(ellipse 60% 55% at 50% 42%, rgba(5, 10, 24, 0.2) 0%, rgba(5, 10, 24, 0.62) 62%, rgba(5, 10, 24, 0.88) 100%),
          linear-gradient(180deg, rgba(5, 10, 24, 0.45) 0%, transparent 30%, transparent 68%, rgba(5, 10, 24, 0.82) 100%);
      }

      #qt-particles {
        position: fixed;
        inset: 0;
        z-index: 2;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .content {
        position: relative;
        z-index: 3;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2.5rem 1.25rem 1.5rem;
        text-align: center;
      }

      .brand {
        margin: 0;
        font-family: "Bungee", sans-serif;
        font-weight: 400;
        font-size: clamp(2.4rem, 7vw, 4.2rem);
        letter-spacing: 0.04em;
        line-height: 1.05;
        color: #fff;
        text-shadow: 0 0 24px rgba(142, 191, 208, 0.28), 0 2px 18px rgba(0, 0, 0, 0.65);
      }

      .brand sup {
        font-size: 0.35em;
        vertical-align: super;
        opacity: 0.7;
      }

      .tagline {
        margin: 0.85rem 0 0;
        max-width: 34rem;
        padding: 0 0.5rem;
        font-size: clamp(0.95rem, 2.4vw, 1.25rem);
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--muted);
        line-height: 1.35;
      }

      .panel {
        position: relative;
        margin-top: 1.75rem;
        width: min(100%, 26rem);
        padding: 1.35rem 1.1rem 1.5rem;
        background: var(--glass);
        border: 1px solid rgba(142, 191, 208, 0.28);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        box-shadow: 0 0 40px rgba(142, 191, 208, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
        text-align: center;
      }

      .panel::before,
      .panel::after {
        content: "";
        position: absolute;
        width: 14px;
        height: 14px;
        border-color: var(--accent);
        border-style: solid;
        pointer-events: none;
      }

      .panel::before {
        top: -1px;
        left: -1px;
        border-width: 2px 0 0 2px;
      }

      .panel::after {
        bottom: -1px;
        right: -1px;
        border-width: 0 2px 2px 0;
      }

      .panel-corners {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .panel-corners span {
        position: absolute;
        width: 14px;
        height: 14px;
        border-color: var(--accent);
        border-style: solid;
      }

      .panel-corners span:nth-child(1) {
        top: -1px;
        right: -1px;
        border-width: 2px 2px 0 0;
      }

      .panel-corners span:nth-child(2) {
        bottom: -1px;
        left: -1px;
        border-width: 0 0 2px 2px;
      }

      .panel-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.65rem;
        padding: 0 0.15rem;
      }

      .chip {
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        color: var(--signal);
      }

      .voice-count {
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text);
      }

      .voice-count strong {
        color: var(--signal);
        font-weight: 700;
      }

      .hairline {
        height: 1px;
        margin: 0 0 0.55rem;
        background: linear-gradient(90deg, transparent, var(--line), transparent);
        border: 0;
      }

      .voice-list {
        list-style: none;
        margin: 0 0 0.75rem;
        padding: 0;
        max-height: 16rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .voice-row {
        display: grid;
        grid-template-columns: 2rem minmax(0, 1fr);
        align-items: center;
        column-gap: 0.65rem;
        width: 15.5rem;
        max-width: 100%;
        margin: 0 auto;
        padding: 0.35rem 0.45rem;
        border-radius: 4px;
        text-align: left;
      }

      .voice-row:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .voice-row .avatar {
        position: relative;
        flex: 0 0 2rem;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        border: 1px solid rgba(142, 191, 208, 0.35);
        overflow: hidden;
        background: var(--navy);
      }

      .voice-row .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .voice-row .name {
        flex: 0 1 auto;
        min-width: 0;
        max-width: 12rem;
        font-size: 0.98rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: #dcddde;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
      }

      .empty {
        margin: 0.5rem 0 0.85rem;
        font-size: 0.95rem;
        letter-spacing: 0.04em;
        color: var(--muted);
        text-align: center;
      }

      .server-online {
        margin: 0.85rem 0 0;
        font-size: 0.8rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(138, 164, 184, 0.75);
        text-align: center;
      }

      .panel-cta {
        text-align: center;
        margin-top: 0.25rem;
      }

      .cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 12rem;
        padding: 0.85rem 1.6rem;
        font-family: "Rajdhani", sans-serif;
        font-size: 1.15rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--void);
        background: linear-gradient(180deg, var(--cyan-soft) 0%, var(--cyan) 100%);
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow:
          0 0 28px rgba(0, 212, 255, 0.4),
          0 0 56px rgba(0, 212, 255, 0.22),
          0 0 80px rgba(0, 212, 255, 0.12);
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        animation: cta-pulse 2.8s ease-in-out infinite;
      }

      .cta:hover {
        transform: translateY(-1px);
        filter: brightness(1.08);
        box-shadow:
          0 0 36px rgba(0, 212, 255, 0.5),
          0 0 70px rgba(0, 212, 255, 0.28),
          0 0 100px rgba(0, 212, 255, 0.16);
        color: var(--void);
      }

      .site-footer {
        position: relative;
        z-index: 3;
        padding: 1rem 1.25rem 1.4rem;
        text-align: center;
        color: rgba(138, 164, 184, 0.65);
        font-size: 0.8rem;
        letter-spacing: 0.04em;
      }

      .site-footer code {
        display: inline-block;
        margin-bottom: 0.35rem;
        font-size: 0.72rem;
        word-break: break-all;
        color: rgba(138, 164, 184, 0.55);
      }

      @keyframes kenburns {
        from { transform: scale(1.04); }
        to { transform: scale(1.1); }
      }

      @keyframes cta-pulse {
        0%, 100% {
          box-shadow:
            0 0 24px rgba(0, 212, 255, 0.35),
            0 0 48px rgba(0, 212, 255, 0.18),
            0 0 72px rgba(0, 212, 255, 0.1);
        }
        50% {
          box-shadow:
            0 0 36px rgba(0, 212, 255, 0.5),
            0 0 72px rgba(0, 212, 255, 0.28),
            0 0 110px rgba(0, 212, 255, 0.16);
        }
      }

      @media (max-width: 480px) {
        .content { padding-top: 2rem; }
        .tagline { letter-spacing: 0.03em; max-width: 20rem; }
        .panel { padding: 1.15rem 0.85rem 1.25rem; }
        .voice-list { max-height: 14rem; }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-bg { animation: none; transform: scale(1.04); }
        .cta { animation: none; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="hero-scrim" aria-hidden="true"></div>
      <canvas id="qt-particles" aria-hidden="true"></canvas>

      <main class="content">
        <h1 class="brand">GOON SQUAD<sup>&trade;</sup></h1>
        <p class="tagline">Star Citizen voice — hop into Permafleet</p>

        <section class="panel" id="permafleet-panel" aria-labelledby="permafleet-label">
          <div class="panel-corners" aria-hidden="true"><span></span><span></span></div>
          <div class="panel-head">
            <span class="chip" id="permafleet-label">PERMAFLEET</span>
            <span class="voice-count" id="voice-count"><strong id="voice-n">—</strong> in voice</span>
          </div>
          <hr class="hairline" />
          <ul class="voice-list" id="voice-list" aria-live="polite"></ul>
          <p class="empty" id="empty-state" hidden>Voice is clear — jump in</p>
          <div class="panel-cta">
            <a class="cta" id="join-cta" href="https://discord.com/invite/M4h9bBWq" target="_blank" rel="noopener noreferrer">Join Permafleet</a>
          </div>
          <p class="server-online" id="server-online"></p>
        </section>
      </main>

      <footer class="site-footer">
        <div><code>bc1qx5ktkj6utjw3vl43htvn434c9kg89m73lympr0</code></div>
        <div><small>&copy; big lol</small></div>
      </footer>
    </div>

    <script>
(function () {
  var GUILD_ID = '1190527980120850493';
  var PERMAFLEET_ID = '1236721094153732276';
  var PERMAFLEET_NAME = 'permafleet';
  var FALLBACK_INVITE = 'https://discord.com/invite/M4h9bBWq';
  var MAX_ROWS = 24;

  var voiceN = document.getElementById('voice-n');
  var listEl = document.getElementById('voice-list');
  var emptyEl = document.getElementById('empty-state');
  var serverEl = document.getElementById('server-online');
  var ctaEl = document.getElementById('join-cta');

  function resolveChannelId(channels) {
    if (!channels || !channels.length) return PERMAFLEET_ID;
    for (var i = 0; i < channels.length; i++) {
      if ((channels[i].name || '').toLowerCase() === PERMAFLEET_NAME) {
        return String(channels[i].id);
      }
    }
    return PERMAFLEET_ID;
  }

  function renderPanel(data) {
    var channelId = resolveChannelId(data.channels);
    var members = (data.members || []).filter(function (m) {
      return m.channel_id != null && String(m.channel_id) === channelId;
    });

    voiceN.textContent = String(members.length);
    listEl.innerHTML = '';

    if (!members.length) {
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      var shown = members.slice(0, MAX_ROWS);
      for (var i = 0; i < shown.length; i++) {
        var m = shown[i];
        var li = document.createElement('li');
        li.className = 'voice-row';

        var av = document.createElement('div');
        av.className = 'avatar';
        var img = document.createElement('img');
        img.src = m.avatar_url || '';
        img.alt = '';
        img.loading = 'lazy';
        av.appendChild(img);

        var name = document.createElement('span');
        name.className = 'name';
        name.textContent = m.username || 'Member';
        name.title = m.username || 'Member';

        li.appendChild(av);
        li.appendChild(name);
        listEl.appendChild(li);
      }
    }

    if (typeof data.presence_count === 'number') {
      serverEl.textContent = data.presence_count + ' online on server';
    }

    ctaEl.href = data.instant_invite || FALLBACK_INVITE;
  }

  function renderFallback() {
    voiceN.textContent = '0';
    listEl.innerHTML = '';
    emptyEl.hidden = false;
    serverEl.textContent = '';
    ctaEl.href = FALLBACK_INVITE;
  }

  fetch('https://discord.com/api/guilds/' + GUILD_ID + '/widget.json')
    .then(function (res) {
      if (!res.ok) throw new Error('widget ' + res.status);
      return res.json();
    })
    .then(renderPanel)
    .catch(renderFallback);

  /* QT particles: pause -> dive wave -> peel off -> pause */
  var canvas = document.getElementById('qt-particles');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas || reduce || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var particles = [];
  var raf = 0;
  var running = true;
  var pointer = { x: 0, y: 0, ok: false };
  var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var phase = 'pause';
  var phaseUntil = 0;
  var target = { x: 0, y: 0 };
  var NEAR_R = 32;
  var DIVE_SPEED = 3.2;

  function isMobileLike() {
    return coarsePointer || window.innerWidth < 640 || !pointer.ok;
  }

  function pauseMs() {
    return 2000 + Math.random() * 2000;
  }

  function hunterBudget() {
    return window.innerWidth < 640 ? 6 : 10;
  }

  function countBudget() {
    return window.innerWidth < 640 ? 50 : 100;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(atEdge) {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var cx = w * 0.5;
    var cy = h * 0.42;
    var angle = Math.random() * Math.PI * 2;
    var maxR = Math.sqrt(cx * cx + cy * cy) + 80;
    var dist = atEdge ? Math.random() * maxR * 0.85 : Math.random() * 40;
    return {
      angle: angle,
      dist: dist,
      speed: 0.35 + Math.random() * 1.1,
      width: 0.6 + Math.random() * 1.2,
      hue: Math.random() > 0.4 ? 'soft' : 'white',
      hunting: false,
      vx: 0,
      vy: 0
    };
  }

  function pickTarget() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (!isMobileLike() && pointer.ok) {
      target.x = pointer.x;
      target.y = pointer.y;
      return;
    }
    var insetX = w * 0.12;
    var insetY = h * 0.15;
    target.x = insetX + Math.random() * (w - insetX * 2);
    target.y = insetY + Math.random() * (h - insetY * 2);
  }

  function startDive() {
    pickTarget();
    var need = hunterBudget();
    var picked = 0;
    var attempts = 0;
    while (picked < need && attempts < particles.length * 3) {
      attempts++;
      var i = Math.floor(Math.random() * particles.length);
      var p = particles[i];
      if (p.hunting) continue;
      p.hunting = true;
      picked++;
    }
    phase = 'dive';
  }

  function clearHunters() {
    for (var i = 0; i < particles.length; i++) {
      particles[i].hunting = false;
      particles[i].vx = 0;
      particles[i].vy = 0;
    }
  }

  function huntingCount() {
    var n = 0;
    for (var i = 0; i < particles.length; i++) {
      if (particles[i].hunting) n++;
    }
    return n;
  }

  function init() {
    particles = [];
    var n = countBudget();
    for (var i = 0; i < n; i++) particles.push(spawn(true));
    phase = 'pause';
    phaseUntil = performance.now() + pauseMs();
    clearHunters();
  }

  function tick(now) {
    if (!running) return;
    if (!now) now = performance.now();

    var w = window.innerWidth;
    var h = window.innerHeight;
    var cx = w * 0.5;
    var cy = h * 0.42;
    var maxR = Math.sqrt(cx * cx + Math.max(cy, h - cy) * Math.max(cy, h - cy)) + 40;

    if (phase === 'pause' && now >= phaseUntil) {
      startDive();
    } else if (phase === 'dive') {
      if (!isMobileLike() && pointer.ok) {
        target.x = pointer.x;
        target.y = pointer.y;
      }
      if (huntingCount() === 0) {
        phase = 'pause';
        phaseUntil = now + pauseMs();
      }
    }

    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var x = cx + Math.cos(p.angle) * p.dist;
      var y = cy + Math.sin(p.angle) * p.dist;
      var hunting = p.hunting;
      var trailX = 0;
      var trailY = 0;

      if (hunting) {
        var hx = target.x - x;
        var hy = target.y - y;
        var hdist = Math.sqrt(hx * hx + hy * hy) || 1;
        p.vx = (hx / hdist) * DIVE_SPEED;
        p.vy = (hy / hdist) * DIVE_SPEED;
        x += p.vx;
        y += p.vy;
        p.angle = Math.atan2(y - cy, x - cx);
        p.dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));

        if (hdist < NEAR_R) {
          p.hunting = false;
          p.vx = 0;
          p.vy = 0;
          hunting = false;
        } else {
          trailX = -p.vx;
          trailY = -p.vy;
        }
      }

      if (!hunting) {
        p.dist += p.speed * (1 + p.dist * 0.012);
        x = cx + Math.cos(p.angle) * p.dist;
        y = cy + Math.sin(p.angle) * p.dist;
        if (p.dist > maxR) {
          particles[i] = spawn(false);
          p = particles[i];
          x = cx + Math.cos(p.angle) * p.dist;
          y = cy + Math.sin(p.angle) * p.dist;
        }
      }

      var len;
      var x2;
      var y2;
      var t = p.dist / maxR;
      var alpha = t < 0.08 ? t / 0.08 * 0.25 : (t > 0.85 ? (1 - t) / 0.15 * 0.45 : 0.18 + (1 - t) * 0.32);
      var lineW = p.width;

      if (hunting) {
        var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || DIVE_SPEED;
        len = 10 + speed * 4;
        x2 = x + (trailX / (speed || 1)) * len;
        y2 = y + (trailY / (speed || 1)) * len;
        alpha = Math.min(0.9, alpha + 0.4);
        lineW = p.width + 1.1;
      } else {
        len = 2 + p.dist * 0.035;
        x2 = cx + Math.cos(p.angle) * Math.max(0, p.dist - len);
        y2 = cy + Math.sin(p.angle) * Math.max(0, p.dist - len);
      }

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x, y);
      ctx.strokeStyle = hunting
        ? 'rgba(210, 240, 250,' + alpha + ')'
        : (p.hue === 'soft'
          ? 'rgba(168, 208, 220,' + alpha + ')'
          : 'rgba(232, 244, 255,' + alpha + ')');
      ctx.lineWidth = lineW;
      ctx.stroke();
    }

    raf = requestAnimationFrame(tick);
  }

  function onPointer(e) {
    var point = e.touches && e.touches[0] ? e.touches[0] : e;
    pointer.x = point.clientX;
    pointer.y = point.clientY;
    pointer.ok = true;
  }

  function onVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else {
      running = true;
      raf = requestAnimationFrame(tick);
    }
  }

  resize();
  init();
  raf = requestAnimationFrame(tick);
  window.addEventListener('resize', function () {
    resize();
    init();
  });
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('touchstart', onPointer, { passive: true });
  window.addEventListener('touchmove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
})();
    </script>
  </body>
</html>
`;
  }
}

module.exports = GoonSPA;
