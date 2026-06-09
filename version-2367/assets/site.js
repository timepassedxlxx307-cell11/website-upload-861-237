(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  if (filterInput && cards.length) {
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = [card.getAttribute('data-title'), card.getAttribute('data-tags'), card.getAttribute('data-genre')].join(' ').toLowerCase();
        card.style.display = text.indexOf(keyword) >= 0 ? '' : 'none';
      });
    });
  }

  var searchRoot = document.querySelector('[data-search-results]');

  if (searchRoot && window.siteMovieIndex) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');

    if (input) {
      input.value = q;
    }

    function renderSearch(query) {
      var normalized = query.trim().toLowerCase();
      var list = window.siteMovieIndex.filter(function (item) {
        var text = [item.title, item.genre, item.region, item.type, item.tags].join(' ').toLowerCase();
        return normalized === '' || text.indexOf(normalized) >= 0;
      }).slice(0, 80);

      searchRoot.innerHTML = list.map(function (item) {
        return '<a class="search-result-item" href="' + item.href + '">' +
          '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span>' +
            '<h2>' + escapeHtml(item.title) + '</h2>' +
            '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</p>' +
            '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '</span>' +
        '</a>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    renderSearch(q);

    if (input) {
      input.addEventListener('input', function () {
        renderSearch(input.value);
      });
    }
  }
})();
