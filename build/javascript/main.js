"use strict";
function prettyfyTime(time) {
    var seconds;
    var minutes;
    var hours;
    hours = Math.floor(time / 3600);
    time -= hours * 3600;
    minutes = Math.floor(time / 60);
    time -= minutes * 60;
    seconds = Math.floor(time);
    var PRETTY_MINUTES = ("" + minutes).padStart(2, "0");
    var PRETTY_SECONDS = ("" + seconds).padStart(2, "0");
    return hours + ":" + PRETTY_MINUTES + ":" + PRETTY_SECONDS;
}
var MagnificientAudioPlayer = (function () {
    function MagnificientAudioPlayer(configuration) {
        var _this = this;
        this.timeContainer = undefined;
        if (configuration.container === undefined) {
            throw new SyntaxError("MAP: Invalid configuration object: No container property.");
        }
        this.container = configuration.container;
        if (configuration.audioPlayer === undefined) {
            var AUDIO_PLAYER = this.container.querySelector("audio");
            if (AUDIO_PLAYER === null) {
                throw new ReferenceError("MAP: No <audio> element provided.");
            }
            this.audioPlayer = AUDIO_PLAYER;
        }
        else {
            if (configuration.audioPlayer instanceof HTMLAudioElement) {
                this.audioPlayer = configuration.audioPlayer;
            }
            else {
                throw new TypeError("MAP: audioPlayer property MUST be an instance of HTMLAudioElement.");
            }
        }
        if (configuration.playButton === undefined) {
            var PLAY_BUTTON = this.container.querySelector("button[data-map*=\"play\"]");
            if (PLAY_BUTTON === null) {
                throw new ReferenceError("MAP: No playButton property specified in configuration and couldn't find a button[data-map*=\"play\"] in the DOM.");
            }
            this.playButton = PLAY_BUTTON;
        }
        else {
            if (configuration.playButton instanceof HTMLButtonElement) {
                this.playButton = configuration.playButton;
            }
            else {
                throw new TypeError("MAP: Play button must be an instance of HTMLButtonElement.");
            }
        }
        if (!this.playButton.classList.contains("play")) {
            this.playButton.classList.add("play");
        }
        if (configuration.pauseButton === undefined) {
            var PAUSE_BUTTON = this.container.querySelector("button[data-map*=\"pause\"]");
            if (PAUSE_BUTTON === null) {
                throw new ReferenceError("MAP: No pauseButton property specified in configuration and couldn't find a button[data-map*=\"pause\"] in the DOM.");
            }
            this.pauseButton = PAUSE_BUTTON;
        }
        else {
            if (configuration.pauseButton instanceof HTMLButtonElement) {
                this.pauseButton = configuration.pauseButton;
            }
            else {
                throw new TypeError("MAP: Pause button must be an instance of HTMLButtonElement.");
            }
        }
        if ((!(this.playButton === this.pauseButton) || !this.audioPlayer.paused)
            &&
                !this.pauseButton.classList.contains("pause")) {
            this.pauseButton.classList.add("pause");
        }
        if (this.playButton === this.pauseButton && !this.pauseButton.hasAttribute("role")) {
            this.pauseButton.setAttribute("role", "switch");
        }
        if (this.playButton === this.pauseButton) {
        }
        this.playButton.addEventListener("click", function (event) {
            if (_this.audioPlayer.paused) {
                _this.play();
                event.stopImmediatePropagation();
            }
        });
        this.pauseButton.addEventListener("click", function (event) {
            if (!_this.audioPlayer.paused) {
                _this.pause();
                event.stopImmediatePropagation();
            }
        });
        this.audioPlayer.addEventListener("click", function () {
            _this.togglePlay();
        });
        if (configuration.timeline === undefined) {
            var TIMELINE = this.container.querySelector("progress[data-map=\"timeline\"]");
            if (TIMELINE === null) {
                throw new ReferenceError("MAP: No timeline HTMLProgressElement provided in configuration and unable to find it in DOM.");
            }
            else {
                if (TIMELINE instanceof HTMLProgressElement) {
                    this.timeline = TIMELINE;
                }
                else {
                    throw new TypeError("MAP: timeline property MUST be an instance of HTMLProgressElement.");
                }
            }
        }
        else {
            if (configuration.timeline instanceof HTMLProgressElement) {
                this.timeline = configuration.timeline;
            }
            else {
                throw new TypeError("MAP: timeline property MUST be an instance of HTMLProgressElement.");
            }
        }
        window.setInterval(function (t) {
            if (_this.audioPlayer.readyState > 0) {
                _this.timeline.max = _this.audioPlayer.duration;
                _this.timeline.value = _this.audioPlayer.currentTime;
                clearInterval(t);
            }
        });
        if (configuration.displayTime === undefined || configuration.displayTime === false) {
            this.displayTime = false;
        }
        else {
            this.displayTime = true;
            if (configuration.timeContainer === undefined) {
                var TIME_CONTAINER = this.container.querySelector("span[data-map=\"time\"]");
                if (TIME_CONTAINER === null) {
                    throw new ReferenceError("MAP: No timeContainer property provided in configuration and couldn't find it in DOM.");
                }
                this.timeContainer = TIME_CONTAINER;
            }
            else {
                if (configuration.timeContainer instanceof HTMLElement) {
                    this.timeContainer = configuration.timeContainer;
                }
                else {
                    throw new TypeError("MAP: timeContainer property MUST be an instance of HTMLElement.");
                }
            }
            window.setInterval(function (t) {
                if (_this.audioPlayer.readyState > 0) {
                    _this.updateTime();
                    clearInterval(t);
                }
            });
        }
        var time_changing = false;
        this.timeline.addEventListener("mousedown", function () {
            time_changing = true;
        });
        this.timeline.addEventListener("mousemove", function (event) {
            if (time_changing) {
                var TIME = _this.calculateTimelineProgress(event.clientX);
                _this.updateTime(TIME);
            }
        });
        this.timeline.addEventListener("mouseup", function (event) {
            if (time_changing) {
                var TIME = _this.calculateTimelineProgress(event.clientX);
                _this.updateTime(TIME);
                time_changing = false;
            }
        });
        this.timeline.addEventListener("mouseleave", function (event) {
            if (time_changing) {
                var TIME = _this.calculateTimelineProgress(event.clientX);
                _this.updateTime(TIME);
                time_changing = false;
            }
        });
        this.audioPlayer.addEventListener("timeupdate", function () {
            _this.timeline.value = _this.audioPlayer.currentTime;
            var PROGRESS = 100 / _this.audioPlayer.duration * _this.audioPlayer.currentTime / 100;
            var EVENT = new CustomEvent("MAPProgressUpdate", { detail: PROGRESS });
            _this.audioPlayer.dispatchEvent(EVENT);
            _this.updateTime();
        });
        if (configuration.displaySoundControls === undefined) {
            this.displaySoundControls = false;
            this.volume = undefined;
        }
        else {
            this.displaySoundControls = true;
            if (configuration.muteButton === undefined) {
                var MUTE_BUTTON = this.container.querySelector("button[data-map=\"mute\"]");
                if (MUTE_BUTTON === null) {
                    throw new ReferenceError("MAP: No muteButton property provided in configuration and unable to find it in DOM.");
                }
                else {
                    if (MUTE_BUTTON instanceof HTMLButtonElement) {
                        this.muteButton = MUTE_BUTTON;
                    }
                    else {
                        throw new TypeError("MAP: muteButton property MUST be an instance of HTMLButtonElement.");
                    }
                }
            }
            else {
                if (configuration.muteButton instanceof HTMLButtonElement) {
                    this.muteButton = configuration.muteButton;
                }
                else {
                    throw new TypeError("MAP: muteButton property MUST be an instance of HTMLButtonElement.");
                }
            }
            if (configuration.volume === undefined) {
                var VOLUME = this.container.querySelector("progress[data-map=\"volume\"]");
                if (VOLUME === null) {
                    throw new ReferenceError("MAP: No volume property provided in configuration and unable to find it in DOM.");
                }
                else {
                    if (VOLUME instanceof HTMLProgressElement) {
                        this.volume = VOLUME;
                    }
                    else {
                        throw new TypeError("MAP: volume property MUST be an instance of HTMLButtonElement.");
                    }
                }
            }
            else {
                if (configuration.volume instanceof HTMLButtonElement) {
                    this.volume = configuration.volume;
                }
                else {
                    throw new TypeError("MAP: volume property MUST be an instance of HTMLButtonElement.");
                }
            }
            this.volume.max = 1;
            this.volume.value = 0.5;
            var volume_changing_1 = false;
            this.volume.addEventListener("mousedown", function () {
                if (_this.displaySoundControls && _this.volume !== undefined) {
                    volume_changing_1 = true;
                }
            });
            this.volume.addEventListener("mousemove", function (event) {
                if (_this.displaySoundControls && _this.volume !== undefined && volume_changing_1) {
                    var VOLUME = _this.calculateVolume(event.clientX);
                    _this.setVolume(VOLUME);
                }
            });
            this.volume.addEventListener("mouseup", function (event) {
                if (_this.displaySoundControls && _this.volume !== undefined && volume_changing_1) {
                    var VOLUME = _this.calculateVolume(event.clientX);
                    _this.setVolume(VOLUME);
                    volume_changing_1 = false;
                }
            });
            this.volume.addEventListener("mouseleave", function (event) {
                if (_this.displaySoundControls && _this.volume !== undefined && volume_changing_1) {
                    var VOLUME = _this.calculateVolume(event.clientX);
                    _this.setVolume(VOLUME);
                    volume_changing_1 = false;
                }
            });
            if (!this.muteButton.hasAttribute("role")) {
                this.muteButton.setAttribute("role", "switch");
            }
            this.muteButton.classList.add("mute");
            this.muteButton.addEventListener("click", function () {
                if (_this.audioPlayer.muted) {
                    _this.audioPlayer.muted = false;
                    _this.container.classList.remove("muted");
                }
                else {
                    _this.audioPlayer.muted = true;
                    _this.container.classList.add("muted");
                }
            });
        }
    }
    MagnificientAudioPlayer.prototype.getAudioPlayer = function () {
        return this.audioPlayer;
    };
    MagnificientAudioPlayer.prototype.getPlayButton = function () {
        return this.playButton;
    };
    MagnificientAudioPlayer.prototype.getPausebutton = function () {
        return this.playButton;
    };
    MagnificientAudioPlayer.prototype.getCurrentTime = function () {
        return this.audioPlayer.currentTime;
    };
    MagnificientAudioPlayer.prototype.getDuration = function () {
        return this.audioPlayer.duration;
    };
    MagnificientAudioPlayer.prototype.getPrettyCurrentTime = function () {
        return prettyfyTime(this.audioPlayer.currentTime);
    };
    MagnificientAudioPlayer.prototype.getPrettyDuration = function () {
        return prettyfyTime(this.audioPlayer.duration);
    };
    MagnificientAudioPlayer.prototype.calculateTimelineProgress = function (clientX) {
        var TIMELINE_RECT = this.timeline.getBoundingClientRect();
        var LEFT = TIMELINE_RECT.left;
        var WIDTH = TIMELINE_RECT.width;
        var PROGRESS = (100 / WIDTH) * (clientX - LEFT) / 100;
        var TIME = this.audioPlayer.duration * PROGRESS;
        return TIME;
    };
    MagnificientAudioPlayer.prototype.updateTime = function (time) {
        if (time === void 0) { time = undefined; }
        if (time !== undefined) {
            this.audioPlayer.currentTime = time;
        }
        if (this.displayTime && this.timeContainer !== undefined) {
            this.timeContainer.innerHTML = this.getPrettyCurrentTime() + " / " + this.getPrettyDuration();
        }
    };
    MagnificientAudioPlayer.prototype.getDisplaySoundControls = function () {
        return this.displaySoundControls;
    };
    MagnificientAudioPlayer.prototype.calculateVolume = function (clientX) {
        if (this.displaySoundControls && this.volume !== undefined) {
            var VOLUME_RECT = this.volume.getBoundingClientRect();
            var LEFT = VOLUME_RECT.left;
            var WIDTH = VOLUME_RECT.width;
            var VOLUME = (100 / WIDTH) * (clientX - LEFT) / 100;
            return VOLUME;
        }
        else {
            return 0;
        }
    };
    MagnificientAudioPlayer.prototype.setVolume = function (volume) {
        if (this.displaySoundControls && this.volume !== undefined) {
            if (volume > 1) {
                volume = volume / 100;
            }
            if (volume < 0) {
                volume = 0;
            }
            var EVENT = new CustomEvent("MAPVolumeUpdate", { detail: volume });
            this.audioPlayer.dispatchEvent(EVENT);
            this.volume.value = volume;
            this.audioPlayer.volume = volume;
        }
    };
    MagnificientAudioPlayer.prototype.pause = function () {
        if (!this.audioPlayer.paused) {
            this.audioPlayer.pause();
            this.container.classList.remove("playing");
            if (this.pauseButton === this.playButton) {
                this.pauseButton.classList.remove("pause");
                this.playButton.classList.add("play");
            }
            else {
                this.pauseButton.hidden = true;
                this.playButton.hidden = false;
            }
            return true;
        }
        return false;
    };
    MagnificientAudioPlayer.prototype.play = function () {
        var _this = this;
        if (this.audioPlayer.paused) {
            this.audioPlayer.play()
                .then(function () {
                _this.container.classList.add("playing");
                if (_this.playButton === _this.pauseButton) {
                    _this.playButton.classList.remove("play");
                    _this.pauseButton.classList.add("pause");
                }
                else {
                    _this.playButton.hidden = true;
                    _this.pauseButton.hidden = false;
                }
                return true;
            })
                .catch(function (error) {
                console.debug(error);
            });
        }
        return false;
    };
    MagnificientAudioPlayer.prototype.togglePlay = function () {
        if (this.audioPlayer.paused) {
            this.play();
        }
        else {
            this.pause();
        }
    };
    return MagnificientAudioPlayer;
}());
