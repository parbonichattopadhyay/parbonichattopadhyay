const EMAIL = document.body.dataset.email;
const desk = document.getElementById('desk');
const isPhone = () => window.matchMedia('(max-width: 760px)').matches;

/* ============================================================
   CLOCKS (New York time)
   ============================================================ */
function tick() {
  const now = new Date();
  const tz = { timeZone: 'America/New_York' };
  document.getElementById('menu-clock').textContent =
    now.toLocaleDateString('en-US', { ...tz, weekday: 'short', month: 'short', day: 'numeric' }) + '  ' +
    now.toLocaleTimeString('en-US', { ...tz, hour: 'numeric', minute: '2-digit' });
  const dt = document.getElementById('dc-time');
  if (dt) dt.textContent = now.toLocaleTimeString('en-US', { ...tz, hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, '');
  const dd = document.getElementById('dc-date');
  if (dd) dd.textContent = now.toLocaleDateString('en-US', { ...tz, weekday: 'long', month: 'long', day: 'numeric' });
  const bc = document.getElementById('big-clock');
  if (bc) bc.textContent =
    now.toLocaleTimeString('en-US', { ...tz, hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, '');
  const bd = document.getElementById('big-date');
  if (bd) bd.textContent =
    now.toLocaleDateString('en-US', { ...tz, weekday: 'long', month: 'long', day: 'numeric' });
}
tick();
setInterval(tick, 15000);

/* ============================================================
   WINDOWS
   ============================================================ */
let z = 100;
let cascade = 0;
const openers = new Map();

function focusWin(win) {
  document.querySelectorAll('.win.active').forEach((w) => w.classList.remove('active'));
  win.classList.add('active');
  win.style.zIndex = ++z;
}

function placeWin(win) {
  if (isPhone() || win.dataset.placed) return;
  const r = desk.getBoundingClientRect();
  const w = win.offsetWidth, h = win.offsetHeight;
  const off = (cascade++ % 6) * 28;
  const left = Math.max(12, (r.width - w) / 2 + off - 60);
  const top = Math.max(12, Math.min((r.height - h) / 2 - 40 + off, r.height - h - 100));
  win.style.left = left + 'px';
  win.style.top = top + 'px';
  win.dataset.placed = '1';
}

function openWin(id, opener) {
  const win = document.getElementById('win-' + id);
  if (!win) return;
  win.hidden = false;
  placeWin(win);
  focusWin(win);
  if (opener) openers.set(win, opener);
  win.querySelector('.win-close').focus({ preventScroll: true });
}

function closeWin(win) {
  win.hidden = true;
  win.classList.remove('active');
  const back = openers.get(win);
  if (back && document.contains(back)) back.focus({ preventScroll: true });
}

// any element with data-open="id" opens that window (dock, menu bar, file list)
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-open]');
  if (!t || t.classList.contains('icon')) return; // desktop icons handled below
  openWin(t.dataset.open, t);
});

document.querySelectorAll('.win').forEach((win) => {
  win.querySelector('.win-close').addEventListener('click', () => closeWin(win));
  win.addEventListener('pointerdown', () => focusWin(win));

  // drag by the title bar
  const bar = win.querySelector('.win-bar');
  let s = null;
  bar.addEventListener('pointerdown', (e) => {
    if (isPhone() || e.target.closest('button')) return;
    s = { x: e.clientX, y: e.clientY, left: win.offsetLeft, top: win.offsetTop };
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', (e) => {
    if (!s) return;
    const r = desk.getBoundingClientRect();
    const left = Math.min(Math.max(s.left + e.clientX - s.x, -win.offsetWidth + 80), r.width - 80);
    const top = Math.min(Math.max(s.top + e.clientY - s.y, 0), r.height - 48);
    win.style.left = left + 'px';
    win.style.top = top + 'px';
  });
  const end = () => { s = null; };
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
});

// Esc closes the window on top
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const active = document.querySelector('.win.active:not([hidden])');
  if (active) closeWin(active);
});

/* ============================================================
   DESKTOP ICONS — click opens, drag moves
   ============================================================ */
document.querySelectorAll('.icon').forEach((icon) => {
  let s = null;
  let dragged = false;

  icon.addEventListener('pointerdown', (e) => {
    dragged = false;
    if (isPhone()) return;
    s = { x: e.clientX, y: e.clientY, left: icon.offsetLeft, top: icon.offsetTop, moved: false };
    icon.setPointerCapture(e.pointerId);
  });
  icon.addEventListener('pointermove', (e) => {
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (!s.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
    s.moved = true;
    icon.classList.add('dragging');
    const r = desk.getBoundingClientRect();
    icon.style.left = Math.min(Math.max(s.left + dx, 0), r.width - icon.offsetWidth) + 'px';
    icon.style.top = Math.min(Math.max(s.top + dy, 0), r.height - icon.offsetHeight) + 'px';
  });
  const end = () => {
    if (s && s.moved) dragged = true;
    icon.classList.remove('dragging');
    s = null;
  };
  icon.addEventListener('pointerup', end);
  icon.addEventListener('pointercancel', end);

  icon.addEventListener('click', () => {
    if (dragged) { dragged = false; return; }
    openWin(icon.dataset.open, icon);
  });
});

/* ============================================================
   MESSAGES — copy email + composer that opens a real email
   ============================================================ */
const toast = document.getElementById('toast');
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelectorAll('.copy-email').forEach((b) => {
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(EMAIL); showToast('email copied ✓'); }
    catch { window.location.href = 'mailto:' + EMAIL; }
  });
});

const composer = document.getElementById('composer');
composer.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = composer.querySelector('input');
  const text = input.value.trim();
  if (!text) { input.focus(); return; }

  // show it as a sent bubble, then hand off to the visitor's email app
  const bubble = document.createElement('div');
  bubble.className = 'bubble me';
  bubble.textContent = text;
  composer.before(bubble);
  input.value = '';
  bubble.scrollIntoView({ block: 'nearest' });

  setTimeout(() => {
    window.location.href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent('Hi from your portfolio') +
      '&body=' + encodeURIComponent(text);
  }, 500);
});

/* say hello on first visit to a big screen */
if (!isPhone()) setTimeout(() => openWin('about'), 600);

/* ============================================================
   LIVE DEMO — swap the play button for the real app on click
   ============================================================ */
document.querySelectorAll('.live-demo').forEach((demo) => {
  const start = demo.querySelector('.live-start');
  const stage = demo.querySelector('.live-stage');
  start.addEventListener('click', () => {
    const note = document.createElement('p');
    note.className = 'live-loading';
    note.textContent = 'waking up the server…';
    const frame = document.createElement('iframe');
    frame.src = demo.dataset.src;
    frame.title = demo.dataset.title || 'Live demo';
    frame.loading = 'eager';
    frame.allow = 'geolocation';
    frame.addEventListener('load', () => note.remove());
    stage.replaceChildren(note, frame);
  });
});

/* ============================================================
   PINBOARD — drag items around (a drag never counts as a click)
   ============================================================ */
(function () {
  const board = document.querySelector('.pinboard');
  if (!board) return;
  let top = 10;
  board.querySelectorAll('img, a').forEach((n) => n.setAttribute('draggable', 'false'));
  board.querySelectorAll('.pcard, .pphoto, .clip-wrap').forEach((el) => {
    let s = null, dragged = false;
    el.addEventListener('pointerdown', (e) => {
      if (isPhone() || e.button !== 0) return;
      dragged = false;
      s = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop, moved: false };
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!s) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (!s.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
      if (!s.moved) { s.moved = true; el.classList.add('is-dragging'); el.style.zIndex = ++top; }
      el.style.left = s.left + dx + 'px';
      el.style.top = s.top + dy + 'px';
    });
    const end = () => {
      if (s && s.moved) { dragged = true; el.style.zIndex = top; }
      el.classList.remove('is-dragging');
      s = null;
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    // swallow the click that ends a drag, so dragging doesn't open a window or link
    el.addEventListener('click', (e) => {
      if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; }
    }, true);
  });
})();

/* ============================================================
   TRASH — "empty" it, then the items come back next time
   ============================================================ */
document.querySelectorAll('.empty-trash').forEach((btn) => {
  btn.addEventListener('click', () => {
    const list = btn.parentElement.querySelector('.trashlist');
    list.classList.add('emptied');
    btn.textContent = 'trash emptied ✓';
    btn.disabled = true;
    setTimeout(() => {
      list.classList.remove('emptied');
      btn.textContent = 'Empty trash';
      btn.disabled = false;
    }, 4000);
  });
});

/* dock: show a "running" dot under apps whose window is open */
(function () {
  const sync = () => document.querySelectorAll('.dock button[data-open]').forEach((b) => {
    const w = document.getElementById('win-' + b.dataset.open);
    b.classList.toggle('running', !!w && !w.hidden);
  });
  new MutationObserver(sync).observe(document.getElementById('desk'), { subtree: true, attributes: true, attributeFilter: ['hidden'] });
  sync();
})();

/* dock: bounce an app when it's clicked, like macOS launching it */
document.querySelectorAll('.dock button').forEach((b) => b.addEventListener('click', () => {
  b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce');
}));

/* quick-reply chips fill the composer */
document.querySelectorAll('.chip-reply').forEach((c) => c.addEventListener('click', () => {
  const input = document.getElementById('msg');
  input.value = c.textContent.replace(/\s*☕$/, '');
  input.focus();
}));
