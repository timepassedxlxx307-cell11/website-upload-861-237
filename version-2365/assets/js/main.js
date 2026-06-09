(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var shell = document.querySelector('[data-hero]');
    if (!shell) {
      return;
    }
    var slides = Array.prototype.slice.call(shell.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(shell.querySelectorAll('.hero-dot'));
    var prev = shell.querySelector('.hero-prev');
    var next = shell.querySelector('.hero-next');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (tabBox) {
      var buttons = Array.prototype.slice.call(tabBox.querySelectorAll('[data-tab]'));
      var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var key = button.getAttribute('data-tab');
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          panels.forEach(function (panel) {
            panel.classList.toggle('is-active', panel.getAttribute('data-panel') === key);
          });
        });
      });
    });
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupCatalogFilters() {
    document.querySelectorAll('[data-catalog]').forEach(function (panel) {
      var search = panel.querySelector('[data-search]');
      var yearFilter = panel.querySelector('[data-year-filter]');
      var typeFilter = panel.querySelector('[data-type-filter]');
      var cards = Array.prototype.slice.call(panel.querySelectorAll('.movie-card, .ranking-item'));
      var empty = panel.querySelector('[data-empty]');

      function apply() {
        var query = normalize(search ? search.value : '');
        var year = normalize(yearFilter ? yearFilter.value : '');
        var type = normalize(typeFilter ? typeFilter.value : '');
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
          var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
          var visible = matchesQuery && matchesYear && matchesType;
          card.classList.toggle('is-filter-hidden', !visible);
          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }

      [search, yearFilter, typeFilter].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupTabs();
    setupCatalogFilters();
  });
})();
