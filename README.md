# X FITNESS Walk-in 系统

一个完整的 walk-in 顾客 check-in 与封禁管理系统，取代原本的 Google Form + Sheet 工作流。

---

## 系统包含什么

### 顾客端（QR Code 扫描入口）
- 第一次来 → 注册（姓名 / IC / 电话 / 紧急联络人 / T&C）
- 再次来 → 输入 IC → 一键确认 check-in
- Banned 顾客 → 全屏红色警告
- 三语切换（English / 中文 / Bahasa Malaysia）

### 员工端（Staff Dashboard）
- 实时 today 列表（取代 Google Sheet，自动更新）
- Banned 顾客整行红色高亮 + 闪烁
- 有 warnings 的顾客黄色高亮
- 查看顾客资料、添加 warning、添加备注
- **不能** 修改资料、删除、ban/unban

### Admin 端
- 员工的所有功能 +
- Ban / Unban 顾客（必须填写原因）
- 重置 warnings
- 数据报表（每日 / 每月 / 90 天）
- 高峰时段图表
- 操作审计日志（谁做了什么）
- 导出 CSV

---

## 部署步骤（约 30 分钟）

### Step 1：注册 Supabase（数据库）

1. 到 https://supabase.com 注册一个免费账号
2. 创建新 project，名字例如 `xfitness-walkin`
3. 选 region：**Singapore**（最靠近马来西亚）
4. 设一个 database password（记下来）
5. 等待 1-2 分钟创建完成

### Step 2：建立数据库

1. 在 Supabase 项目左侧选 **SQL Editor**
2. 点 **New Query**
3. 打开本项目的 `supabase-schema.sql` 文件，复制全部内容
4. 粘贴进 SQL Editor，点 **Run**
5. 看到 "Success" 即完成

### Step 3：开启 Realtime（让员工 Dashboard 实时更新）

1. 在 Supabase 选 **Database** → **Replication**
2. 找到 `visits` 和 `customers` 表，开启 realtime
3. 保存

### Step 4：创建你的 Admin 账号

1. 在 Supabase 选 **Authentication** → **Users**
2. 点 **Add User** → **Create new user**
3. 输入你的 email + password（这是你的登录凭证）
4. **重要**：去掉 "Auto Confirm User" 旁边的勾，让它确认（或勾上自动确认）
5. 创建后，复制这个 user 的 ID（UUID）
6. 回到 **SQL Editor**，运行：

```sql
INSERT INTO app_users (id, email, display_name, role)
VALUES ('paste-your-user-id-here', 'your-email@example.com', 'Admin', 'admin');
```

### Step 5：创建员工账号（重复 Step 4，但 role 写 'staff'）

```sql
INSERT INTO app_users (id, email, display_name, role)
VALUES ('staff-user-id', 'staff@example.com', 'Staff Name', 'staff');
```

### Step 6：取得 API 密钥

1. 在 Supabase 选 **Settings** → **API**
2. 记下两个值：
   - `Project URL`（例：`https://xxx.supabase.co`）
   - `anon public` key（一长串）

### Step 7：上传到 GitHub

1. 在本地解压本项目
2. 创建 GitHub repository
3. 把项目推上去（如果不会，让 ChatGPT/Claude 教你）

### Step 8：部署到 Netlify

1. 到 https://netlify.com 用 GitHub 登录
2. **Add new site** → **Import from Git**
3. 选刚才推上去的 repo
4. Build command: `npm run build`（应该自动检测）
5. **重要**：在 **Environment variables** 添加：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 anon key
6. 点 **Deploy**
7. 等 2-3 分钟构建完成
8. 网站上线了！例如 `https://xfitness-walkin.netlify.app`

### Step 9：生成 QR Code

1. 用任何 QR Code 生成器（例如 https://qr-code-generator.com）
2. URL 填：`https://你的网站.netlify.app/checkin`
3. 下载 QR code，打印贴在前台

### Step 10：测试

1. 用手机扫 QR → 应该看到 WELCOME 页面
2. 输入新 IC 注册一个测试账号
3. 用 Admin 账号登录 `/login`
4. 进入 `/admin` 看到列表
5. 试着把测试账号 ban 掉
6. 用同一个 IC 重新 check-in，应该看到红色 BANNED 屏幕

---

## 路由总览

| URL | 用途 | 需要登录？ |
|-----|------|------|
| `/checkin` | 顾客扫 QR 入口 | 否 |
| `/checkin/register` | 新顾客注册 | 否 |
| `/checkin/confirm` | 回头客确认 | 否 |
| `/checkin/approved` | 入场通过 | 否 |
| `/checkin/banned` | 封禁警告 | 否 |
| `/login` | 员工/Admin 登录 | 否 |
| `/staff` | 员工 dashboard | 是（staff/admin）|
| `/staff/customers` | 员工查看客户 | 是 |
| `/admin` | Admin dashboard | 是（admin only）|
| `/admin/customers` | Admin 客户管理 | 是 |
| `/admin/reports` | 数据报表 | 是 |
| `/admin/audit` | 操作日志 | 是 |

---

## 日常使用流程

### 顾客角度
1. 到店扫 QR
2. 输入 IC（第一次的话填完整资料）
3. 看到绿色 ✓ APPROVED → 到柜台付款 → 开始训练

### 员工角度
1. 浏览器开着 `/staff`（实时更新）
2. 看到顾客名字出现 → ✓ 即可（绿色正常）
3. 看到红色 → 拦截顾客
4. 看到黄色（有 warnings）→ 留意行为，必要时再加 warning

### Admin 角度（你）
- 平时不需要看
- 出现问题客户 → 进 `/admin/customers/{id}` → BAN 并填原因
- 月底看 `/admin/reports` 了解客流量

---

## 成本

- **Supabase Free Plan**：500MB 数据库 + 50K monthly active users（你绝对用不完）
- **Netlify Free Plan**：100GB bandwidth/月（够用）
- **域名（可选）**：~RM 50/年（如果要绑定自己的域名，例如 walkin.xfitness.my）

**目前总成本：RM 0/月** ✅

---

## 后续优化建议（暂时不需要做）

- 加 SMS / WhatsApp 通知（顾客被 ban 时联系本人）
- 加生日祝福
- 与 POS 系统集成（自动同步付款记录）
- 顾客自助查看到访次数
- Member 升级提示（来了 10 次 → 推荐买月卡）

---

## 有问题？

最常见问题：

**Q：员工 dashboard 没自动更新？**
A：检查 Supabase 的 Realtime 是否开启了（Step 3）

**Q：登录后跳回 login 页？**
A：可能 app_users 表没插入这个 user，回去看 Step 4

**Q：Build 失败？**
A：检查 Netlify 的 environment variables 有没有正确设置

---

Built with Next.js 14 + Supabase + Tailwind CSS · For X FITNESS CENTRE
