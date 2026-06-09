(function () {
  function setupNative(video, streamUrl) {
    video.src = streamUrl;
    return Promise.resolve();
  }

  function setupHls(video, streamUrl) {
    if (video._siteHls) {
      video._siteHls.destroy();
      video._siteHls = null;
    }
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    video._siteHls = hls;
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    return new Promise(function (resolve) {
      var done = false;
      function finish() {
        if (!done) {
          done = true;
          resolve();
        }
      }
      hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
      window.setTimeout(finish, 1600);
    });
  }

  function bindPlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("movie-play-button");
    if (!video || !button || !streamUrl) {
      return;
    }
    var prepared = false;
    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        return setupNative(video, streamUrl);
      }
      if (window.Hls && window.Hls.isSupported()) {
        return setupHls(video, streamUrl);
      }
      return setupNative(video, streamUrl);
    }
    function play() {
      button.classList.add("is-hidden");
      prepare().then(function () {
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  window.startMoviePlayer = bindPlayer;
})();
