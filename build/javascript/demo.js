"use strict";
window.addEventListener("load", function () {
    var CONTAINER = document.querySelector("custom-player[data-mvp=\"container\"]");
    if (CONTAINER === null) {
        throw new ReferenceError("MVP Demo: Impossible to find container.");
    }
    new MagnificientAudioPlayer({
        container: CONTAINER,
        audioPlayer: undefined,
        playButton: undefined,
        pauseButton: undefined,
        timeline: undefined,
        displayTime: true,
        timeContainer: undefined,
        displaySoundControls: true,
        muteButton: undefined,
        volume: undefined
    });
});
