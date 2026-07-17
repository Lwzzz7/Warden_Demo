document.title = "Warden Demo | Audio Samples";

const sampleRows = [
  {
    label: "DiffWave",
    methods: [
      {
        name: "Original",
        category: "original",
        path: (index) => `DiffWave/DiffWave_audio${index}.wav`,
      },
      {
        name: "Groot",
        category: "baseline",
        path: (index) => `Groot/groot_wmd${index}.wav`,
      },
      {
        name: "RIWF",
        category: "baseline",
        path: (index) => `RIWF/riwf_wmd${index}.wav`,
      },
      {
        name: "Warden (DW)",
        category: "warden",
        path: (index) => `Warden/DiffWave_wmd${index}.wav`,
      },
    ],
  },
  {
    label: "HiFiGAN",
    methods: [
      {
        name: "Original",
        category: "original",
        path: (index) => `HiFiGAN/HifiGAN_audio${index}.wav`,
      },
      {
        name: "HFGw",
        category: "baseline",
        path: (index) => `HFGw/hfgw_wmd${index}.wav`,
      },
      {
        name: "Warden (HFG)",
        category: "warden",
        path: (index) => `Warden/HifiGAN_wmd${index}.wav`,
      },
    ],
  },
];

const sampleList = document.querySelector("#sample-list");
let activeAudio = null;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function stopOtherAudio(nextAudio) {
  if (activeAudio && activeAudio !== nextAudio) {
    activeAudio.pause();
  }
  activeAudio = nextAudio;
}

function buildAudioLink(method, sampleIndex) {
  const item = document.createElement("span");
  item.className = "method-item";
  item.dataset.category = method.category;

  const button = document.createElement("button");
  button.className = "audio-button";
  button.type = "button";

  const playIcon = document.createElement("span");
  playIcon.className = "play-icon";
  playIcon.setAttribute("aria-hidden", "true");

  const time = document.createElement("span");
  time.className = "time";
  time.textContent = "0:00";

  const name = document.createElement("span");
  name.className = "method-name";
  name.textContent = method.name;

  button.append(playIcon, name, time);

  const audio = document.createElement("audio");
  audio.preload = "metadata";

  const source = method.path(sampleIndex);
  audio.src = source;
  button.setAttribute("aria-label", `Play sample ${sampleIndex}, ${method.name}`);

  audio.addEventListener(
    "loadedmetadata",
    () => {
      time.textContent = formatTime(audio.duration);
    },
    { once: true },
  );

  button.addEventListener("click", async () => {
    if (audio.paused) {
      stopOtherAudio(audio);
      try {
        await audio.play();
      } catch {
        item.classList.remove("is-playing");
      }
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    item.classList.add("is-playing");
    button.setAttribute("aria-label", `Pause sample ${sampleIndex}, ${method.name}`);
  });

  audio.addEventListener("pause", () => {
    item.classList.remove("is-playing");
    button.setAttribute("aria-label", `Play sample ${sampleIndex}, ${method.name}`);
  });

  audio.addEventListener("timeupdate", () => {
    time.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", () => {
    time.textContent = formatTime(audio.duration);
  });

  item.append(button, audio);
  return item;
}

function buildSample(sampleIndex) {
  const section = document.createElement("section");
  section.className = "sample-block";

  const title = document.createElement("h3");
  title.textContent = `Sample ${sampleIndex}`;
  section.appendChild(title);

  const list = document.createElement("div");
  list.className = "sample-lines";

  sampleRows.forEach((row) => {
    const line = document.createElement("div");
    line.className = "sample-line";

    const label = document.createElement("div");
    label.className = "row-label";
    label.textContent = `${row.label}:`;

    const methods = document.createElement("div");
    methods.className = "method-list";

    row.methods.forEach((method, index) => {
      methods.appendChild(buildAudioLink(method, sampleIndex));

      if (index < row.methods.length - 1) {
        const divider = document.createElement("span");
        divider.className = "divider";
        divider.textContent = "|";
        methods.appendChild(divider);
      }
    });

    line.append(label, methods);
    list.appendChild(line);
  });

  section.appendChild(list);
  return section;
}

sampleList.replaceChildren();

for (let sampleIndex = 1; sampleIndex <= 5; sampleIndex += 1) {
  sampleList.appendChild(buildSample(sampleIndex));
}
