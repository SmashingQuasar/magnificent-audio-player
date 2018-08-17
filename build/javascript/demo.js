"use strict";
window.addEventListener("load", function () {
    var CONTAINER = document.querySelector("custom-player[data-map=\"container\"]");
    if (CONTAINER === null) {
        throw new ReferenceError("MAP Demo: Impossible to find container.");
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
