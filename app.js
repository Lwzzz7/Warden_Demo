const methods = [
  {
    name: "DiffWave",
    label: "Original · Diffusion vocoder",
    category: "original",
    path: (index) => `DiffWave/DiffWave_audio${index}.wav`,
  },
  {
    name: "Warden / DiffWave",
    label: "Proposed · Watermarked",
    category: "warden",
    path: (index) => `VocBulwark/DiffWave_wmd${index}.wav`,
  },
  {
    name: "HiFi-GAN",
    label: "Original · GAN vocoder",
    category: "original",
    path: (index) => `HiFiGAN/HifiGAN_audio${index}.wav`,
  },
  {
    name: "Warden / HiFi-GAN",
    label: "Proposed · Watermarked",
    category: "warden",
    path: (index) => `VocBulwark/HifiGAN_wmd${index}.wav`,
  },
  {
    name: "RIWF",
    label: "Baseline · Watermarked",
    category: "baseline",
    path: (index) => `RIWF/riwf_wmd${index}.wav`,
  },
  {
    name: "Groot",
    label: "Baseline · Watermarked",
    category: "baseline",
    path: (index) => `Groot/groot_wmd${index}.wav`,
  },
  {
    name: "HFGW",
    label: "Baseline · Watermarked",
    category: "baseline",
    path: (index) => `HFGw/hfgw_wmd${index}.wav`,
  },
];

const sampleList = document.querySelector("#sample-list");
const cardTemplate = document.querySelector("#audio-card-template");
const filters = document.querySelectorAll(".filter");
let activeAudio = null;
let audioContext = null;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function drawPlaceholder(canvas, category) {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(canvas.clientWidth, 180);
  const height = canvas.clientHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;

  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);
  context.strokeStyle =
    category === "warden"
      ? "#806cff"
      : category === "original"
        ? "#ff774d"
        : "#7c8576";
  context.lineWidth = 1.25;
  context.beginPath();

  const bars = Math.floor(width / 4);
  for (let i = 0; i < bars; i += 1) {
    const x = i * 4 + 1;
    const envelope = Math.sin((i / bars) * Math.PI);
    const noise = 0.26 + Math.abs(Math.sin(i * 1.73)) * 0.74;
    const barHeight = Math.max(3, envelope * noise * (height - 10));
    context.moveTo(x, (height - barHeight) / 2);
    context.lineTo(x, (height + barHeight) / 2);
  }
  context.stroke();
}

async function drawWaveform(canvas, source, category) {
  drawPlaceholder(canvas, category);
  try {
    audioContext ??= new AudioContext();
    const response = await fetch(source);
    const buffer = await response.arrayBuffer();
    const decoded = await audioContext.decodeAudioData(buffer);
    const channel = decoded.getChannelData(0);
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(canvas.clientWidth, 180);
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const context = canvas.getContext("2d");
    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height);
    context.strokeStyle =
      category === "warden"
        ? "#806cff"
        : category === "original"
          ? "#ff774d"
          : "#7c8576";
    context.lineWidth = 1.25;
    context.beginPath();

    const bars = Math.floor(width / 4);
    const block = Math.max(1, Math.floor(channel.length / bars));
    for (let i = 0; i < bars; i += 1) {
      let peak = 0;
      const start = i * block;
      for (let j = 0; j < block; j += 1) {
        peak = Math.max(peak, Math.abs(channel[start + j] || 0));
      }
      const x = i * 4 + 1;
      const barHeight = Math.max(2, peak * (height - 6));
      context.moveTo(x, (height - barHeight) / 2);
      context.lineTo(x, (height + barHeight) / 2);
    }
    context.stroke();
  } catch {
    // The placeholder remains usable if waveform decoding is unavailable.
  }
}

function stopOtherAudio(nextAudio) {
  if (activeAudio && activeAudio !== nextAudio) {
    activeAudio.pause();
  }
  activeAudio = nextAudio;
}

function buildAudioCard(method, sampleIndex) {
  const fragment = cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".audio-card");
  const audio = fragment.querySelector("audio");
  const player = fragment.querySelector(".wave-player");
  const canvas = fragment.querySelector(".waveform");
  const progress = fragment.querySelector(".wave-progress");
  const time = fragment.querySelector(".time");
  const download = fragment.querySelector(".download-link");
  const source = method.path(sampleIndex);

  card.dataset.category = method.category;
  card.querySelector(".method-type").textContent = method.label;
  card.querySelector(".method-name").textContent = method.name;
  audio.src = source;
  download.href = source;
  download.setAttribute(
    "aria-label",
    `Download sample ${sampleIndex}, ${method.name}`,
  );
  player.setAttribute(
    "aria-label",
    `Play sample ${sampleIndex}, ${method.name}`,
  );

  drawPlaceholder(canvas, method.category);
  audio.addEventListener(
    "loadedmetadata",
    () => {
      time.textContent = formatTime(audio.duration);
    },
    { once: true },
  );

  player.addEventListener("click", async () => {
    if (audio.paused) {
      stopOtherAudio(audio);
      try {
        await audio.play();
        drawWaveform(canvas, source, method.category);
      } catch {
        card.classList.remove("is-playing");
      }
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    card.classList.add("is-playing");
    player.setAttribute("aria-label", `Pause sample ${sampleIndex}, ${method.name}`);
  });

  audio.addEventListener("pause", () => {
    card.classList.remove("is-playing");
    player.setAttribute("aria-label", `Play sample ${sampleIndex}, ${method.name}`);
  });

  audio.addEventListener("timeupdate", () => {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.style.width = `${percent}%`;
    time.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", () => {
    progress.style.width = "0";
    time.textContent = formatTime(audio.duration);
  });

  return fragment;
}

for (let sampleIndex = 1; sampleIndex <= 5; sampleIndex += 1) {
  const group = document.createElement("section");
  group.className = "sample-group";
  group.innerHTML = `
    <div class="sample-label">
      <span class="sample-number">${sampleIndex.toString().padStart(2, "0")}</span>
      <div>
        <h3>Speech sample ${sampleIndex}</h3>
        <p>Compare the same sample index across all methods</p>
      </div>
    </div>
    <div class="audio-grid"></div>
  `;

  const grid = group.querySelector(".audio-grid");
  methods.forEach((method) => {
    grid.appendChild(buildAudioCard(method, sampleIndex));
  });
  sampleList.appendChild(group);
}

requestAnimationFrame(() => {
  document.querySelectorAll(".audio-card").forEach((card) => {
    drawPlaceholder(card.querySelector(".waveform"), card.dataset.category);
  });
});

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    filters.forEach((filter) => filter.classList.remove("is-active"));
    button.classList.add("is-active");

    document.querySelectorAll(".audio-card").forEach((card) => {
      card.hidden = selected !== "all" && card.dataset.category !== selected;
    });
  });
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.querySelectorAll(".audio-card").forEach((card) => {
      drawPlaceholder(card.querySelector(".waveform"), card.dataset.category);
    });
  }, 120);
});
