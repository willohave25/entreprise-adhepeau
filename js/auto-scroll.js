/* ===========================================
   W2K Auto-Scroll Premium Module
   Défilement automatique intelligent
   Vitrine digitale animée
   W2K-Digital 2025
   =========================================== */

var W2KAutoScroll = (function () {
  'use strict';

  // Configuration par défaut
  var config = {
    speed: 'slow',
    pauseDuration: 12,
    inactivityDelay: 45,
    showIndicator: true
  };

  // État interne
  var etat = {
    actif: false,
    enPause: false,
    sections: [],
    indexActuel: 0,
    timerScroll: null,
    timerInactivite: null,
    timerDemarrage: null,
    indicateur: null
  };

  // Vitesses de défilement (pixels par step)
  var vitesses = {
    slow: 1.2,
    medium: 2.5,
    fast: 4
  };

  /* --- Initialisation --- */
  function init(options) {
    // Fusionner options utilisateur
    if (options) {
      for (var cle in options) {
        if (options.hasOwnProperty(cle)) {
          config[cle] = options[cle];
        }
      }
    }

    // Récupérer les sections avec data-autoscroll
    etat.sections = document.querySelectorAll('[data-autoscroll]');
    if (etat.sections.length === 0) return;

    // Créer indicateur visuel
    if (config.showIndicator) {
      creerIndicateur();
    }

    // Écouter interactions utilisateur
    ajouterEcouteurs();

    // Démarrage après délai initial (3 secondes)
    etat.timerDemarrage = setTimeout(function () {
      demarrer();
    }, 3000);
  }

  /* --- Créer l'indicateur visuel (point or pulsant) --- */
  function creerIndicateur() {
    etat.indicateur = document.createElement('div');
    etat.indicateur.className = 'w2k-scroll-indicator';
    etat.indicateur.setAttribute('aria-hidden', 'true');
    etat.indicateur.title = 'Défilement automatique actif';
    document.body.appendChild(etat.indicateur);
  }

  /* --- Mettre à jour l'indicateur --- */
  function majIndicateur(enPause) {
    if (!etat.indicateur) return;
    if (enPause) {
      etat.indicateur.classList.add('paused');
      etat.indicateur.title = 'Défilement en pause';
    } else {
      etat.indicateur.classList.remove('paused');
      etat.indicateur.title = 'Défilement automatique actif';
    }
  }

  /* --- Démarrer le défilement --- */
  function demarrer() {
    etat.actif = true;
    etat.enPause = false;
    majIndicateur(false);
    defilerVersSectionSuivante();
  }

  /* --- Mettre en pause --- */
  function pause() {
    etat.enPause = true;
    etat.actif = false;
    majIndicateur(true);

    // Arrêter les timers en cours
    clearTimeout(etat.timerScroll);
    cancelAnimationFrame(etat.animationFrame);

    // Lancer timer inactivité
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

    // Recalculer la section actuelle
    trouverSectionActuelle();
    defilerVersSectionSuivante();
  }

  /* --- Trouver la section actuellement visible --- */
  function trouverSectionActuelle() {
    var scrollY = window.scrollY;
    var hauteurVue = window.innerHeight;
    var milieu = scrollY + hauteurVue / 2;

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

  /* --- Défiler vers la section suivante --- */
  function defilerVersSectionSuivante() {
    if (!etat.actif || etat.enPause) return;

    // Passer à la section suivante
    etat.indexActuel++;

    // Si on a dépassé la dernière section
    if (etat.indexActuel >= etat.sections.length) {
      // Rediriger vers la page suivante (boucle)
      var pageSuivante = document.body.getAttribute('data-next-page');
      if (pageSuivante) {
        etat.timerScroll = setTimeout(function () {
          window.location.href = pageSuivante;
        }, config.pauseDuration * 1000);
        return;
      } else {
        // Pas de page suivante, retour au début
        etat.indexActuel = 0;
      }
    }

    var cible = etat.sections[etat.indexActuel];
    if (!cible) return;

    // Scroll smooth vers la cible
    defilementDoux(cible, function () {
      // Après le scroll, pause avant la prochaine section
      if (etat.actif && !etat.enPause) {
        etat.timerScroll = setTimeout(function () {
          defilerVersSectionSuivante();
        }, config.pauseDuration * 1000);
      }
    });
  }

  /* --- Défilement doux personnalisé --- */
  function defilementDoux(element, callback) {
    var headerElement = document.querySelector('.header');
    var offsetHeader = headerElement ? headerElement.offsetHeight : 0;
    var destination = element.getBoundingClientRect().top + window.scrollY - offsetHeader;
    var depart = window.scrollY;
    var distance = destination - depart;
    var duree = Math.min(Math.abs(distance) * 1.5, 2000); // Max 2 secondes
    var tempsDepart = null;

    function animer(timestamp) {
      if (!etat.actif || etat.enPause) return;

      if (!tempsDepart) tempsDepart = timestamp;
      var progression = timestamp - tempsDepart;
      var pourcentage = Math.min(progression / duree, 1);

      // Easing ease-in-out
      var easing = pourcentage < 0.5
        ? 2 * pourcentage * pourcentage
        : 1 - Math.pow(-2 * pourcentage + 2, 2) / 2;

      window.scrollTo(0, depart + distance * easing);

      if (pourcentage < 1) {
        etat.animationFrame = requestAnimationFrame(animer);
      } else {
        if (callback) callback();
      }
    }

    etat.animationFrame = requestAnimationFrame(animer);
  }

  /* --- Ajouter les écouteurs d'interactions --- */
  function ajouterEcouteurs() {
    var evenements = ['click', 'touchstart', 'wheel', 'keydown'];

    evenements.forEach(function (evt) {
      document.addEventListener(evt, function (e) {
        // Ignorer les clics sur l'indicateur
        if (etat.indicateur && etat.indicateur.contains(e.target)) return;

        // Mettre en pause si actif
        if (etat.actif && !etat.enPause) {
          pause();
        } else if (etat.enPause) {
          // Relancer le timer d'inactivité
          clearTimeout(etat.timerInactivite);
          etat.timerInactivite = setTimeout(function () {
            reprendre();
          }, config.inactivityDelay * 1000);
        }
      }, { passive: true });
    });

    // Événement scroll (souris/trackpad)
    var scrollTimer = null;
    window.addEventListener('scroll', function () {
      if (etat.actif && !etat.enPause) {
        // Ne pas pauseer si c'est notre propre scroll
        return;
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
