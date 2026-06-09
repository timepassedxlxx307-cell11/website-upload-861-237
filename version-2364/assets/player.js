(function () {
    function setup(videoId, buttonId, videoUrl) {
        const video = document.getElementById(videoId);
        const button = document.getElementById(buttonId);
        let hls = null;
        let ready = false;

        if (!video || !button || !videoUrl) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
        }

        function play() {
            attach();
            const promise = video.play();
            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    button.classList.add('is-hidden');
                }).catch(function () {
                    button.classList.add('is-hidden');
                    video.controls = true;
                });
            } else {
                button.classList.add('is-hidden');
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.MoviePlayer = {
        setup: setup
    };
})();
