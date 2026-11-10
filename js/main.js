/**
 * TerraCoir - Artisanal Coir & Golden Jute Products Store
 * Global Production JavaScript Logic
 * STRICT DIRECTIVES: Vanilla JS only, Dark/Light Mode, RTL Toggle, Filter System, Strict Real-Time Validation
 */

/* ==========================================================================
   0. TOP-LEVEL GLOBAL CAPTURE LISTENERS (STRICT REAL-TIME INPUT RESTRICTIONS)
   Runs immediately in the capture phase so NO digits can ever be typed into Name,
   and NO letters can ever be typed into Phone across ANY form or modal.
   ========================================================================== */

function isNameFieldElement(el) {
  if (!el || !(el instanceof HTMLInputElement)) return false;
  const id = (el.id || '').toLowerCase();
  const name = (el.name || '').toLowerCase();
  const placeholder = (el.placeholder || '').toLowerCase();
  const cls = (el.className || '').toLowerCase();
  const autocomplete = (el.getAttribute('autocomplete') || '').toLowerCase();
  return (
    id.includes('name') ||
    name === 'name' ||
    name.includes('name') ||
    cls.includes('modal-input-name') ||
    cls.includes('name-field') ||
    placeholder.includes('name') ||
    placeholder.includes('katherine') ||
    placeholder.includes('alexandra') ||
    autocomplete === 'name'
  );
}

function isPhoneFieldElement(el) {
  if (!el || !(el instanceof HTMLInputElement)) return false;
  const type = (el.type || '').toLowerCase();
  const id = (el.id || '').toLowerCase();
  const name = (el.name || '').toLowerCase();
  const placeholder = (el.placeholder || '').toLowerCase();
  const cls = (el.className || '').toLowerCase();
  const autocomplete = (el.getAttribute('autocomplete') || '').toLowerCase();
  return (
    type === 'tel' ||
    id.includes('phone') ||
    name.includes('phone') ||
    cls.includes('modal-input-phone') ||
    placeholder.includes('phone') ||
    placeholder.includes('555-01') ||
    autocomplete === 'tel'
  );
}

function showFieldRealtimeWarning(input, message) {
  input.classList.add('border-rose-500', 'ring-1', 'ring-rose-500', 'field-error-shake');
  setTimeout(() => input.classList.remove('field-error-shake'), 350);

  const container = input.parentElement;
  let errEl = container ? container.querySelector('.field-error, .form-field-error') : null;
  if (!errEl && container) {
    errEl = document.createElement('span');
    errEl.className = 'field-error text-[11px] text-rose-600 dark:text-rose-400 mt-1 block font-medium';
    container.appendChild(errEl);
  }
  if (errEl) {
    errEl.textContent = message;
    errEl.classList.remove('hidden');
  }

  clearTimeout(input._realtimeWarningTimer);
  input._realtimeWarningTimer = setTimeout(() => {
    input.classList.remove('border-rose-500', 'ring-1', 'ring-rose-500');
    if (errEl && !input.hasAttribute('data-submit-invalid')) {
      errEl.classList.add('hidden');
    }
  }, 2200);
}

// Global Capture Keydown Handler: physically blocks disallowed keystrokes
window.addEventListener('keydown', (e) => {
  const target = e.target;
  if (!target || !(target instanceof HTMLInputElement)) return;

  // 1. NAME FIELD: STRICTLY BLOCK ALL NUMBERS (0-9, Keypad, NumRow)
  if (isNameFieldElement(target)) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const navKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Escape', 'Enter'];
    if (navKeys.includes(e.key)) return;

    const isDigit = (e.key >= '0' && e.key <= '9') || 
                    (e.code && (e.code.startsWith('Digit') || e.code.startsWith('Numpad')));

    if (isDigit) {
      e.preventDefault();
      e.stopImmediatePropagation();
      showFieldRealtimeWarning(target, 'Numbers (0-9) are strictly prohibited in the Name field.');
      return false;
    }
  }

  // 2. PHONE FIELD: STRICTLY BLOCK ALL LETTERS AND SYMBOLS EXCEPT PHONE CHARACTERS
  if (isPhoneFieldElement(target)) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedPhoneKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Escape', 'Enter',
      '+', '-', '(', ')', ' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      showFieldRealtimeWarning(target, 'Letters (A-Z) are strictly prohibited in the Phone field.');
      return false;
    }

    if (!allowedPhoneKeys.includes(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      showFieldRealtimeWarning(target, 'Only numbers and phone symbols (+, -, parentheses) are allowed.');
      return false;
    }
  }
}, true); // Capture phase is unskippable

// Global Capture Input Handler: strips numbers or letters from paste, autofill, voice, or virtual keyboards
window.addEventListener('input', (e) => {
  const target = e.target;
  if (!target || !(target instanceof HTMLInputElement)) return;

  if (isNameFieldElement(target)) {
    if (/[0-9]/.test(target.value)) {
      target.value = target.value.replace(/[0-9]/g, '');
      showFieldRealtimeWarning(target, 'Numbers removed from Name field.');
    }
  }

  if (isPhoneFieldElement(target)) {
    if (/[^0-9+\-()\s]/.test(target.value)) {
      target.value = target.value.replace(/[^0-9+\-()\s]/g, '');
      showFieldRealtimeWarning(target, 'Letters removed from Phone field.');
    }
  }
}, true);

// Global Capture Paste Handler: sanitizes clipboard text
window.addEventListener('paste', (e) => {
  const target = e.target;
  if (!target || !(target instanceof HTMLInputElement)) return;

  const clipboardData = e.clipboardData || window.clipboardData;
  if (!clipboardData) return;
  const rawText = clipboardData.getData('text');
  if (!rawText) return;

  if (isNameFieldElement(target)) {
    if (/[0-9]/.test(rawText)) {
      e.preventDefault();
      const clean = rawText.replace(/[0-9]/g, '');
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      target.value = target.value.slice(0, start) + clean + target.value.slice(end);
      target.setSelectionRange(start + clean.length, start + clean.length);
      showFieldRealtimeWarning(target, 'Numbers stripped from pasted name.');
    }
  }

  if (isPhoneFieldElement(target)) {
    if (/[^0-9+\-()\s]/.test(rawText)) {
      e.preventDefault();
      const clean = rawText.replace(/[^0-9+\-()\s]/g, '');
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      target.value = target.value.slice(0, start) + clean + target.value.slice(end);
      target.setSelectionRange(start + clean.length, start + clean.length);
      showFieldRealtimeWarning(target, 'Letters stripped from pasted phone.');
    }
  }
}, true);

/* ==========================================================================
   INITIALIZATION BOOTSTRAPPER
   ========================================================================== */
function initApp() {
  initTheme();
  initDirection();
  initStickyHeader();
  initNavigation();
  initActivePageHighlight();
  initHomeDropdown();
  initProductFilters();
  initFormValidation();
  initFaqAccordions();
  initModals();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* ==========================================================================
   1. STICKY HEADER & SCROLL ELEVATION
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  function updateHeaderShadow() {
    if (window.scrollY > 10) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  }

  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();
}

/* ==========================================================================
   2. NAVBAR ACTIVE PAGE HIGHLIGHTER & CAPSULE TABS
   ========================================================================== */
function initActivePageHighlight() {
  const pathname = window.location.pathname;
  let currentPage = pathname.split('/').pop() || 'index.html';
  if (currentPage === '' || currentPage === '/') currentPage = 'index.html';

  // Home Dropdown button highlight
  const homeDropdownBtn = document.querySelector('.home-dropdown-btn');
  if (homeDropdownBtn) {
    if (currentPage === 'index.html' || currentPage === 'home-2.html') {
      homeDropdownBtn.classList.add('active-page');
    } else {
      homeDropdownBtn.classList.remove('active-page');
    }
  }

  // Desktop links
  const navLinks = document.querySelectorAll('header nav a.nav-link');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active-page');
    } else {
      link.classList.remove('active-page');
    }
  });

  // Home Dropdown Wrapper highlight when on Home 1 or Home 2
  const homeWrapper = document.querySelector('.home-select-wrapper');
  if (homeWrapper) {
    if (currentPage === 'index.html' || currentPage === 'home-2.html') {
      homeWrapper.classList.add('active-home');
    } else {
      homeWrapper.classList.remove('active-home');
    }
  }

  // Mobile drawer links
  const mobileLinks = document.querySelectorAll('#mobile-menu a.mobile-nav-link');
  mobileLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active-page');
    } else {
      link.classList.remove('active-page');
    }
  });
}

/* ==========================================================================
   3. THEME MANAGEMENT (Dark / Light with localStorage persistence)
   ========================================================================== */
function initTheme() {
  const themeBtns = document.querySelectorAll('.theme-toggle-btn');
  const storedTheme = localStorage.getItem('terracoir_theme');

  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('terracoir_theme', isDark ? 'dark' : 'light');
    });
  });
}

/* ==========================================================================
   4. DIRECTION MANAGEMENT (RTL / LTR with localStorage persistence)
   ========================================================================== */
function initDirection() {
  const rtlBtns = document.querySelectorAll('.rtl-toggle-btn');
  const storedDir = localStorage.getItem('terracoir_dir') || 'ltr';
  document.documentElement.setAttribute('dir', storedDir);

  rtlBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      document.documentElement.setAttribute('dir', newDir);
      localStorage.setItem('terracoir_dir', newDir);
    });
  });
}

/* ==========================================================================
   5. NAVIGATION & MOBILE HAMBURGER MENU
   ========================================================================== */
function initNavigation() {
  // Mobile / touch support for Home dropdown
  const homeDropdownBtn = document.querySelector('.home-dropdown-btn');
  const homeDropdownMenu = document.querySelector('.home-dropdown-menu');
  if (homeDropdownBtn && homeDropdownMenu) {
    homeDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = !homeDropdownMenu.classList.contains('pointer-events-none');
      if (isVisible) {
        homeDropdownMenu.classList.add('pointer-events-none', 'opacity-0');
        homeDropdownBtn.setAttribute('aria-expanded', 'false');
      } else {
        homeDropdownMenu.classList.remove('pointer-events-none', 'opacity-0');
        homeDropdownBtn.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', () => {
      homeDropdownMenu.classList.add('pointer-events-none', 'opacity-0');
      homeDropdownBtn.setAttribute('aria-expanded', 'false');
    });
  }
  const menuButtons = document.querySelectorAll('#mobile-menu-toggle, #mobile-menu-btn, .mobile-menu-btn, [aria-label*="menu"]');
  const mobileMenu = document.getElementById('mobile-drawer') || document.getElementById('mobile-menu');
  const menuCloseButtons = document.querySelectorAll('#mobile-drawer-close, #mobile-menu-close, .mobile-menu-close');

  if (!mobileMenu) return;

  function toggleMenu(show) {
    if (show) {
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      menuButtons.forEach(btn => btn.setAttribute('aria-expanded', 'true'));
    } else {
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = '';
      menuButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    }
  }

  menuButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mobileMenu.classList.contains('hidden');
      toggleMenu(isHidden);
    });
  });

  menuCloseButtons.forEach((closeBtn) => {
    closeBtn.addEventListener('click', () => toggleMenu(false));
  });

  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      toggleMenu(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      toggleMenu(false);
    }
  });

  const mobileNavLinks = mobileMenu.querySelectorAll('a');
  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

/* ==========================================================================
   6. HOME DEMO SELECT DROPDOWN SYNC & FIX
   FIX: Ensures selecting Home 1 from Contact or other pages ALWAYS redirects to index.html!
   ========================================================================== */
function initHomeDropdown() {
  const homeSelects = document.querySelectorAll('.home-demo-select');
  const pathname = window.location.pathname;
  let currentPage = pathname.split('/').pop() || 'index.html';
  if (currentPage === '' || currentPage === '/') currentPage = 'index.html';

  homeSelects.forEach((select) => {
    // If on a subpage (contact, products, etc.), value is '' (matching the neutral prompt)
    // so choosing Home 1 or Home 2 ALWAYS triggers change!
    if (currentPage === 'index.html') {
      select.value = 'index.html';
    } else if (currentPage === 'home-2.html') {
      select.value = 'home-2.html';
    } else {
      select.value = '';
    }

    select.addEventListener('change', (e) => {
      const targetPage = e.target.value;
      if (targetPage) {
        window.location.href = targetPage;
      }
    });
  });
}

/* ==========================================================================
   7. PRODUCT CATALOG FILTERING SYSTEM (Live Category Pills, Search & Sort)
   ========================================================================== */
function initProductFilters() {
  const filterBtns = document.querySelectorAll('#category-filters .filter-btn, .filter-btn');
  const searchInput = document.getElementById('product-search');
  const sortSelect = document.getElementById('product-sort');
  const productGrid = document.getElementById('product-grid');
  const productItems = Array.from(document.querySelectorAll('.product-item'));

  if (!productItems.length) return;

  // Ensure empty state exists
  let emptyState = document.getElementById('product-empty-state');
  if (!emptyState && productGrid) {
    emptyState = document.createElement('div');
    emptyState.id = 'product-empty-state';
    emptyState.className = 'hidden text-center py-16 space-y-4 col-span-full w-full';
    emptyState.innerHTML = `
      <div class="w-14 h-14 rounded-full bg-[#fbeee8] dark:bg-[#251e1a] text-[#944422] dark:text-[#d4973b] flex items-center justify-center mx-auto shadow-sm">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <div class="space-y-1">
        <h4 class="text-lg font-extrabold text-[#16191c] dark:text-white">No products found matching your criteria</h4>
        <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">Try selecting a different category or clearing your search term.</p>
      </div>
      <button type="button" class="reset-catalog-btn px-5 py-2.5 rounded-full bg-[#944422] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#793417] shadow-sm transition-all cursor-pointer">
        View All 12 Products
      </button>
    `;
    productGrid.appendChild(emptyState);

    const resetBtn = emptyState.querySelector('.reset-catalog-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        currentFilter = 'all';
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'featured';
        updateActiveButton();
        applyFilters();
      });
    }
  }

  let currentFilter = 'all';

  function updateActiveButton() {
    filterBtns.forEach((btn) => {
      const filterVal = btn.getAttribute('data-filter') || 'all';
      if (filterVal === currentFilter) {
        btn.classList.add('active-filter', 'bg-[#944422]', 'text-white');
        btn.classList.remove('bg-[#fbeee8]', 'dark:bg-[#251e1a]', 'text-[#4b5563]', 'dark:text-[#cbd5e1]');
      } else {
        btn.classList.remove('active-filter', 'bg-[#944422]', 'text-white');
        btn.classList.add('bg-[#fbeee8]', 'dark:bg-[#251e1a]', 'text-[#4b5563]', 'dark:text-[#cbd5e1]');
      }
    });
  }

  function applyFilters() {
    const query = (searchInput ? searchInput.value.trim().toLowerCase() : '');
    const sortVal = (sortSelect ? sortSelect.value : 'featured');

    let visibleItems = [];

    productItems.forEach((card) => {
      const category = (card.getAttribute('data-category') || '').toLowerCase();
      const cardText = card.textContent.toLowerCase();

      const matchCategory = currentFilter === 'all' || category === currentFilter;
      const matchSearch = !query || cardText.includes(query);

      if (matchCategory && matchSearch) {
        card.classList.remove('hidden');
        visibleItems.push(card);
      } else {
        card.classList.add('hidden');
      }
    });

    // Handle Sorting
    if (productGrid && visibleItems.length > 0) {
      if (sortVal === 'low-high') {
        visibleItems.sort((a, b) => {
          const priceA = parseFloat(a.getAttribute('data-price') || '0');
          const priceB = parseFloat(b.getAttribute('data-price') || '0');
          return priceA - priceB;
        });
      } else if (sortVal === 'high-low') {
        visibleItems.sort((a, b) => {
          const priceA = parseFloat(a.getAttribute('data-price') || '0');
          const priceB = parseFloat(b.getAttribute('data-price') || '0');
          return priceB - priceA;
        });
      }

      visibleItems.forEach((item) => {
        productGrid.appendChild(item);
      });
    }

    if (emptyState) {
      if (visibleItems.length === 0) {
        emptyState.classList.remove('hidden');
        if (productGrid) productGrid.appendChild(emptyState);
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      currentFilter = btn.getAttribute('data-filter') || 'all';
      updateActiveButton();
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  // Initial trigger
  updateActiveButton();
  applyFilters();
}

/* ==========================================================================
   8. TOAST NOTIFICATION ENGINE & STRICT FORM VALIDATION
   ========================================================================== */

function showToast(title, message, type = 'success') {
  let container = document.getElementById('terracoir-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'terracoir-toast-container';
    container.className = 'fixed top-5 right-5 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-3 max-w-md w-[calc(100%-2.5rem)] pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'terracoir-toast pointer-events-auto flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-y-[-10px] opacity-0';

  if (type === 'success') {
    toast.classList.add('bg-[#16191c]', 'border-emerald-500', 'text-white');
    toast.innerHTML = `
      <div class="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5 shadow-sm">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      </div>
      <div class="flex-1 space-y-1">
        <div class="font-extrabold text-sm sm:text-base text-emerald-400 tracking-tight">${title}</div>
        <div class="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed font-medium">${message}</div>
      </div>
      <button type="button" class="toast-close-btn p-1 text-[#94a3b8] hover:text-white rounded-lg transition-colors cursor-pointer" aria-label="Close notification">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
  } else {
    toast.classList.add('bg-[#16191c]', 'border-amber-500', 'text-white');
    toast.innerHTML = `
      <div class="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center shrink-0 text-amber-400 mt-0.5 shadow-sm">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <div class="flex-1 space-y-1">
        <div class="font-extrabold text-sm text-amber-400 tracking-tight">${title}</div>
        <div class="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed font-medium">${message}</div>
      </div>
      <button type="button" class="toast-close-btn p-1 text-[#94a3b8] hover:text-white rounded-lg transition-colors cursor-pointer" aria-label="Close notification">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
  }

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-[-10px]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  const closeBtn = toast.querySelector('.toast-close-btn');
  let autoDismissTimer;

  function dismissToast() {
    clearTimeout(autoDismissTimer);
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', dismissToast);
  }

  autoDismissTimer = setTimeout(dismissToast, 6500);
}
window.showToast = showToast;

function initFormValidation() {
  const forms = document.querySelectorAll('form#contact-enquiry-form, form#bulk-order-form, form.needs-strict-validation');
  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  forms.forEach((form) => {
    if (form.dataset.validationBound) return;
    form.dataset.validationBound = 'true';

    // Locate or create the inline feedback container inside the form
    let alertBox = form.querySelector('.form-feedback-area, #contact-form-alert, #bulk-form-alert, .form-alert');
    if (!alertBox) {
      alertBox = document.createElement('div');
      alertBox.className = 'form-feedback-area hidden p-4 sm:p-5 rounded-2xl text-xs font-bold my-4';
      const submitBtn = form.querySelector('button[type="submit"]');
      const btnRow = submitBtn ? (submitBtn.closest('.pt-2') || submitBtn.parentElement) : form;
      btnRow.parentElement.insertBefore(alertBox, btnRow);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isFormValid = true;
      let firstInvalidInput = null;

      const nameInput = form.querySelector('input[name="name"], input[name="fullName"], input#contact-name, input#bulk-name, input#rfq-name');
      const emailInput = form.querySelector('input[type="email"], input#contact-email, input#bulk-email, input#rfq-email');
      const phoneInput = form.querySelector('input[type="tel"], input#contact-phone, input#bulk-phone, input#rfq-phone');
      const messageInput = form.querySelector('textarea');
      const consentInput = form.querySelector('input[type="checkbox"][required], input#contact-consent');
      const requiredSelects = form.querySelectorAll('select[required]');
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

      // 1. Validate Name (Letters and spaces only, min 2 chars)
      if (nameInput) {
        const val = nameInput.value.trim();
        const errEl = getOrCreateFieldFeedback(nameInput);
        if (!val || val.length < 2) {
          markFieldInvalid(nameInput, errEl, 'Full Name is required (minimum 2 letters).');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = nameInput;
        } else if (/[0-9]/.test(val)) {
          markFieldInvalid(nameInput, errEl, 'Numbers are strictly prohibited in the Name field.');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = nameInput;
        } else if (!/^[A-Za-z\s.\'-]+$/.test(val)) {
          markFieldInvalid(nameInput, errEl, 'Please enter a valid name using letters, spaces, hyphens, or apostrophes only.');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = nameInput;
        } else {
          markFieldValid(nameInput, errEl);
        }
      }

      // 2. Validate Email (Strict Regex)
      if (emailInput) {
        const val = emailInput.value.trim();
        const errEl = getOrCreateFieldFeedback(emailInput);
        if (!val) {
          markFieldInvalid(emailInput, errEl, 'Email address is required.');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = emailInput;
        } else if (!strictEmailRegex.test(val)) {
          markFieldInvalid(emailInput, errEl, 'Please provide a valid email address (e.g., name@domain.com).');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = emailInput;
        } else {
          markFieldValid(emailInput, errEl);
        }
      }

      // 3. Validate Phone (7 to 15 digits)
      if (phoneInput) {
        const val = phoneInput.value.trim();
        const digits = val.replace(/\D/g, '');
        const errEl = getOrCreateFieldFeedback(phoneInput);
        if (!val) {
          markFieldInvalid(phoneInput, errEl, 'Contact phone number is required.');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = phoneInput;
        } else if (/[a-zA-Z]/.test(val)) {
          markFieldInvalid(phoneInput, errEl, 'Letters are not allowed in the Phone field.');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = phoneInput;
        } else if (digits.length < 7 || digits.length > 15) {
          markFieldInvalid(phoneInput, errEl, 'Please enter a valid phone number (7 to 15 digits).');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = phoneInput;
        } else {
          markFieldValid(phoneInput, errEl);
        }
      }

      // 4. Validate Message / Specifications (min 10 characters)
      if (messageInput) {
        const val = messageInput.value.trim();
        const errEl = getOrCreateFieldFeedback(messageInput);
        if (!val || val.length < 10) {
          markFieldInvalid(messageInput, errEl, 'Please provide detailed requirements (minimum 10 characters).');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = messageInput;
        } else {
          markFieldValid(messageInput, errEl);
        }
      }

      // 5. Validate Required Dropdowns
      requiredSelects.forEach((sel) => {
        const val = sel.value.trim();
        const errEl = getOrCreateFieldFeedback(sel);
        if (!val) {
          markFieldInvalid(sel, errEl, 'Please select an option from the list.');
          isFormValid = false;
          if (!firstInvalidInput) firstInvalidInput = sel;
        } else {
          markFieldValid(sel, errEl);
        }
      });

      // 6. Validate Agreement Checkbox (if present)
      if (consentInput && !consentInput.checked) {
        const errEl = getOrCreateFieldFeedback(consentInput);
        markFieldInvalid(consentInput, errEl, 'You must agree to the export compliance policies before submitting.');
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = consentInput;
      } else if (consentInput) {
        markFieldValid(consentInput, getOrCreateFieldFeedback(consentInput));
      }

      // If invalid, focus first error & display warning feedback
      if (!isFormValid) {
        if (firstInvalidInput) {
          firstInvalidInput.focus();
          firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (alertBox) {
          alertBox.className = 'p-4 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800 my-4 block animate-fade-in';
          alertBox.innerHTML = `
            <div class="flex items-center gap-2.5">
              <span class="text-rose-600 font-bold text-base">&#9888;</span>
              <span>Please fill in all required fields highlighted in red before submitting.</span>
            </div>
          `;
          alertBox.classList.remove('hidden');
        }
        showToast('Form Incomplete', 'Please check and complete the required fields highlighted in red.', 'warning');
        return;
      }

      // 100% VALID - Process submission with Toast and Confirmation
      const btnRaw = submitBtn ? submitBtn.textContent.trim() : '';
      let toastTitle = 'Inquiry Submitted!';
      let toastMsg = '';
      const clientName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Valued Trade Partner';
      const randomRef = 'TC-' + Math.floor(10000 + Math.random() * 90000);

      if (btnRaw.includes('Wholesale') || form.id === 'bulk-order-form' || window.location.pathname.includes('bulk-orders')) {
        toastTitle = 'Wholesale RFQ Submitted!';
        toastMsg = `Thank you, <strong>${clientName}</strong>! Your wholesale RFQ docket <strong>#${randomRef}</strong> has been logged. Our commercial desk will review your volume requirements and deliver an official pro-forma invoice within 24 hours.`;
      } else if (btnRaw.includes('Engineering') || btnRaw.includes('RFQ') || window.location.pathname.includes('home-2')) {
        toastTitle = 'Engineering RFQ Dispatched!';
        toastMsg = `Thank you, <strong>${clientName}</strong>! Your civil engineering RFQ docket <strong>#${randomRef}</strong> has been received. Container load calculations and technical datasheets will be delivered within 24 hours.`;
      } else if (btnRaw.includes('Readers') || btnRaw.includes('Join') || btnRaw.includes('Subscribe')) {
        toastTitle = 'Subscription Confirmed!';
        toastMsg = `Thank you! You have been subscribed to TerraCoir circular fiber bulletins. Our latest technical edition has been sent to your inbox.`;
      } else {
        toastTitle = 'Official Message Transmitted!';
        toastMsg = `Thank you, <strong>${clientName}</strong>! Your inquiry docket <strong>#${randomRef}</strong> has been dispatched. Our sustainable fiber export specialists will contact you within 1 business day.`;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Transmitting Request...
        `;
      }

      setTimeout(() => {
        // 1. Fire Top-Right Toast Notification
        showToast(toastTitle, toastMsg, 'success');

        // 2. Show Prominent Inline Success Box in Form
        if (alertBox) {
          alertBox.className = 'p-5 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-100 shadow-xl my-4 block animate-fade-in';
          alertBox.innerHTML = `
            <div class="flex items-start gap-3.5">
              <div class="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 font-black text-lg shadow-md">&#10003;</div>
              <div class="space-y-1.5 flex-1">
                <div class="font-extrabold text-sm sm:text-base text-emerald-800 dark:text-emerald-300 tracking-tight">${toastTitle}</div>
                <div class="text-xs sm:text-sm text-emerald-700 dark:text-emerald-200 leading-relaxed">
                  Thank you, <strong class="text-emerald-900 dark:text-white">${clientName}</strong>! Docket <strong class="underline decoration-emerald-500 font-mono">#${randomRef}</strong> has been generated. Our desk will contact you with full documentation within 24 business hours.
                </div>
              </div>
            </div>
          `;
          alertBox.classList.remove('hidden');
          alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // 3. Reset Form Inputs
        form.reset();

        // 4. Clear any validation error indicators
        form.querySelectorAll('.field-error, .form-field-error').forEach(el => el.remove());
        form.querySelectorAll('[data-submit-invalid]').forEach(el => {
          el.removeAttribute('data-submit-invalid');
          el.classList.remove('border-rose-500', 'ring-1', 'ring-rose-500');
        });

        // 5. Update Submit Button to Success Badge
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `&#10003; Submitted Successfully!`;
          submitBtn.classList.remove('bg-[#944422]', 'hover:bg-[#793417]');
          submitBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');

          setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
            submitBtn.classList.add('bg-[#944422]', 'hover:bg-[#793417]');
          }, 4500);
        }
      }, 600);
    });
  });

  // Newsletter forms in footer
  const newsletterForms = document.querySelectorAll('form.newsletter-form');
  newsletterForms.forEach((nForm) => {
    nForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = nForm.querySelector('input[type="email"]');
      const feedback = nForm.querySelector('.newsletter-feedback');
      if (!emailInput) return;
      const val = emailInput.value.trim();
      if (!val || !strictEmailRegex.test(val)) {
        emailInput.classList.add('border-rose-500');
        if (feedback) {
          feedback.textContent = 'Please enter a valid email address.';
          feedback.className = 'newsletter-feedback text-[10px] text-rose-400 mt-1 block';
          feedback.classList.remove('hidden');
        }
        return;
      }
      emailInput.value = '';
      emailInput.classList.remove('border-rose-500');
      if (feedback) {
        feedback.textContent = 'Commercial catalog dispatched to your inbox!';
        feedback.className = 'newsletter-feedback text-[10px] text-emerald-400 mt-1 block';
        feedback.classList.remove('hidden');
        setTimeout(() => feedback.classList.add('hidden'), 4000);
      }
      showToast('Subscription Confirmed', 'The TerraCoir commercial catalog and sustainable fiber journal have been dispatched to your inbox.', 'success');
    });
  });

  function getOrCreateFieldFeedback(input) {
    let errEl = input.parentElement ? input.parentElement.querySelector('.field-error, .form-field-error') : null;
    if (!errEl && input.parentElement) {
      errEl = document.createElement('span');
      errEl.className = 'field-error text-[11px] text-rose-600 dark:text-rose-400 mt-1 block font-medium';
      input.parentElement.appendChild(errEl);
    }
    return errEl;
  }

  function markFieldInvalid(input, errEl, msg) {
    input.setAttribute('data-submit-invalid', 'true');
    input.classList.add('border-rose-500', 'ring-1', 'ring-rose-500');
    input.classList.remove('border-[#e6decb]', 'dark:border-[#2a3138]');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove('hidden');
    }
  }

  function markFieldValid(input, errEl) {
    input.removeAttribute('data-submit-invalid');
    input.classList.remove('border-rose-500', 'ring-1', 'ring-rose-500');
    input.classList.add('border-[#e6decb]', 'dark:border-[#2a3138]');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.add('hidden');
    }
  }
}

/* ==========================================================================
   9. FAQ ACCORDIONS (Works with both .faq-accordion-btn and .faq-toggle)
   ========================================================================== */
function initFaqAccordions() {
  const faqButtons = document.querySelectorAll('.faq-accordion-btn, .faq-toggle');
  faqButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.faq-item') || btn.parentElement;
      const content = container ? container.querySelector('.faq-accordion-content, .faq-content') : null;
      const icon = btn.querySelector('.faq-icon');
      const isExpanded = content && !content.classList.contains('hidden');

      faqButtons.forEach((otherBtn) => {
        const otherContainer = otherBtn.closest('.faq-item') || otherBtn.parentElement;
        const otherContent = otherContainer ? otherContainer.querySelector('.faq-accordion-content, .faq-content') : null;
        const otherIcon = otherBtn.querySelector('.faq-icon');
        if (otherContent) otherContent.classList.add('hidden');
        if (otherIcon) {
          otherIcon.textContent = '+';
          otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      if (!isExpanded && content) {
        content.classList.remove('hidden');
        if (icon) {
          icon.textContent = '−';
          icon.style.transform = 'rotate(180deg)';
        }
      }
    });
  });
}

/* ==========================================================================
   10. CENTERED MODAL POPUPS (Quick View, Specifications & Fiber Sample Boxes)
   ========================================================================== */
function initModals() {
  // Quick View Buttons on Product and Home cards
  const quickViewButtons = document.querySelectorAll('.btn-quick-view, .quick-spec-trigger');
  quickViewButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-name') || btn.getAttribute('data-spec-title') || 'Artisanal Coir & Jute Piece';
      const price = btn.getAttribute('data-price') || '';
      const specs = btn.getAttribute('data-specs') || btn.getAttribute('data-spec-material') || '100% Biodegradable Kerala Coir & Bengal Jute';
      const img = btn.getAttribute('data-img') || '';
      const id = btn.getAttribute('data-id') || 'TC-SPEC';
      openQuickViewModal(name, price, specs, img, id);
    });
  });

  const sampleTriggers = document.querySelectorAll('.order-sample-trigger');
  sampleTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const sampleName = btn.getAttribute('data-sample-name') || 'Sustainable Fiber Specimen Box';
      openSampleModal(sampleName);
    });
  });

  const studyTriggers = document.querySelectorAll('.spec-modal-trigger');
  studyTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-modal-title') || 'Ecological Field Report';
      openStudyModal(title);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

function openQuickViewModal(name, price, specs, img, id) {
  closeAllModals();

  const backdrop = document.createElement('div');
  backdrop.id = 'terracoir-quickview-modal';
  backdrop.className = 'terracoir-modal-backdrop';

  backdrop.innerHTML = `
    <div class="terracoir-modal-box p-6 sm:p-8 max-w-lg w-full" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-4 border-b border-[#e6decb] dark:border-[#2b333d]">
        <div class="flex items-center gap-2">
          <span class="badge-clay">Artisan Specimen</span>
          <span class="text-xs font-bold text-[#944422] dark:text-[#d4973b]">${id}</span>
        </div>
        <button type="button" class="modal-close-btn p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded transition-colors" aria-label="Close dialog">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      ${img ? `
      <div class="mt-4 rounded-xl overflow-hidden h-48 sm:h-56 bg-stone-100 dark:bg-stone-800 border border-[#e6decb] dark:border-[#2b333d]">
        <img src="${img}" alt="${name}" class="w-full h-full object-cover">
      </div>
      ` : ''}

      <div class="mt-4">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-lg sm:text-xl font-extrabold brand-heading leading-tight">${name}</h3>
          ${price ? `<span class="text-sm font-black px-2.5 py-1 rounded bg-[#fbeee8] dark:bg-[#251e1a] text-[#944422] dark:text-[#d4973b]">${price}</span>` : ''}
        </div>
        <p class="text-xs text-[#5e6670] dark:text-[#a0acb8] mt-2 leading-relaxed">
          ${specs}
        </p>
      </div>

      <div class="mt-5 space-y-2.5 bg-[#fbeee8]/60 dark:bg-[#1a2026] p-4 rounded-xl text-xs border border-[#e6decb] dark:border-[#2b333d]">
        <div class="flex justify-between border-b border-[#e6decb] dark:border-[#2b333d] pb-1.5">
          <span class="text-[#5e6670] dark:text-[#a0acb8]">Material Composition:</span>
          <span class="font-bold text-[#16191c] dark:text-[#f2f4f8]">100% Kerala Coir &amp; Bengal Jute</span>
        </div>
        <div class="flex justify-between border-b border-[#e6decb] dark:border-[#2b333d] pb-1.5">
          <span class="text-[#5e6670] dark:text-[#a0acb8]">Degradation Cycle:</span>
          <span class="font-bold text-[#16191c] dark:text-[#f2f4f8]">100% Soil Return (18-24 Mo)</span>
        </div>
        <div class="flex justify-between border-b border-[#e6decb] dark:border-[#2b333d] pb-1.5">
          <span class="text-[#5e6670] dark:text-[#a0acb8]">Adhesive / Backing:</span>
          <span class="font-bold text-[#16191c] dark:text-[#f2f4f8]">Natural Vulcanized Latex</span>
        </div>
        <div class="flex justify-between pt-0.5">
          <span class="text-[#5e6670] dark:text-[#a0acb8]">Certification:</span>
          <span class="font-bold text-[#944422] dark:text-[#d4973b]">FSC &amp; GOTS Organic Certified</span>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-[#e6decb] dark:border-[#2b333d] flex flex-col sm:flex-row gap-3">
        <a href="bulk-orders.html" class="flex-1 py-3 bg-[#944422] hover:bg-[#793417] text-white text-xs font-bold uppercase tracking-wider rounded-lg text-center transition-colors">
          Inquire Bulk Pricing
        </a>
        <button type="button" class="modal-close-action py-3 px-5 bg-white dark:bg-[#1c2127] border border-[#e6decb] dark:border-[#2a3138] text-[#16191c] dark:text-white text-xs font-bold uppercase tracking-wider rounded-lg text-center hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  backdrop.addEventListener('click', closeAllModals);
  const closeBtn = backdrop.querySelector('.modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeAllModals);
  const closeAction = backdrop.querySelector('.modal-close-action');
  if (closeAction) closeAction.addEventListener('click', closeAllModals);
}

function openSpecsModal(title, dimensions, material) {
  closeAllModals();

  const backdrop = document.createElement('div');
  backdrop.id = 'terracoir-specs-modal';
  backdrop.className = 'terracoir-modal-backdrop';

  backdrop.innerHTML = `
    <div class="terracoir-modal-box p-6 sm:p-8" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-4 border-b border-[#e6decb] dark:border-[#2b333d]">
        <div class="flex items-center gap-2">
          <span class="badge-clay">Certified Metric</span>
          <span class="text-xs font-bold text-[#944422] dark:text-[#e57a46]">ASTM D5035 / ISO 14001</span>
        </div>
        <button type="button" class="modal-close-btn p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded transition-colors" aria-label="Close dialog">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="mt-5">
        <h3 class="text-xl sm:text-2xl font-extrabold brand-heading leading-tight">${title}</h3>
        <p class="text-xs text-[#5e6670] dark:text-[#a0acb8] mt-1.5 leading-relaxed">
          Comprehensive fiber yield analysis, tensile thresholds, and soil degradation metrics.
        </p>
      </div>

      <div class="mt-6 space-y-3 bg-[#f5ede6] dark:bg-[#1a2026] p-4 rounded-xl text-xs">
        <div class="flex justify-between border-b border-[#e6decb] dark:border-[#2b333d] pb-2">
          <span class="text-[#5e6670] dark:text-[#a0acb8] font-semibold">Standard Dimension / Roll:</span>
          <span class="font-bold text-[#16191c] dark:text-[#f2f4f8] text-right">${dimensions}</span>
        </div>
        <div class="flex justify-between border-b border-[#e6decb] dark:border-[#2b333d] pb-2">
          <span class="text-[#5e6670] dark:text-[#a0acb8] font-semibold">Botanical Fiber Composition:</span>
          <span class="font-bold text-[#16191c] dark:text-[#f2f4f8] text-right">${material}</span>
        </div>
        <div class="flex justify-between border-b border-[#e6decb] dark:border-[#2b333d] pb-2">
          <span class="text-[#5e6670] dark:text-[#a0acb8] font-semibold">Biodegradation Period:</span>
          <span class="font-bold text-[#16191c] dark:text-[#f2f4f8] text-right">100% Soil Return (18-24 Months)</span>
        </div>
        <div class="flex justify-between border-b border-[#e6decb] dark:border-[#2b333d] pb-2">
          <span class="text-[#5e6670] dark:text-[#a0acb8] font-semibold">Binder / Adhesive:</span>
          <span class="font-bold text-[#16191c] dark:text-[#f2f4f8] text-right">Zero Formaldehyde / Natural Latex Backing</span>
        </div>
        <div class="flex justify-between pt-1">
          <span class="text-[#5e6670] dark:text-[#a0acb8] font-semibold">Traceability:</span>
          <span class="font-bold text-[#944422] dark:text-[#e57a46] text-right">Fair-Trade Cooperative Certified</span>
        </div>
      </div>

      <div class="mt-6 pt-5 border-t border-[#e6decb] dark:border-[#2b333d] flex flex-col sm:flex-row gap-3">
        <button type="button" class="spec-modal-order-sample flex-1 py-3 bg-[#944422] hover:bg-[#793417] text-white text-xs font-bold uppercase tracking-wider rounded-full text-center transition-colors">
          Request Fiber Box
        </button>
        <a href="bulk-orders.html" class="flex-1 py-3 bg-white dark:bg-[#1a2026] border border-[#dcd1be] dark:border-[#2f3741] text-[#16191c] dark:text-[#f2f4f8] hover:bg-[#f7ede7] text-xs font-bold uppercase tracking-wider rounded-full text-center transition-colors">
          Request Bulk Quote
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  backdrop.addEventListener('click', closeAllModals);
  const closeBtn = backdrop.querySelector('.modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeAllModals);

  const orderSampleBtn = backdrop.querySelector('.spec-modal-order-sample');
  if (orderSampleBtn) {
    orderSampleBtn.addEventListener('click', () => {
      openSampleModal(`Fiber Specimen Kit for "${title}"`);
    });
  }
}

function openSampleModal(sampleName) {
  closeAllModals();

  const backdrop = document.createElement('div');
  backdrop.id = 'terracoir-sample-modal';
  backdrop.className = 'terracoir-modal-backdrop';

  backdrop.innerHTML = `
    <div class="terracoir-modal-box p-6 sm:p-8" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-4 border-b border-[#e6decb] dark:border-[#2b333d]">
        <div class="flex items-center gap-2">
          <span class="badge-wheat">Courier Priority</span>
          <span class="text-xs font-bold text-[#944422] dark:text-[#e57a46]">Trade Fiber Kit</span>
        </div>
        <button type="button" class="modal-close-btn p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded transition-colors" aria-label="Close dialog">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="mt-5">
        <h3 class="text-xl sm:text-2xl font-extrabold brand-heading leading-tight">Request Fiber Specimen Box</h3>
        <p class="text-xs text-[#5e6670] dark:text-[#a0acb8] mt-1.5 leading-relaxed">
          Physical sample box containing coir bristled cores, 4 golden jute weave specimens, and woven burlap test strips.
        </p>
        <div class="mt-3 p-2.5 bg-[#f5ede6] dark:bg-[#1a2026] rounded-lg text-[11px] font-bold text-[#944422] dark:text-[#e57a46]">
          Selected Range: ${sampleName}
        </div>
      </div>

      <form id="modal-sample-form" class="mt-5 space-y-4" novalidate>
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-[#3c444c] dark:text-[#c4cfdb] mb-1">
            Recipient Name / Design Firm *
          </label>
          <input type="text" name="name" required placeholder="e.g., Alexandra Sterling" class="modal-input-name w-full h-9 px-3 text-xs border border-[#dcd1be] dark:border-[#2f3741] rounded bg-white dark:bg-[#1a2026] text-[#16191c] dark:text-[#f2f4f8] focus:outline-none focus:ring-1 focus:ring-[#944422]">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-[#3c444c] dark:text-[#c4cfdb] mb-1">
              Direct Phone *
            </label>
            <input type="tel" name="phone" required placeholder="e.g., +1 (206) 555-0144" class="modal-input-phone w-full h-9 px-3 text-xs border border-[#dcd1be] dark:border-[#2f3741] rounded bg-white dark:bg-[#1a2026] text-[#16191c] dark:text-[#f2f4f8] focus:outline-none focus:ring-1 focus:ring-[#944422]">
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-[#3c444c] dark:text-[#c4cfdb] mb-1">
              Trade Email Address *
            </label>
            <input type="email" name="email" required placeholder="e.g., studio@sterling.com" class="modal-input-email w-full h-9 px-3 text-xs border border-[#dcd1be] dark:border-[#2f3741] rounded bg-white dark:bg-[#1a2026] text-[#16191c] dark:text-[#f2f4f8] focus:outline-none focus:ring-1 focus:ring-[#944422]">
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-[#3c444c] dark:text-[#c4cfdb] mb-1">
            Studio / Site Delivery Address (Street, City, Postal Code) *
          </label>
          <input type="text" name="address" required placeholder="e.g., 740 Eco Harbor Way, Suite 200, Portland, OR 97201" class="modal-input-address w-full h-9 px-3 text-xs border border-[#dcd1be] dark:border-[#2f3741] rounded bg-white dark:bg-[#1a2026] text-[#16191c] dark:text-[#f2f4f8] focus:outline-none focus:ring-1 focus:ring-[#944422]">
        </div>

        <div class="modal-form-feedback hidden text-[11px] font-semibold text-rose-600 dark:text-rose-400"></div>

        <button type="submit" class="w-full py-3 bg-[#944422] hover:bg-[#793417] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow transition-colors">
          Dispatch Fiber Specimen Box (24-Hour Courier)
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  backdrop.addEventListener('click', closeAllModals);
  const closeBtn = backdrop.querySelector('.modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeAllModals);

  const form = backdrop.querySelector('#modal-sample-form');
  const nameInput = backdrop.querySelector('.modal-input-name');
  const phoneInput = backdrop.querySelector('.modal-input-phone');
  const emailInput = backdrop.querySelector('.modal-input-email');
  const addressInput = backdrop.querySelector('.modal-input-address');
  const feedback = backdrop.querySelector('.modal-form-feedback');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = nameInput ? nameInput.value.trim() : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const addrVal = addressInput ? addressInput.value.trim() : '';
      const strictEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!nameVal || nameVal.length < 2 || /[0-9]/.test(nameVal)) {
        showFeedback('Please enter a valid full name (letters only).');
        return;
      }
      if (!phoneVal || phoneVal.replace(/\D/g, '').length < 7 || /[a-zA-Z]/.test(phoneVal)) {
        showFeedback('Please enter a valid contact phone number.');
        return;
      }
      if (!emailVal || !strictEmail.test(emailVal)) {
        showFeedback('Please enter a valid trade email address.');
        return;
      }
      if (!addrVal || addrVal.length < 5) {
        showFeedback('Please provide a full delivery address.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Dispatching via Courier...';
      }
      if (typeof showToast === 'function') {
        showToast('Specimen Kit Queued!', 'Your fiber specimen box is scheduled for DHL Express dispatch to ' + addrVal + '.', 'success');
      }

      setTimeout(() => {
        const modalBox = backdrop.querySelector('.terracoir-modal-box');
        modalBox.innerHTML = `
          <div class="text-center py-8">
            <div class="w-14 h-14 bg-[#f5ede6] dark:bg-[#1a2026] text-[#944422] dark:text-[#e57a46] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span class="badge-clay">Specimen Kit Queued</span>
            <h3 class="text-2xl font-extrabold brand-heading mt-3">Fiber Box Dispatched!</h3>
            <p class="text-xs text-[#5e6670] dark:text-[#a0acb8] mt-2 max-w-sm mx-auto leading-relaxed">
              Your coir and golden jute specimen box has been scheduled for express courier to <strong>${addrVal}</strong>. Tracking manifest forwarded to <strong>${emailVal}</strong>.
            </p>
            <div class="mt-6">
              <button type="button" class="modal-success-close px-8 py-2.5 bg-[#944422] hover:bg-[#793417] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors">
                Return to Atelier
              </button>
            </div>
          </div>
        `;
        const successClose = modalBox.querySelector('.modal-success-close');
        if (successClose) successClose.addEventListener('click', closeAllModals);
      }, 700);
    });
  }

  function showFeedback(msg) {
    if (feedback) {
      feedback.textContent = msg;
      feedback.classList.remove('hidden');
    }
  }
}

function openStudyModal(title) {
  closeAllModals();

  const backdrop = document.createElement('div');
  backdrop.id = 'terracoir-study-modal';
  backdrop.className = 'terracoir-modal-backdrop';

  backdrop.innerHTML = `
    <div class="terracoir-modal-box p-6 sm:p-8" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-4 border-b border-[#e6decb] dark:border-[#2b333d]">
        <span class="badge-slate">Field Report</span>
        <button type="button" class="modal-close-btn p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded transition-colors" aria-label="Close dialog">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="mt-5">
        <h3 class="text-xl sm:text-2xl font-extrabold brand-heading leading-tight">${title}</h3>
        <p class="text-xs text-[#5e6670] dark:text-[#a0acb8] mt-2 leading-relaxed">
          Comprehensive civil engineering study documenting tensile shear retention, vegetative ground-cover establishment, and carbon offset calculations.
        </p>
      </div>

      <div class="mt-6 pt-5 border-t border-[#e6decb] dark:border-[#2b333d] flex gap-3">
        <button type="button" class="study-modal-close flex-1 py-3 bg-[#944422] hover:bg-[#793417] text-white text-xs font-bold uppercase tracking-wider rounded-full text-center transition-colors">
          Close Report
        </button>
        <a href="bulk-orders.html" class="flex-1 py-3 bg-white dark:bg-[#1a2026] border border-[#dcd1be] dark:border-[#2f3741] text-[#16191c] dark:text-[#f2f4f8] hover:bg-[#f7ede7] text-xs font-bold uppercase tracking-wider rounded-full text-center transition-colors">
          Commercial Procurement
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  backdrop.addEventListener('click', closeAllModals);
  const closeBtn = backdrop.querySelector('.modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeAllModals);
  const studyClose = backdrop.querySelector('.study-modal-close');
  if (studyClose) studyClose.addEventListener('click', closeAllModals);
}

function closeAllModals() {
  const existingModals = document.querySelectorAll('.terracoir-modal-backdrop');
  existingModals.forEach((m) => m.remove());
  document.body.style.overflow = '';
}
