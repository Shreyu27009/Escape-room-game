import Phaser from 'phaser';
export class EscapeRoomScene extends Phaser.Scene {
    constructor() {
        super('EscapeRoomScene');
        this.isKeyPicked = false;
    }
    preload() {
        // Load textures
        this.load.image('doorTexture', 'assets/doors.png'); // Placeholder image for door
        this.load.image('keyTexture', 'assets/key.png'); // Placeholder image for key
        this.load.image('resetButton', 'assets/reset.png'); // Placeholder image for reset button
    }
    create() {
        // Add door
        this.door = this.add.image(400, 300, 'doorTexture').setInteractive();
        this.door.setScale(0.5);
        // Add key
        this.key = this.add.image(200, 400, 'keyTexture').setInteractive();
        this.key.setScale(0.2);
        // Add instructions
        this.add.text(10, 10, 'Click the key to pick it up. Then click the door to escape.', {
            fontSize: '18px',
            color: '#ffffff',
        });
        // Timer
        this.timer = this.time.addEvent({
            delay: 60000, // 60 seconds
            callback: this.onTimeUp,
            callbackScope: this,
        });
        this.timerText = this.add.text(10, 40, '', {
            fontSize: '18px',
            color: '#ffffff',
        });
        // Message display
        this.messageText = this.add.text(200, 250, '', {
            fontSize: '24px',
            color: '#ffffff',
        });
        // Event listeners
        this.key.on('pointerdown', this.onKeyClick, this);
        this.door.on('pointerdown', this.onDoorClick, this);
        // Reset button
        const resetButton = this.add.image(750, 550, 'resetButton').setInteractive();
        resetButton.setScale(0.1);
        resetButton.on('pointerdown', this.resetGame, this);
    }
    update() {
        // Update the timer
        const timeLeft = Math.ceil(this.timer.getRemainingSeconds());
        this.timerText.setText(`Time Left: ${timeLeft}s`);
    }
    onKeyClick() {
        if (!this.isKeyPicked) {
            this.isKeyPicked = true;
            this.key.setTint(0x00ff00); // Indicate the key has been picked up
            this.key.setVisible(false); // Hide the key
            this.showMessage('You picked up the key!', '#00ff00');
        }
    }
    onDoorClick() {
        if (this.isKeyPicked) {
            this.door.setTint(0x00ff00); // Indicate the door is open
            this.tweens.add({
                targets: this.door,
                angle: 90,
                duration: 1000,
            });
            this.showMessage('You Escaped!', '#00ff00');
            this.scene.pause();
        }
        else {
            this.showMessage('You need the key to open the door!', '#ff0000');
        }
    }
    onTimeUp() {
        this.showMessage("Time's up! You failed to escape.", '#ff0000');
        this.scene.pause();
    }
    resetGame() {
        this.scene.restart(); // Restart the scene
    }
    showMessage(message, color) {
        this.messageText.setText(message).setColor(color);
        this.time.delayedCall(3000, () => {
            this.messageText.setText(''); // Clear the message after 3 seconds
        });
    }
}
