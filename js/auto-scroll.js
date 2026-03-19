/* ===========================================
   W2K Auto-Scroll V4 - Mode Salle d'Attente
   Défilement continu lent de haut en bas
   Puis page suivante, boucle infinie
   Parfait pour écrans vitrine / salle d'attente
   W2K-Digital 2025
   =========================================== */

var W2KAutoScroll = (function () {
  'use strict';

  var config = {
    speed: 'slow',
    pauseDuration: 3,
    inactivityDelay: 30,
    showIndicator: true
  };

  /* Pixels par frame à ~60fps */
  var vitesses = {
    slow: 0.6,
    medium: 1.2,
    fast: 2.0
  };

  var animationId = null;
  var actif = false;
  var enPause = false;
  var indicateur = null;
  var timerDemarrage = null;
  var timerInactivite = null;

  /* ======================================== */
  /*  INITIALISATION                          */
  /* ======================================== */
  function init(options) {
    if (options) {
      if (options.speed) config.speed = options.speed;
      if (options.pauseDuration) config.pauseDuration = options.pauseDuration;
      if (options.inactivityDelay) config.inactivityDelay = options.inactivityDelay;
      if (typeof options.showIndicator !== 'undefined') config.showIndicator = options.showIndicator;
    }

    if (config.showIndicator) creerIndicateur();
    ecouterInteractions();

    /* Démarrer après un court délai */
    timerDemarrage = setTimeout(function () {
      demarrer();
    }, config.pauseDuration * 1000);
  }

  /* ======================================== */
  /*  INDICATEUR VISUEL                       */
  /* ======================================== */
  function creerIndicateur() {
    indicateur = document.createElement('div');
    indicateur.className = 'w2k-scroll-indicator';
    indicateur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(indicateur);
  }

  function majIndicateur() {
    if (!indicateur) return;
    if (enPause) {
      indicateur.classList.add('paused');
    } else {
      indicateur.classList.remove('paused');
    }
  }

  /* ======================================== */
  /*  DÉMARRER LE DÉFILEMENT CONTINU          */
  /* ======================================== */
  function demarrer() {
    actif = true;
    enPause = false;
    majIndicateur();
    defiler();
  }

  /* ======================================== */
  /*  BOUCLE DE DÉFILEMENT CONTINU            */
  /*  Avance de X pixels chaque frame         */
  /*  Arrivé en bas → page suivante           */
  /* ======================================== */
  function defiler() {
    if (!actif || enPause) return;

    var vitesse = vitesses[config.speed] || vitesses.slow;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var posActuelle = window.pageYOffset;

    /* Arrivé tout en bas de la page */
    if (posActuelle >= maxScroll - 1) {
      /* Aller à la page suivante */
      var pageSuivante = document.body.getAttribute('data-next-page');
      if (pageSuivante) {
        /* Petit délai avant de changer de page */
        setTimeout(function () {
          if (actif && !enPause) {
            window.location.href = pageSuivante;
          }
        }, 2000);
        return;
      } else {
        /* Pas de page suivante, retour en haut */
        window.scrollTo(0, 0);
      }
    }

    /* Avancer de quelques pixels */
    window.scrollTo(0, posActuelle + vitesse);

    /* Prochaine frame */
    animationId = requestAnimationFrame(defiler);
  }

  /* ======================================== */
  /*  PAUSE / REPRISE                         */
  /* ======================================== */
  function mettreEnPause() {
    if (!actif) return;
    enPause = true;
    majIndicateur();
    cancelAnimationFrame(animationId);

    /* Reprendre après inactivité */
    clearTimeout(timerInactivite);
    timerInactivite = setTimeout(function () {
      reprendre();
    }, config.inactivityDelay * 1000);
  }

  function reprendre() {
    if (!actif) return;
    enPause = false;
    majIndicateur();
    defiler();
  }

  /* ======================================== */
  /*  ÉCOUTER LES INTERACTIONS                */
  /*  Touch/clic/molette → pause              */
  /*  Inactivité 30s → reprise               */
  /* ======================================== */
  function ecouterInteractions() {

    var gerer = function () {
      if (!actif) return;
      if (enPause) {
        /* Déjà en pause, relancer le timer */
        clearTimeout(timerInactivite);
        timerInactivite = setTimeout(function () {
          reprendre();
        }, config.inactivityDelay * 1000);
      } else {
        mettreEnPause();
      }
    };

    document.addEventListener('wheel', gerer, { passive: true });
    document.addEventListener('touchstart', gerer, { passive: true });
    document.addEventListener('keydown', gerer, { passive: true });
    document.addEventListener('mousedown', function (e) {
      /* Laisser les liens fonctionner normalement */
      if (e.target.closest('a') || e.target.closest('button')) return;
      gerer();
    }, { passive: true });
  }

  /* API publique */
  return {
    init: init,
    pause: mettreEnPause,
    reprendre: reprendre,
    demarrer: demarrer
  };

})();
