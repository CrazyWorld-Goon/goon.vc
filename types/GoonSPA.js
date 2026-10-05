'use strict';

const fs = require('fs');
const path = require('path');
const FabricSPA = require('@fabric/http/types/spa');
const escapeHtml = require('../functions/escapeHtml');
const HomePage = require('../components/HomePage');
const PermafleetOperation = require('../components/PermafleetOperation');
const PermafleetSchedule = require('../components/PermafleetSchedule');

const PERSONALITIES_DIR = path.join(__dirname, '../contracts/permafleet/personalities');

const DEFAULTS = {
  title: 'GOON SQUAD',
  heading: 'GOON SQUAD<sup>&trade;</sup>',
  joinLabel: 'Join the Squad &raquo;',
  joinUrl: 'https://discord.com/servers/g00n-squad-1190527980120850493',
  loginLabel: '&gt; LOGIN &lt;',
  loginPath: '/sessions',
  monitorUrl: 'https://relay.goon.vc',
  monitorLabel: 'Monitor',
  dossierPath: '/dossier',
  dossierLabel: 'DOSSIER',
  dossierHeading: 'DOSSIER',
  dossierIntro: 'Public roster derived from alliance records and org chart.',
  dossierDocumentTitle: 'DOSSIER — GOON SQUAD',
  permafleetPath: '/operations/PERMAFLEET',
  permafleetLabel: 'PERMAFLEET',
  permafleetHeading: 'PERMAFLEET',
  permafleetTagline: 'We’re always online.',
  permafleetIntro: 'Dedicated to giving everyone a group to fly with, PERMAFLEET runs 24/7 public assistance. Security is always on standby, giving us rapid response times to hostile encounters.',
  permafleetDocumentTitle: 'PERMAFLEET — GOON SQUAD',
  permafleetChannelId: '1236721094153732276',
  permafleetChannelName: 'permafleet',
  permafleetInviteUrl: 'https://discord.com/invite/M4h9bBWq',
  permafleetHeroImage: '/hero-quantum.jpg',
  permafleetSchedulePath: '/operations/PERMAFLEET/schedule',
  permafleetScheduleImage: '/permafleet-schedule.svg',
  permafleetScheduleHtml: '/permafleet-schedule.html',
  permafleetScheduleDocumentTitle: 'PERMAFLEET Weekly Ops — GOON SQUAD',
  discordWidgetId: '1190527980120850493',
  discordWidgetTheme: 'dark',
  discordWidgetWidth: 350,
  discordWidgetHeight: 800,
  bitcoinAddress: 'bc1qx5ktkj6utjw3vl43htvn434c9kg89m73lympr0',
  copyright: '&copy; big lol',
  viewport: 'width=500, initial-scale=1'
};

function loadPersonalities () {
  let files = [];
  try {
    files = fs.readdirSync(PERSONALITIES_DIR).filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
  const list = files.map(f => JSON.parse(fs.readFileSync(path.join(PERSONALITIES_DIR, f), 'utf8')));
  list.sort((a, b) => String(a.handle).localeCompare(String(b.handle)));
  return list;
}

function normalizeSources (p) {
  if (Array.isArray(p.sources) && p.sources.length) return p.sources;
  if (p.source) return [p.source];
  return [];
}

function renderOrganizationHtml (p) {
  const org = p.organization != null && p.organization !== ''
    ? escapeHtml(p.organization)
    : '<span class="muted">—</span>';
  return `<p class="dossier-org"><strong>Organization</strong> ${org}</p>`;
}

function renderRolesUlHtml (p) {
  const rolesHtml = (p.roles || []).map((r) => {
    const parts = [`<strong>${escapeHtml(r.title)}</strong>`];
    if (r.organization) parts.push(`<span class="dossier-role-meta">${escapeHtml(r.organization)}</span>`);
    else if (r.scope) parts.push(`<span class="dossier-role-meta">${escapeHtml(r.scope)}</span>`);
    const note = r.notes ? `<div class="dossier-role-notes">${escapeHtml(r.notes)}</div>` : '';
    return `<li><div class="dossier-role-line">${parts.join(' · ')}</div>${note}</li>`;
  }).join('');
  return `<ul class="dossier-roles">${rolesHtml}</ul>`;
}

function renderSourcesFooterHtml (sources) {
  if (!sources.length) return '';
  const linkParts = [];
  for (const src of sources) {
    if (src.url) {
      linkParts.push(`<a href="${escapeHtml(src.url)}" rel="noopener noreferrer">${escapeHtml(src.kind || 'source')}</a>`);
    } else if (src.path) {
      linkParts.push(`<code>${escapeHtml(src.path)}</code>`);
    } else if (src.kind) {
      linkParts.push(escapeHtml(src.kind));
    }
  }
  let notesHtml = '';
  for (const src of sources) {
    if (src.notes) notesHtml += `<div class="dossier-src-notes">${escapeHtml(src.notes)}</div>`;
  }
  return `<footer class="dossier-source">${linkParts.join(' · ')}${notesHtml}</footer>`;
}

function renderDossierCardHtml (p, dossierBasePath) {
  const slug = encodeURIComponent(p.handle);
  const profileHref = `${dossierBasePath}/${slug}`;
  const org = renderOrganizationHtml(p);
  const rolesHtml = renderRolesUlHtml(p);
  const sourcesFooter = renderSourcesFooterHtml(normalizeSources(p));
  return `<article class="dossier-card">
      <header><h2 class="dossier-handle"><a href="${escapeHtml(profileHref)}">${escapeHtml(p.handle)}</a></h2></header>
      ${org}
      ${rolesHtml}
      ${sourcesFooter}
    </article>`;
}

function renderDossierCardsHtml (personas, dossierBasePath) {
  if (!personas.length) {
    return '<p class="dossier-empty">No dossier records.</p>';
  }
  return personas.map(p => renderDossierCardHtml(p, dossierBasePath)).join('\n');
}

function renderPersonMainHtml (p, dossierBasePath, loginPath, loginLabel, copyright) {
  const id = `person-${escapeHtml(p.handle)}`;
  const slug = encodeURIComponent(p.handle);
  const profileHref = `${dossierBasePath}/${slug}`;
  const org = renderOrganizationHtml(p);
  const rolesHtml = renderRolesUlHtml(p);
  const sourcesFooter = renderSourcesFooterHtml(normalizeSources(p));
  return `<main id="${id}" class="person-page dossier-page">
      <p class="dossier-back"><a href="/">&larr; Home</a> · <a href="${dossierBasePath}">Dossier index</a></p>
      <h1 class="person-title">${escapeHtml(p.handle)}</h1>
      ${org}
      ${rolesHtml}
      ${sourcesFooter}
      <p class="person-permalink"><a href="${escapeHtml(profileHref)}">Permalink</a></p>
      <footer>
        <div style="padding-top: 2em;"><a class="footer-login-button" href="${loginPath}">${loginLabel}</a></div>
        <div><small>${copyright}</small></div>
      </footer>
    </main>`;
}

/**
 * Goon.VC SPA: static site template driven by settings (see settings/local.js site.*).
 * Edit settings to change title, Discord, Bitcoin, footer without touching this file.
 */
class GoonSPA extends FabricSPA {
  _site (key) {
    return this.settings[key] !== undefined ? this.settings[key] : DEFAULTS[key];
  }

  /**
   * Build the full HTML document from config (settings/local.js site.*).
   * @param {string} [html=''] - Ignored; output is static. Kept for API compatibility.
   * @returns {string} Full document string.
   */
  _renderWith (html = '') {
    const title = this._site('title');
    const heading = this._site('heading');
    const joinLabel = this._site('joinLabel');
    const joinUrl = this._site('joinUrl');
    const loginLabel = this._site('loginLabel');
    const loginPath = this._site('loginPath');
    const monitorUrl = this._site('monitorUrl');
    const monitorLabel = escapeHtml(this._site('monitorLabel'));
    const dossierPath = this._site('dossierPath');
    const dossierLabel = escapeHtml(this._site('dossierLabel'));
    const dossierHeading = escapeHtml(this._site('dossierHeading'));
    const dossierIntro = escapeHtml(this._site('dossierIntro'));
    const dossierDocumentTitle = this._site('dossierDocumentTitle');
    const dossierTitleJson = JSON.stringify(dossierDocumentTitle);
    const permafleetPath = this._site('permafleetPath');
    const permafleetTitleJson = JSON.stringify(this._site('permafleetDocumentTitle'));
    const permafleetInviteUrl = this._site('permafleetInviteUrl');
    const schedulePath = this._site('permafleetSchedulePath');
    const scheduleTitleJson = JSON.stringify(this._site('permafleetScheduleDocumentTitle'));
    const titleJson = JSON.stringify(title);
    const personas = loadPersonalities();
    const dossierCardsHtml = renderDossierCardsHtml(personas, dossierPath);
    const personMainsHtml = personas.map(p =>
      renderPersonMainHtml(p, dossierPath, loginPath, loginLabel, this._site('copyright'))
    ).join('\n');
    const widgetId = this._site('discordWidgetId');
    const widgetTheme = this._site('discordWidgetTheme');
    const widgetWidth = this._site('discordWidgetWidth');
    const widgetHeight = this._site('discordWidgetHeight');
    const bitcoinAddress = this._site('bitcoinAddress');
    const copyright = this._site('copyright');
    const viewport = this._site('viewport');
    const widgetSrc = `https://discord.com/widget?id=${widgetId}&theme=${widgetTheme}`;
    const personPathPattern = '^' + dossierPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/([^/]+)$';
    const homeMainHtml = HomePage.render({
      heading,
      nav: [
        { href: dossierPath, label: dossierLabel },
        { href: permafleetPath, label: escapeHtml(this._site('permafleetLabel')) },
        { href: monitorUrl, label: monitorLabel },
        { href: loginPath, label: 'Login' }
      ],
      joinUrl,
      joinLabel,
      widgetSrc,
      widgetWidth,
      widgetHeight,
      loginPath,
      loginLabel,
      bitcoinAddress,
      copyright
    });
    const permafleetMainHtml = PermafleetOperation.render({
      heading: escapeHtml(this._site('permafleetHeading')),
      goonBrandHtml: heading,
      tagline: escapeHtml(this._site('permafleetTagline')),
      intro: escapeHtml(this._site('permafleetIntro')),
      inviteUrl: permafleetInviteUrl,
      hotlineUrl: joinUrl,
      schedulePath,
      bitcoinAddress,
      copyright,
      nav: [
        { href: dossierPath, label: dossierLabel },
        { href: schedulePath, label: 'Schedule' },
        { href: monitorUrl, label: monitorLabel },
        { href: loginPath, label: 'Login' }
      ]
    });
    const scheduleMainHtml = PermafleetSchedule.render({
      title: 'PERMAFLEET',
      imageSrc: this._site('permafleetScheduleImage'),
      htmlSrc: this._site('permafleetScheduleHtml'),
      operationPath: permafleetPath,
      joinUrl: permafleetInviteUrl
    });
    const permafleetScript = PermafleetOperation.script({
      guildId: widgetId,
      channelId: this._site('permafleetChannelId'),
      channelName: this._site('permafleetChannelName'),
      inviteUrl: permafleetInviteUrl
    });

    return `<html>
  <head>
    <title>${title}</title>
    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <meta name="theme-color" content="#4C1D95">
    <meta name="viewport" content="${viewport}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style type="text/css">
      body { background: #333; color: #ddd; text-align: center; }
      h1, h2, h3 { font-family: "Bungee", sans-serif; font-weight: 400; font-style: normal; }
      a { color: #fff; }
      footer, footer > div { padding-top: 1em; }
      .footer-login-button {
        border: 2px solid #fff;
        border-radius: 8px;
        color: #fff;
        display: inline-block;
        font-family: "Bungee", sans-serif;
        letter-spacing: 0.1em;
        padding: 0.5em 0.9em;
        text-decoration: none;
      }
      .footer-login-button:hover { background: rgba(255, 255, 255, 0.1); }
      .login-page { display: none; margin: 3em auto; max-width: 32em; padding: 0 1em; }
      .session-form { margin: 2em auto; max-width: 26em; display: flex; flex-direction: column; gap: 0.75em; }
      .session-form button {
        background: #222;
        border: 2px solid #fff;
        border-radius: 8px;
        color: #fff;
        cursor: pointer;
        font-family: "Bungee", sans-serif;
        letter-spacing: 0.08em;
        padding: 0.65em 0.9em;
      }
      .session-form button:hover { background: rgba(255, 255, 255, 0.1); }
      .session-form button:disabled { opacity: 0.45; cursor: default; }
      .session-status { min-height: 1.2em; margin-top: 1em; word-break: break-word; }
      .session-identity {
        margin-top: 1.25em;
        padding: 0.85em 1em;
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 8px;
        text-align: left;
        font-size: 0.9em;
        display: none;
      }
      .session-identity code { word-break: break-all; font-size: 0.85em; }
      .dossier-page {
        display: none;
        margin: 0 auto;
        max-width: 38em;
        padding: 0 1em 3em;
        text-align: left;
      }
      .dossier-page > h1 { text-align: center; }
      .dossier-back { text-align: center; margin-bottom: 1.5em; }
      .dossier-intro {
        color: #bbb;
        font-size: 0.92em;
        line-height: 1.45;
        margin: 0 auto 2em;
        max-width: 28em;
        text-align: center;
      }
      .dossier-grid { display: flex; flex-direction: column; gap: 1.25rem; }
      .dossier-card {
        background: rgba(0, 0, 0, 0.22);
        border: 1px solid #555;
        border-radius: 10px;
        padding: 1rem 1.15rem;
      }
      .dossier-handle { font-size: 1.2rem; margin: 0 0 0.5rem; }
      .dossier-handle a { text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.25); }
      .dossier-handle a:hover { border-bottom-color: #fff; }
      .dossier-org { font-size: 0.88rem; margin: 0 0 0.85rem; }
      .dossier-roles {
        list-style: disc;
        margin: 0;
        padding-left: 1.25rem;
      }
      .dossier-role-line { margin-bottom: 0.15rem; }
      .dossier-role-meta { color: #c9c9c9; font-weight: normal; }
      .dossier-role-notes {
        color: #aaa;
        font-size: 0.82rem;
        line-height: 1.35;
        margin: 0.35rem 0 0.5rem;
      }
      .dossier-source {
        border-top: 1px solid #444;
        color: #999;
        font-size: 0.78rem;
        margin-top: 1rem;
        padding-top: 0.75rem;
      }
      .dossier-src-notes { margin-top: 0.35rem; color: #888; font-size: 0.78rem; }
      .dossier-empty { color: #888; text-align: center; padding: 2em 0; }
      .muted { color: #777; }
      .person-title { text-align: center; margin-top: 0; }
      .person-permalink { font-size: 0.85rem; margin-top: 1.25rem; color: #999; }
${HomePage.styles()}
${PermafleetOperation.styles({ heroImage: this._site('permafleetHeroImage') })}
${PermafleetSchedule.styles()}
    </style>
  </head>
  <body>
    ${homeMainHtml}
    <main id="login-page" class="login-page">
      <h1>${loginLabel}</h1>
      <p>Sign in with your Fabric identity — GoonCitizen desktop or Fabric Passport. Same key, interchangeable.</p>
      <div id="session-form" class="session-form">
        <button type="button" id="login-desktop">Log in with GoonCitizen / desktop</button>
        <button type="button" id="login-passport">Sign in with Passport</button>
      </div>
      <p id="session-status" class="session-status"></p>
      <div id="session-identity" class="session-identity"></div>
      <p><a href="/">Back to Home</a></p>
    </main>
    <main id="dossier-page" class="dossier-page">
      <p class="dossier-back"><a href="/">&larr; Home</a></p>
      <h1>${dossierHeading}</h1>
      <p class="dossier-intro">${dossierIntro}</p>
      <div class="dossier-grid">
${dossierCardsHtml}
      </div>
      <footer>
        <div style="padding-top: 2em;"><a class="footer-login-button" href="${loginPath}">${loginLabel}</a></div>
        <div><small>${copyright}</small></div>
      </footer>
    </main>
${personMainsHtml}
    ${permafleetMainHtml}
    ${scheduleMainHtml}
    <script type="text/javascript">
      (function () {
        var loginPath = ${JSON.stringify(loginPath)};
        var dossierPath = ${JSON.stringify(dossierPath)};
        var permafleetPath = ${JSON.stringify(permafleetPath)};
        var schedulePath = ${JSON.stringify(schedulePath)};
        var personRe = new RegExp(${JSON.stringify(personPathPattern)});
        var path = (window.location.pathname || '/').replace(/\\/+$/, '') || '/';
        var isLogin = path === loginPath;
        var isDossier = path === dossierPath;
        var isRoot = path === '/';
        var isPermafleet = isRoot || path.toLowerCase() === permafleetPath.toLowerCase();
        var isSchedule = path.toLowerCase() === schedulePath.toLowerCase();
        var personMatch = personRe.exec(path);
        var personId = personMatch ? ('person-' + decodeURIComponent(personMatch[1])) : null;
        var home = document.getElementById('home-page');
        var login = document.getElementById('login-page');
        var dossierEl = document.getElementById('dossier-page');
        var permafleetEl = document.getElementById('operation-permafleet');
        var scheduleEl = document.getElementById('permafleet-schedule');
        var personEl = personId ? document.getElementById(personId) : null;

        if (home) {
          home.style.display = (!isLogin && !isDossier && !isPermafleet && !isSchedule && !personEl) ? 'block' : 'none';
        }
        if (login) login.style.display = isLogin ? 'block' : 'none';
        if (dossierEl) dossierEl.style.display = isDossier ? 'block' : 'none';
        if (permafleetEl) permafleetEl.style.display = isPermafleet ? 'block' : 'none';
        document.body.classList.toggle('op-active', isPermafleet);
        if (scheduleEl) scheduleEl.style.display = isSchedule ? 'block' : 'none';
        document.body.classList.toggle('schedule-active', isSchedule);
        document.querySelectorAll('.person-page').forEach(function (el) {
          el.style.display = (personEl && el.id === personId) ? 'block' : 'none';
        });

        if (personEl && personMatch) {
          document.title = decodeURIComponent(personMatch[1]) + ' — GOON SQUAD';
        } else if (isDossier) document.title = ${dossierTitleJson};
        else if (isPermafleet) document.title = ${permafleetTitleJson};
        else if (isSchedule) document.title = ${scheduleTitleJson};
        else document.title = ${titleJson};

        var status = document.getElementById('session-status');
        var identityBox = document.getElementById('session-identity');
        var btnDesktop = document.getElementById('login-desktop');
        var btnPassport = document.getElementById('login-passport');

        function setLoginCtAsVisible (visible) {
          document.querySelectorAll('a.footer-login-button, .site-nav a[href="' + loginPath + '"]').forEach(function (el) {
            var target = el.closest('.site-nav-item') || el;
            target.style.display = visible ? '' : 'none';
          });
          if (btnDesktop) btnDesktop.disabled = !visible;
          if (btnPassport) btnPassport.disabled = !visible;
          if (!visible && status && isLogin) {
            status.textContent = 'Login unavailable — Hub API proxy is unreachable.';
          }
        }

        // Probe Hub via same-origin proxy (OPTIONS /services/rpc). Hide Login CTAs when Hub is down.
        window.fetch('/services/rpc', {
          method: 'OPTIONS',
          headers: { Accept: 'application/json' },
          cache: 'no-store'
        }).then(function (res) {
          if (res.status === 502 || res.status === 503 || res.status === 504) {
            setLoginCtAsVisible(false);
            return null;
          }
          return res.text().then(function (t) {
            try {
              var j = t ? JSON.parse(t) : null;
              if (j && (j.error === 'hub-unreachable' || j.error === 'Hub unreachable')) {
                setLoginCtAsVisible(false);
              }
            } catch (e) {}
          });
        }).catch(function () {
          setLoginCtAsVisible(false);
        });

        if (!status || !btnDesktop || !btnPassport) return;

        var pollTimer = null;
        var passportWait = null;

        function setBusy (busy) {
          btnDesktop.disabled = !!busy;
          btnPassport.disabled = !!busy;
        }

        function clearPoll () {
          if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        }

        function storeSignedIdentity (payload) {
          try {
            var row = {
              identity: payload.identity || null,
              pubkeyHex: payload.pubkeyHex || null,
              delegationToken: payload.delegationToken || null,
              signer: payload.signer || 'client',
              linkedAt: Date.now()
            };
            window.localStorage.setItem('fabric.identity.session', JSON.stringify(row));
            if (payload.delegationToken) {
              window.localStorage.setItem('fabric.delegation', JSON.stringify({
                token: payload.delegationToken,
                linkedAt: row.linkedAt,
                origin: window.location.origin
              }));
            }
            if (identityBox) {
              identityBox.style.display = 'block';
              identityBox.innerHTML = '<strong>Signed in</strong><br/>id <code>' +
                (payload.identity && payload.identity.id ? String(payload.identity.id) : '—') +
                '</code><br/>signer <code>' + (payload.signer || 'client') + '</code>';
            }
          } catch (e) {}
        }

        function pollSigned (sessionId, pollSecret, onDone) {
          var tries = 0;
          clearPoll();
          pollTimer = setInterval(function () {
            tries += 1;
            if (tries > 90) {
              clearPoll();
              status.textContent = 'Timed out waiting for approval. Unlock your wallet and try again.';
              setBusy(false);
              return;
            }
            var pollHeaders = { Accept: 'application/json' };
            if (pollSecret) pollHeaders['X-Fabric-Poll-Secret'] = pollSecret;
            window.fetch('/sessions/' + encodeURIComponent(sessionId), {
              headers: pollHeaders,
              cache: 'no-store'
            }).then(function (res) { return res.json().then(function (j) { return { ok: res.ok, j: j }; }); })
              .then(function (r) {
                if (!r.ok) return;
                if (r.j && r.j.status === 'signed') {
                  clearPoll();
                  storeSignedIdentity(r.j);
                  status.textContent = 'Signed in.';
                  setBusy(false);
                  if (typeof onDone === 'function') onDone(r.j);
                }
              }).catch(function () {});
          }, 1500);
        }

        function createSession () {
          var origin = window.location.origin;
          return window.fetch('/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ origin: origin })
          }).then(function (res) {
            return res.json().then(function (j) { return { ok: res.ok, j: j }; });
          });
        }

        btnDesktop.addEventListener('click', function () {
          setBusy(true);
          status.textContent = 'Starting Fabric login…';
          createSession().then(function (r) {
            if (!r.ok || !r.j || !r.j.ok) {
              status.textContent = 'Session create failed: ' + ((r.j && r.j.error) || 'unknown');
              setBusy(false);
              return;
            }
            var protocolUrl = r.j.protocolUrl ||
              ('fabric://login?sessionId=' + encodeURIComponent(r.j.sessionId) +
                '&hub=' + encodeURIComponent(window.location.origin));
            status.textContent = 'Approve the request in GoonCitizen (or your Fabric desktop app)…';
            var a = document.createElement('a');
            a.href = protocolUrl;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            pollSigned(r.j.sessionId, r.j.pollSecret);
          }).catch(function (error) {
            status.textContent = 'Session create failed: ' + error.message;
            setBusy(false);
          });
        });

        btnPassport.addEventListener('click', function () {
          setBusy(true);
          status.textContent = 'Starting Passport login…';
          if (passportWait) {
            window.removeEventListener('message', passportWait);
            passportWait = null;
          }
          createSession().then(function (r) {
            if (!r.ok || !r.j || !r.j.ok) {
              status.textContent = 'Session create failed: ' + ((r.j && r.j.error) || 'unknown');
              setBusy(false);
              return;
            }
            var sessionId = r.j.sessionId;
            var message = r.j.message;
            passportWait = function (event) {
              if (event.origin !== window.location.origin) return;
              var d = event.data;
              if (!d || d.source !== 'fabric-passport' || d.type !== 'FABRIC_SITE_LOGIN_RESULT') return;
              window.removeEventListener('message', passportWait);
              passportWait = null;
              if (!d.ok) {
                status.textContent = 'Passport: ' + (d.error || 'rejected');
                clearPoll();
                setBusy(false);
                return;
              }
              status.textContent = 'Passport approved — confirming session…';
            };
            window.addEventListener('message', passportWait);
            window.postMessage({
              source: 'fabric-site',
              type: 'FABRIC_SITE_LOGIN_REQUEST',
              sessionId: sessionId,
              hub: window.location.origin,
              origin: window.location.origin,
              message: message
            }, window.location.origin);
            status.textContent = 'Open the Passport popup and approve the sign-in…';
            pollSigned(sessionId, r.j.pollSecret);
          }).catch(function (error) {
            status.textContent = 'Session create failed: ' + error.message;
            setBusy(false);
          });
        });

        try {
          var existing = window.localStorage.getItem('fabric.identity.session');
          if (existing && identityBox) {
            var parsed = JSON.parse(existing);
            if (parsed && parsed.identity) {
              identityBox.style.display = 'block';
              identityBox.innerHTML = '<strong>Already signed in</strong><br/>id <code>' +
                String(parsed.identity.id || '—') + '</code>';
            }
          }
        } catch (e) {}
      })();
    </script>
    ${permafleetScript}
  </body>
</html>
`;
  }
}

module.exports = GoonSPA;
