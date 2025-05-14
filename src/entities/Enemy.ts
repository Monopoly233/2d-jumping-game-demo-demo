import { LevelScene } from '../scenes/LevelScene';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private health: number = 100;
    private maxHealth: number = 100;
    private healthBar: Phaser.GameObjects.Graphics;
    private healthBarWidth: number = 40;
    private healthBarHeight: number = 4;

    constructor(scene: LevelScene, x: number, y: number) {
        super(scene, x, y, 'enemy');

        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this, false); // false表示是动态的，会受重力影响

        // 设置物理属性
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setBounce(0.2); // 添加一些弹性
        
        // 设置碰撞箱大小
        this.setSize(30, 30);
        
        // 创建一个黄色方块作为敌人的显示
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 30, 30);
        graphics.generateTexture('enemy', 30, 30);
        graphics.destroy();

        // 设置纹理
        this.setTexture('enemy');

        // 创建血条
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    private updateHealthBar(): void {
        this.healthBar.clear();

        // 血条背景（灰色）
        this.healthBar.fillStyle(0x666666);
        this.healthBar.fillRect(
            this.x - this.healthBarWidth / 2,
            this.y - 25,
            this.healthBarWidth,
            this.healthBarHeight
        );

        // 当前血量（红色）
        const healthWidth = (this.health / this.maxHealth) * this.healthBarWidth;
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(
            this.x - this.healthBarWidth / 2,
            this.y - 25,
            healthWidth,
            this.healthBarHeight
        );
    }

    public takeDamage(damage: number): void {
        this.health = Math.max(0, this.health - damage);
        this.updateHealthBar();

        if (this.health <= 0) {
            this.die();
        }
    }

    private die(): void {
        // 死亡效果
        const emitter = this.scene.add.particles(0, 0, 'enemy', {
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            gravityY: 300,
            quantity: 10
        });

        // 粒子效果完成后销毁
        this.scene.time.delayedCall(500, () => {
            emitter.destroy();
            this.healthBar.destroy();
            this.destroy();
        });
    }

    public update(): void {
        // 更新血条位置
        this.updateHealthBar();
    }
} 