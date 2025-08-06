const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
function showWinModal() {
  document.getElementById("winModal").style.display = "flex";
}

function closeWinModal() {
  document.getElementById("winModal").style.display = "none";
  initGame();
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();

canvas.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
  },
  { passive: false }
);

window.addEventListener("resize", () => {
  resizeCanvas();
  initGame();
});

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

const config = {
  rows: 5,
  cols: 5,
  paddleHeight: 10,
  paddleSpeed: 8,
};

let ball, paddle, bricks, charPool, isRunning;

function initGame() {
  isRunning = false;

  // Responsive setup
  config.brickWidth = canvas.width / config.cols;
  config.brickHeight = canvas.height / 20;
  config.paddleWidth = canvas.width / 5;
  config.ballSpeed = canvas.width / 70;

  // Ball
  ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: canvas.width / 50,
    dx: config.ballSpeed,
    dy: -config.ballSpeed,
  };

  // Paddle
  paddle = {
    x: (canvas.width - config.paddleWidth) / 2,
    y: canvas.height - 20,
    width: config.paddleWidth,
    height: config.paddleHeight,
    dx: 0,
  };

  // Bricks
  bricks = [];
  const charMatrix = [
  ["KR", "LU", "KR", "FA", "D"],
  ["5D", "TX", "SV", "U",  "5O"],
  ["RM", "LY", "Q",  "DU", "1"],
  ["KN", "WW", "LN", "I5", "TO"],
  ["VE", "3",  "LN", "LN", "KD"],
];

  for (let r = 0; r < config.rows; r++) {
  for (let c = 0; c < config.cols; c++) {
    const hits = Math.floor(Math.random() * 3) + 1;
    const char = charMatrix[r][c] || ""; // lấy ký tự từ bảng
    bricks.push({
      x: c * config.brickWidth,
      y: r * config.brickHeight,
      hits,
      broken: false,
      char,
    });
  }
}


  draw();
}
// Modal
function createWinModal() {
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'winModal';
  modalOverlay.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    text-align: center;
    font-family: "Segoe UI", sans-serif;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  `;

  const h2 = document.createElement('h2');
  h2.textContent = 'OTT:';
  h2.style.color = '#333';
  h2.style.marginBottom = '1rem';

  const p = document.createElement('p');
  p.style.whiteSpace = 'pre-line';
  p.style.lineHeight = '1.6';
  p.style.color = '#555';
  p.style.fontSize = '1rem';
  p.textContent = `Âm vang Hội trại gọi mời
Năm năm nguyên bản bay theo mây trời
Cháy lên tiếng hát rạng ngời
Đoàn viên háo hức ngập trời hân hoan`;

  const btn = document.createElement('button');
  btn.textContent = 'OK';
  btn.style.cssText = `
    margin-top: 1.5rem;
    padding: 0.6rem 1.5rem;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  `;
  btn.addEventListener('click', closeWinModal);

  modalContent.appendChild(h2);
  modalContent.appendChild(p);
  modalContent.appendChild(btn);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

// Hàm đóng modal
function closeWinModal() {
  const modal = document.getElementById('winModal');
  if (modal) modal.style.display = 'none';
}

// Hàm mở modal
function openWinModal() {
  const modal = document.getElementById('winModal');
  if (modal) modal.style.display = 'flex';
}


function drawBricks() {
  bricks.forEach((brick) => {
    if (!brick.broken) {
      ctx.fillStyle = `rgb(${255 - brick.hits * 60}, ${100 + brick.hits * 50}, 200)`;
      ctx.fillRect(brick.x, brick.y, config.brickWidth, config.brickHeight);
      ctx.fillStyle = "#fff";
      ctx.font = `${config.brickHeight / 2}px sans-serif`;
      ctx.fillText(brick.hits, brick.x + config.brickWidth / 2 - 5, brick.y + config.brickHeight / 2 + 5);
    } else {
      ctx.fillStyle = "#fff";
      ctx.font = `${config.brickHeight / 1.5}px sans-serif`;
      ctx.fillText(brick.char, brick.x + config.brickWidth / 2 - 6, brick.y + config.brickHeight / 2 + 6);
    }
  });
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ff5722";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.fillStyle = "#00bcd4";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
  if (ball.y - ball.radius < 0) ball.dy *= -1;

  // Paddle collision
  if (
    ball.y + ball.radius > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy *= -1;
  }

  // Bottom = lose
  if (ball.y + ball.radius > canvas.height) {
    alert("Game Over!");
    initGame();
  }

  // Brick collision
  bricks.forEach((brick) => {
    if (!brick.broken) {
      if (
        ball.x > brick.x &&
        ball.x < brick.x + config.brickWidth &&
        ball.y - ball.radius < brick.y + config.brickHeight &&
        ball.y + ball.radius > brick.y
      ) {
        ball.dy *= -1;
        brick.hits--;
        if (brick.hits <= 0) {
          brick.broken = true;
          checkWin();
        }
      }
    }
  });
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
}

function checkWin() {
  const allBroken = bricks.every((brick) => brick.broken);
  if (allBroken) {
    isRunning = false;
    setTimeout(() => {
      openWinModal();
      initGame();
    }, 100);
  }
} 


function update() {
  if (!isRunning) return;
  moveBall();
  movePaddle();
  draw();
  requestAnimationFrame(update);
}

function startGame() {
  if (!isRunning) {
    isRunning = true;
    update();
  }
}

document.getElementById("startBtn").addEventListener("click", () => {
  initGame();
  startGame();
});

// Arrow keys
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") paddle.dx = config.paddleSpeed;
  if (e.key === "ArrowLeft") paddle.dx = -config.paddleSpeed;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") paddle.dx = 0;
});

// Touch support
canvas.addEventListener("touchmove", (e) => {
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  paddle.x = touchX - paddle.width / 2;

  // Giới hạn
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }
});

// Init lần đầu
initGame();
draw();
