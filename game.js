const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const config = {
  rows: 5,
  cols: 5,
  brickWidth: canvas.width / 5,
  brickHeight: 20,
  ballSpeed: 6,
  paddleWidth: 120,
  paddleHeight: 10,
};

let ball, paddle, bricks, isRunning;

function initGame() {
  isRunning = false;

  // Ball
  ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 7,
    dx: config.ballSpeed,
    dy: -config.ballSpeed,
  };

  // Paddle
  paddle = {
    x: (canvas.width - config.paddleWidth) / 2,
    y: canvas.height - 20,
    width: config.paddleWidth,
    height: config.paddleHeight,
    speed: 6,
    dx: 0,
  };

  // Bricks
  bricks = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      const hitsToBreak = Math.floor(Math.random() * 3) + 1;
      const char = chars[Math.floor(Math.random() * chars.length)];
      bricks.push({
        x: c * config.brickWidth,
        y: r * config.brickHeight,
        hits: hitsToBreak,
        broken: false,
        char,
      });
    }
  }
}

canvas.addEventListener("touchmove", function (e) {
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  paddle.x = touchX - paddle.width / 2;

  // Giới hạn trong canvas
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }
});

function drawBricks() {
  bricks.forEach(brick => {
    if (!brick.broken) {
      ctx.fillStyle = `rgb(${255 - brick.hits * 60}, ${100 + brick.hits * 50}, 200)`;
      ctx.fillRect(brick.x, brick.y, config.brickWidth, config.brickHeight);
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.fillText(brick.hits, brick.x + config.brickWidth / 2 - 5, brick.y + config.brickHeight / 2 + 5);
    } else {
      // Draw revealed character
      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.fillText(brick.char, brick.x + config.brickWidth / 2 - 6, brick.y + config.brickHeight / 2 + 6);
    }
  });
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ff5722';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.fillStyle = '#00bcd4';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

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
    alert('Game Over!');
    initGame();
  }

  // Brick collision
  bricks.forEach(brick => {
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
        }
      }
    }
  });
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
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

document.getElementById('startBtn').addEventListener('click', () => {
  initGame();
  startGame();
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') paddle.dx = paddle.speed;
  if (e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') paddle.dx = 0;
});

// Init once
initGame();
draw();
