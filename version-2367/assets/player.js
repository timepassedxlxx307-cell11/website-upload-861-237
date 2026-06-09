function initMoviePlayer(videoId, maskId, streamUrl) {
  var video = document.getElementById(videoId);
  var mask = document.getElementById(maskId);
  var initialized = false;

  if (!video) {
    return;
  }

  function bindStream() {
    if (initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    bindStream();

    if (mask) {
      mask.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (mask) {
    mask.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (mask) {
      mask.classList.add('is-hidden');
    }
  });
}
