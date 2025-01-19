import Phaser from 'phaser';
import { EscapeRoomScene } from './escapeRoomScene';
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    scene: [EscapeRoomScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // Specify both x and y components
            debug: false
        }
    }
};
export class Game extends Phaser.Game {
    constructor() {
        super(config);
    }
}
new Game();
