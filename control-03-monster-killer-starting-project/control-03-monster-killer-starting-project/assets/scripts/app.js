/**
 * Whisker & Co. — Cat Accessories Landing Page
 * Vanilla JS interactivity: mobile menu, add-to-cart, smooth scroll,
 * newsletter validation, dynamic footer year, and scroll-spy nav highlighting.
 *
 * Wrapped in DOMContentLoaded so all elements are guaranteed to exist
 * before we query them (the script tag already has `defer`, but this is
 * a belt-and-suspenders safety measure).
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* =========================================================
   * 1. ELEMENT REFERENCES
   * Cache DOM nodes up-front for performance and readability.
   * ========================================================= */
  const menuToggle  = document.getElementById('menu-toggle');
  const navLinks    = document.getElementById('nav-links');
  const cartBtn     = document.getElementById('cart-btn');
  const cartCount   = document.getElementById('cart-count');
  const newsletterForm    = document.getElementById('newsletter-form');
  const newsletterEmail   = document.getElementById('newsletter-email');
  const newsletterMessage = document.getElementById('newsletter-message');
  const currentYearEl     = document.getElementById('current-year');

  /* Running cart total kept in a variable so we don't rely solely on
     parsing the DOM text on every click. */
  let cartTotal = 0;

  /* =========================================================
   * 2. MOBILE MENU TOGGLE
   * Toggles the `nav-open` class on both the nav-links container and
   * the hamburger button, and updates `aria-expanded` for screen readers.
   * ========================================================= */
  const toggleMobileMenu = (forceOpen) => {
    if (!menuToggle || !navLinks) return;

    // Determine target state: explicit override or flip current state.
    const willOpen = typeof forceOpen === 'boolean'
      ? forceOpen
      : !navLinks.classList.contains('nav-open');

    navLinks.classList.toggle('nav-open', willOpen);
    menuToggle.classList.toggle('nav-open', willOpen);
    menuToggle.setAttribute('aria-expanded', String(willOpen));
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => toggleMobileMenu());
  }

  /* Close the mobile menu when any nav link is clicked so the menu
     collapses after navigation on small screens. */
  if (navLinks) {
    navLinks.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        toggleMobileMenu(false);
      }
    });
  }

  /* =========================================================
   * 3. ADD TO CART (event delegation)
   * A single delegated listener on the document handles every
   * `.add-to-cart-btn` click. Increments the badge and provides
   * visual feedback: a bounce on the cart button + a temporary
   * "Added!" label on the clicked button.
   * ========================================================= */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;

    // Increment running total and update the badge.
    cartTotal += 1;
    if (cartCount) {
      cartCount.textContent = String(cartTotal);
    }

    // --- Visual feedback on the cart button (scale bounce) ---
    if (cartBtn) {
      cartBtn.classList.remove('cart-bounce');          // reset to allow re-trigger
      // Force reflow so the animation restarts reliably.
      void cartBtn.offsetWidth;
      cartBtn.classList.add('cart-bounce');
    }

    // --- Visual feedback on the clicked button ("Added!" text) ---
    const originalText = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.disabled = true;

    // Revert after ~1.2s.
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 1200);
  });

  /* CSS keyframes for the cart bounce are injected once so we don't
     need to touch app.css. */
  const bounceStyle = document.createElement('style');
  bounceStyle.textContent = `
    @keyframes cartBounce {
      0%   { transform: scale(1); }
      30%  { transform: scale(1.25); }
      60%  { transform: scale(0.92); }
      100% { transform: scale(1); }
    }
    .cart-bounce {
      animation: cartBounce 0.4s ease;
    }
  `;
  document.head.appendChild(bounceStyle);

  /* =========================================================
   * 4. SMOOTH SCROLL NAVIGATION
   * Progressive enhancement: intercept clicks on in-page anchor
   * links (`a[href^="#"]`) in the navbar and footer, then use
   * scrollIntoView for smooth scrolling. Placeholder links with
   * `href="#"` are skipped (no scroll, no preventDefault).
   * ========================================================= */
  const handleAnchorClick = (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');

    // Skip placeholder links — let them behave naturally (no-op).
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Move focus to the target for keyboard / screen-reader users.
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  // Delegate on navbar and footer (covers nav links, hero CTAs, footer links).
  const navbar = document.getElementById('navbar');
  const footer = document.getElementById('contact');
  if (navbar) navbar.addEventListener('click', handleAnchorClick);
  if (footer) footer.addEventListener('click', handleAnchorClick);

  // Also handle hero CTA buttons (they live in <main>, outside navbar/footer).
  const hero = document.getElementById('home');
  if (hero) hero.addEventListener('click', handleAnchorClick);

  /* =========================================================
   * 5. NEWSLETTER FORM VALIDATION
   * The form has `novalidate`, so JS owns validation. On submit:
   *   - Validate email with a simple regex.
   *   - Invalid  → show error message + shake the input.
   *   - Valid    → clear input, show success message.
   * The message auto-hides after 5 seconds.
   * ========================================================= */
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let messageTimeout = null;

  const showMessage = (text, isError = false) => {
    if (!newsletterMessage) return;

    newsletterMessage.textContent = text;
    newsletterMessage.classList.remove('hidden');

    // Toggle an error class for potential styling (forward-compatible).
    newsletterMessage.classList.toggle('newsletter-error', isError);

    // Clear any pending auto-hide timer and set a fresh one.
    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
      newsletterMessage.classList.add('hidden');
      newsletterMessage.classList.remove('newsletter-error');
    }, 5000);
  };

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = newsletterEmail ? newsletterEmail.value.trim() : '';

      if (!EMAIL_REGEX.test(email)) {
        // Invalid email — show error and shake the input.
        showMessage('⚠️ Please enter a valid email address.', true);

        if (newsletterEmail) {
          newsletterEmail.classList.remove('shake');
          void newsletterEmail.offsetWidth; // force reflow to restart animation
          newsletterEmail.classList.add('shake');
          newsletterEmail.focus();
        }
        return;
      }

      // Valid email — show success and reset the form.
      showMessage('🎉 Welcome to the Whisker Club! Check your inbox for your 10% off code.', false);
      newsletterForm.reset();
    });
  }

  // Inject shake keyframes (same rationale as the cart bounce).
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes inputShake {
      0%, 100% { transform: translateX(0); }
      20%      { transform: translateX(-8px); }
      40%      { transform: translateX(8px); }
      60%      { transform: translateX(-6px); }
      80%      { transform: translateX(6px); }
    }
    .shake {
      animation: inputShake 0.4s ease;
    }
  `;
  document.head.appendChild(shakeStyle);

  /* =========================================================
   * 6. DYNAMIC FOOTER YEAR
   * Replace the placeholder year with the current year on load.
   * ========================================================= */
  if (currentYearEl) {
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  /* =========================================================
   * 7. SCROLL SPY (optional enhancement)
   * Uses IntersectionObserver to highlight the nav link whose
   * target section is currently in view. Adds/removes the `active`
   * class on the matching `.nav-link`. Lightweight and progressive.
   * ========================================================= */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkEls = navLinks
    ? navLinks.querySelectorAll('.nav-link')
    : [];

  if (sections.length > 0 && navLinkEls.length > 0 && 'IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = entry.target.id;

          // Remove `active` from all nav links, then add to the matching one.
          navLinkEls.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
          });
        });
      },
      {
        // Trigger when the section's top crosses ~40% of the viewport.
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => spyObserver.observe(section));
  }
});
