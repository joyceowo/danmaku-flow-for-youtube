# 專案協作指引

適用於整個儲存庫；使用者明確指示優先。溝通預設使用繁體中文。

## 專案與架構

- Danmaku Flow for YouTube：Chrome Manifest V3 彈幕套件，使用 TypeScript、Vue 2.7、Vuetify 2、Vuex、webpack；CI 使用 Node.js 20。
- 依賴以 npm 與 `package-lock.json` 為準；沿用既有架構與 Prettier 風格，不順手升級依賴或重建 `yarn.lock`。
- `src/background.ts`：設定同步與分頁訊息；`src/content-script*.ts`：YouTube 主頁面與聊天 iframe。
- `src/components/`：介面；`App.vue`：更新通知；`src/store/settings.ts`、`src/models/`、`src/config/display-modes.ts`：設定與情境預設。
- `src/_locales/`：語系；`tests/`：回歸測試；`docs/chrome-store-listing.md`：商店文案。
- `app/`、`dist/` 是忽略的建置產物，請修改來源後重建。

## 修改原則

- 先檢查 `git status`，保留既有變更，只修改任務相關檔案。
- 新設定同步型別、預設值、介面與持久化，兼容舊設定並保留各情境的獨立設定。
- 聊天顯示修改須考慮 `/watch`、`/live`、SPA 導覽、延遲載入，以及全螢幕／劇院／一般模式；離開適用模式時恢復樣式。
- 避免 observer、事件監聽與 resize 迴圈；service worker 重啟後仍須能恢復設定。
- 保留 Vue runtime ESM alias 與 MV3 CSP 相容性。新增權限或外部資料傳輸時，說明用途並同步隱私文件。

## 驗證

- 常用指令：`npm ci`、`npm run dev`、`npm test`、`npm run build -- --output-clean`。Windows 必要時使用 `npm.cmd`、`npx.cmd`。
- `npm test` 包含聊天、更新通知測試及 lint；pre-commit hook 也會執行，不跳過。
- 行為修改補上相關回歸測試，發版前完成測試與正式建置。純文件修改只檢查內容、Prettier 與 `git diff --check`。
- 已通過的檢查只在後續修改影響結果時重跑；未實際操作 Chrome，不宣稱完成手動驗證。

## 版本與更新通知

- 發版同步 `package.json`、`package-lock.json`、`App.vue` 的 `releaseVersion` 與通知 key，以及 README 更新紀錄；功能描述有變更時同步商店文案。
- 通知描述本次實際變更，同步中、英、日、韓文案，其他語系可回退英文。
- 通知僅在 popup 顯示；新版不受舊版已讀狀態阻擋。同版關閉後不再顯示，首次顯示起 24 小時到期，重開不重設時間。
- webpack 從 `package.json` 注入 manifest 版本；驗證 `app/manifest.json`，不用在來源 manifest 重複維護版本。

## 打包與交付

- 採乾淨正式建置，ZIP 命名為 `dist/danmaku-flow-for-youtube-v<版本>.zip`。
- Chrome 商店 ZIP 根目錄須直接有 `manifest.json`。現有 `npm run package` 需要 Unix 的 `zip`，且會保留 `app/` 外層目錄；商店上傳包應改為壓縮 `app/` 內的內容。
- Windows 打包範例（建置成功後才執行壓縮）：

```powershell
npm.cmd run build -- --output-clean
$releaseVersion = (Get-Content -Raw package.json | ConvertFrom-Json).version
New-Item -ItemType Directory -Path dist -Force | Out-Null
Compress-Archive -Path app\* -DestinationPath ("dist/danmaku-flow-for-youtube-v{0}.zip" -f $releaseVersion) -Force
```

- 開啟 ZIP 核對 manifest 版本、引用檔案、資產、語系、授權及新版通知，排除舊 source maps 與 hot reload 產物。
- 在已授權範圍內完成 Git 操作；推送前核對遠端。`v<版本>` tag 指向完整發版提交，不任意覆寫遠端 tag 或強制推送。
- tag CI 建立 GitHub Release 草稿；本機 ZIP、GitHub 推送與 Chrome 商店上架須分別報告。
- 工具拒絕時不繞過限制，說明原因並完成其他工作。交付簡述改動與驗證；發版另提供 commit、tag、ZIP 路徑和遠端狀態。
