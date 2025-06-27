// 全局变量
let totalDuration = 180;
let currentStage = 0;
let elapsedTime = 0;
let intervalId = null;
let flashIntervalId = null;

// DOM 元素
const durationInput = document.getElementById('duration');
const errorMessage = document.getElementById('error-message');
const indicator = document.getElementById('indicator');
const stageText = document.getElementById('stage-text');
const timeRemaining = document.getElementById('time-remaining');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const stageBreakdown = document.getElementById('stage-breakdown');

// 节奏配置
const stages = [
  { name: '慢节奏', percentage: 0.3, flashInterval: 1000, colorClass: 'slow' },
  { name: '中节奏', percentage: 0.4, flashInterval: 500, colorClass: 'medium' },
  { name: '快节奏', percentage: 0.3, flashInterval: 375, colorClass: 'fast' }
];

// 计算每个阶段的持续时间
function calculateStageDurations() {
  return stages.map((stage) => ({
    ...stage,
    duration: Math.round(totalDuration * stage.percentage)
  }));
}

// 更新阶段预览
function updateStagePreview() {
  const stageDurations = calculateStageDurations();
  stageBreakdown.innerHTML = '';

  stageDurations.forEach((stage) => {
    const item = document.createElement('div');
    item.className = 'stage-item';
    item.innerHTML = `
            <span class="stage-name">${stage.name}</span>
            <span class="stage-duration">${stage.duration}秒 (${Math.round(60 / (stage.flashInterval / 1000))} BPM)</span>
        `;
    stageBreakdown.appendChild(item);
  });
}

// 验证输入
function validateInput() {
  const value = parseInt(durationInput.value);

  if (isNaN(value) || value < 60 || value > 600) {
    errorMessage.textContent = '请输入60-600秒之间的数值';
    return false;
  }

  errorMessage.textContent = '';
  totalDuration = value;
  updateStagePreview();
  return true;
}

// 获取当前阶段信息
function getCurrentStageInfo() {
  const stageDurations = calculateStageDurations();
  let accumulatedTime = 0;

  for (let i = 0; i < stageDurations.length; i++) {
    accumulatedTime += stageDurations[i].duration;
    if (elapsedTime < accumulatedTime) {
      return {
        index: i,
        stage: stageDurations[i],
        stageElapsed:
          elapsedTime - (accumulatedTime - stageDurations[i].duration),
        stageRemaining: accumulatedTime - elapsedTime
      };
    }
  }

  return null;
}

// 闪烁指示器
function startFlashing(interval, colorClass) {
  let isOn = true;

  // 添加激活状态类
  indicator.classList.add('active');

  // 立即设置颜色
  indicator.className = `indicator ${colorClass} active`;

  flashIntervalId = setInterval(() => {
    if (isOn) {
      indicator.className = 'indicator';
    } else {
      indicator.className = `indicator ${colorClass} active`;
    }
    isOn = !isOn;
  }, interval / 2);
}

// 停止闪烁
function stopFlashing() {
  if (flashIntervalId) {
    clearInterval(flashIntervalId);
    flashIntervalId = null;
  }
  indicator.className = 'indicator';
  indicator.classList.remove('active');
}

// 更新显示
function updateDisplay() {
  const stageInfo = getCurrentStageInfo();

  if (!stageInfo) {
    // 完成
    stopTimer();
    stageText.textContent = '已完成';
    timeRemaining.textContent = '';
    return;
  }

  // 更新阶段文本
  stageText.textContent = stageInfo.stage.name;

  // 更新剩余时间
  const totalRemaining = totalDuration - elapsedTime;
  timeRemaining.textContent = `总剩余时间: ${totalRemaining}秒 | 本阶段剩余: ${stageInfo.stageRemaining}秒`;

  // 如果进入新阶段，更新闪烁
  if (stageInfo.index !== currentStage) {
    currentStage = stageInfo.index;
    stopFlashing();
    startFlashing(stageInfo.stage.flashInterval, stageInfo.stage.colorClass);
  }
}

// 开始
function start() {
  if (!validateInput()) return;

  elapsedTime = 0;
  currentStage = -1;

  startBtn.disabled = true;
  stopBtn.disabled = false;
  durationInput.disabled = true;

  // 立即更新一次
  updateDisplay();

  // 每秒更新
  intervalId = setInterval(() => {
    elapsedTime++;
    updateDisplay();
  }, 1000);
}

// 停止
function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  stopFlashing();

  startBtn.disabled = false;
  stopBtn.disabled = true;
  durationInput.disabled = false;

  if (elapsedTime === 0) {
    stageText.textContent = '准备开始';
    timeRemaining.textContent = '';
  }
}

// 事件监听
startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', () => {
  stopTimer();
  stageText.textContent = '已停止';
  timeRemaining.textContent = '';
});

durationInput.addEventListener('input', () => {
  if (validateInput()) {
    updateStagePreview();
  }
});

// 初始化
updateStagePreview();
