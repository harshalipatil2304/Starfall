import Phaser from "phaser";

class StarfallScene extends Phaser.Scene{
    constructor(){
        super("StarfallScene");
    }

    create(){
        this.touchLeft = false;
        this.touchRight = false;
        this.gameStarted = false;
        this.isPaused = false;
        this.gameOver = false;
        this.cameras.main.setBackgroundColor("#17152f");

        this.spaceDust = [];
        for(let i=0; i<60; i++)
        {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 500);
            const size = Phaser.Math.FloatBetween(1, 2.5);

            const dust = this.add.circle(x, y, size, 0xffffff, 0.6);

            this.spaceDust.push({
                object: dust, speed: Phaser.Math.FloatBetween(0.3, 1)
            })
        }

        this.add.text(400,100, "STARFALL",{
                fontSize:"48px",color:"#ffffff", fontStyle:"bold"
            }).setOrigin(0.5);

        this.add.text(400,160, "Catch the Stars ✦",{
                fontSize:"20px",color:"#c4b5fd"
            }).setOrigin(0.5);

        this.player = this.add.circle(400, 300, 35, 0xffd166);
        this.player.setStrokeStyle(3, 0xffffff, 0.8);

        this.playerGlow = this.add.circle(400, 300, 38, 0xffd93d, 0.4);
        this.playerGlow.setDepth(1);
        this.player.setDepth(2);

        this.tweens.add({targets:this.playerGlow, alpha:{ from:0.2, to:0.5}, scale: {from:0.9, to:1.1},
            duration: 800, yoyo: true, repeat:-1
        });
        

        this.leftEye = this.add.circle(0, 0, 4, 0x000000);
        this.rightEye = this.add.circle(0, 0, 4, 0x000000);
        this.leftEye.setDepth(3);
        this.rightEye.setDepth(3);

        this.add.text(400,390, "Use <- and -> arrow keys to move!",{
                fontSize:"18px", color:"#ffffff"
            }).setOrigin(0.5);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.pauseButton = this.add.text(400, 20, "PAUSE",{
            fontSize:"18px", color:"#ffffff", backgroundColor:"#6d5dfc", padding:{x:12, y:8}
        }).setOrigin(0.5).setInteractive({ useHandCursor:true });

        this.pauseButton.on("pointerdown", ()=>{
            if(!this.gameStarted || this.gameOver) return;
            this.isPaused = !this.isPaused;
            this.pauseButton.setText(this.isPaused ? "RESUME" : "PAUSE");
        })

        

        this.fallingStar = this.add.circle(Phaser.Math.Between(50, 750), 0,12, 0xffffff);
        this.starGlow = this.add.circle(this.fallingStar.x, this.fallingStar.y, 15, 0x9b8cff, 0.35);
        this.starGlow.setDepth(this.fallingStar.depth-1);

        this.starSpeed = 2;

        this.bomb = this.add.circle(Phaser.Math.Between(50,750), -100, 14, 0xff4d6d);
        this.bomb.setDepth(2);
        this.bombGlow = this.add.circle(this.bomb.x, this.bomb.y, 20, 0xff4d6d, 0.2);
        this.bombGlow.setDepth(1);

        this.bombSpeed = 3;
        this.lives = 3;

        this.livesText = this.add.text(650, 20, "Lives: 3",{
           fontSize: "22px", color:"#ffffff" 
        });

        this.score = 0;
        this.highScore = Number(localStorage.getItem("starfallHighScore")) || 0;

        this.scoreText = this.add.text(20,20, "Score: 0", {
          fontSize: "22px",
          color: "#ffffff"  
        })

        this.highScoreText = this.add.text(20, 50, "High Score: "+ this.highScore,{
            fontSize: "18pxx", color:"#ffd700"
        })

        this.startOverlay = this.add.rectangle(
            400, 250, 800, 500, 0x0b0a1a, 0.88
        ).setDepth(20);

        this.startTitle = this.add.text(400, 190, "READY FOR STARFALL?",{
            fontSize:"32px", color:"#ffffff", fontStyle:"bold"
        }).setOrigin(0.5).setDepth(21);

        this.startButton = this.add.text(400, 280, "START GAME",{
            fontSize:"24px", color:"#ffffff", backgroundColor:"#6d5dfc",padding:{x:24, y:14}
        }).setOrigin(0.5).setDepth(21).setInteractive({useHandCursor:true});

        this.startButton.on("pointerdown", ()=>{
            this.gameStarted = true;
            this.startOverlay.destroy();
            this.startTitle.destroy();
            this.startButton.destroy();
        });

        this.leftButton = this.add.text(340, 440, "◀" ,{
            fontSize:"32px", color:"#ffffff", backgroundColor:"#6d5dfc", padding:{x:18, y:12}
        }).setOrigin(0.5).setAlpha(0.85).setInteractive(new Phaser.Geom.Rectangle(-30,-25,100,90), Phaser.Geom.Rectangle.Contains);
        this.rightButton = this.add.text(460, 440, "▶" ,{
            fontSize:"32px", color:"#ffffff", backgroundColor:"#6d5dfc", padding:{x:18, y:12}
        }).setOrigin(0.5).setAlpha(0.85).setInteractive(new Phaser.Geom.Rectangle(-30,-25,100,90), Phaser.Geom.Rectangle.Contains);

        this.input.addPointer(1);
        
        this.leftButton.on("pointerdown", () => { this.touchLeft = true; });
        this.leftButton.on("pointerup", () => {  this.touchLeft = false; });
        this.leftButton.on("pointerupoutside", () => {  this.touchLeft = false; });

        this.rightButton.on("pointerdown", () => { this.touchRight = true;});
        this.rightButton.on("pointerup", () => { this.touchRight = false; });
        this.rightButton.on("pointerupoutside", () => {  this.touchRight = false; });

    }

    update(){
        if(this.gameOver) return;
        if(!this.gameStarted) return;
        if(this.isPaused) return;

        this.spaceDust.forEach((dust)=>{
            dust.object.y += dust.speed;

            if(dust.object.y > 500){
                dust.object.y = 0;
                dust.object.x = Phaser.Math.Between(0, 800);
            }
        })


        const moveLeft = this.cursors.left.isDown || this.touchLeft;
        const moveRight = this.cursors.right.isDown || this.touchRight;
        if(moveLeft && !moveRight){
            this.player.x -= 4;
        }else if(moveRight && !moveLeft)
        {
            this.player.x += 4;
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, 35, 765);
        this.leftEye.x = this.player.x - 15;
        this.leftEye.y = this.player.y - 10;
        this.rightEye.x = this.player.x + 15;
        this.rightEye.y = this.player.y - 10;
        this.playerGlow.x = this.player.x;
        this.playerGlow.y = this.player.y;

        this.fallingStar.y += this.starSpeed;
        this.starGlow.x = this.fallingStar.x;
        this.starGlow.y = this.fallingStar.y;

        if(this.score > 0 && this.score % 5 === 0)
        {
            this.starSpeed = Math.min(2+Math.floor(this.score/5)*0.5, 6)
        }

        if(this.fallingStar.y > 500){
            this.fallingStar.y = 0;
            this.fallingStar.x = Phaser.Math.Between(50, 750);
        }

        this.bomb.y += this.bombSpeed;
        this.bombGlow.x = this.bomb.x;
        this.bombGlow.y = this.bomb.y;

        if(this.score>0 && this.score % 5 == 0)
        {
            this.bombSpeed = Math.min(3 + Math.floor(this.score/5)*0.5, 7)
        }

        if(this.bomb.y > 520){
            this.bomb.y = 0;
            this.bomb.x = Phaser.Math.Between(50, 750);
        }

        const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.fallingStar.x,
            this.fallingStar.y
        );

        if(distance < 45){
            this.score +=1;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
            oscillator.onended = ()=> {audioContext.close()};

            if(this.score > this.highScore){
                this.highScore = this.score;
                localStorage.setItem("starfallHighScore", this.highScore);
                this.highScoreText.setText("High Score: "+this.highScore);
            }

            this.scoreText.setText("Score: "+this.score);

            this.fallingStar.y = 0;
            this.fallingStar.x = Phaser.Math.Between(50, 750);
        }

        const bombDistance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.bomb.x,
            this.bomb.y
        );

        
        if (bombDistance < 49) {
        this.lives -= 1;
        this.isPaused = true;

        this.time.delayedCall(700, ()=>{
            if(!this.gameOver && this.gameStarted){
                this.isPaused = false;
            }
        });
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        const now = audioContext.currentTime;

        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(180, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.25);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.25);

        oscillator.onended = () => audioContext.close();

        this.livesText.setText("Lives: " + this.lives);

        this.bomb.y = 0;
        this.bomb.x = Phaser.Math.Between(50, 750);

            if (this.lives <= 0) {
                this.lives = 0;
                this.livesText.setText("Lives: 0");

                this.gameOver = true;

                this.add.text(400, 250, "GAME OVER", {
                fontSize: "48px", color: "#ff4d6d", fontStyle: "bold",
                }).setOrigin(0.5);

                this.add.text(400, 285, "Final Score: "+ this.score,{
                   fontSize: "24px", color:"#ffffff" 
                }).setOrigin(0.5);

                
                const restartButton = this.add.text(400, 320, "PLAY AGAIN",{
                    fontSize : "24px", color: "#ffffff", backgroundColor: "#6d5dfc", padding: {x:20, y:12} 
                }).setOrigin(0.5).setInteractive({ useHandCursor: true});

                restartButton.on("pointerdown", ()=>{
                    this.scene.restart("StarfallScene");
                });

                return;

            }
        }

    }
}

const gameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 500,
        parent: "starfall-game",
        scale:{
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: StarfallScene
    };

export default gameConfig;