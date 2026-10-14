# Wcid — Todo + Schedule

## 定位与约束

轻量跨平台 PWA：Windows 浏览器 / Android Chrome 80+。任务只有可选截止日期；日程有固定日期与起止时间。长期项目，优先响应速度、兼容性和简洁视觉；低饱和中性色，不使用艳色、大面积渐变或沉重组件库。AI 辅助创建为后续计划，尚未实现。

## 开发

- Node.js 22；`npm ci`、`npm run dev`、`npm test`、`npm run build`、`npm run preview`。
- React 18 + Vite 5 + Zustand + date-fns；PWA 由 vite-plugin-pwa 生成。
- `src/model.js`：本地日期、兼容 ID、任务默认值、重复日期算法、完成推进。
- `src/calendar.js`：时间转换、重叠事件分栏。
- `src/store.js`：Zustand 持久化，localStorage `wcid-store`，schema version 1。
- `src/App.jsx`：桌面侧栏/今日安排、手机导航、模态窗。
- `src/components/ScheduleView.jsx`：周 / 日历与时间轴，全天 00:00–24:00，初始滚动至 07:00。
- `src/components/AddModal.jsx`：创建/编辑、校验、重复规则、键盘焦点管理。
- `src/tokens.css`：颜色和基础 token；`src/global.css`：重置与兼容覆盖。
- `tests/model.test.js`：日期边界、旧数据默认值、重复推进去重、重叠分栏测试。
- `.github/workflows/pages.yml`：测试、构建、部署 GitHub Pages。

## 数据模型

Task: `{ id, type:'task', title, description, dueDate:'YYYY-MM-DD'|null, priority:'low'|'medium'|'high'|'urgent', completed, createdAt, recurrence, nextOccurrenceId? }`

Recurrence: `{ frequency:'none'|'daily'|'weekly'|'monthly'|'yearly', weekdays:number[], monthDay:number, month:number }`。星期 0=周日，1=周一；month 1–12，monthDay 1–31。

Schedule: `{ id, type:'schedule', title, date:'YYYY-MM-DD', startTime:'HH:MM', endTime:'HH:MM', description, createdAt }`。

旧的 version 0 数据会补充描述、completed、recurrence 默认值；保留原始 ID/标题/截止日期/优先级。旧 low/medium/high 依次映射绿/蓝/紫，新增 urgent 为金。

## 重复语义

- 首次截止日期可以是任意日期；完成时才寻找之后的下一个规则匹配日。
- 每周可多选星期；每月/每年按指定月日计算，短月落到月底（包括闰日）。
- 从原截止日期推进，不从点击完成的日期推进；逾期不会自动跳过。
- 保留完成记录，生成独立下一条并记录 nextOccurrenceId。取消完成不会删除下一条，再完成不会重复生成；即使下一条已删除也不会重新生成。
- 编辑/删除只影响当前条目；不是整个系列编辑。

## 视觉与兼容约定 / 踩坑

- 桌面 >=960px 是独立侧栏+宽工作区，不能重新限制为手机窄列。
- 手机周历内部横向滚动，页面本身不溢出；单日视图适合窄屏。
- 颜色通过 tokens.css；动态位置可用 inline style，其他样式使用 CSS。
- 常规触摸操作区域至少 44px；极短日程块保持时间比例，通过键盘或放大点击编辑。
- Chrome 80 不支持 crypto.randomUUID：用 crypto.getRandomValues 生成 ID。
- 日期不能用 toISOString().slice(0,10)，否则本地凌晨可能变成前一天；使用 localDate。
- 旧 Chrome 没有 flex gap、inset、:has 支持；主要间距使用 grid/margin，覆盖层用四边定位，焦点有 :focus/:focus-within 回退。保留的 :has 规则仅作渐进增强。
- Vite target 明确 chrome80；PWA 路径使用相对路径，支持仓库子目录。补齐 192/512 PNG 图标，不再锁定 portrait。
- 弹窗 Escape 关闭、Tab 焦点限制与焦点恢复；不能禁用浏览器缩放。
- 服务工作线程只在生产构建注册；dev 测试通过不代表离线缓存成功。
- 用户数据仅在当前浏览器；GitHub Pages 上与 localhost 的存储相互独立。无账户、云同步、提醒、AI、跨午夜日程或日程拖拽。
- 不将真实任务、本地缓存、凭证、.env、node_modules、dist 或测试截图提交仓库。

## 2026-10-14 进度

已实现独立桌面布局、周/日时间轴、日期导航与今日标记、当前时间线、重叠日程分栏、四档优先级、任务描述/截止日期/每日每周每月每年重复、完成历史与下一次生成、旧数据迁移、PWA 图标与兼容修复。

验证：9 项 Node 测试通过；生产构建通过。Windows Edge 无头浏览器完成桌面 1440px 和手机 375px 测试：创建与校验、重复完成、刷新持久化、日历新增、日视图、Escape、深色模式；无 JS 运行错误，手机页面无横向溢出。已检查桌面、日历、手机截图。旧安卓真机和大量数据性能尚未实测，不可把构建通过描述为真机验证。

生产预览补充验证：已用旧 version 0 数据启动并编辑成功；确认 schema 升级至 1；等待 service worker 激活后断网刷新，界面与任务仍正常读取。

公开仓库：https://github.com/Entropy2077-axe/Wcid 。默认开发分支为 master；该分支推送触发 Pages。应用地址：https://entropy2077-axe.github.io/Wcid/ 。

GitHub Pages 部署踩坑：空仓库启用 Pages 时 github-pages 环境会预设只允许 main，导致 master 的部署在启动 runner 前被拒绝（无构建日志）。已在该环境的 deployment branch policies 中明确允许 master；保留分支保护，不需要改为所有分支可部署。
