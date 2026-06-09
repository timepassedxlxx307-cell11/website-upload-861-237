(function () {
  var header = document.getElementById('site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
      menuButton.textContent = opened ? '×' : '☰';
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startCarousel() {
      stopCarousel();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopCarousel() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startCarousel();
      });
    });

    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
    showSlide(0);
    startCarousel();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters(scope) {
    var searchInput = scope.querySelector('[data-card-search]');
    var categoryFilter = scope.querySelector('[data-category-filter]');
    var yearFilter = scope.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-card-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.children);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var category = categoryFilter ? categoryFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || ''));
        var cardCategory = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    if (categoryFilter) {
      categoryFilter.addEventListener('change', applyFilters);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }

    applyFilters();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(setupFilters);
}());

function setupMoviePlayer(videoId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var isReady = false;
  var hlsInstance = null;

  if (!video || !overlay || !sourceUrl) {
    return;
  }

  function loadSource() {
    if (isReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      isReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      isReady = true;
      return;
    }

    video.src = sourceUrl;
    isReady = true;
  }

  function startPlayback() {
    loadSource();
    overlay.classList.add('is-hidden');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
