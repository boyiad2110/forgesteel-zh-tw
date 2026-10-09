# Forge Steel 正體中文版

規則、進度與已拍板的決定，請先讀 [docs/zh-TW/README.md](docs/zh-TW/README.md)。

本倉庫是 [Forge Steel](https://github.com/andyaiken/forgesteel) 的正體中文（zh-TW）在地化。Forge Steel 是 DRAW STEEL 桌上角色扮演遊戲的英雄構築與主持人工具，由 [Andy Aiken](mailto:andy.aiken@live.co.uk) 設計開發。英文正式站為 [forgesteel.net](https://forgesteel.net)。

## 原則

- 不修改上游的資料、邏輯、存檔格式與分享碼。翻譯只在畫面顯示時套用。
- 所有中文以中文 Master Sheet 為唯一依據，且只能採用狀態為 APPROVED 的條目。
- 在地化不得超前 Master Sheet。
- zh-TW 版本會隱藏社群與第三方來源書。
- 主持人（Director）的工具和資料不是刻意留英文。Master Sheet 譯了就會顯示中文，只是優先順序比較後面。

## 分支

- `main` 永遠與上游相同，只做鏡像，不在此開發。
- `develop` 是開發預覽分支。
- 功能改動使用功能分支，以 pull request 合併進 `develop`；一般內容經 Marc 接受，明確授權的維護依自動驗證結案。

## 本地開發

需要 [Node.js](https://nodejs.org/) 24 或更新版本。

```bash
npm ci
npm run start
```

瀏覽器開啟 http://localhost:5173 。分叉的完整驗證入口：

```bash
node scripts/l10n/verify.mjs
```

依序執行在地化守門（含匯出一致性）、Lint、TypeScript、Vitest、正式建置、npm audit。前項失敗仍執行後項，最後列出各項退出碼與耗時；任何一項失敗，整體退出碼為 1。稽核漏洞與網路失敗均不忽略。

`node scripts/l10n/verify.mjs --doctor` 只列環境與依賴版本；`--only guard|lint|types|tests|build|audit` 選一項補跑，不能當成完整驗證。環境或 Sass 異常先跑 doctor，確認依鎖定檔安裝依賴，再用原設定重跑；不要看到 Sass 錯誤就直接新增 sass-embedded。

GitHub Localization check 使用相同入口，六項各自顯示為一步；依賴安裝成功後，前項失敗不會跳過後項。上游 `npm run check` 保持原樣（Lint、TypeScript、Vitest、audit，遇錯即停），本批相容性驗證仍需執行；它不含在地化守門或正式建置。單獨守門仍可用 `node scripts/l10n/check.mjs`，不必接著重跑匯出一致性。

## 同步上游

`upstream` 遠端應指向 `https://github.com/andyaiken/forgesteel.git`。

完整流程與分支保護見 [UPSTREAM.md](docs/zh-TW/UPSTREAM.md)：main 只做 fast-forward 鏡像；整合進 develop 必須開同步 PR，不能直接推送。每週一台灣 09:00 由 Upstream watch 比較積欠；GitHub 預設分支設 develop，讓分叉專用排程與範本可執行。同步 PR 用 merge commit 保留上游祖先，一般內容批次仍可 squash。

## 授權

本專案以 [GNU General Public License v3.0](license.md) 釋出。

依 DRAW STEEL Creator License，須附下列聲明：

> Forge Steel 正體中文版 is an independent product published under the DRAW STEEL Creator License and is not affiliated with MCDM Productions, LLC. DRAW STEEL © 2026 MCDM Productions, LLC.
