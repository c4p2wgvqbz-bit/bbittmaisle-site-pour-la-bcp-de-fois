// ========================================
// MAINTENANCE MODE TOGGLE
// ========================================
// 🎯 CHANGE THIS TO ACTIVATE/DEACTIVATE MAINTENANCE MODE
const maintenanceMode = false; // Set to 'true' to enable maintenance page

// ========================================
// script.js — gestion badge / thèmes / overlays / ep-cards / lecteur vidéo / maintenance
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Check if maintenance mode is enabled FIRST
  if (maintenanceMode) {
    displayMaintenancePage();
    return; // Stop all other script execution
  }

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const overlay = $('#overlay');
  const overlayInner = $('#overlay-inner');
  const overlayContent = $('#overlay-content');
  const overlayClose = $('#overlay-close');

  const newsBtn = $('#btn-news');
  const newsBadge = $('#news-badge');

  const ovalLearn = $('#oval-learn');
  const themeToggle = $('#theme-toggle');
  const THEME_KEY = 'brad_theme_pref';
  const NEWS_SEEN_KEY = 'brad_news_seen';

  /* NEWS badge logic (show on load, hide on click; no persistence) */
  function refreshNewsBadge() {
    if (!newsBadge) return;
    newsBadge.hidden = false;
    newsBadge.style.display = '';
  }

  function markNewsRead() {
    if (newsBadge) {
      newsBadge.hidden = true;
      newsBadge.style.display = 'none';
    }
  }

  // utilitaire runtime pour réactiver le badge
  window.__brad_resetNews = () => {
    if (newsBadge) {
      newsBadge.hidden = false;
      newsBadge.style.display = '';
    }
    console.log('Badge "Nouveautés" réactivé (runtime).');
  };

  // initialize badge
  refreshNewsBadge();

  // --- NEWS history data (modifiable facilement) ---
  const NEWS_HISTORY = [
    {
      version: '1.1',
      date: '14-02-2026',
      teaser: 'Cette mise à jour apporte plusieurs améliorations importantes pour rendre l\'expérience plus claire, plus moderne et plus agréable à utiliser.',
      detailHtml: `<p>Amélioration de la rubrique "Nouveautés", avec un affichage plus clair des versions. Correction du badge « 1 », qui disparaît désormais lorsqu'il est consulté. Ajout d'un bouton "Suivi du jeu" dans la section "Brad Bitt, mais le jeu" pour accéder directement au développement du projet. Optimisation générale de l'interface sur ordinateur.</p>`
    },
    {
      version: '1.0',
      date: '14-01-2026',
      teaser: 'Lancement initial du site.',
      detailHtml: `<p>Première version publique contenant la page principale, les cartes Episodes/Musiques/Lore et le lecteur intégré pour les épisodes.</p>`
    }
  ];

  // Panels content (welcome = en savoir plus)
  const PANELS = {
    welcome: `
      <h2>En savoir plus</h2>
      <p>Ce site rassemble tout ce qui gravite autour de Brad Bitt : les expériences interactives, les épisodes, les ambiances sonores et les éléments de récit qui donnent vie à ce monde.</p>

      <p>Vous pouvez y découvrir le futur jeu et son univers, suivre les aventures de Brad à travers de courts épisodes, et explorer peu à peu l'histoire qui se dessine en arrière-plan.</p>

      <p>Certains contenus sont déjà accessibles, d'autres arriveront progressivement. L'idée est simple : offrir un point d'entrée clair pour explorer, comprendre et suivre l'évolution du projet.</p>

      <p>Utilisez les boutons « Découvrir » et « Voir » pour naviguer librement entre les contenus.</p>
    `,
    news: `
      <h2>Nouveautés</h2>
      <p>C'est ici que vous trouverez les dernières mises à jour du site et des contenus ajoutés récemment.</p>
    `,
    game: `
      <h2>Brad Bitt — Le jeu</h2>
      <p>Aperçu du jeu, mécaniques et notes de développement.</p>
    `
  };

  function buildNewsHtml() {
    const items = NEWS_HISTORY.map((n, idx) => `
      <article class="news-card" tabindex="0" data-index="${idx}" aria-expanded="false">
        <div class="meta">
          <div class="version">v${n.version}</div>
          <div class="date">${n.date}</div>
        </div>
        <div class="teaser">${n.teaser}</div>
        <div class="detail">${n.detailHtml}</div>
      </article>
    `).join('');
    return `<h2>Nouveautés</h2><div class="news-list">${items}</div>`;
  }

  function attachNewsHandlers() {
    const cards = Array.from(overlayContent.querySelectorAll('.news-card'));
    cards.forEach(card => {
      const idx = card.getAttribute('data-index');
      card.addEventListener('click', (e) => {
        const expanded = card.classList.toggle('expanded');
        card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const expanded = card.classList.toggle('expanded');
          card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
      });
    });
  }

  /* Overlay open/close + video player injection */
  let lastFocused = null;
  function openPanel(key, options = {}) {
    if (!overlay || !overlayContent || !overlayInner) return;

    let html;
    if (key === 'news') {
      html = buildNewsHtml();
    } else {
      html = (PANELS[key] || (options.html || `<p>Contenu à venir</p>`));
    }

    overlayContent.innerHTML = html;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    lastFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    overlayInner.focus();

    if (key === 'news') markNewsRead();

    if (key === 'news') {
      requestAnimationFrame(() => attachNewsHandlers());
    }
  }

  function closePanel() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    if (overlayContent) overlayContent.innerHTML = '';
  }

  if (overlayClose) overlayClose.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) closePanel(); });

  /* open 'welcome' from the oval button (En savoir plus) */
  if (ovalLearn) {
    ovalLearn.addEventListener('click', () => openPanel('welcome'));
  }

  /* ep-card flip & visionner handler */
  $$('.ep-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      card.classList.toggle('flipped');
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        card.classList.toggle('flipped');
        e.preventDefault();
      }
    });
  });

  // handle Visionner / Voir button clicks (delegated)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-visionner');
    if (!btn) return;
    const videoId = btn.getAttribute('data-video') || btn.closest('.ep-card')?.getAttribute('data-video');
    if (!videoId) {
      openPanel(null, { html: '<p>Vidéo indisponible.</p>' });
      return;
    }
    const playerHtml = `
      <h2>Lecture</h2>
      <div class="video-wrap">
        <iframe src="https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1" 
                title="Vidéo" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
      </div>
      <p style="margin-top:12px;color:var(--muted)">Fermez la fenêtre pour revenir au site.</p>
    `;
    openPanel(null, { html: playerHtml });
  });

  /* Theme: robuste + logo switching (folder 'images') */
  const logoImg = document.getElementById('site-logo');

  function updateLogoForTheme(pref) {
    if (!logoImg) return;

    if (pref === 'light') {
      logoImg.src = 'images/logo bb site clair.png';
    } else if (pref === 'dark') {
      logoImg.src = 'images/logo bb site sombre.png';
    } else {
      const mm = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
      const isLight = mm ? mm.matches : true;
      logoImg.src = isLight
        ? 'images/logo bb site clair.png'
        : 'images/logo bb site sombre.png';
    }
  }

  function applyTheme(pref = 'auto', save = false) {
    try {
      const root = document.documentElement;

      if (pref === 'light') {
        root.setAttribute('data-theme', 'light');
      } else if (pref === 'dark') {
        root.removeAttribute('data-theme');
      } else {
        const mm = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
        const isLight = mm ? mm.matches : true;
        if (isLight) root.setAttribute('data-theme', 'light');
        else root.removeAttribute('data-theme');
      }

      if (themeToggle) {
        themeToggle.classList.remove('is-light','is-dark');
        if (pref === 'light') themeToggle.classList.add('is-light');
        else if (pref === 'dark') themeToggle.classList.add('is-dark');
        const title = pref === 'auto' ? 'Mode : automatique' : (pref === 'light' ? 'Mode : clair' : 'Mode : sombre');
        themeToggle.setAttribute('title', title);
        themeToggle.setAttribute('aria-label', title);
      }

      updateLogoForTheme(pref);

      if (save) {
        try { localStorage.setItem(THEME_KEY, pref); } catch(e) {}
      }
    } catch (e) { /* ignore */ }
  }

  // initial read + apply
  try {
    const saved = localStorage.getItem(THEME_KEY) || 'auto';
    applyTheme(saved, false);
  } catch(e){ applyTheme('auto', false); }

  // cycle through modes on click: auto -> light -> dark -> auto
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = localStorage.getItem(THEME_KEY) || 'auto';
      const order = ['auto','light','dark'];
      const next = order[(order.indexOf(current) + 1) % order.length];
      applyTheme(next, true);
    });
  }

  /* --- Reveal elements on load --- */
  (function revealOnLoad() {
    const reveals = $$('.reveal');
    if (!reveals.length) return;
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 80 * i);
    });
  })();

  // News button handlers (badge / open panel)
  if (newsBtn) {
    newsBtn.addEventListener('click', () => {
      markNewsRead();
      openPanel('news');
    });
  }
  if (newsBadge) {
    newsBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      markNewsRead();
    });
  }

});

// ========================================
// MAINTENANCE PAGE FUNCTION
// ========================================
function displayMaintenancePage() {
  // Hide all main content
  const header = document.querySelector('.site-header');
  const appMain = document.getElementById('app-main');
  const footer = document.querySelector('.site-footer');
  const overlay = document.getElementById('overlay');

  if (header) header.style.display = 'none';
  if (appMain) appMain.style.display = 'none';
  if (footer) footer.style.display = 'none';
  if (overlay) overlay.style.display = 'none';

  // Create maintenance overlay
  const maintenanceOverlay = document.createElement('div');
  maintenanceOverlay.className = 'maintenance-overlay';
  maintenanceOverlay.innerHTML = `
    <div class="maintenance-container">
      <!-- Logo -->
      <div class="maintenance-logo">
        <img src="images/logo bb site clair.png" alt="Logo Brad Bitt" id="maintenance-logo-img" />
      </div>

      <!-- Main Text -->
      <div class="maintenance-content">
        <h1 class="maintenance-title">Maintenance en cours</h1>
        <p class="maintenance-subtitle">Pas de panique, le site sera accessible d'ici quelques minutes.</p>
      </div>

      <!-- Audio Player -->
      <div class="maintenance-player">
        <div class="player-header">
          <span class="artist-name">lılYº</span>
        </div>
        
        <div class="player-controls">
          <button class="player-btn play-btn" id="maintenance-play-btn" aria-label="Play/Pause">
            <svg class="icon-play" viewBox="0 0 24 24" width="20" height="20">
              <polygon points="5 3 19 12 5 21" fill="currentColor" />
            </svg>
            <svg class="icon-pause" viewBox="0 0 24 24" width="20" height="20" style="display:none;">
              <rect x="6" y="4" width="4" height="16" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" fill="currentColor" />
            </svg>
          </button>

          <div class="player-progress">
            <div class="progress-bar" id="maintenance-progress">
              <div class="progress-fill" id="maintenance-progress-fill"></div>
            </div>
            <span class="time-display" id="maintenance-time">0:00 / 0:00</span>
          </div>
        </div>
      </div>
    </div>

    <audio id="maintenance-audio" crossorigin="anonymous"></audio>
  `;

  document.body.appendChild(maintenanceOverlay);

  // Update logo according to current theme
  updateMaintenanceLogo();

  // Listen for theme changes and update logo
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', updateMaintenanceLogo);
  }

  // Initialize audio player
  initializeMaintenanceAudioPlayer();
}

function updateMaintenanceLogo() {
  const logoImg = document.getElementById('maintenance-logo-img');
  if (!logoImg) return;

  const root = document.documentElement;
  const isLight = root.getAttribute('data-theme') === 'light';
  
  logoImg.src = isLight
    ? 'images/logo bb site clair.png'
    : 'images/logo bb site sombre.png';
}

function initializeMaintenanceAudioPlayer() {
  const audio = document.getElementById('maintenance-audio');
  const playBtn = document.getElementById('maintenance-play-btn');
  const progressBar = document.getElementById('maintenance-progress');
  const progressFill = document.getElementById('maintenance-progress-fill');
  const timeDisplay = document.getElementById('maintenance-time');
  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');

  // Set audio source (UPDATE THIS PATH TO YOUR ACTUAL FILE)
  audio.src = 'musiques/maintenance/v1.1.mp3';

  // Play/Pause button
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(err => console.warn('Audio autoplay prevented by browser', err));
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
      playBtn.classList.add('playing');
    } else {
      audio.pause();
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      playBtn.classList.remove('playing');
    }
  });

  // Update progress bar
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = percent + '%';
      updateMaintenanceTimeDisplay();
    }
  });

  // Clickable progress bar
  progressBar.addEventListener('click', (e) => {
    if (audio.duration) {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audio.currentTime = percent * audio.duration;
    }
  });

  // Time display update
  function updateMaintenanceTimeDisplay() {
    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime % 60);
    const durationMinutes = Math.floor(audio.duration / 60);
    const durationSeconds = Math.floor(audio.duration % 60);

    timeDisplay.textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
  }

  // Handle metadata
  audio.addEventListener('loadedmetadata', updateMaintenanceTimeDisplay);
  audio.addEventListener('ended', () => {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
    playBtn.classList.remove('playing');
  });
}
