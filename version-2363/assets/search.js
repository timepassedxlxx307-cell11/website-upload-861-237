(function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var kicker = document.querySelector('[data-search-kicker]');
    var source = window.SEARCH_INDEX || [];

    if (input) {
        input.value = query;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function makeCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card">' +
            '<a class="movie-card__poster" href="' + escapeHtml(item.url) + '">' +
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="movie-card__play">▶</span>' +
            '</a>' +
            '<div class="movie-card__body">' +
                '<div class="movie-card__meta">' + escapeHtml(item.meta) + '</div>' +
                '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
        '</article>';
    }

    if (!query || !results) {
        return;
    }

    var lowered = query.toLowerCase();
    var matched = source.filter(function (item) {
        var haystack = [
            item.title,
            item.meta,
            item.category,
            item.oneLine,
            item.year,
            (item.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return haystack.indexOf(lowered) !== -1;
    }).slice(0, 96);

    if (kicker) {
        kicker.textContent = 'Search';
    }

    if (title) {
        title.textContent = matched.length ? '搜索结果' : '没有找到匹配内容';
    }

    results.innerHTML = matched.length ? matched.map(makeCard).join('') : '';
}());
