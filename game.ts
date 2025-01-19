import Phaser from 'phaser';
import { EscapeRoomScene } from './escapeRoomScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#ffffff', // White background
  scene: [EscapeRoomScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Specify both x and y components
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT, // Ensures the game scales to fit the screen
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game canvas
  },
};

export class Game extends Phaser.Game {
  constructor() {
    super(config);

    // Handle window resize events
    window.addEventListener('resize', this.resize, false);
  }

  // Resize method to adjust game dimensions dynamically
  private resize = () => {
    const { width, height } = this.scale.gameSize;
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // Update game scale manager
    this.scale.resize(newWidth, newHeight);

    // Resize scenes if necessary
    this.scene.scenes.forEach((scene) => {
      scene.cameras.main.setViewport(0, 0, newWidth, newHeight);
    });
  };
}

new Game();
