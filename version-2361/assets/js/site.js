(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.mobile-menu-button');

  if (header && menuButton) {
    menuButton.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === index);
    });

    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === index);
    });
  }

  function schedule() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }
  }

  if (slides.length) {
    showSlide(0);
    schedule();

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        showSlide(itemIndex);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        schedule();
      });
    }
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
  var emptyState = document.querySelector('[data-empty-state]');

  function applyFilter() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var selected = filterSelect ? filterSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var category = card.getAttribute('data-category') || '';
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchCategory = !selected || selected === category;
      var show = matchQuery && matchCategory;

      card.style.display = show ? '' : 'none';

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (filterForm) {
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
  }

  if (filterInput) {
    var parameters = new URLSearchParams(window.location.search);
    var queryValue = parameters.get('q');

    if (queryValue) {
      filterInput.value = queryValue;
    }

    filterInput.addEventListener('input', applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  if (cards.length && (filterInput || filterSelect)) {
    applyFilter();
  }
})();
