(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q'], input[type='search']");
        var keyword = input ? input.value.trim() : "";
        if (!keyword) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
          return;
        }
        event.preventDefault();
        var action = form.getAttribute("action") || "search.html";
        window.location.href = action + "?q=" + encodeURIComponent(keyword);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initCardFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var search = panel.querySelector("[data-card-search]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
      var grid = panel.nextElementSibling;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      var active = "all";
      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var type = card.getAttribute("data-type") || "other";
          var text = card.textContent.toLowerCase();
          var matchesType = active === "all" || active === type;
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          card.classList.toggle("is-filtered-out", !(matchesType && matchesKeyword));
        });
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
      if (search) {
        search.addEventListener("input", apply);
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSearch() {
    var root = document.querySelector("[data-search-results]");
    if (!root || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var pageInput = document.querySelector(".page-search input[name='q']");
    if (pageInput) {
      pageInput.value = q;
    }
    if (!q) {
      root.innerHTML = '<div class="empty-state">请输入关键词开始搜索</div>';
      return;
    }
    var keyword = q.toLowerCase();
    var results = window.SITE_MOVIES.filter(function (movie) {
      return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine]
        .join(" ")
        .toLowerCase()
        .indexOf(keyword) !== -1;
    });
    if (!results.length) {
      root.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
      return;
    }
    var html = '<h2 class="search-title">搜索结果</h2><div class="movie-grid compact-grid">';
    html += results.map(function (movie) {
      return '<article class="movie-card">'
        + '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">'
        + '<img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
        + '<span class="poster-glow"></span><span class="play-chip">播放</span></a>'
        + '<div class="card-body">'
        + '<a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>'
        + '<p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>'
        + '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>'
        + '</div></article>';
    }).join("");
    html += '</div>';
    root.innerHTML = html;
  }

  ready(function () {
    initNavigation();
    initSearchForms();
    initHero();
    initCardFilters();
    renderSearch();
  });
})();
