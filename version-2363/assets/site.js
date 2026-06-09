(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    var searchButton = document.querySelector('[data-search-toggle]');
    var headerSearch = document.querySelector('[data-header-search]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    if (searchButton && headerSearch) {
        searchButton.addEventListener('click', function () {
            headerSearch.classList.toggle('is-open');
            var input = headerSearch.querySelector('input');
            if (input && headerSearch.classList.contains('is-open')) {
                input.focus();
            }
        });
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterInput && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
        filterInput.addEventListener('input', function () {
            var query = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                card.style.display = haystack.indexOf(query) === -1 ? 'none' : '';
            });
        });
    }
}());
