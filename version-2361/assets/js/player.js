import { H as Hls } from './hls-dru42stk.js';

export function setupMoviePlayer(options) {
  var video = document.querySelector(options.video);
  var trigger = document.querySelector(options.trigger);
  var panel = document.querySelector(options.panel);
  var message = document.querySelector(options.message);
  var stream = options.stream;
  var ready = false;
  var hls = null;

  if (!video || !trigger || !panel || !stream) {
    return;
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function prepare() {
    if (ready) {
      return;
    }

    ready = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function start() {
    prepare();
    panel.classList.add('is-hidden');
    setMessage('');

    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        panel.classList.remove('is-hidden');
        setMessage('点击播放按钮继续观看');
      });
    }
  }

  trigger.addEventListener('click', start);
  panel.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!ready) {
      start();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
