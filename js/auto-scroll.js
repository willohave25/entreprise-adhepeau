/* ===========================================
   W2K Auto-Scroll Premium V3
   Défilement automatique vitrine digitale
   Simple, fiable, production-ready
   W2K-Digital 2025
   =========================================== */

var W2KAutoScroll = (function () {
  'use strict';

  /* Configuration */
  var config = {
    speed: 'slow',
    pauseDuration: 12,
    inactivityDelay: 45,
    showIndicator: true
  };

  /* État */
  var sections = [];
  var indexActuel = 0;
  var actif = false;
  var enPause = false;
  var timerSection = null;
  var timerInactivite = null;
  var timerDemarrage = null;
  var indicateur = null;

  /* ========================================
     INITIALISATION
     ======================================== */
  function init(options) {
    /* Fusionner les options */
    if (options) {
      if (options.speed) config.speed = options.speed;
      if (options.pauseDuration) config.pauseDuration = options.pauseDuration;
      if (options.inactivityDelay) config.inactivityDelay = options.inactivityDelay;
      if (typeof options.showIndicator !== 'undefined') config.showIndicator = options.showIndicator;
    }

    /* Récupérer toutes les sections */
    sections = document.querySelectorAll('[data-autoscroll]');
    if (sections.length === 0) return;

    /* Créer indicateur visuel */
    if (config.showIndicator) {
      creerIndicateur();
    }

    /* Écouter les interactions utilisateur */
    ecouterInteractions();

    /* Démarrer après 3 secondes */
    timerDemarrage = setTimeout(function () {
      lancerAutoScroll();
    }, 3000);
  }

  /* ========================================
     INDICATEUR VISUEL (point or pulsant)
     ======================================== */
  function creerIndicateur() {
    indicateur = document.createElement('div');
    indicateur.className = 'w2k-scroll-indicator';
    indicateur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(indicateur);
  }

  function mettreAJourIndicateur() {
    if (!indicateur) return;
    if (enPause) {
      indicateur.classList.add('paused');
    } else {
      indicateur.classList.remove('paused');
    }
  }

  /* ========================================
     LANCER L'AUTO-SCROLL
     ======================================== */
  function lancerAutoScroll() {
    actif = true;
    enPause = false;
    mettreAJourIndicateur();

    /* Trouver la section visible actuellement */
    detecterSectionVisible();

    /* Programmer le scroll vers la prochaine section */
    programmerProchainScroll();
  }

  /* ========================================
     PROGRAMMER LE PROCHAIN SCROLL
     Attend pauseDuration secondes puis scrolle
     ======================================== */
  function programmerProchainScroll() {
    if (!actif || enPause) return;

    annulerTimers();

    timerSection = setTimeout(function () {
      scrollerVersSuivant();
    }, config.pauseDuration * 1000);
  }

  /* ========================================
     SCROLLER VERS LA SECTION SUIVANTE
     ======================================== */
  function scrollerVersSuivant() {
    if (!actif || enPause) return;

    var prochainIndex = indexActuel + 1;

    /* Toutes les sections sont parcourues */
    if (prochainIndex >= sections.length) {
      /* Rediriger vers la page suivante */
      var pageSuivante = document.body.getAttribute('data-next-page');
      if (pageSuivante) {
        /* Pause avant la redirection */
        timerSection = setTimeout(function () {
          if (actif && !enPause) {
            window.location.href = pageSuivante;
          }
        }, config.pauseDuration * 1000);
      } else {
        /* Pas de page suivante, retour au début */
        indexActuel = 0;
        scrollerVersSection(0);
      }
      return;
    }

    /* Scroller vers la prochaine section */
    indexActuel = prochainIndex;
    scrollerVersSection(prochainIndex);
  }

  /* ========================================
     SCROLLER VERS UNE SECTION SPÉCIFIQUE
     Utilise scrollTo smooth natif du navigateur
     ======================================== */
  function scrollerVersSection(index) {
    if (!actif || enPause) return;
    if (index < 0 || index >= sections.length) return;

    var cible = sections[index];
    var headerEl = document.querySelector('.header');
    var offsetHeader = headerEl ? headerEl.offsetHeight : 0;

    /* Calculer la position de destination */
    var rect = cible.getBoundingClientRect();
    var destination = rect.top + window.pageYOffset - offsetHeader;

    /* Scroll smooth natif */
    window.scrollTo({
      top: destination,
      behavior: 'smooth'
    });

    /* Attendre que le scroll soit terminé puis programmer le suivant */
    /* Le scroll smooth prend environ 500-1000ms selon la distance */
    var distance = Math.abs(destination - window.pageYOffset);
    var delaiScroll = Math.min(Math.max(distance * 0.5, 500), 2000);

    setTimeout(function () {
      if (actif && !enPause) {
        programmerProchainScroll();
      }
    }, delaiScroll);
  }

  /* ========================================
     DÉTECTER LA SECTION ACTUELLEMENT VISIBLE
     ======================================== */
  function detecterSectionVisible() {
    var scrollY = window.pageYOffset || window.scrollY;
    var milieu = scrollY + (window.innerHeight / 2);

    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      var haut = rect.top + scrollY;
      var bas = haut + rect.height;

      if (milieu >= haut && milieu < bas) {
        indexActuel = i;
        return;
      }
    }

    /* Par défaut, première section */
    indexActuel = 0;
  }

  /* ========================================
     METTRE EN PAUSE (interaction utilisateur)
     ======================================== */
  function mettreEnPause() {
    if (!actif) return;
    if (enPause) {
      /* Déjà en pause, relancer le timer inactivité */
      relancerTimerInactivite();
      return;
    }

    enPause = true;
    mettreAJourIndicateur();
    annulerTimers();

    /* Reprendre après inactivité */
    relancerTimerInactivite();
  }

  function relancerTimerInactivite() {
    clearTimeout(timerInactivite);
    timerInactivite = setTimeout(function () {
      reprendre();
    }, config.inactivityDelay * 1000);
  }

  /* ========================================
     REPRENDRE APRÈS INACTIVITÉ
     ======================================== */
  function reprendre() {
    if (!actif || !enPause) return;

    enPause = false;
    mettreAJourIndicateur();

    /* Recalculer la position */
    detecterSectionVisible();

    /* Reprendre le défilement */
    programmerProchainScroll();
  }

  /* ========================================
     ANNULER TOUS LES TIMERS
     ======================================== */
  function annulerTimers() {
    clearTimeout(timerSection);
    clearTimeout(timerInactivite);
  }

  /* ========================================
     ÉCOUTER LES INTERACTIONS UTILISATEUR
     wheel, touchstart, mousedown, keydown
     ======================================== */
  function ecouterInteractions() {

    /* Molette souris */
    document.addEventListener('wheel', function () {
      if (actif) mettreEnPause();
    }, { passive: true });

    /* Touch écran */
    document.addEventListener('touchstart', function () {
      if (actif) mettreEnPause();
    }, { passive: true });

    /* Clic souris (pas sur les liens de navigation) */
    document.addEventListener('mousedown', function (e) {
      if (!actif) return;
      /* Ignorer les clics sur les liens et boutons */
      if (e.target.closest('a') || e.target.closest('button')) return;
      if (indicateur && indicateur.contains(e.target)) return;
      mettreEnPause();
    }, { passive: true });

    /* Clavier */
    document.addEventListener('keydown', function (e) {
      /* Flèches, espace, page up/down */
      var touches = [32, 33, 34, 35, 36, 37, 38, 39, 40];
      if (touches.indexOf(e.keyCode) !== -1) {
        if (actif) mettreEnPause();
      }
    }, { passive: true });
  }

  /* ========================================
     API PUBLIQUE
     ======================================== */
  return {
    init: init,
    pause: mettreEnPause,
    reprendre: reprendre,
    demarrer: lancerAutoScroll
  };

})();
