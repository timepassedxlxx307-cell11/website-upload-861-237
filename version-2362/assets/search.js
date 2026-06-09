import { searchMovies } from "./search-data.js";

const params = new URLSearchParams(window.location.search);
const query = (params.get("q") || "").trim();
const input = document.querySelector("#page-search-input");
const summary = document.querySelector("#search-summary");
const results = document.querySelector("#search-results");

if (input) {
    input.value = query;
}

function normalize(value) {
    return String(value || "").toLowerCase();
}

function createCard(movie) {
    const article = document.createElement("a");
    article.className = "movie-card";
    article.href = movie.url;
    article.innerHTML = `
        <span class="poster-frame">
            <img src="${movie.cover}" alt="${movie.title}" loading="lazy">
            <span class="poster-shine"></span>
            <span class="year-badge">${movie.year || ""}</span>
        </span>
        <span class="movie-card-body">
            <strong>${movie.title}</strong>
            <em>${movie.oneLine || ""}</em>
            <span class="movie-meta">
                <span>${movie.region || ""}</span>
                <span>${movie.type || ""}</span>
            </span>
        </span>
    `;
    return article;
}

function render() {
    if (!summary || !results) {
        return;
    }

    results.innerHTML = "";

    if (!query) {
        summary.textContent = "输入关键词后显示结果";
        return;
    }

    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    const matched = searchMovies.filter((movie) => {
        const text = normalize([
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.tags,
            movie.oneLine,
            movie.category
        ].join(" "));
        return tokens.every((token) => text.includes(token));
    });

    summary.textContent = `“${query}” 相关结果：${matched.length} 部`;

    matched.slice(0, 240).forEach((movie) => {
        results.appendChild(createCard(movie));
    });
}

render();
