import "./style.css";
import { intonate } from "intonate";

const { listen, subscribe, unsubscribe } = await intonate();

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

(async () => {
  try {
    listen();
    subscribe(displayNote);
  } catch (error) {
    console.log(error);
  }
})();

let init = false;

function displayNote(obj) {
  console.log(obj);
  const elem = document.getElementById("note-value");
  if (!obj.note) {
    init = false;
    elem.textContent = "Microphone is disabled";
  } else if (obj.volume < THRESHOLD) {
    if (!init) elem.textContent = "Too quiet";
    else return;
  } else {
    init = true;
    elem.textContent = obj.note;
  }
}

function populateScales() {
  for (const type in scales) {
    for (const scale in scales[type]) {
      let opt = document.createElement("option");
      opt.textContent = `${scale} ${type}`;
      opt.value = `${type},${scale}`;
      dropdown.appendChild(opt);
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

    subscribe(validateScale);
  });
}

function addOctaves(scale) {
  const s = [].concat(...Array.from({ length: OCTAVES }, () => scale));
  return s.concat([scale[0]], [...s].reverse());
}

function validateScale(obj) {
  if (obj.volume < THRESHOLD || !obj.note) return;

  if (obj.note === currentScale[currentIndex]) {
    currentIndex++;
    if (currentIndex === currentScale.length) endScale(true);

    console.log("next note: ", currentScale[currentIndex]);
  } else if (obj.note !== currentScale[currentIndex - 1]) {
    scaleElem.textContent = `The next note was ${currentScale[currentIndex]}, but you played ${obj.note}`;
    endScale(false);
  }
}

function endScale(wasCorrect) {
  currentIndex = 0;
  currentScale = [];
  if (wasCorrect) scaleElem.textContent = "";
  dropdown.selectedIndex = 0;
  unsubscribe(validateScale);
  console.log("scale end");
}

populateScales();
