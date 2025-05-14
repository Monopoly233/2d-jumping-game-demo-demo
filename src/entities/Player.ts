import { Bullet } from './Bullet';
import { LevelScene } from '../scenes/LevelScene';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: {
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private jumpKey: Phaser.Input.Keyboard.Key;
  private shootKey: Phaser.Input.Keyboard.Key;
  private baseJumpVelocity: number = -500; // 保持基础跳跃速度不变
  private maxJumpVelocity: number = -900; // 增加最大跳跃速度
  private jumpBoostForce: number = -2000; // 增加加速力度
  private isJumpBoosting: boolean = false;
  private maxJumpBoostTime: number = 250; // 增加加速时间
  private jumpBoostTimer: number = 0;
  private maxSpeed: number = 300;
  private acceleration: number = 3000;
  private deceleration: number = 6000;
  private shootCooldown: number = 300; // 射击冷却时间（毫秒）
  private lastShootTime: number = 0;
  private direction: number = 1; // 1表示右边，-1表示左边
  
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
    this.setSize(30, 30); // 设置碰撞箱为30x60（两个格子高）
    this.setDisplaySize(30, 60); // 设置显示大小为30x60
    
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
    this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
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
      this.direction = -1;
    } else if (isRightPressed) {
      // 向右加速
      this.setAccelerationX(this.acceleration);
      this.direction = 1;
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
    
    // 当玩家落地时重置跳跃状态
    if (isOnGround) {
      this.jumpCount = 0;
      this.isJumpBoosting = false;
      this.jumpBoostTimer = 0;
    }
    
    // 处理按键抬起状态
    if (!isJumpPressed) {
      this.jumpKeyReleased = true;
      this.isJumpBoosting = false; // 松开按键时停止提升
    }
    
    // 处理跳跃
    if (isJumpPressed && this.jumpKeyReleased) {
      this.jumpKeyReleased = false;
      
      if (isOnGround) {
        // 第一段跳跃 (在地面上)
        this.setVelocityY(this.baseJumpVelocity);
        this.jumpCount = 1;
        this.isJumpBoosting = true;
        this.jumpBoostTimer = 0;
        console.log('玩家跳跃 - 第一段');
      } else if (this.jumpCount < this.maxJumps) {
        // 第二段跳跃 (在空中)
        this.setVelocityY(this.baseJumpVelocity);
        this.jumpCount++;
        this.isJumpBoosting = true;
        this.jumpBoostTimer = 0;
        console.log('玩家跳跃 - 第二段');
      }
    }
    
    // 处理长按跳跃提升
    if (this.isJumpBoosting && isJumpPressed) {
      this.jumpBoostTimer += (1000/60); // 假设60FPS
      if (this.jumpBoostTimer <= this.maxJumpBoostTime) {
        const currentVelocityY = body.velocity.y;
        // 只有当当前速度大于最大跳跃速度时才继续提升
        if (currentVelocityY > this.maxJumpVelocity) {
          this.setVelocityY(currentVelocityY + this.jumpBoostForce * (1/60));
        }
      } else {
        this.isJumpBoosting = false;
      }
    }

    // 处理射击
    if (this.shootKey.isDown) {
      this.shoot();
    }
  }

  private shoot(): void {
    const currentTime = this.scene.time.now;
    
    // 检查是否超过冷却时间
    if (currentTime - this.lastShootTime >= this.shootCooldown) {
      // 从玩家位置发射子弹
      new Bullet(this.scene as LevelScene, this.x, this.y, this.direction);
      this.lastShootTime = currentTime;
    }
  }
} 