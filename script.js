var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var pitchOffsets = {
  'A': 0,
  'A#': 1,
  'BB': 1,
  'B': 2,
  'CB': 2,
  'B#': 3,
  'C': 3,
  'C#': 4,
  'DB': 4,
  'D': 5,
  'D#': 6,
  'EB': 6,
  'E': 7,
  'FB': 7,
  'E#': 8,
  'F': 8,
  'F#': 9,
  'GB': 9,
  'G': 10,
  'G#': 11,
  'AB': 11
}

var keyNumFromName = function(keyName) {
  // match a pitch name and octave, capture them separately
  // Breakdown of this regex here: https://regexper.com/#%2F(%5BA-Ga-g%5D%2B%23%7B0%2C1%7D)(%5Cd)%2F
  var pitchMatchRegEx = /([A-Ga-g]+#{0,1})(\d)/;
  var pitchNameParts = keyName.match(pitchMatchRegEx);
  if (!pitchNameParts) {
    throw new Error('Incorrect pitch notation. Pitchname must consist of a pitch name (A-G with optional # or b) and ')
  }
  var pitchName = pitchNameParts[1].toUpperCase();
  var octave = parseInt(pitchNameParts[2]);
  var keyNumber = (octave * 12) + pitchOffsets[pitchName] + 1;
  return keyNumber;
}

var frequencyFromKeyNum = function(keyNum) {
  return Math.pow(Math.pow(2, (1 / 12)), keyNum - 49) * 440;
}

// master scale speed value (in seconds per note)
var scaleSpeed = 0.2;

// grab play buttons
var playButton = document.getElementById('play');

playButton.onclick = play;

// grab start/stop buttons
var startAudio = document.getElementById('audioStart');
var endAudio = document.getElementById('audioEnd');

// start audio function
startAudio.onclick = function() {
  audioCtx.resume();
}

// pause audio function
endAudio.onclick = function() {
  audioCtx.suspend();
}

var gainNode = audioCtx.createGain();
gainNode.connect(audioCtx.destination);
gainNode.gain.value = 0.2;

var score = [
  { note: 'C4', time: 8},
  { note: 'E4', time: 7},
  { note: 'G4', time: 1},
  { note: 'C5', time: 1},
  { note: 'E5', time: 1},
  { note: 'G4', time: 1},
  { note: 'C5', time: 1},
  { note: 'E5', time: 1},
  { note: 'C4', time: 8},
  { note: 'E4', time: 7},
  { note: 'G4', time: 1},
  { note: 'C5', time: 1},
  { note: 'E5', time: 1},
  { note: 'G4', time: 1},
  { note: 'C5', time: 1},
  { note: 'E5', time: 1},

  { note: 'C4', time: 8},
  { note: 'D4', time: 7},
  { note: 'A5', time: 1},
  { note: 'D5', time: 1},
  { note: 'F5', time: 1},
  { note: 'A5', time: 1},
  { note: 'D5', time: 1},
  { note: 'F5', time: 1},
  { note: 'C4', time: 8},
  { note: 'D4', time: 7},
  { note: 'A5', time: 1},
  { note: 'D5', time: 1},
  { note: 'F5', time: 1},
  { note: 'A5', time: 1},
  { note: 'D5', time: 1},
  { note: 'F5', time: 1},

  { note: 'B4', time: 8},
  { note: 'D4', time: 7},
  { note: 'G4', time: 1},
  { note: 'D5', time: 1},
  { note: 'F5', time: 1},
  { note: 'G4', time: 1},
  { note: 'D5', time: 1},
  { note: 'F5', time: 1},
  { note: 'B4', time: 8},
  { note: 'D4', time: 7},
  { note: 'G4', time: 1},
  { note: 'D5', time: 1},
  { note: 'F5', time: 1},
  { note: 'G4', time: 1},
  { note: 'D5', time: 1},
  { note: 'F5', time: 1},

  { note: 'C4', time: 8},
  { note: 'E4', time: 7},
  { note: 'G4', time: 1},
  { note: 'C5', time: 1},
  { note: 'E5', time: 1},
  { note: 'G4', time: 1},
  { note: 'C5', time: 1},
  { note: 'E5', time: 1},
  { note: 'C4', time: 8},
  { note: 'E4', time: 7},
  { note: 'G4', time: 1},
  { note: 'C5', time: 1},
  { note: 'E5', time: 1},
  { note: 'G4', time: 1},
  { note: 'C5', time: 1},
  { note: 'E5', time: 1}
];

function turnOnKeyDisplay(keyElement) {
  if (keyElement.className.match(/white-key/)) {
    keyElement.className += ' on';
  }
}

function turnOffKeyDisplay(keyElement) {
  if (keyElement.className.match(/white/)) {
    keyElement.className = 'white-key';
  }
}

// event handler for play scale buttons
function play(event) {
  for (var i = 0; i < score.length; i++) {
    var freq = frequencyFromKeyNum(keyNumFromName(score[i].note));
    playTone(freq, audioCtx.currentTime + (i * scaleSpeed), score[i].time);

    const key = document.getElementById(score[i].note);
    const startTime = (audioCtx.currentTime + (i * scaleSpeed) * 1000);
    const endTime = (audioCtx.currentTime + (i * scaleSpeed * 1000) + scaleSpeed * score[i].time * 1000 - 5);

    // "Play" the note
    window.setTimeout(function() {
      turnOnKeyDisplay(key)
    }, startTime);
    // "Release" the note
    window.setTimeout(function() {
      turnOffKeyDisplay(key)
    }, endTime);
  }
}

// Play a tone at a specified frequency for the 'scaleSpeed' length
// For a more dynamic version, we might want to create a third 'length' argument so that it is more reusable
function playTone(freq, time, length) {
  var osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.connect(gainNode);
  osc.frequency.value = freq;
  osc.start(time);
  osc.stop(time + scaleSpeed * length);
  return osc;
}