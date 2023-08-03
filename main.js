import "./style.css";
import { intonate } from "intonate";

const scales = {
  major: {
    C: ["C", "D", "E", "F", "G", "A", "B"],
    D: ["D", "E", "F#", "G", "A", "B", "C#"],
    E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  },
  minor: {
    C: [],
  },
};
const THRESHOLD = 0.025;
const OCTAVES = 2;

const dropdown = document.getElementById("chooseScale");
const scaleElem = document.getElementById("scale");

let currentScale = [];
let currentIndex = 0;

let start;
let stop;
let init = false;
let time = Date.now();

async function startIntonate() {
  const { listen, subscribe, unsubscribe } = await intonate();
  start = subscribe;
  stop = unsubscribe;
  try {
    listen();
    subscribe(displayNote);
  } catch (error) {
    console.log(error);
  }
}

function displayNote(obj) {
  const elem = document.getElementById("note-value");
  const msgElem = document.getElementById("message");
  if ((!obj.note || obj.volume < THRESHOLD) && !init) {
    elem.textContent = "Too quiet...";
    msgElem.textContent = "Is your microphone on?";
  } else if (obj.volume > THRESHOLD) {
    init = true;
    elem.textContent = obj.note;
    msgElem.textContent = "";
  }
}

function populateScales() {
  for (const type in scales) {
    const group = document.createElement("optgroup");
    group.label = type.charAt(0).toUpperCase() + type.slice(1);
    dropdown.appendChild(group);
    for (const scale in scales[type]) {
      const opt = document.createElement("option");
      opt.textContent = `${scale} ${type}`;
      opt.value = `${type},${scale}`;
      group.appendChild(opt);
    }
  }

  dropdown.addEventListener("change", (e) => {
    if (dropdown.value === "") {
      scaleElem.textContent = "";
      return;
    }

    const [i, j] = dropdown.value.split(",");
    const scale = scales[i][j];

    currentScale = addOctaves(scale);
    console.log(currentScale);

    scaleElem.textContent = `Currently listening for ${j} ${i}, ${OCTAVES} octaves`;

    start(validateScale);
    time = Date.now();
  });
}

function addOctaves(scale) {
  const s = [].concat(...Array.from({ length: OCTAVES }, () => scale));
  return s.concat([scale[0]], [...s].reverse());
}

function validateScale(obj) {
  if (obj.volume < THRESHOLD || !obj.note) return;

  if (obj.note === currentScale[currentIndex]) {
    // correct note
    currentIndex++;
    if (currentIndex === currentScale.length) endScale(true);
    console.log("next note: ", currentScale[currentIndex]);
  } else if (obj.note === currentScale[currentIndex - 1]) {
    // still playing previous note, ignore but update timer
    time = Date.now();
  } else if ((Date.now() - time) / 1000 > 0.15) {
    // has been playing a wrong note for more than 0.15s (approx.)
    // (notes shorter than this are ignored due to background noise and
    // small fluctuations in the frequency, especially for wind instruments)
    console.log(
      "Debug details for incorrect note:\n",
      `Approx. note length: ${(Date.now() - time) / 1000}s\n`,
      `Note volume: ${obj.volume}\n`,
      `Note expected: ${currentScale[currentIndex]}\n`,
      `Note observed: ${obj.note}`
    );
    scaleElem.textContent = `The next note was ${currentScale[currentIndex]}, but you played ${obj.note}`;
    endScale(false);
  }
}

function endScale(wasCorrect) {
  if (wasCorrect) scaleElem.textContent = "You played the scale correctly!";
  currentScale = [];
  currentIndex = 0;
  dropdown.selectedIndex = 0;
  stop(validateScale);
  console.log("scale end");
}

populateScales();
startIntonate();
