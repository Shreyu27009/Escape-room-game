import Phaser from 'phaser';
import { EscapeRoomScene } from './escapeRoomScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [EscapeRoomScene],
};

new Phaser.Game(config);
