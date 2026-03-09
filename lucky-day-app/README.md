# 🌟 幸运日程规划师

上传测测 APP 截图，结合实时天气、位置，AI 自动生成专属今日日程。

---

## 🚀 部署到 GitHub + Vercel（5分钟上线）

### 第一步：获取 Anthropic API Key

1. 打开 https://console.anthropic.com
2. 登录后点击左侧 API Keys → Create Key
3. 复制 key（格式为 sk-ant-...），保存好

---

### 第二步：推送到 GitHub

```bash
cd lucky-day-app
git init
git add .
git commit -m "init: lucky day planner"

# 在 github.com 新建仓库后：
git remote add origin https://github.com/你的用户名/lucky-day-planner.git
git branch -M main
git push -u origin main
```

---

### 第三步：部署到 Vercel

1. 打开 vercel.com，用 GitHub 账号登录
2. Add New Project → 选择仓库 → Import
3. 构建设置自动识别，无需修改
4. 点击 Environment Variables，添加：
   - Name:  ANTHROPIC_API_KEY
   - Value: sk-ant-你的key
5. Deploy ✓

---

### 之后更新代码

```bash
git add . && git commit -m "update" && git push
```
Vercel 自动重新部署。

---

## 💻 本地开发

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-你的key" > .env.local
npm run dev
```

打开 http://localhost:5173

---

## 功能
- 📸 上传测测截图，AI 识别幸运元素
- 🌤️ 实时天气感知穿搭建议
- 📍 公司/家地址，工作日/休息日自动切换
- 🍜 附近真实餐厅推荐（OpenStreetMap）
- 🧭 附近公园散步推荐
- 📅 一键导出日历
