export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: {
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private jumpKey: Phaser.Input.Keyboard.Key;
  private jumpVelocity: number = -600;
  private maxSpeed: number = 300;
  private acceleration: number = 2000;
  private deceleration: number = 3000;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    // 启用物理
    scene.physics.add.existing(this);
    
    // 设置物理属性
    this.setBounce(0);
    this.setCollideWorldBounds(true);
    
    // 获取键盘控制
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasdKeys = scene.input.keyboard.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    }) as any;
    this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  }

  update() {
    // 左右移动 (同时支持方向键和AD键)
    const isLeftPressed = this.cursors.left.isDown || this.wasdKeys.A.isDown;
    const isRightPressed = this.cursors.right.isDown || this.wasdKeys.D.isDown;

    // 获取当前水平速度
    const currentVelocityX = this.body.velocity.x;

    if (isLeftPressed) {
      // 向左加速
      this.setAccelerationX(-this.acceleration);
    } else if (isRightPressed) {
      // 向右加速
      this.setAccelerationX(this.acceleration);
    } else {
      // 没有按键时减速
      if (currentVelocityX > 0) {
        this.setAccelerationX(-this.deceleration);
      } else if (currentVelocityX < 0) {
        this.setAccelerationX(this.deceleration);
      } else {
        this.setAccelerationX(0);
      }
    }

    // 限制最大速度
    if (Math.abs(currentVelocityX) > this.maxSpeed) {
      this.setVelocityX(Math.sign(currentVelocityX) * this.maxSpeed);
    }

    // 跳跃 (支持上方向键和K键)
    const isJumpPressed = this.cursors.up.isDown || this.jumpKey.isDown;
    if (isJumpPressed && this.body.touching.down) {
      this.setVelocityY(this.jumpVelocity);
    }
  }
} 