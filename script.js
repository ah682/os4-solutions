(() => {
  'use strict';

  const documentRoot = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Header state
  const header = document.querySelector('[data-header]');
  let scrollFrame = null;

  const syncHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 28);
    scrollFrame = null;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(syncHeader);
    },
    { passive: true }
  );
  syncHeader();

  // Mobile navigation
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  let lastFocusedElement = null;

  const menuFocusable = () =>
    mobileMenu
      ? [...mobileMenu.querySelectorAll('a[href], button:not([disabled])')]
      : [];

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;

    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileMenu.classList.toggle('is-open', open);
    header?.classList.toggle('menu-active', open);
    body.classList.toggle('menu-open', open);

    if (open) {
      lastFocusedElement = document.activeElement;
      window.setTimeout(() => menuFocusable()[0]?.focus(), reducedMotion ? 0 : 260);
    } else if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu?.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    const menuIsOpen = menuToggle?.getAttribute('aria-expanded') === 'true';
    if (!menuIsOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false);
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = menuFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && menuToggle?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
    }
  });

  // Scroll reveals: content remains visible when JS or IntersectionObserver is unavailable.
  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -45px' }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Subtle pointer response on the illustrative deployment window.
  const heroVisual = document.querySelector('[data-hero-visual]');
  if (heroVisual && finePointer && !reducedMotion) {
    heroVisual.addEventListener('pointermove', (event) => {
      const bounds = heroVisual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      heroVisual.style.setProperty('--ry', `${x * 5.5}deg`);
      heroVisual.style.setProperty('--rx', `${y * -4.5}deg`);
    });

    heroVisual.addEventListener('pointerleave', () => {
      heroVisual.style.setProperty('--ry', '0deg');
      heroVisual.style.setProperty('--rx', '0deg');
    });
  }

  // Accessible engagement tabs
  document.querySelectorAll('[data-tabs]').forEach((tabGroup) => {
    const tabs = [...tabGroup.querySelectorAll('[role="tab"]')];
    const panels = [...tabGroup.querySelectorAll('[role="tabpanel"]')];

    const activateTab = (nextTab, moveFocus = true) => {
      tabs.forEach((tab) => {
        const selected = tab === nextTab;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== nextTab.getAttribute('aria-controls');
      });

      if (moveFocus) nextTab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab, false));
      tab.addEventListener('keydown', (event) => {
        let nextIndex = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        activateTab(tabs[nextIndex]);
      });
    });

    const initiallySelected = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
    if (initiallySelected) activateTab(initiallySelected, false);
  });

  // Keep the FAQ compact while preserving native details behaviour.
  const faqDetails = [...document.querySelectorAll('.faq-list details')];
  faqDetails.forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      faqDetails.forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  // Reflect the section currently in view in the desktop navigation.
  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const trackedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && trackedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${visible.target.id}`;
          link.classList.toggle('is-active', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      },
      { threshold: [0.18, 0.35, 0.55], rootMargin: '-20% 0px -58%' }
    );

    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  // Static-friendly contact form: validates locally, then prepares a mailto draft.
  const contactEmail = 'hello@os4solutions.tech';
  const contactForm = document.querySelector('[data-contact-form]');
  const formStatus = document.querySelector('[data-form-status]');

  if (contactForm) contactForm.noValidate = true;

  const setFieldError = (input, message = '') => {
    const field = input.closest('.field');
    const error = field?.querySelector('.field-error');
    field?.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message;
  };

  const validateForm = () => {
    if (!contactForm) return false;
    const name = contactForm.elements.name;
    const email = contactForm.elements.email;
    const message = contactForm.elements.message;
    let valid = true;

    if (name.value.trim().length < 2) {
      setFieldError(name, 'Please add your name.');
      valid = false;
    } else setFieldError(name);

    if (!email.value.trim() || !email.validity.valid) {
      setFieldError(email, 'Please use a valid email address.');
      valid = false;
    } else setFieldError(email);

    if (message.value.trim().length < 15) {
      setFieldError(message, 'A little more detail will help—please use at least 15 characters.');
      valid = false;
    } else setFieldError(message);

    if (!valid) {
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      if (formStatus) formStatus.textContent = 'Please check the highlighted fields.';
    }

    return valid;
  };

  contactForm?.querySelectorAll('input[required], textarea[required]').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') setFieldError(input);
      if (formStatus) formStatus.textContent = '';
    });
  });

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const data = new FormData(contactForm);
    const name = String(data.get('name')).trim();
    const email = String(data.get('email')).trim();
    const company = String(data.get('company') || '').trim();
    const need = String(data.get('need') || 'Project enquiry');
    const message = String(data.get('message')).trim();
    const subject = `${need} — ${company || name}`;
    const bodyText = [
      `Hi Ava,`,
      '',
      message,
      '',
      `—`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || 'Not provided'}`,
      `Project type: ${need}`
    ].join('\n');

    if (formStatus) formStatus.textContent = 'Opening a prepared draft in your email app…';
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  });

  // Copy-to-clipboard helper with a fallback for older browsers.
  const copyButton = document.querySelector('[data-copy-email]');
  const copyStatus = document.querySelector('[data-copy-status]');

  const fallbackCopy = (text) => {
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = text;
    temporaryInput.setAttribute('readonly', '');
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand('copy');
    temporaryInput.remove();
    return copied;
  };

  copyButton?.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(contactEmail);
      } else if (!fallbackCopy(contactEmail)) {
        throw new Error('Clipboard unavailable');
      }
      if (copyStatus) copyStatus.textContent = 'Email address copied.';
      copyButton.textContent = 'Copied';
    } catch {
      if (copyStatus) copyStatus.textContent = `Copy unavailable—use ${contactEmail}.`;
    }
  });

  document.querySelectorAll('[data-year]').forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });

  documentRoot.classList.add('is-ready');
})();
