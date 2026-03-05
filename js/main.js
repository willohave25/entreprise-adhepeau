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

  /* --- Carrousel témoignages automatique --- */
  var carouselContainer = document.querySelector('.temoignages-carousel');
  var carouselGrid = document.querySelector('.temoignages-grid');

  if (carouselContainer && carouselGrid) {
    var cartes = carouselGrid.querySelectorAll('.temoignage-card');
    var totalCartes = cartes.length;
    var indexCarousel = 0;
    var timerCarousel = null;
    var delaiCarousel = 4000;

    function cartesVisibles() {
      var largeur = window.innerWidth;
      if (largeur >= 1025) return 3;
      if (largeur >= 481) return 2;
      return 1;
    }

    /* Créer les contrôles */
    var controlsDiv = document.createElement('div');
    controlsDiv.className = 'carousel-controls';

    var btnPrev = document.createElement('button');
    btnPrev.className = 'carousel-btn';
    btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    btnPrev.setAttribute('aria-label', 'Précédent');

    var dotsDiv = document.createElement('div');
    dotsDiv.className = 'carousel-dots';

    var btnNext = document.createElement('button');
    btnNext.className = 'carousel-btn';
    btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
    btnNext.setAttribute('aria-label', 'Suivant');

    controlsDiv.appendChild(btnPrev);
    controlsDiv.appendChild(dotsDiv);
    controlsDiv.appendChild(btnNext);
    carouselContainer.appendChild(controlsDiv);

    function creerDots() {
      dotsDiv.innerHTML = '';
      var nbSlides = Math.max(1, totalCartes - cartesVisibles() + 1);
      for (var i = 0; i < nbSlides; i++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Témoignage ' + (i + 1));
        dot.dataset.index = i;
        dot.addEventListener('click', function () {
          allerAuSlide(parseInt(this.dataset.index));
        });
        dotsDiv.appendChild(dot);
      }
    }

    function allerAuSlide(index) {
      var nbVisibles = cartesVisibles();
      var maxIndex = Math.max(0, totalCartes - nbVisibles);
      indexCarousel = Math.min(Math.max(0, index), maxIndex);

      if (totalCartes > 0 && cartes[0]) {
        var carteWidth = cartes[0].offsetWidth;
        var gap = parseInt(window.getComputedStyle(carouselGrid).gap) || 24;
        var offset = indexCarousel * (carteWidth + gap);
        carouselGrid.style.transform = 'translateX(-' + offset + 'px)';
      }

      var dots = dotsDiv.querySelectorAll('.carousel-dot');
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === indexCarousel);
      });

      lancerAutoPlay();
    }

    function slideSuivant() {
      var maxIndex = Math.max(0, totalCartes - cartesVisibles());
      var prochain = indexCarousel + 1;
      if (prochain > maxIndex) prochain = 0;
      allerAuSlide(prochain);
    }

    function slidePrecedent() {
      var maxIndex = Math.max(0, totalCartes - cartesVisibles());
      var precedent = indexCarousel - 1;
      if (precedent < 0) precedent = maxIndex;
      allerAuSlide(precedent);
    }

    function lancerAutoPlay() {
      clearInterval(timerCarousel);
      timerCarousel = setInterval(slideSuivant, delaiCarousel);
    }

    btnNext.addEventListener('click', slideSuivant);
    btnPrev.addEventListener('click', slidePrecedent);

    carouselContainer.addEventListener('mouseenter', function () { clearInterval(timerCarousel); });
    carouselContainer.addEventListener('mouseleave', lancerAutoPlay);

    var touchStartX = 0;
    carouselContainer.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      clearInterval(timerCarousel);
    }, { passive: true });
    carouselContainer.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) slideSuivant(); else slidePrecedent();
      }
      lancerAutoPlay();
    }, { passive: true });

    window.addEventListener('resize', function () { creerDots(); allerAuSlide(indexCarousel); });

    creerDots();
    lancerAutoPlay();
  }

});
