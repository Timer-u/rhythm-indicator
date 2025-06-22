document.getElementById("start").addEventListener("click", function () {
  const duration = parseInt(document.getElementById("duration").value, 10);
  if (isNaN(duration) || duration <= 0) {
    alert("请输入有效的时长（秒）");
    return;
  }

  startRhythm(duration);
});

// 休息按钮的长按功能
const breakBtn = document.getElementById("break-btn");
let breakTimer;

breakBtn.addEventListener("mousedown", startBreak);
breakBtn.addEventListener("touchstart", startBreak);

breakBtn.addEventListener("mouseup", cancelBreak);
breakBtn.addEventListener("touchend", cancelBreak);
breakBtn.addEventListener("mouseleave", cancelBreak);

function startBreak() {
  // 只有已经开始节奏时才能进入休息
  if (currentPhase && !isBreakActive) {
    breakTimer = setTimeout(enterBreak, 1000); // 长按1秒后进入休息
  }
}

function cancelBreak() {
  clearTimeout(breakTimer);
}

function enterBreak() {
  isBreakActive = true;

  // 保存当前状态
  breakSavedState = {
    phase: currentPhase,
    elapsed: currentElapsed,
    interval: currentInterval,
  };

  // 清除当前闪烁
  clearInterval(blinkInterval);

  // 应用休息样式
  const indicator = document.getElementById("indicator");
  indicator.className = "indicator blink-break";

  // 设置休息结束计时器
  setTimeout(exitBreak, 10000); // 休息10秒
}

function exitBreak() {
  isBreakActive = false;

  // 恢复之前的状态
  const { phase, elapsed, interval } = breakSavedState;
  currentPhase = phase;
  currentElapsed = elapsed;

  // 重新开始闪烁
  startBlink(interval);

  // 更新进度条
  updateProgressBar();
}

// 节奏控制变量
let currentPhase = null;
let currentElapsed = 0;
let currentInterval = 0;
let blinkInterval = null;
let isBreakActive = false;
let breakSavedState = {};

function startRhythm(duration) {
  // 重置状态
  currentPhase = "slow";
  currentElapsed = 0;
  isBreakActive = false;

  // 计算各阶段时间（秒）
  const slowDuration = duration * 0.3;
  const mediumDuration = duration * 0.4;
  const fastDuration = duration * 0.3;

  // 设置初始阶段
  startPhase(slowDuration, 1000); // 慢速阶段：1000ms间隔
}

function startPhase(duration, interval) {
  currentInterval = interval;
  startBlink(interval);

  // 设置阶段超时
  setTimeout(() => {
    if (isBreakActive) return; // 如果正在休息则跳过阶段切换

    switch (currentPhase) {
      case "slow":
        // 进入中速阶段
        currentPhase = "medium";
        currentElapsed = 0;
        startPhase((duration * 0.4) / 0.3, 571); // 中速阶段：571ms间隔（≈1.75Hz）
        break;
      case "medium":
        // 进入快速阶段
        currentPhase = "fast";
        currentElapsed = 0;
        startPhase((duration * 0.3) / 0.4, 400); // 快速阶段：400ms间隔（2.5Hz）
        break;
      case "fast":
        // 结束所有阶段
        clearInterval(blinkInterval);
        const indicator = document.getElementById("indicator");
        indicator.className = "indicator";
        break;
    }

    // 更新进度条
    updateProgressBar();
  }, duration * 1000);
}

function startBlink(interval) {
  const indicator = document.getElementById("indicator");

  // 清除现有闪烁
  clearInterval(blinkInterval);

  // 设置当前阶段的样式
  indicator.className = `indicator blink-${currentPhase}`;

  // 开始闪烁
  blinkInterval = setInterval(() => {
    if (!isBreakActive) {
      // 闪烁效果通过添加/移除active类实现
      const inner = indicator.querySelector(".indicator-inner");
      inner.classList.toggle("active");

      // 更新当前阶段经过的时间
      currentElapsed += interval;
    }
  }, interval);
}

function updateProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  const phases = progressBar.querySelectorAll(".phase");

  // 重置所有阶段
  phases.forEach((phase) => {
    phase.style.opacity = "0.3";
  });

  // 高亮当前阶段
  switch (currentPhase) {
    case "slow":
      phases[0].style.opacity = "1";
      break;
    case "medium":
      phases[1].style.opacity = "1";
      break;
    case "fast":
      phases[2].style.opacity = "1";
      break;
  }
}
