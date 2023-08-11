const backupBtn = document.getElementById("backup-btn");
const resetBtn = document.getElementById("reset-btn");
const cancel = document.getElementsByClassName("cancel");

function displayStats() {
  const data = JSON.parse(localStorage.getItem("scales"));
  const app = document.getElementById("app");
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

function updateMenu(status) {
  const menuElems = {
    menu: document.getElementById("menu"),
    backup: document.getElementById("backup"),
    reset: document.getElementById("reset"),
    file: document.getElementById("load-input"),
  };

  Object.keys(menuElems).forEach((e) => (menuElems[e].style.display = "none"));

  if (status === "hide") {
    console.log("Operation cancelled");
  } else if (status === "backup") {
    [menuElems.menu, menuElems.backup].forEach(
      (e) => (e.style.display = "block")
    );

    document.getElementById("save-bk").addEventListener("click", saveBackup);

    document.getElementById("load-bk").addEventListener("click", () => {
      menuElems.file.style.display = "block";
      document
        .getElementById("submit-file")
        .addEventListener("click", loadBackup);
    });
  } else if (status === "reset") {
    [menuElems.menu, menuElems.reset].forEach(
      (e) => (e.style.display = "block")
    );

    document
      .getElementById("reset-stats")
      .addEventListener("click", resetStats);
  }
}

function resetStats() {
  localStorage.clear();
  updateMenu("hide");
  window.location.reload();
}

function saveBackup() {
  const file =
    "data:text/json;charset=utf-8," +
    JSON.stringify(JSON.parse(localStorage.getItem("scales")));

  const data = encodeURI(file);
  const link = document.createElement("a");
  link.setAttribute("href", data);
  link.setAttribute("download", "escalade-backup.json");
  link.click();
}

function loadBackup() {
  const file = document.getElementById("file").files[0];
  console.log(file);
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    localStorage.setItem("scales", reader.result);
    window.location.reload();
  });
  reader.readAsText(file);
}

backupBtn.addEventListener("click", () => updateMenu("backup"));
resetBtn.addEventListener("click", () => updateMenu("reset"));
Array.from(cancel).forEach((btn) => {
  btn.addEventListener("click", () => updateMenu("hide"));
});

displayStats();
