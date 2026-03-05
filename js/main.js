/* ===========================================
   ENTREPRISE ADHEPEAU - Script principal
   Menu, navigation, interactions UI
   W2K-Digital 2025
   =========================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Menu hamburger mobile --- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');

  function ouvrirMenuMobile() {
    if (mobileMenu) mobileMenu.classList.add('open');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function fermerMenuMobile() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', ouvrirMenuMobile);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', fermerMenuMobile);
  if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', fermerMenuMobile);

  /* --- Dropdown menu produits (desktop) --- */
  const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
  const dropdownMenu = document.querySelector('.nav-dropdown');

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropdownToggle.classList.toggle('open');
      dropdownMenu.classList.toggle('open');
    });

    // Fermer en cliquant ailleurs
    document.addEventListener('click', function (e) {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownToggle.classList.remove('open');
        dropdownMenu.classList.remove('open');
      }
    });
  }

  /* --- Dropdown menu produits (mobile) --- */
  const mobileDropdownToggle = document.querySelector('.mobile-dropdown-toggle');
  const mobileDropdown = document.querySelector('.mobile-dropdown');

  if (mobileDropdownToggle && mobileDropdown) {
    mobileDropdownToggle.addEventListener('click', function (e) {
      e.preventDefault();
      mobileDropdownToggle.classList.toggle('open');
      mobileDropdown.classList.toggle('open');
    });
  }

  /* --- Header shrink on scroll --- */
  const header = document.querySelector('.header');
  let lastScroll = 0;

  function gererScrollHeader() {
    const scrollY = window.scrollY;
    if (header) {
      if (scrollY > 80) {
        header.classList.add('shrink');
      } else {
        header.classList.remove('shrink');
      }
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', gererScrollHeader, { passive: true });

  /* --- Scroll to top button --- */
  const scrollTopBtn = document.querySelector('.scroll-top');

  function gererBoutonScrollTop() {
    if (scrollTopBtn) {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', gererBoutonScrollTop, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Smooth scroll pour les liens ancres --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (lien) {
    lien.addEventListener('click', function (e) {
      var cible = document.querySelector(this.getAttribute('href'));
      if (cible) {
        e.preventDefault();
        var offset = header ? header.offsetHeight : 0;
        var position = cible.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: position, behavior: 'smooth' });
        // Fermer le menu mobile si ouvert
        fermerMenuMobile();
      }
    });
  });

  /* --- Page active dans la navigation --- */
  function surlignerPageActive() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    
    // Navigation desktop
    document.querySelectorAll('.nav-menu > li > a').forEach(function (lien) {
      var href = lien.getAttribute('href');
      if (href === page) {
        lien.classList.add('active');
      }
    });

    // Dropdown desktop
    document.querySelectorAll('.nav-dropdown li a').forEach(function (lien) {
      var href = lien.getAttribute('href');
      if (href === page) {
        lien.classList.add('active');
        // Souligner aussi le parent Produits
        if (dropdownToggle) {
          dropdownToggle.querySelector('a') && dropdownToggle.classList.add('active');
        }
      }
    });

    // Navigation mobile
    document.querySelectorAll('.mobile-nav > li > a').forEach(function (lien) {
      var href = lien.getAttribute('href');
      if (href === page) {
        lien.classList.add('active');
      }
    });
  }

  surlignerPageActive();

  /* --- Validation formulaire contact basique --- */
  var formulaire = document.querySelector('.form-contact form');
  if (formulaire) {
    formulaire.addEventListener('submit', function (e) {
      e.preventDefault();
      var valide = true;
      var messageDiv = document.querySelector('.form-message');

      // Vérifier champs requis
      var champsRequis = formulaire.querySelectorAll('[required]');
      champsRequis.forEach(function (champ) {
        if (!champ.value.trim()) {
          valide = false;
          champ.style.borderColor = '#c0392b';
        } else {
          champ.style.borderColor = '';
        }
      });

      // Vérifier format email
      var emailChamp = formulaire.querySelector('input[type="email"]');
      if (emailChamp && emailChamp.value) {
        var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(emailChamp.value)) {
          valide = false;
          emailChamp.style.borderColor = '#c0392b';
        }
      }

      // Vérifier format téléphone
      var telChamp = formulaire.querySelector('input[type="tel"]');
      if (telChamp && telChamp.value) {
        var regexTel = /^[\+]?[0-9\s\-]{8,20}$/;
        if (!regexTel.test(telChamp.value)) {
          valide = false;
          telChamp.style.borderColor = '#c0392b';
        }
      }

      if (valide) {
        if (messageDiv) {
          messageDiv.className = 'form-message success';
          messageDiv.textContent = 'Merci ! Votre message a été envoyé. Nous vous répondrons sous 24h.';
          messageDiv.style.display = 'block';
        }
        formulaire.reset();
      } else {
        if (messageDiv) {
          messageDiv.className = 'form-message error';
          messageDiv.textContent = 'Veuillez remplir correctement tous les champs obligatoires.';
          messageDiv.style.display = 'block';
        }
      }

      // Masquer message après 5 secondes
      setTimeout(function () {
        if (messageDiv) messageDiv.style.display = 'none';
      }, 5000);
    });
  }

  /* --- Lazy loading support (Intersection Observer) --- */
  if ('IntersectionObserver' in window) {
    var observateur = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observateur.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      observateur.observe(el);
    });
  } else {
    // Fallback navigateurs anciens
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  }

});
