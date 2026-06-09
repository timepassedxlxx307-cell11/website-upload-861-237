import { H as Hls } from "./hls-dru42stk.js";

export function initMoviePlayer(streamUrl) {
    const video = document.querySelector("#movie-player");
    const button = document.querySelector("#play-button");

    if (!video || !button || !streamUrl) {
        return;
    }

    let attached = false;
    let hls = null;

    function attachStream() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    async function playVideo() {
        attachStream();
        button.classList.add("is-hidden");
        video.controls = true;

        try {
            await video.play();
        } catch (error) {
            button.classList.remove("is-hidden");
        }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", () => {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener("play", () => {
        button.classList.add("is-hidden");
    });
    video.addEventListener("pause", () => {
        if (!video.ended) {
            button.classList.remove("is-hidden");
        }
    });
    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
