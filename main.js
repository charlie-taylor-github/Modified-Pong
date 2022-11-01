class Ball {
    constructor(game) {
        this.game = game;
        this.width = 15;
        this.height = 15;
        this.y = (this.game.height - this.height) / 2;
        this.x = (this.game.width - this.width) / 2;
        this.xVel = 3;
        this.yVel = 3;
        this.defxVel = 3;
        this.defyVel = 3;
        this.validRound = true;
        this.reset();
    }

    update() {
        this.x += this.xVel;
        this.y -= this.yVel;

        if (this.y <= 0) {
            this.yVel *= -1;
        }
        if (this.y >= this.game.height - this.height) {
            this.yVel *= -1;
        }

        let ballPastPlayer = null;

        if (this.x <= (this.game.player1.x + this.game.player1.width)) {
            ballPastPlayer = this.game.player1;

        }
        if (this.x >= (this.game.player2.x - this.game.player2.width)) {
            ballPastPlayer = this.game.player2;
        }

        if (ballPastPlayer) {
            if (this.y > ballPastPlayer.y - 40 && this.y < ballPastPlayer.y + ballPastPlayer.height + 40 && this.validRound) {
                this.xVel *= -1;
            }
            else {
                this.validRound = false;
            }
        }

        if (this.x < -this.width) {
            this.game.score[1]++;
            this.reset();
        }

        if (this.x > this.game.width) {
            this.game.score[0]++;
            this.reset();
        }
    }

    draw(context) {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    reset() {
        this.validRound = true;
        this.y = (this.game.height - this.height) / 2;
        this.x = (this.game.width - this.width) / 2;
        this.xVel = this.defxVel;
        this.yVel = this.defyVel;

        let direction = [];

        if (this.game.ballSpawnTrueRandom) {
            direction = [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2)];
        }
        else {
            const directionIndex = Math.floor(Math.random() * this.game.startingDirections.length)
            direction = this.game.startingDirections[directionIndex];
            this.game.startingDirections.splice(directionIndex, 1);
        }
        
        if (direction[0] == 1) {
            this.xVel *= -1;
        }
        if (direction[1] == 1) {
            this.yVel *= -1;
        }
        
    }
}

class InputHandler {
    constructor() {
        this.keys = [];

        window.addEventListener('keydown', e => {        
            if (this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
        });

        window.addEventListener('keyup', e => {
            this.keys.splice(this.keys.indexOf(e.key), 1);
        });
    }
}

class Player {

    constructor(game, playerNo) {
        this.game = game;
        this.width = 15;
        this.height = 80;
        this.y = (this.game.height - this.height) / 2;
        this.x = {1: 30, 2: (game.width - 30 - this.width)}[playerNo];
        this.playerNo = playerNo;
        this.speed = 10;
    }

    update() {
        const keys = this.game.input.keys;

        if (this.playerNo == 1) {
            if (keys.includes('w')) {
                this.y -= this.speed;
            }
            if (keys.includes('s')) {
                this.y += this.speed;
            }
        }
        if (this.playerNo == 2) {
            if (keys.includes('ArrowUp')) {
                this.y -= this.speed;
            }
            if (keys.includes('ArrowDown')) {
                this.y += this.speed;
            }
        }

        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y > this.game.height - this.height) {
            this.y = this.game.height - this.height;
        }
    }

    draw(context) {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor(width, height, noBalls) {
        this.startingDirections = [[1, 1], [1, 2], [2, 1], [2, 2]];
        this.ballSpawnTrueRandom = false;
        this.width = width;
        this.height = height;
        this.player1 = new Player(this, 1);
        this.player2 = new Player(this, 2);
        this.balls = [];
        for (let i = 0; i < noBalls; i++) {
            this.balls.push(new Ball(this));
        }
        this.input = new InputHandler();
        this.score = [0, 0];
        this.active = true;
        this.holdingPause = false;
        this.reset();
    }

    update() {
        if (this.input.keys.includes(' ')) {
            if (!this.holdingPause) {
                this.active = !this.active;
                this.holdingPause = true;
            }
        }
        else {
            this.holdingPause = false;
        }

        if (this.active) {
            this.player1.update();
            this.player2.update();
            for (const ball of this.balls) {
                ball.update();
            }
        }
    }

    draw(context) {
        this.player1.draw(context);
        this.player2.draw(context);
        for (const ball of this.balls) {
            ball.draw(context);
        }

        context.fillText(this.score[0], 100, 100);
        context.fillText(this.score[1], 500, 100);
    }

    reset() {
        this.startingDirections = [[1, 1], [1, 2], [2, 1], [2, 2]];
        this.ballSpawnTrueRandom = false;
        for (const ball of this.balls) {
            ball.reset();
        }
        
        this.ballSpawnTrueRandom = true;
        
    }
}

window.addEventListener('load', function(){
    let ballSpeedRange = document.getElementById('ball-speed-range');
    let playerSpeedRange = document.getElementById('player-speed-range');
    let resetBtn = document.getElementById('reset-btn');
    let ballsRange = document.getElementById('ball-no-range');

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 650;
    canvas.height = 500;
    ctx.font = "80px Arial";
    let game = new Game(canvas.width, canvas.height, ballsRange.value);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.draw(ctx);
        game.update();
        requestAnimationFrame(animate)
    }
    animate();

    playerSpeedRange.addEventListener('change', () => {
        const maxPlayerSpeed = 50;
        const minPlayerSpeed = 0;
        const newSpeed = (playerSpeedRange.value / 200) * (maxPlayerSpeed + minPlayerSpeed);
        game.player1.speed = newSpeed;
        game.player2.speed = newSpeed;
    });

    ballSpeedRange.addEventListener('change', () => {
        const newSpeed = ((8 / 150) * ballSpeedRange.value) + 1/3;
        for (const ball of game.balls) {
            ball.defxVel = newSpeed;
        }
        
    });

    resetBtn.addEventListener('click', () => {
        game = new Game(canvas.width, canvas.height, ballsRange.value);
        const newSpeed = ((8 / 150) * ballSpeedRange.value) + 1/3;
        for (const ball of game.balls) {
            ball.defxVel = newSpeed;
        }
    });
});
