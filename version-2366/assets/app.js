import { H as Hls } from "./hls-dru42stk.js";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".mobile-panel");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
    toggle.textContent = expanded ? "☰" : "×";
  });
}

function setupSearchForms() {
  document.querySelectorAll(".site-search").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const base = form.dataset.searchBase || "search.html";

      if (query.length > 0) {
        window.location.href = `${base}?q=${encodeURIComponent(query)}`;
      }
    });
  });
}

function setupHeroCarousel() {
  const carousel = document.querySelector(".hero-carousel");
  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
  const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
  const prev = carousel.querySelector(".hero-control--prev");
  const next = carousel.querySelector(".hero-control--next");
  let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let timer = null;

  if (index < 0) {
    index = 0;
  }

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5200);
  }

  if (slides.length <= 1) {
    return;
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.slide || 0));
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      show(index + 1);
      restart();
    });
  }

  carousel.addEventListener("mouseenter", () => window.clearInterval(timer));
  carousel.addEventListener("mouseleave", restart);
  restart();
}

function setupLibraryFilters() {
  const grid = document.querySelector(".library-grid");
  if (!grid) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll(".library-card"));
  const keywordInput = document.querySelector(".library-search-input");
  const filters = Array.from(document.querySelectorAll(".library-filter"));
  const reset = document.querySelector(".reset-library-filter");
  const counter = document.querySelector(".filter-count");

  function getFilterValue(name) {
    const control = filters.find((item) => item.dataset.filter === name);
    return control ? control.value.trim().toLowerCase() : "";
  }

  function applyFilters() {
    const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
    const selected = {
      region: getFilterValue("region"),
      year: getFilterValue("year"),
      type: getFilterValue("type"),
      genre: getFilterValue("genre")
    };
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title || "",
        card.dataset.region || "",
        card.dataset.type || "",
        card.dataset.year || "",
        card.dataset.genre || "",
        card.textContent || ""
      ].join(" ").toLowerCase();

      const matchedKeyword = keyword === "" || haystack.includes(keyword);
      const matchedRegion = selected.region === "" || (card.dataset.region || "").toLowerCase().includes(selected.region);
      const matchedYear = selected.year === "" || (card.dataset.year || "").toLowerCase() === selected.year;
      const matchedType = selected.type === "" || (card.dataset.type || "").toLowerCase().includes(selected.type);
      const matchedGenre = selected.genre === "" || (card.dataset.genre || "").toLowerCase().includes(selected.genre);
      const shouldShow = matchedKeyword && matchedRegion && matchedYear && matchedType && matchedGenre;

      card.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (counter) {
      counter.textContent = visible > 0 ? "已显示匹配影片" : "暂无匹配影片";
    }
  }

  if (keywordInput) {
    keywordInput.addEventListener("input", applyFilters);
  }

  filters.forEach((filter) => {
    filter.addEventListener("change", applyFilters);
  });

  if (reset) {
    reset.addEventListener("click", () => {
      if (keywordInput) {
        keywordInput.value = "";
      }
      filters.forEach((filter) => {
        filter.value = "";
      });
      applyFilters();
    });
  }

  applyFilters();
}

function setupSearchResults() {
  const results = document.querySelector("#search-results");
  const status = document.querySelector(".search-status");

  if (!results || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  const searchInput = document.querySelector(".search-page-form input[name='q']");

  if (searchInput) {
    searchInput.value = query;
  }

  if (!query) {
    return;
  }

  const lower = query.toLowerCase();
  const matches = window.MOVIE_SEARCH_INDEX.filter((movie) => {
    const text = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.tags,
      movie.oneLine
    ].join(" ").toLowerCase();
    return text.includes(lower);
  });

  if (status) {
    status.textContent = matches.length > 0 ? `已找到 ${matches.length} 个匹配结果。` : "没有找到匹配结果，请更换关键词。";
  }

  results.innerHTML = matches.slice(0, 240).map((movie) => {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
<article class="movie-card">
  <a href="detail/${movie.pad}.html" class="movie-card__link">
    <div class="movie-card__poster">
      <img src="${movie.poster}" alt="${escapeHtml(movie.title)}" loading="lazy">
      <span class="movie-card__duration">${escapeHtml(movie.duration)}</span>
      <span class="movie-card__play">▶</span>
    </div>
    <div class="movie-card__body">
      <div class="movie-card__eyebrow">${escapeHtml(movie.mainGenre)} · ${escapeHtml(movie.year)}</div>
      <h3>${escapeHtml(movie.title)}</h3>
      <p>${escapeHtml(movie.oneLine)}</p>
      <div class="movie-card__tags">${tags}</div>
      <div class="movie-card__meta">
        <span>★ ${escapeHtml(movie.rating)}</span>
        <span>${escapeHtml(movie.region)}</span>
      </div>
    </div>
  </a>
</article>`;
  }).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupPlayers() {
  document.querySelectorAll(".video-player").forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector(".video-start");
    const message = player.querySelector(".video-message");

    if (!video) {
      return;
    }

    const source = video.dataset.src;
    let initialized = false;
    let hls = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function initialize() {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => setMessage(""));
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage("网络波动，正在重新加载视频...");
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage("媒体加载异常，正在尝试恢复...");
            hls.recoverMediaError();
          } else {
            setMessage("当前浏览器暂时无法加载该播放源。");
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        setMessage("当前浏览器不支持 HLS 播放，请更换新版浏览器。 ");
      }
    }

    async function play() {
      initialize();
      try {
        await video.play();
        player.classList.add("is-playing");
        setMessage("");
      } catch (error) {
        setMessage("请再次点击播放按钮开始播放。");
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("play", () => player.classList.add("is-playing"));
    video.addEventListener("pause", () => {
      if (!video.ended) {
        player.classList.remove("is-playing");
      }
    });
    video.addEventListener("loadedmetadata", () => setMessage(""));
    video.addEventListener("error", () => setMessage("视频加载失败，请刷新页面或稍后再试。"));

    player.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        play();
      }
    });
  });
}

ready(() => {
  setupNavigation();
  setupSearchForms();
  setupHeroCarousel();
  setupLibraryFilters();
  setupSearchResults();
  setupPlayers();
});
