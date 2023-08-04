const data = JSON.parse(localStorage.getItem("scales"));
const app = document.getElementById("app");

function displayStats() {
  let statElem = document.querySelector(".stat");

  if (!data) return;
  else statElem.style.display = "block";

  for (let i = 0; i < Object.keys(data).length; i++) {
    if (i !== 0) {
      statElem = statElem.cloneNode(true);
      app.appendChild(statElem);
    }

    const numCorrect = Object.values(data)[i].correct;
    const numIncorrect = Object.values(data)[i].incorrect;

    statElem.querySelector(".scale-name").textContent = Object.keys(data)[i];
    statElem.querySelector(".num-correct").textContent = numCorrect;
    statElem.querySelector(".num-incorrect").textContent = numIncorrect;

    const width = (100 * numIncorrect) / (numCorrect + numIncorrect);

    if (width === Infinity) statElem.querySelector(".bar").style.width = "100%";
    else statElem.querySelector(".bar").style.width = `${width}%`;
  }
}

displayStats();
