import Phaser from 'phaser';

export class EscapeRoomScene extends Phaser.Scene {
  private door!: Phaser.GameObjects.Image;
  private key!: Phaser.GameObjects.Image;
  private resetButton!: Phaser.GameObjects.Image;
  private timer!: Phaser.Time.TimerEvent;
  private timerText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Rectangle;
  private progressBarBackground!: Phaser.GameObjects.Rectangle;
  private hintButton!: Phaser.GameObjects.Image;
  private isKeyPicked: boolean = false;
  private level: number = 1;
  private score: number = 0;
  private timePerLevel: number = 60;
  private difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  private hintUsed: boolean = false;
  private playerName: string = ''; // Store player's name
  private totalPlayTime: number = 0; // Track total playtime in seconds
  private gameStartTime: number = 0; // Track the start time of the game
  private currentPuzzle: string = '';
  private correctAnswer: string = '';
  private inputField!: Phaser.GameObjects.DOMElement;
  private submitButton!: Phaser.GameObjects.Text;

  constructor() {
    super('EscapeRoomScene');
  }

  preload() {
    this.load.image('doorTexture', 'assets/doors.png');
    this.load.image('keyTexture', 'assets/key.png');
    this.load.image('resetButtonTexture', 'assets/reset.png');
    this.load.image('hintButtonTexture', 'assets/hint.png');
    this.load.image('background', 'assets/background.jpg');
  }

  create() {
    const bg = this.add.image(0, 0, 'background').setOrigin(0);
    this.scaleObjectToScreen(bg);

    // Only ask for player's name if not already set
    if (!this.playerName) {
      this.playerName = prompt('Enter your name to start the game:') || 'Player';
    }

    // Door and key setup
    this.door = this.add.image(this.scale.width / 2, this.scale.height / 2, 'doorTexture').setInteractive();
    this.door.setScale(0.2);
    this.key = this.add.image(this.scale.width / 4, this.scale.height * 0.75, 'keyTexture').setInteractive();
    this.key.setScale(0.1);

    // Text displays
    const panelStyle = {
      fontSize: '18px',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 },
      color: '#ffffff',
    };
    this.levelText = this.add.text(10, 10, `Level: ${this.level}`, panelStyle);
    this.scoreText = this.add.text(10, 40, `Score: ${this.score}`, panelStyle);
    this.timerText = this.add.text(10, 70, '', panelStyle);

    this.messageText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 10, y: 10 },
      align: 'center',
    }).setOrigin(0.5).setVisible(false);

    // Timer progress bar
    this.progressBarBackground = this.add.rectangle(this.scale.width / 2, 40, 300, 20, 0x888888);
    this.progressBar = this.add.rectangle(this.scale.width / 2, 40, 300, 20, 0x00ff00);

    this.timer = this.time.addEvent({
      delay: this.timePerLevel * 1000,
      callback: this.onTimeUp,
      callbackScope: this,
    });

    // Interactive objects
    this.key.on('pointerdown', this.onKeyClick, this);
    this.door.on('pointerdown', this.onDoorClick, this);

    // Reset button
    this.resetButton = this.add.image(this.scale.width - 50, this.scale.height - 50, 'resetButtonTexture').setInteractive();
    this.resetButton.setScale(0.2);
    this.resetButton.on('pointerdown', this.resetGame, this);

    // Hint button
    this.hintButton = this.add.image(50, this.scale.height - 50, 'hintButtonTexture').setInteractive();
    this.hintButton.setScale(0.2);
    this.hintButton.on('pointerdown', this.showHint, this);

    // Add hover effects
    this.addHoverEffect(this.door);
    this.addHoverEffect(this.key);
    this.addHoverEffect(this.resetButton);
    this.addHoverEffect(this.hintButton);

    // Handle word puzzle
    this.generateWordPuzzle();

    // Track the game start time
    this.gameStartTime = this.time.now;

    // Check if the total playtime for the day exceeds the limit (1 hour = 3600 seconds)
    const playTimeToday = localStorage.getItem('totalPlayTime');
    if (playTimeToday && parseInt(playTimeToday) >= 3600) {
      alert('You have reached your daily playtime limit of 1 hour.');
      this.scene.stop(); // Stop the game if limit reached
    }
  }

  update() {
    // Rotate objects
    this.door.rotation += 0.005;
    this.key.rotation += 0.01;

    // Calculate total playtime in seconds
    this.totalPlayTime = Math.ceil((this.time.now - this.gameStartTime) / 1000);

    // Update timer
    const timeLeft = Math.ceil(this.timer.getRemainingSeconds());
    this.timerText.setText(`Time Left: ${timeLeft}s`);
    this.progressBar.width = (timeLeft / this.timePerLevel) * 300;
    if (timeLeft < this.timePerLevel / 3) {
      this.progressBar.setFillStyle(0xff0000);
    }

    // Save playtime to localStorage (limit of 1 hour per day)
    localStorage.setItem('totalPlayTime', this.totalPlayTime.toString());
  }

  private onKeyClick() {
    if (!this.isKeyPicked) {
      this.isKeyPicked = true;
      this.key.setTint(0x00ff00);
      this.key.setVisible(false);
      this.showMessage('You picked up the key!', '#00ff00');
    }
  }

  private onDoorClick() {
    if (this.isKeyPicked) {
      this.door.setTint(0x00ff00);
      this.tweens.add({
        targets: this.door,
        angle: 90,
        duration: 1000,
      });
      this.advanceLevel();
    } else {
      this.showMessage('You need the key to open the door!', '#ff0000');
    }
  }

  private advanceLevel() {
    if (this.level < 10) {
      this.score += 100;
      if (this.hintUsed) this.score -= 50; // Penalty for using hints
      this.level++;
      this.timePerLevel = Math.max(10, this.timePerLevel - 10);

      // Tween to fade out elements before restarting the level
      this.tweens.add({
        targets: [this.door, this.key, this.resetButton, this.hintButton],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.scene.restart({
            level: this.level,
            score: this.score,
            timePerLevel: this.timePerLevel,
          });
        },
      });
    } else {
      const message = `Congratulations! You have completed the task! Final Score: ${this.score}`;
      this.updateLeaderboard(this.score);
      window.alert(message);
      this.scene.pause();
    }
  }

  private onTimeUp() {
    this.showMessage("Time's up! You failed to escape.", '#ff0000');
    this.scene.pause();
  }

  private resetGame() {
    this.level = 1;
    this.score = 0;
    this.timePerLevel = 60;
    this.scene.restart();
  }

  private showHint() {
    if (!this.hintUsed) {
      this.hintUsed = true;
      this.showMessage('Hint: The key opens the door!', '#0000ff');
    } else {
      this.showMessage('Hint already used!', '#ff0000');
    }
  }

  private showMessage(message: string, color: string) {
    this.messageText.setText(message).setColor(color).setVisible(true);
    this.time.delayedCall(3000, () => {
      this.messageText.setVisible(false);
    });
  }

  private generateWordPuzzle() {
    let word: string;

    // Select the word based on the current level
    switch (this.level) {
        case 1:
            word = 'apple';
            break;
        case 2:
            word = 'banana';
            break;
        case 3:
            word = 'grape';
            break;
        case 4:
            word = 'watermelon';
            break;
        default:
            word = 'complex';
            break;
    }

    this.correctAnswer = word;
    this.currentPuzzle = this.scrambleWord(word);
    this.showMessage(`Unscramble the word: ${this.currentPuzzle}`, '#ffff00');

    // Destroy existing input field and button if they exist
    if (this.inputField) {
        this.inputField.destroy();
    }
    if (this.submitButton) {
        this.submitButton.destroy();
    }

    // Create the input field for the word puzzle using Phaser DOMElement
    this.inputField = this.add.dom(this.scale.width / 2, this.scale.height / 1.5).createFromHTML(`
        <input type="text" id="wordInput" placeholder="Type the unscrambled word" 
               style="width: 300px; padding: 10px; font-size: 18px; border-radius: 5px; background-color: white; border: 2px solid #ccc;" />
    `) as Phaser.GameObjects.DOMElement;

    // Ensure the input field is visible
    this.inputField.setVisible(true);

    // Adjust the DOM input element size if necessary
    const inputElement = this.inputField.node as HTMLInputElement;
    inputElement.style.fontSize = '20px';
    inputElement.style.padding = '10px';

    // Create the submit button
    this.submitButton = this.add.text(this.scale.width / 2, this.scale.height / 1.3, 'Submit', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 5 },
        align: 'center',
    }).setOrigin(0.5).setInteractive();

    // Submit button event
    this.submitButton.on('pointerdown', this.checkWordPuzzleAnswer, this);
}

private checkWordPuzzleAnswer() {
    // Ensure the input element is defined
    const inputElement = this.inputField.node as HTMLInputElement;

    // Check if inputElement is valid and its value is not empty
    if (inputElement && inputElement.value !== undefined && inputElement.value.trim() !== '') {
        if (inputElement.value.trim().toLowerCase() === this.correctAnswer.toLowerCase()) {
            this.showMessage('Correct! Moving to the next level.', '#00ff00');
            this.advanceLevel();
        } else {
            this.showMessage('Incorrect! Try again.', '#ff0000');
        }
    } else {
        this.showMessage('Please enter a word before submitting!', '#ff0000');
    }
}

private scrambleWord(word: string): string {
    const array = word.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}
  private addHoverEffect(object: Phaser.GameObjects.Image) {
    object.on('pointerover', () => object.setScale(object.scale + 0.05));
    object.on('pointerout', () => object.setScale(object.scale - 0.05));
  }

  private scaleObjectToScreen(object: Phaser.GameObjects.Image) {
    const scaleX = this.scale.width / object.width;
    const scaleY = this.scale.height / object.height;
    const scale = Math.max(scaleX, scaleY);
    object.setScale(scale).setOrigin(0);
  }

  private updateLeaderboard(finalScore: number) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    leaderboard.push({ name: this.playerName, score: finalScore });
    leaderboard.sort((a: any, b: any) => b.score - a.score); // Sort by score in descending order
    leaderboard = leaderboard.slice(0, 5); // Keep top 5 scores
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    console.log('Leaderboard:', leaderboard);
    // Display leaderboard in a popup or on the UI
    window.alert(`Top Scores: \n${leaderboard.map((entry: any) => `${entry.name}: ${entry.score}`).join('\n')}`);
  }
}
