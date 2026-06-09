(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function attachStream(video, url) {
    if (video.dataset.ready === '1') {
      return;
    }
    video.dataset.ready = '1';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src = url;
  }

  function setupPlayers() {
    document.querySelectorAll('.player-card').forEach(function (card) {
      var video = card.querySelector('video');
      var button = card.querySelector('.play-layer');
      if (!video) {
        return;
      }
      var url = video.getAttribute('data-play');
      if (!url) {
        return;
      }

      function start() {
        attachStream(video, url);
        if (button) {
          button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  ready(setupPlayers);
})();
