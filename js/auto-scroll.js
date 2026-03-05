/* ===========================================
   W2K Auto-Scroll Premium Module V2
   Défilement lent continu type vitrine digitale
   Scroll progressif section par section
   W2K-Digital 2025
   =========================================== */

var W2KAutoScroll = (function () {
  'use strict';

  var config = {
    speed: 'slow',
    pauseDuration: 12,
    inactivityDelay: 45,
    showIndicator: true
  };

  var etat = {
    actif: false,
    enPause: false,
    scrollEnCours: false,
    sections: [],
    indexActuel: -1,
    timerPause: null,
    timerInactivite: null,
    timerDemarrage: null,
    animationId: null,
    indicateur: null,
    estNotreScroll: false
  };

  /* Vitesse en pixels par frame (~60fps) */
  var vitesses = {
    slow: 0.8,
    medium: 1.5,
    fast: 2.5
  };

  /* --- Initialisation --- */
  function init(options) {
    if (options) {
      for (var cle in options) {
        if (options.hasOwnProperty(cle)) {
          config[cle] = options[cle];
        }
      }
    }

    etat.sections = document.querySelectorAll('[data-autoscroll]');
    if (etat.sections.length === 0) return;

    if (config.showIndicator) creerIndicateur();
    ajouterEcouteurs();

    /* Démarrage après 3 secondes */
    etat.timerDemarrage = setTimeout(function () {
      demarrer();
    }, 3000);
  }

  /* --- Indicateur visuel (point or pulsant) --- */
  function creerIndicateur() {
    etat.indicateur = document.createElement('div');
    etat.indicateur.className = 'w2k-scroll-indicator';
    etat.indicateur.setAttribute('aria-hidden', 'true');
    etat.indicateur.title = 'Défilement automatique actif';
    document.body.appendChild(etat.indicateur);
  }

  function majIndicateur(pause) {
    if (!etat.indicateur) return;
    if (pause) {
      etat.indicateur.classList.add('paused');
      etat.indicateur.title = 'Défilement en pause';
    } else {
      etat.indicateur.classList.remove('paused');
      etat.indicateur.title = 'Défilement automatique actif';
    }
  }

  /* --- Démarrer --- */
  function demarrer() {
    etat.actif = true;
    etat.enPause = false;
    majIndicateur(false);

    /* Trouver dans quelle section on se trouve */
    trouverSectionActuelle();

    /* Pause sur la section actuelle puis défiler */
    planifierProchainScroll();
  }

  /* --- Planifier le prochain défilement après la pause --- */
  function planifierProchainScroll() {
    if (!etat.actif || etat.enPause) return;

    clearTimeout(etat.timerPause);
    etat.timerPause = setTimeout(function () {
      allerSectionSuivante();
    }, config.pauseDuration * 1000);
  }

  /* --- Aller à la section suivante --- */
  function allerSectionSuivante() {
    if (!etat.actif || etat.enPause) return;

    var prochainIndex = etat.indexActuel + 1;

    /* Dernière section atteinte */
    if (prochainIndex >= etat.sections.length) {
      var pageSuivante = document.body.getAttribute('data-next-page');
      if (pageSuivante) {
        /* Scroller lentement jusqu'au bas absolu de la page */
        var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        var posActuelle = window.scrollY;

        if (maxScroll - posActuelle > 10) {
          /* Il reste du contenu en bas (footer etc), scroller doucement */
          defilementLent(maxScroll, function () {
            /* Pause en bas puis redirection */
            etat.timerPause = setTimeout(function () {
              if (etat.actif && !etat.enPause) {
                window.location.href = pageSuivante;
              }
            }, config.pauseDuration * 1000);
          });
        } else {
          /* Déjà tout en bas, redirection après pause */
          etat.timerPause = setTimeout(function () {
            if (etat.actif && !etat.enPause) {
              window.location.href = pageSuivante;
            }
          }, config.pauseDuration * 1000);
        }
        return;
      } else {
        /* Boucle : retour en haut */
        prochainIndex = 0;
        etat.estNotreScroll = true;
        window.scrollTo(0, 0);
        etat.estNotreScroll = false;
        etat.indexActuel = 0;
        planifierProchainScroll();
        return;
      }
    }

    /* Calculer la destination (haut de la section - hauteur header) */
    var cible = etat.sections[prochainIndex];
    var headerEl = document.querySelector('.header');
    var offsetHeader = headerEl ? headerEl.offsetHeight : 0;
    var destination = cible.getBoundingClientRect().top + window.scrollY - offsetHeader;

    /* Mettre à jour l'index */
    etat.indexActuel = prochainIndex;

    /* Défilement lent pixel par pixel */
    defilementLent(destination, function () {
      /* Section atteinte, pause puis continuer */
      if (etat.actif && !etat.enPause) {
        planifierProchainScroll();
      }
    });
  }

  /* --- Défilement lent pixel par pixel (effet vitrine) --- */
  function defilementLent(destination, callback) {
    etat.scrollEnCours = true;
    var vitesse = vitesses[config.speed] || vitesses.slow;

    function boucle() {
      if (!etat.actif || etat.enPause) {
        etat.scrollEnCours = false;
        return;
      }

      var posActuelle = window.scrollY;
      var distance = destination - posActuelle;

      /* Arrivé à destination */
      if (Math.abs(distance) < 2) {
        etat.estNotreScroll = true;
        window.scrollTo(0, destination);
        etat.estNotreScroll = false;
        etat.scrollEnCours = false;
        if (callback) callback();
        return;
      }

      /* Vitesse adaptative : légèrement plus rapide si grande distance */
      var pas;
      if (Math.abs(distance) > 800) {
        pas = vitesse * 3;
      } else if (Math.abs(distance) > 400) {
        pas = vitesse * 2;
      } else if (Math.abs(distance) > 100) {
        pas = vitesse * 1.5;
      } else {
        /* Ralentir à l'approche pour un effet doux */
        pas = vitesse * 0.8;
      }

      /* Direction */
      var direction = distance > 0 ? 1 : -1;
      var nouvPos = posActuelle + (pas * direction);

      /* Ne pas dépasser */
      if (direction > 0 && nouvPos > destination) nouvPos = destination;
      if (direction < 0 && nouvPos < destination) nouvPos = destination;

      etat.estNotreScroll = true;
      window.scrollTo(0, nouvPos);
      etat.estNotreScroll = false;

      etat.animationId = requestAnimationFrame(boucle);
    }

    etat.animationId = requestAnimationFrame(boucle);
  }

  /* --- Trouver la section visible actuellement --- */
  function trouverSectionActuelle() {
    var scrollY = window.scrollY;
    var hauteurVue = window.innerHeight;
    var milieu = scrollY + hauteurVue / 2;

    etat.indexActuel = 0;

    for (var i = 0; i < etat.sections.length; i++) {
      var rect = etat.sections[i].getBoundingClientRect();
      var topAbsolu = rect.top + scrollY;
      var bottomAbsolu = topAbsolu + rect.height;

      if (milieu >= topAbsolu && milieu < bottomAbsolu) {
        etat.indexActuel = i;
        return;
      }
    }
  }

  /* --- Pause immédiate --- */
  function pause() {
    etat.enPause = true;
    etat.actif = false;
    etat.scrollEnCours = false;
    majIndicateur(true);

    clearTimeout(etat.timerPause);
    cancelAnimationFrame(etat.animationId);

    /* Timer inactivité pour reprendre automatiquement */
    clearTimeout(etat.timerInactivite);
    etat.timerInactivite = setTimeout(function () {
      reprendre();
    }, config.inactivityDelay * 1000);
  }

  /* --- Reprendre après inactivité --- */
  function reprendre() {
    if (!etat.enPause) return;
    etat.enPause = false;
    etat.actif = true;
    majIndicateur(false);

    /* Recalculer position */
    trouverSectionActuelle();
    planifierProchainScroll();
  }

  /* --- Gérer une interaction utilisateur --- */
  function gererInteraction() {
    if (etat.actif && !etat.enPause) {
      pause();
    } else if (etat.enPause) {
      /* Relancer le compteur d'inactivité */
      clearTimeout(etat.timerInactivite);
      etat.timerInactivite = setTimeout(function () {
        reprendre();
      }, config.inactivityDelay * 1000);
    }
  }

  /* --- Écouter les interactions utilisateur --- */
  function ajouterEcouteurs() {

    /* Touch et clavier */
    ['touchstart', 'keydown'].forEach(function (evt) {
      document.addEventListener(evt, function () {
        gererInteraction();
      }, { passive: true });
    });

    /* Clic : ne pas pauser sur les liens/boutons de nav */
    document.addEventListener('click', function (e) {
      if (etat.indicateur && etat.indicateur.contains(e.target)) return;
      if (e.target.closest('a') || e.target.closest('button')) return;
      gererInteraction();
    }, { passive: true });

    /* Molette souris → l'utilisateur veut scroller lui-même */
    document.addEventListener('wheel', function () {
      gererInteraction();
    }, { passive: true });

    /* Détection scroll manuel (pas notre auto-scroll) */
    window.addEventListener('scroll', function () {
      if (etat.estNotreScroll) return;
      if (etat.actif && !etat.enPause && etat.scrollEnCours) {
        pause();
      }
    }, { passive: true });
  }

  /* --- API publique --- */
  return {
    init: init,
    pause: pause,
    reprendre: reprendre,
    demarrer: demarrer
  };

})();
