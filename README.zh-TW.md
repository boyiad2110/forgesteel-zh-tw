# Forge Steel 正體中文版

規則、進度與已拍板的決定，請先讀 [docs/zh-TW/README.md](docs/zh-TW/README.md)。

本倉庫是 [Forge Steel](https://github.com/andyaiken/forgesteel) 的正體中文（zh-TW）在地化。Forge Steel 是 DRAW STEEL 桌上角色扮演遊戲的英雄構築與主持人工具，由 [Andy Aiken](mailto:andy.aiken@live.co.uk) 設計開發。英文正式站為 [forgesteel.net](https://forgesteel.net)。

## 原則

- 不修改上游的資料、邏輯、存檔格式與分享碼。翻譯只在畫面顯示時套用。
- 所有中文以專案負責人維護的 Translation Master Sheet 為唯一依據，且只能採用狀態為 APPROVED 的條目。
- 在地化不得超前 Master Sheet。
- zh-TW 版本會隱藏社群與第三方來源書。
- 主持人（Director）工具目前維持英文。

## 分支

- `main` 永遠與上游相同，只做鏡像，不在此開發。
- `develop` 是開發預覽分支。
- 功能改動使用功能分支，經人工接受後以 pull request 合併進 `develop`。

## 本地開發

需要 [Node.js](https://nodejs.org/) 24 或更新版本。

```bash
npm ci
npm run start
```

瀏覽器開啟 http://localhost:5173 。提交前執行：

```bash
npm run check
```

## 同步上游

`upstream` 遠端應指向 `https://github.com/andyaiken/forgesteel.git`。

```bash
git fetch upstream
git checkout main
git merge --ff-only upstream/main
git push origin main
git checkout develop
git merge main
git push origin develop
```

## 授權

本專案以 [GNU General Public License v3.0](license.md) 釋出。

依 DRAW STEEL Creator License，須附下列聲明：

> Forge Steel 正體中文版 is an independent product published under the DRAW STEEL Creator License and is not affiliated with MCDM Productions, LLC. DRAW STEEL © 2026 MCDM Productions, LLC.
