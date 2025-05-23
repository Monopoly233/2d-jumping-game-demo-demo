# 2D游戏场景编辑器

这是一个基于Phaser 3的2D游戏场景编辑器，允许您创建和编辑游戏场景，放置平台和传送门。

## 特性

- 强大的场景编辑器，支持实时编辑
- 可扩展的场景系统，支持创建多个关卡
- 保存/加载场景数据
- 直观的界面，网格吸附
- 支持多种游戏对象（平台、传送门）

## 如何使用

### 基本控制

- **移动角色**：方向键或WASD
- **跳跃**：上方向键或K键（支持二段跳）

### 编辑器控制

- **启用/禁用编辑器**：E键
- **放置对象**：鼠标左键或空格键
- **删除对象**：鼠标右键或Delete键
- **切换对象类型**：Tab键
- **调整网格大小**：+/- 键
- **保存当前场景**：S键
- **加载保存的场景**：L键

## 场景系统

这个项目使用一个基于类继承的场景系统：

- **LevelScene**：所有关卡的基类，包含共享功能
- **Level1Scene**：第一个关卡实现
- **Level2Scene**：第二个关卡实现

每个场景类都可以覆盖以下方法来自定义其行为：

```typescript
// 创建默认的场景布局
createDefaultLayout(): void

// 创建玩家
createPlayer(): void

// 创建地面
createGround(): void

// 创建用户界面
createUI(): void
```

## 编辑器工作流程

1. 进入游戏场景
2. 按E键打开编辑器
3. 使用鼠标和键盘放置/删除物体
4. 按S键保存场景
5. 按E键退出编辑器，测试场景

场景数据会保存在浏览器的localStorage中，每个场景都有独立的存储键。

## 开发

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run start
```

### 构建

```bash
npm run build
``` 