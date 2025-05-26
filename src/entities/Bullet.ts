import { LevelScene } from '../scenes/LevelScene';
import { Enemy } from './Enemy';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    private speed: number = 400;
    private damage: number = 20;
    private lifespan: number = 20000; // 子弹存在时间（毫秒）

    constructor(scene: LevelScene, x: number, y: number, direction: number) {
        super(scene, x, y, 'bullet');

        // 创建子弹纹理（如果还没有）
        if (!scene.textures.exists('bullet')) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(0x00ffff, 1); // 青色子弹
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('bullet', 8, 8);
            graphics.destroy();
        }

        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 设置子弹物理属性
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false); // 子弹不受重力影响
        
        // 设置子弹速度（根据方向）
        this.setVelocityX(this.speed * direction);

        // 设置子弹大小
        this.setDisplaySize(8, 8);

        // 添加与敌人的碰撞
        scene.physics.add.overlap(
            this,
            scene.enemies,
            (_: any, obj2: any) => {
                if (obj2 instanceof Enemy) {
                    obj2.takeDamage(this.damage);
                    this.destroy();
                }
            },
            undefined,
            this
        );

        // 设置自动销毁定时器
        scene.time.delayedCall(this.lifespan, () => {
            this.destroy();
        });
    }

    update(): void {
        // 如果子弹离开世界边界，销毁它
        if (!this.scene || !this.body) return;
        
        if (this.x < 0 || this.x > this.scene.scale.width || 
            this.y < 0 || this.y > this.scene.scale.height) {
            this.destroy();
        }
    }
} 