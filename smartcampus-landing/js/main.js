/* ═══════════════════════════════════════════════════════════════
   SmartCampus — Landing page · Interactions
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Année du footer ───────────────────────────────────────── */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ── Navbar : fond au scroll + scroll progress ─────────────── */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
    // Barre de progression
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? Math.min((window.scrollY / docH) * 100, 100) : 0;
    nav.style.setProperty('--scroll-progress', pct + '%');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Menu mobile ───────────────────────────────────────────── */
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');
  const toggleMenu = (open) => {
    const isOpen = open ?? !burger.classList.contains('is-open');
    burger.classList.toggle('is-open', isOpen);
    links.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleMenu());
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => toggleMenu(false))
  );

  /* ── Révélation au scroll ──────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ── Compteurs animés ──────────────────────────────────────── */
  const animateCount = (el) => {
    if (el.dataset.anim) return; // déjà lancé
    el.dataset.anim = '1';
    const target = parseInt(el.dataset.count, 10) || 0;
    const dur = 1300;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('fr-FR');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const allCounts = () => document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    // Seuil 0 : se déclenche dès qu'un pixel entre dans le viewport,
    // même lors d'un scroll rapide (contrairement à threshold: 0.5).
    const ioCount = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            ioCount.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -6% 0px' }
    );
    allCounts().forEach((el) => ioCount.observe(el));
  } else {
    allCounts().forEach((el) =>
      (el.textContent = parseInt(el.dataset.count, 10).toLocaleString('fr-FR'))
    );
  }
  // Filet de sécurité : si un bloc `.reveal` devient visible et contient
  // des compteurs (cas d'un scroll très rapide), on les anime aussi.
  const ioReveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.count').forEach(animateCount);
        }
      });
    },
    { threshold: 0 }
  );
  document.querySelectorAll('.reveal').forEach((el) => ioReveal.observe(el));

  /* ── Tilt 3D sur les cartes au mousemove ──────────────────── */
  document.querySelectorAll('.feature, .role, .plan, .step').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px) scale(1.02)`;
      card.classList.add('is-tilting');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.classList.remove('is-tilting');
    });
  });

  /* ── Parallax subtil sur les blobs du hero ────────────────── */
  const blobs = document.querySelectorAll('.hero__blob');
  const heroVisual = document.querySelector('.hero__visual');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    blobs.forEach((b, i) => {
      b.style.transform = `translateY(${sy * (i === 0 ? .12 : .08)}px) scale(${1 + sy * .0002})`;
    });
    if (heroVisual) {
      heroVisual.style.transform = `translateY(${sy * .04}px)`;
    }
  }, { passive: true });

  /* ── Ripple au clic sur les boutons ────────────────────────── */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,.35);width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;transform:scale(0);animation:ripple .5s ease-out;pointer-events:none;`;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ── Toggle mensuel / annuel ───────────────────────────────── */
  const toggleBtns = document.querySelectorAll('.toggle__btn');
  toggleBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      const cycle = btn.dataset.cycle; // 'mensuel' | 'annuel'
      document.querySelectorAll('[data-price]').forEach((el) => {
        const show = el.dataset.price === cycle;
        el.hidden = !show;
      });
      document.querySelectorAll('[data-cycle-label]').forEach((el) => {
        el.textContent = cycle === 'annuel' ? '/ an' : '/ mois';
      });
    })
  );

  /* ── FAQ : fermer les autres items à l'ouverture ───────────── */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach((item) =>
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    })
  );

  /* ── Modal de demande de création d'établissement ──────────── */
  const leadModal       = document.getElementById('leadModal');
  const leadForm        = document.getElementById('leadForm');
  const leadFormView    = document.getElementById('leadFormView');
  const leadSuccessView = document.getElementById('leadSuccessView');
  const leadError       = document.getElementById('leadError');
  const leadSubmit      = document.getElementById('leadSubmit');
  const leadSubmitLabel = leadSubmit.querySelector('.lead__submit-label');
  const leadSpinner     = leadSubmit.querySelector('.lead__spinner');
  const LEAD_ENDPOINT   = 'https://smartcampus-auth.onrender.com/auth/leads';

  const openLeadModal = (plan) => {
    leadForm.reset();
    leadError.hidden = true;
    document.getElementById('leadPlan').value = plan || 'pro';
    leadSuccessView.hidden = true;
    leadFormView.hidden = false;
    leadSubmit.disabled = false;
    leadSubmitLabel.textContent = "Envoyer ma demande de création d'établissement";
    leadSpinner.hidden = true;
    leadModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('leadEtab').focus(), 60);
  };

  const closeLeadModal = () => {
    leadModal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  // Tous les CTA « essai gratuit » / « souscription » ouvrent le formulaire
  document.querySelectorAll('a[href="#essai"], a[data-plan]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openLeadModal(a.dataset.plan || 'pro');
    });
  });

  document.querySelectorAll('[data-close-lead]').forEach((el) =>
    el.addEventListener('click', closeLeadModal)
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && leadModal.classList.contains('is-open')) closeLeadModal();
  });

  // Clic sur l'overlay = fermeture
  leadModal.querySelector('.modal__overlay').addEventListener('click', closeLeadModal);

  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!leadForm.checkValidity()) {
      leadForm.reportValidity();
      return;
    }

    leadError.hidden = true;
    leadSubmit.disabled = true;
    leadSubmitLabel.textContent = 'Envoi en cours...';
    leadSpinner.hidden = false;

    try {
      const payload = Object.fromEntries(new FormData(leadForm));
      const res = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi de la demande");

      document.getElementById('leadSuccessName').textContent =
        `${payload.prenomAdmin} ${payload.nomAdmin}`;
      document.getElementById('leadSuccessEtab').textContent = payload.etablissementNom;
      document.getElementById('leadSuccessEmail').textContent = payload.emailAdmin;
      leadFormView.hidden = true;
      leadSuccessView.hidden = false;
    } catch (err) {
      leadError.textContent =
        err.message || 'Une erreur est survenue. Veuillez réessayer dans quelques instants.';
      leadError.hidden = false;
    } finally {
      leadSubmit.disabled = false;
      leadSubmitLabel.textContent = "Envoyer ma demande de création d'établissement";
      leadSpinner.hidden = true;
    }
  });
})();
