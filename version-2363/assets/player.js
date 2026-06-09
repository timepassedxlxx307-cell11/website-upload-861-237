(function () {
    var players = document.querySelectorAll('[data-player]');

    Array.prototype.forEach.call(players, function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-player-start]');
        var streamUrl = video ? video.getAttribute('data-play-url') : '';
        var hlsInstance = null;

        function prepare() {
            if (!video || !streamUrl || video.getAttribute('data-ready') === '1') {
                return;
            }

            video.setAttribute('data-ready', '1');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function hideOverlay() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function start() {
            if (!video) {
                return;
            }

            prepare();
            hideOverlay();
            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });

            video.addEventListener('play', hideOverlay);

            video.addEventListener('error', function () {
                if (hlsInstance && hlsInstance.destroy) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    });
}());
