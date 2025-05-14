import { Player } from '../entities/Player';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private fpsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // 创建临时图形
    this.createTemporaryGraphics();
  }

  create() {
    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 创建地面
    const ground = this.platforms.create(400, 568, 'platform');
    ground.setScale(2).refreshBody();

    // 创建其他平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 250, 'platform');
    this.platforms.create(750, 220, 'platform');

    // 创建玩家
    this.player = new Player(this, 100, 450);
    this.add.existing(this.player);

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建FPS显示
    this.fpsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.fpsText.setScrollFactor(0); // 固定在屏幕上
  }

  update() {
    this.player.update();
    
    // 更新FPS显示
    this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
  }

  private createTemporaryGraphics() {
    // 创建临时玩家图形
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0xff0000, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);

    // 创建临时平台图形
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0x00ff00, 1);
    platformGraphics.fillRect(0, 0, 400, 32);
    platformGraphics.generateTexture('platform', 400, 32);
  }
} 