# Showa AI Home

像素风昭和日式小家的纯前端交互原型。项目使用 Vite + React + TypeScript，不接后端、AI 或数据库。

## 功能

- 庭院首页：障子拉门、廊下、树木花草、石灯笼、锦鲤池、猫。
- 室内场景：榻榻米、书桌电脑、台灯、窗户、柜子、猫窝。
- 动态状态：自动时间氛围、按月份季节、右上角天气调试切换。
- 交互：点门进室内，点门回庭院，点灯开关灯，点电脑打开本地聊天框。
- 聊天：预设消息和本地追加消息，刷新后不保存。
- 响应式：桌面为右侧浮窗，手机为底部全宽弹出。

## AI 接入

默认不配置接口时，聊天只做本地追加。要接入自己的 AI 服务，创建 `.env.local`：

```bash
VITE_AI_ENDPOINT=https://your-api.example.com/chat
```

前端会向该地址 `POST`：

```json
{
  "messages": [
    { "role": "user", "content": "你好" }
  ]
}
```

响应里支持读取 `reply`、`content` 或 `message` 字段作为 AI 回复。

## 运行

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```
