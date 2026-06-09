(function () {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dots] button'));
    let current = 0;

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

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    const cardLists = Array.from(document.querySelectorAll('[data-card-list]'));
    cardLists.forEach(function (list) {
        const section = list.closest('main');
        const keyword = section ? section.querySelector('[data-card-filter]') : null;
        const yearFilter = section ? section.querySelector('[data-year-filter]') : null;
        const cards = Array.from(list.querySelectorAll('.movie-card'));

        if (yearFilter) {
            const years = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute('data-year') || '';
            }).filter(Boolean))).sort().reverse();
            years.forEach(function (year) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearFilter.appendChild(option);
            });
        }

        function applyFilter() {
            const term = keyword ? keyword.value.trim().toLowerCase() : '';
            const year = yearFilter ? yearFilter.value : '';
            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                const okTerm = !term || haystack.indexOf(term) !== -1;
                const okYear = !year || card.getAttribute('data-year') === year;
                card.style.display = okTerm && okYear ? '' : 'none';
            });
        }

        if (keyword) {
            keyword.addEventListener('input', applyFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }
    });

    const searchForm = document.querySelector('[data-search-page]');
    const results = document.querySelector('[data-search-results]');
    const status = document.querySelector('[data-search-status]');

    function cardTemplate(movie) {
        const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="play-mark">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>',
            '<h3 class="movie-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p class="movie-line">' + escapeHtml(movie.oneLine || '') + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
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

    function runSearch() {
        if (!searchForm || !results || !status || !window.MOVIE_INDEX) {
            return;
        }
        const input = searchForm.querySelector('input[name="q"]');
        const query = input ? input.value.trim().toLowerCase() : '';
        const params = new URLSearchParams(window.location.search);
        if (!query && params.get('q') && input) {
            input.value = params.get('q');
            return runSearch();
        }
        if (!query) {
            results.innerHTML = '';
            status.textContent = '输入关键词开始搜索';
            return;
        }
        const matched = window.MOVIE_INDEX.filter(function (movie) {
            const haystack = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase();
            return haystack.indexOf(query) !== -1;
        }).slice(0, 120);
        results.innerHTML = matched.map(cardTemplate).join('');
        status.textContent = matched.length ? '搜索结果' : '未找到相关影片';
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });
        runSearch();
    }
})();
