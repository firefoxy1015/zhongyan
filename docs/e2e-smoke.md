# 真实浏览器 E2E Smoke

`npm run e2e` 使用 Playwright 驱动真实 Chromium 浏览器，不读取源码来代替点击验收。默认流程为：

1. 执行生产构建；
2. 在 `127.0.0.1:4317` 启动本地站点；Windows 默认使用读取 `dist` 的 production harness，其他平台默认使用 `vinext start`；
3. 用系统 Chrome、Edge 或 Playwright Chromium 运行 `tests/e2e/e2e-smoke.test.mjs`；
4. 测试结束后关闭本地服务器。

首次在没有 Chrome/Edge 的机器运行时安装 Playwright Chromium：

```powershell
npm.cmd run e2e:install
npm.cmd run e2e
```

## 固定验收内容

- 首页只有明确标注“普通用户请勿点击”的测试人员入口，且第 3 至第 8 章按钮真实可见。
- 先生成合法的目标章节存档，再把它改成已完成状态；逐一验证 2→3、3→4、4→5、5→6、6→7、7→8，完成页必须回到目标章首场，不能被旧完成档吞掉。
- `?fresh=1` 完成初始化后必须从地址栏清除。
- 点击一次现场观察后刷新，场景和观察记录必须恢复。
- 首页以及章节注册表中的全部共享剧情章在 `390x844` 视口下不得产生页面级横向滚动；立绘必须完整加载、使用 `contain`、保持在舞台边界内且不能完全重叠。
- 同源脚本、样式、图片、音频或文档请求不得出现 HTTP 错误；浏览器不得产生未处理异常。

## 可选环境变量

| 变量 | 作用 |
| --- | --- |
| `E2E_BASE_URL` | 对已经部署或已经启动的网站运行；设置后不构建、不启动本地服务。 |
| `E2E_PORT` | 修改本地 smoke 端口，默认 `4317`。 |
| `E2E_SKIP_BUILD=1` | 跳过构建，直接启动所选本地服务模式。 |
| `E2E_SERVER_MODE=harness` | 强制本地服务模式为 `harness`、`dev` 或 `start`。Vinext 0.0.50 的 Windows production static cache 使用反斜线键，`start` 会让 `/assets/*` 返回 404，因此 Windows 默认由 harness 提供同一份 `dist/client` 静态文件并调用 `dist/server`。部署验收应使用 `E2E_BASE_URL`。 |
| `E2E_BROWSER_CHANNEL=chrome` | 强制浏览器通道；也可用 `msedge` 或 `bundled`。 |
| `E2E_HEADED=1` | 显示浏览器窗口，便于人工观察。 |

部署后验收示例：

```powershell
$env:E2E_BASE_URL='https://zhongyan.onrender.com'
npm.cmd run e2e
```

E2E 与普通单元测试分开执行，因为它会启动生产服务并改写隔离浏览器上下文中的 `localStorage`。测试不会读取或改动用户日常 Chrome 配置。
