/**
 * STRIVE & THRIVE — UI Utilities (ui.js)
 * ============================================================
 * Handles all shared, stateless UI interactions:
 *  - Nav tab switching
 *  - Progress bar updates (animated)
 *  - Modal open/close
 *  - Toast notifications
 *  - Button ripple effect
 *  - Screen transitions
 *  - Number counters (animated count-up)
 *  - Confetti (game win)
 *
 * Usage: import or <script src="js/ui.js"> before other scripts.
 * All functions live on the global `UI` object.
 * ============================================================
 */

const UI = (() => {

  /* ──────────────────────────────────────────────────────────
     1. NAV TAB SWITCHING
     ────────────────────────────────────────────────────────── */

  /**
   * Initialise a nav bar so that clicking a tab:
   *   - Sets that tab to nav-tab--active
   *   - Sets all others to nav-tab--inactive
   *   - Optionally calls an onChange callback
   *
   * @param {string|Element} navBarSelector  CSS selector OR Element for the .nav-bar
   * @param {function}       onChange        Optional: called with (tabId) on change
   *
   * HTML convention:  each tab button must have  data-tab="someId"
   *   <button class="nav-tab nav-tab--active"   data-tab="information">Information</button>
   *   <button class="nav-tab nav-tab--inactive"  data-tab="decisions">Decisions</button>
   */
  function initNavBar(navBarSelector, onChange) {
    const bar = typeof navBarSelector === 'string'
      ? document.querySelector(navBarSelector)
      : navBarSelector;
    if (!bar) return;

    const tabs = bar.querySelectorAll('.nav-tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Skip if already active
        if (tab.classList.contains('nav-tab--active')) return;

        // Deactivate all
        tabs.forEach(t => {
          t.classList.remove('nav-tab--active');
          t.classList.add('nav-tab--inactive');
        });

        // Activate clicked
        tab.classList.remove('nav-tab--inactive');
        tab.classList.add('nav-tab--active');

        const tabId = tab.dataset.tab || tab.textContent.trim().toLowerCase();
        if (typeof onChange === 'function') onChange(tabId);
      });
    });
  }

  /**
   * Programmatically switch to a specific tab by its data-tab value.
   *
   * @param {string|Element} navBarSelector
   * @param {string}         tabId   Value of data-tab attribute
   */
  function switchTab(navBarSelector, tabId) {
    const bar = typeof navBarSelector === 'string'
      ? document.querySelector(navBarSelector)
      : navBarSelector;
    if (!bar) return;

    const tabs = bar.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      const id = tab.dataset.tab || tab.textContent.trim().toLowerCase();
      if (id === tabId) {
        tab.classList.add('nav-tab--active');
        tab.classList.remove('nav-tab--inactive');
      } else {
        tab.classList.remove('nav-tab--active');
        tab.classList.add('nav-tab--inactive');
      }
    });
  }

  /**
   * Get the currently active tab's data-tab id.
   *
   * @param  {string|Element} navBarSelector
   * @returns {string|null}
   */
  function getActiveTab(navBarSelector) {
    const bar = typeof navBarSelector === 'string'
      ? document.querySelector(navBarSelector)
      : navBarSelector;
    if (!bar) return null;
    const active = bar.querySelector('.nav-tab--active');
    if (!active) return null;
    return active.dataset.tab || active.textContent.trim().toLowerCase();
  }

  /* ──────────────────────────────────────────────────────────
     2. PROGRESS BAR (HEALTH BARS)
     ────────────────────────────────────────────────────────── */

  /**
   * Animate a progress bar to a new percentage value.
   *
   * @param {string|Element} fillEl      CSS selector OR Element for .progress-bar__fill (or .stat-bar-fill)
   * @param {number}         newValue    Target value (0–100)
   * @param {string|Element} [valueEl]   Optional: element whose textContent will be updated with "X%"
   * @param {object}         [opts]
   * @param {number}         [opts.duration=600]   Animation duration in ms
   * @param {boolean}        [opts.flash=true]     Flash green/red on change
   *
   * Example:
   *   UI.setBar('#phys-fill', 58, '#phys-value');
   */
  function setBar(fillEl, newValue, valueEl, opts = {}) {
    const fill = typeof fillEl === 'string' ? document.querySelector(fillEl) : fillEl;
    const label = valueEl
      ? (typeof valueEl === 'string' ? document.querySelector(valueEl) : valueEl)
      : null;

    if (!fill) return;

    const clamped = Math.max(0, Math.min(100, newValue));
    const prev = parseFloat(fill.style.width) || 0;
    const { duration = 600, flash = true } = opts;

    // Animate width
    fill.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    fill.style.width = clamped + '%';

    // Animate counter in label
    if (label) {
      _countUp(label, prev, clamped, duration, v => Math.round(v) + '%');
    }

    // Flash the bar container
    if (flash && clamped !== prev) {
      const track = fill.closest('.progress-bar__track') || fill.closest('.stat-bar-track') || fill.parentElement;
      const cls = clamped > prev ? 'flash-positive' : 'flash-negative';
      if (track) {
        track.classList.remove('flash-positive', 'flash-negative');
        void track.offsetWidth; // reflow
        track.classList.add(cls);
        setTimeout(() => track.classList.remove(cls), 800);
      }
    }
  }

  /**
   * Animate all four stat values at once.
   * Expects an object with ids pointing to fill + label elements.
   *
   * @param {object} stats   e.g. { physical: 65, mental: 48, cash: 200000000, investment: 50000000 }
   * @param {object} els     Element references:
   *   {
   *     physFill, physLabel,
   *     mentFill, mentLabel,
   *     cashLabel,
   *     investLabel
   *   }
   */
  function updateAllStats(stats, els) {
    if (stats.physical !== undefined && els.physFill) {
      setBar(els.physFill, stats.physical, els.physLabel || null);
    }
    if (stats.mental !== undefined && els.mentFill) {
      setBar(els.mentFill, stats.mental, els.mentLabel || null);
    }
    if (stats.cash !== undefined && els.cashLabel) {
      const prev = _parseNumText(els.cashLabel.textContent);
      _countUp(els.cashLabel, prev, stats.cash, 700, v => formatVND(Math.round(v)));
      _flashEl(els.cashLabel, stats.cash > prev);
    }
    if (stats.investment !== undefined && els.investLabel) {
      const prev = _parseNumText(els.investLabel.textContent);
      _countUp(els.investLabel, prev, stats.investment, 700, v => formatVND(Math.round(v)));
      _flashEl(els.investLabel, stats.investment > prev);
    }
  }

  /* ──────────────────────────────────────────────────────────
     3. MODALS
     ────────────────────────────────────────────────────────── */

  /**
   * Open a modal overlay by selector or element.
   *
   * @param {string|Element} modal
   */
  function openModal(modal) {
    const el = typeof modal === 'string' ? document.querySelector(modal) : modal;
    if (!el) return;
    el.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent page scroll behind overlay
  }

  /**
   * Close a modal overlay.
   *
   * @param {string|Element} modal
   */
  function closeModal(modal) {
    const el = typeof modal === 'string' ? document.querySelector(modal) : modal;
    if (!el) return;
    el.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Show a confirm modal with custom title, body, and callbacks.
   * Uses the existing #confirm-modal element in the DOM (or creates one).
   *
   * @param {object} opts
   * @param {string}   opts.title
   * @param {string}   opts.body
   * @param {string}   [opts.confirmText='Confirm']
   * @param {string}   [opts.cancelText='Cancel']
   * @param {function} opts.onConfirm
   * @param {function} [opts.onCancel]
   */
  function showConfirm(opts) {
    let modal = document.getElementById('st-confirm-modal');
    if (!modal) {
      modal = _createConfirmModal();
      document.body.appendChild(modal);
    }

    modal.querySelector('.modal-card__title').textContent    = opts.title  || 'Are you sure?';
    modal.querySelector('.modal-card__body').textContent     = opts.body   || '';

    const confirmBtn = modal.querySelector('[data-action="confirm"]');
    const cancelBtn  = modal.querySelector('[data-action="cancel"]');

    confirmBtn.innerHTML = `
      <svg class="icon-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:18px; height:18px; flex-shrink:0;">
        <path d="M9.27 17.47L3.74 11.94L5.12 10.56L9.27 14.71L18.18 5.8L19.56 7.18L9.27 17.47Z" fill="currentColor"/>
      </svg>
      ${opts.confirmText || 'Confirm'}
    `;
    cancelBtn.textContent  = opts.cancelText  || 'Cancel';

    // Replace listeners (clone trick)
    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel  = cancelBtn.cloneNode(true);
    confirmBtn.replaceWith(newConfirm);
    cancelBtn.replaceWith(newCancel);

    newConfirm.addEventListener('click', () => {
      closeModal(modal);
      if (typeof opts.onConfirm === 'function') opts.onConfirm();
    });
    newCancel.addEventListener('click', () => {
      closeModal(modal);
      if (typeof opts.onCancel === 'function') opts.onCancel();
    });

    // Click outside to cancel
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeModal(modal);
        if (typeof opts.onCancel === 'function') opts.onCancel();
      }
    }, { once: true });

    openModal(modal);
  }

  function _createConfirmModal() {
    const div = document.createElement('div');
    div.id = 'st-confirm-modal';
    div.className = 'modal-overlay';
    div.innerHTML = `
      <div class="modal-card--compact">
        <div class="modal-card__title"></div>
        <div class="modal-card__body"></div>
        <button class="btn-compact-cancel" data-action="cancel">Cancel</button>
        <button class="btn-compact-confirm" data-action="confirm">
          <svg class="icon-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:18px; height:18px; flex-shrink:0;">
            <path d="M9.27 17.47L3.74 11.94L5.12 10.56L9.27 14.71L18.18 5.8L19.56 7.18L9.27 17.47Z" fill="currentColor"/>
          </svg>
          Confirm
        </button>
      </div>`;
    return div;
  }

  /* ──────────────────────────────────────────────────────────
     4. TOAST NOTIFICATIONS
     ────────────────────────────────────────────────────────── */

  let _toastContainer = null;

  function _ensureToastContainer() {
    if (_toastContainer && document.body.contains(_toastContainer)) return _toastContainer;
    _toastContainer = document.querySelector('.toast-container');
    if (!_toastContainer) {
      _toastContainer = document.createElement('div');
      _toastContainer.className = 'toast-container';
      document.body.appendChild(_toastContainer);
    }
    return _toastContainer;
  }

  /**
   * Show a toast notification.
   *
   * @param {string} message
   * @param {object} [opts]
   * @param {'success'|'warning'|'danger'|''} [opts.type='']   Visual variant
   * @param {number}  [opts.duration=3000]   How long to show (ms). 0 = permanent.
   * @param {string}  [opts.icon]            Optional emoji icon prefix
   * @returns {Element}  The toast element (so caller can remove it manually)
   */
  function showToast(message, opts = {}) {
    const { type = '', duration = 3000, icon = '' } = opts;
    const container = _ensureToastContainer();

    const toast = document.createElement('div');
    toast.className = ['toast', type ? `toast--${type}` : ''].filter(Boolean).join(' ');
    toast.innerHTML = icon
      ? `<span style="margin-right:6px">${icon}</span>${message}`
      : message;

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 320);
      }, duration);
    }

    return toast;
  }

  // Convenience wrappers
  const toast = {
    success: (msg, opts) => showToast(msg, { type: 'success', icon: '✅', ...opts }),
    warning: (msg, opts) => showToast(msg, { type: 'warning', icon: '⚠️', ...opts }),
    danger:  (msg, opts) => showToast(msg, { type: 'danger',  icon: '❌', ...opts }),
    info:    (msg, opts) => showToast(msg, { type: '',        icon: 'ℹ️', ...opts }),
  };

  /* ──────────────────────────────────────────────────────────
     5. SCREEN TRANSITIONS
     ────────────────────────────────────────────────────────── */

  /**
   * Switch the visible screen.
   * Hides all .screen elements, shows the target one with an animation.
   *
   * @param {string} screenId   ID of the screen element to show
   * @param {'fade'|'slide-right'|'slide-left'} [direction='fade']
   */
  function showScreen(screenId, direction = 'fade') {
    const all = document.querySelectorAll('.screen');
    const target = document.getElementById(screenId);
    if (!target) return;

    all.forEach(s => {
      s.classList.remove('screen--active', 'screen--slide-in-right', 'screen--slide-in-left');
      s.style.display = 'none';
    });

    target.style.display = '';  // let CSS flex take over
    void target.offsetWidth;    // reflow

    const animClass = direction === 'slide-right' ? 'screen--slide-in-right'
                    : direction === 'slide-left'  ? 'screen--slide-in-left'
                    : '';

    target.classList.add('screen--active');
    if (animClass) target.classList.add(animClass);
  }

  /* ──────────────────────────────────────────────────────────
     6. BUTTON RIPPLE EFFECT
     ────────────────────────────────────────────────────────── */

  /**
   * Attach ripple effect to all .btn elements inside a root element.
   * Call once after inserting HTML, or on document load.
   *
   * @param {Element|Document} [root=document]
   */
  function initRipple(root) {
    (root || document).querySelectorAll('.btn').forEach(btn => {
      if (btn.dataset.rippleInit) return; // avoid double-binding
      btn.dataset.rippleInit = '1';
      btn.addEventListener('click', _rippleHandler);
    });
  }

  function _rippleHandler(e) {
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple-effect';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width  = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left   = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top    = (e.clientY - rect.top  - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  /* ──────────────────────────────────────────────────────────
     7. ANIMATED NUMBER COUNTER
     ────────────────────────────────────────────────────────── */

  /**
   * Animate a number counting from `from` to `to` inside an element.
   *
   * @param {Element}  el          Target element
   * @param {number}   from        Start value
   * @param {number}   to          End value
   * @param {number}   duration    Animation duration ms
   * @param {function} [format]    Optional formatter: (value) => string
   */
  function _countUp(el, from, to, duration, format) {
    if (!el) return;
    const fmt = format || (v => v.toFixed(0));
    const start = performance.now();
    const diff = to - from;

    function step(now) {
      const elapsed = Math.min(now - start, duration);
      const progress = _easeOut(elapsed / duration);
      el.textContent = fmt(from + diff * progress);
      if (elapsed < duration) requestAnimationFrame(step);
      else el.textContent = fmt(to);
    }

    requestAnimationFrame(step);
  }

  /**
   * Public version: count a number element from its current value to `to`.
   *
   * @param {string|Element} el
   * @param {number}         to
   * @param {object}         [opts]
   * @param {number}         [opts.duration=700]
   * @param {function}       [opts.format]   e.g. v => formatVND(v)
   */
  function countTo(el, to, opts = {}) {
    const elem = typeof el === 'string' ? document.querySelector(el) : el;
    if (!elem) return;
    const from = _parseNumText(elem.textContent);
    _countUp(elem, from, to, opts.duration || 700, opts.format);
  }

  /* ──────────────────────────────────────────────────────────
     8. HEALTH WARNING BANNER
     ────────────────────────────────────────────────────────── */

  /**
   * Insert or update a health warning banner inside a container.
   *
   * @param {string|Element} container   Where to prepend the banner
   * @param {string}         message     Warning text
   */
  function showHealthWarning(container, message) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;

    // Remove previous warning
    el.querySelector('.health-warning-banner')?.remove();

    const banner = document.createElement('div');
    banner.className = 'health-warning-banner';
    banner.innerHTML = `<span class="health-warning-banner__icon">⚠️</span><span>${message}</span>`;
    el.prepend(banner);
  }

  /* ──────────────────────────────────────────────────────────
     9. CONFETTI (game win)
     ────────────────────────────────────────────────────────── */

  /**
   * Fire a burst of confetti particles.
   *
   * @param {object} [opts]
   * @param {number} [opts.count=60]       Number of particles
   * @param {number} [opts.duration=2500]  How long particles fall (ms)
   */
  function fireConfetti(opts = {}) {
    const { count = 60, duration = 2500 } = opts;
    const colors = ['#2E395F','#5C8A3C','#C8874B','#4CAF50','#E53935','#FFD700','#B8C9D9'];

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'confetti-particle';
        el.style.left     = Math.random() * 100 + 'vw';
        el.style.top      = '-10px';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.width    = (Math.random() * 8 + 4) + 'px';
        el.style.height   = (Math.random() * 8 + 4) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        el.style.animationDuration = (Math.random() * 1500 + 1000) + 'ms';
        el.style.animationDelay   = Math.random() * 500 + 'ms';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), duration);
      }, Math.random() * 300);
    }
  }

  /* ──────────────────────────────────────────────────────────
     10. FORMATTING HELPERS
     ────────────────────────────────────────────────────────── */

  /**
   * Format a number as Vietnamese Dong with commas.
   * e.g. 1500000 → "1,500,000 VND"
   */
  function formatVND(amount) {
    return Math.round(amount).toLocaleString('vi-VN') + ' VND';
  }

  /**
   * Format a number as a compact currency.
   * e.g. 1500000 → "1.5M"
   */
  function formatCompact(amount) {
    if (Math.abs(amount) >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(2) + 'B';
    if (Math.abs(amount) >= 1_000_000)     return (amount / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(amount) >= 1_000)         return (amount / 1_000).toFixed(0) + 'K';
    return amount.toString();
  }

  /**
   * Format a percentage.
   * e.g. 70.5 → "70%"
   */
  function formatPct(value) {
    return Math.round(value) + '%';
  }

  /* ──────────────────────────────────────────────────────────
     11. PRIVATE HELPERS
     ────────────────────────────────────────────────────────── */

  function _easeOut(t) {
    return 1 - Math.pow(1 - t, 3); // cubic ease-out
  }

  /** Parse a number from a text like "1,500,000 VND" or "70%" */
  function _parseNumText(text) {
    if (!text) return 0;
    const cleaned = text.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  /** Flash an element green or red based on direction */
  function _flashEl(el, positive) {
    if (!el) return;
    const cls = positive ? 'flash-positive' : 'flash-negative';
    el.classList.remove('flash-positive', 'flash-negative');
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 800);
  }

  /* ──────────────────────────────────────────────────────────
     AUTO-INIT on DOMContentLoaded
     ────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    initRipple(document);
  });

  /* ──────────────────────────────────────────────────────────
     PUBLIC API
     ────────────────────────────────────────────────────────── */
  return {
    // Nav
    initNavBar,
    switchTab,
    getActiveTab,

    // Progress bars
    setBar,
    updateAllStats,

    // Modals
    openModal,
    closeModal,
    showConfirm,

    // Toasts
    showToast,
    toast,

    // Screens
    showScreen,

    // Ripple
    initRipple,

    // Counter
    countTo,

    // Banners
    showHealthWarning,

    // Confetti
    fireConfetti,

    // Formatters
    formatVND,
    formatCompact,
    formatPct,

    // Internals (exposed for testing)
    _countUp,
    _flashEl,
    _parseNumText,
  };

})();
