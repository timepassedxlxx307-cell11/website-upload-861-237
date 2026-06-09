(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initHeader();
        initHero();
        initFilters();
        initPlayer();
    });

    function initHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobile = document.querySelector("[data-mobile-nav]");

        function updateHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 12);
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (toggle && mobile) {
            toggle.addEventListener("click", function () {
                mobile.classList.toggle("is-open");
            });
        }
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });

        show(0);
        start();
    }

    function initFilters() {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var reset = document.querySelector("[data-filter-reset]");
        var empty = document.querySelector("[data-empty-state]");
        var items = Array.prototype.slice.call(list.querySelectorAll(".filter-item"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function apply() {
            var query = normalize(input ? input.value : "");
            var active = {};
            selects.forEach(function (select) {
                active[select.getAttribute("data-filter-select")] = normalize(select.value);
            });
            var visible = 0;
            items.forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute("data-title"),
                    item.getAttribute("data-genre"),
                    item.getAttribute("data-tags"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-type")
                ].join(" "));
                var pass = !query || haystack.indexOf(query) !== -1;
                Object.keys(active).forEach(function (key) {
                    var value = active[key];
                    if (!value) {
                        return;
                    }
                    var itemValue = normalize(item.getAttribute("data-" + key));
                    if (itemValue.indexOf(value) === -1) {
                        pass = false;
                    }
                });
                item.hidden = !pass;
                if (pass) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                selects.forEach(function (select) {
                    select.value = "";
                });
                apply();
            });
        }
        apply();
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var cover = shell.querySelector("[data-player-cover]");
        var message = shell.querySelector("[data-player-message]");
        var data = document.getElementById("movie-player-data");
        var started = false;
        var streamUrl = "";

        try {
            streamUrl = JSON.parse(data.textContent).url || "";
        } catch (error) {
            streamUrl = "";
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function loadExternalHls() {
            return new Promise(function (resolve) {
                if (window.Hls) {
                    resolve(window.Hls);
                    return;
                }
                var existing = document.querySelector("script[data-hls-loader]");
                if (existing) {
                    existing.addEventListener("load", function () {
                        resolve(window.Hls || null);
                    });
                    existing.addEventListener("error", function () {
                        resolve(null);
                    });
                    return;
                }
                var script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
                script.async = true;
                script.setAttribute("data-hls-loader", "true");
                script.onload = function () {
                    resolve(window.Hls || null);
                };
                script.onerror = function () {
                    resolve(null);
                };
                document.head.appendChild(script);
            });
        }

        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        function start() {
            if (!video || !streamUrl) {
                setMessage("播放暂时无法打开");
                return;
            }
            if (started) {
                playVideo();
                return;
            }
            started = true;
            setMessage("");
            if (cover) {
                cover.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                playVideo();
                return;
            }
            loadExternalHls().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    hls.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage("播放暂时无法打开");
                        }
                    });
                } else {
                    video.src = streamUrl;
                    playVideo();
                }
            });
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    }
}());
