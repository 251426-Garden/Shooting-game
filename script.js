const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-val');
const powerGauge = document.getElementById('power-gauge');

canvas.width = 600;
canvas.height = 800;

let score = 0;
const friction = 0.985;
let isCharging = false;
let chargePower = 0;
const MAX_POWER = 22;

const ball = { x: 300, y: 700, radius: 12, dx: 0, dy: 0, isMoving: false };

// 골대 설정
const goalWidth = 180;
const goalX = (canvas.width - goalWidth) / 2;
const goalY = 50;
const postThickness = 12;

const leftPost = { x: goalX - postThickness, y: goalY, w: postThickness, h: 60 };
const rightPost = { x: goalX + goalWidth, y: goalY, w: postThickness, h: 60 };

// 1. 수비수 데이터 (초기 위치)
const defenders = [
    { x: 100, y: 300, w: 70, h: 25 },
    { x: 430, y: 300, w: 70, h: 25 },
    { x: 265, y: 450, w: 70, h: 25 }
];

// 2. 수비수 위치를 랜덤하게 섞는 함수
function shuffleDefenders() {
    defenders.forEach(d => {
        // x축: 좌우 벽에서 어느 정도 떨어진 범위 내 랜덤
        d.x = Math.random() * (canvas.width - d.w - 100) + 50;
        // y축: 골대 앞(150)부터 중간 지역(550) 사이 랜덤
        d.y = Math.random() * 400 + 150;
    });
}

canvas.addEventListener('mousedown', () => { if(!ball.isMoving) { isCharging = true; chargePower = 0; } });
window.addEventListener('mouseup', (e) => {
    if(!isCharging) return;
    isCharging = false;
    const rect = canvas.getBoundingClientRect();
    const angle = Math.atan2((e.clientY - rect.top) - ball.y, (e.clientX - rect.left) - ball.x);
    ball.dx = Math.cos(angle) * (chargePower + 6);
    ball.dy = Math.sin(angle) * (chargePower + 6);
    ball.isMoving = true;
    powerGauge.style.width = '0%';
});

function bounceOffRect(rect) {
    if (ball.x + ball.radius > rect.x && ball.x - ball.radius < rect.x + rect.w &&
        ball.y + ball.radius > rect.y && ball.y - ball.radius < rect.y + rect.h) {
        
        const fromLeft = Math.abs((ball.x + ball.radius) - rect.x);
        const fromRight = Math.abs((ball.x - ball.radius) - (rect.x + rect.w));
        const fromTop = Math.abs((ball.y + ball.radius) - rect.y);
        const fromBottom = Math.abs((ball.y - ball.radius) - (rect.y + rect.h));

        const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);

        if (min === fromLeft || min === fromRight) ball.dx *= -1.1; // 튕길 때 반동 추가
        else ball.dy *= -1.1;

        ball.x += ball.dx;
        ball.y += ball.dy;
        return true;
    }
    return false;
}

function update() {
    if (isCharging) {
        chargePower += 0.35;
        if(chargePower > MAX_POWER) chargePower = MAX_POWER;
        powerGauge.style.width = (chargePower / MAX_POWER * 100) + '%';
    }

    if (ball.isMoving) {
        ball.x += ball.dx;
        ball.y += ball.dy;
        ball.dx *= friction;
        ball.dy *= friction;

        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) ball.dy *= -1;

        defenders.forEach(d => bounceOffRect(d));
        bounceOffRect(leftPost);
        bounceOffRect(rightPost);

        // 골 판정
        if (ball.y < goalY + 20 && ball.x > goalX && ball.x < goalX + goalWidth) {
            score++;
            scoreDisplay.innerText = score;
            shuffleDefenders(); // ★ 골 넣으면 수비수 위치 셔플!
            resetBall();
        }

        if (Math.abs(ball.dx) < 0.2 && Math.abs(ball.dy) < 0.2) resetBall();
    }
}

function resetBall() {
    ball.x = 300; ball.y = 700;
    ball.dx = 0; ball.dy = 0;
    ball.isMoving = false;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#27ae60";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    // 잔디 라인 (간단하게)
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 500, 700);

    // 골대 안쪽
    ctx.fillStyle = "#1e8449";
    ctx.fillRect(goalX, goalY, goalWidth, 40);

    // 기둥
    ctx.fillStyle = "white";
    ctx.fillRect(leftPost.x, leftPost.y, leftPost.w, leftPost.h);
    ctx.fillRect(rightPost.x, rightPost.y, rightPost.w, rightPost.h);

    // 수비수
    ctx.fillStyle = "#e74c3c";
    defenders.forEach(d => {
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.strokeStyle = "#c0392b";
        ctx.strokeRect(d.x, d.y, d.w, d.h);
    });

    // 공
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();

    update();
    requestAnimationFrame(draw);
}

draw();