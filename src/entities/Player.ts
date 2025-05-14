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
  
  // 二段跳相关变量
  private jumpCount: number = 0;
  private maxJumps: number = 2;
  private jumpKeyReleased: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    // 添加sprite到场景
    scene.add.existing(this);
    
    // 启用物理
    scene.physics.add.existing(this);
    
    // 设置物理属性 - 为动态body (不是StaticBody)
    this.setBounce(0);
    this.setCollideWorldBounds(true);
    this.setSize(30, 30); // 稍微小一点的碰撞箱
    
    console.log('Player创建完成，位置:', x, y);
    
    // 获取键盘控制
    if (!scene.input.keyboard) {
      throw new Error('Keyboard input is not available');
    }
    
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasdKeys = scene.input.keyboard.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    }) as any;
    this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  }

  update() {
    if (!this.body) {
      console.log('Player没有物理body，跳过更新');
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // 检查玩家是否站在地面上
    const isOnGround = body.touching.down || body.blocked.down;
    
    // 左右移动 (同时支持方向键和AD键)
    const isLeftPressed = this.cursors.left.isDown || this.wasdKeys.A.isDown;
    const isRightPressed = this.cursors.right.isDown || this.wasdKeys.D.isDown;

    // 获取当前水平速度
    const currentVelocityX = body.velocity.x;

    if (isLeftPressed) {
      // 向左加速
      this.setAccelerationX(-this.acceleration);
    } else if (isRightPressed) {
      // 向右加速
      this.setAccelerationX(this.acceleration);
    } else {
      // 没有按键时减速
      this.setAccelerationX(0);
      if (currentVelocityX > 0) {
        this.setVelocityX(Math.max(0, currentVelocityX - this.deceleration * (1/60)));
      } else if (currentVelocityX < 0) {
        this.setVelocityX(Math.min(0, currentVelocityX + this.deceleration * (1/60)));
      }
    }

    // 限制最大速度
    if (Math.abs(currentVelocityX) > this.maxSpeed) {
      this.setVelocityX(Math.sign(currentVelocityX) * this.maxSpeed);
    }

    // 跳跃 (支持上方向键和K键)
    const isJumpPressed = this.cursors.up.isDown || this.jumpKey.isDown;
    
    // 当玩家落地时重置跳跃次数
    if (isOnGround) {
      this.jumpCount = 0;
    }
    
    // 处理按键抬起状态，确保按一次键只跳一次
    if (!isJumpPressed) {
      this.jumpKeyReleased = true;
    }
    
    // 处理跳跃
    if (isJumpPressed && this.jumpKeyReleased) {
      this.jumpKeyReleased = false;
      
      if (isOnGround) {
        // 第一段跳跃 (在地面上)
        this.setVelocityY(this.jumpVelocity);
        this.jumpCount = 1;
        console.log('玩家跳跃 - 第一段');
      } else if (this.jumpCount < this.maxJumps) {
        // 第二段跳跃 (在空中)
        this.setVelocityY(this.jumpVelocity);
        this.jumpCount++;
        console.log('玩家跳跃 - 第二段');
      }
    }
  }
} 