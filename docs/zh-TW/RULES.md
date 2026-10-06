# 規則

## 只做翻譯

不改現有功能。負責人特別要求時才例外。

## 中文只來自 Master Sheet

Google 雲端的中文 Master Sheet 是唯一依據。檔案編號：`1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4`。

- 只有狀態是 APPROVED 的列可以進網站。
- 網站不能超前這張表。
- 中文由 `scripts/l10n/export-sheet.mjs` 原樣抄進倉庫。人不改寫，AI 也不改寫、不意譯。
- 表上的英文來自紙本書 Heroes 1.01b，可以和 Forge Steel 畫面上的英文不一樣。

## 上游不動

不改上游的資料、列舉、邏輯、存檔格式、分享碼。翻譯只在顯示當下發生：對照表把 Forge Steel 的鍵對到 Sheet ID，並記下核准時的英文雜湊（enHash）；真正換字的只有少數幾個共用的顯示元件。

## 分支

- `main` 永遠等於上游 `andyaiken/forgesteel`。
- 工作都走分支，用 pull request 合進 `develop`。
- 這台電腦上的 `upstream` 不能直接推送，避免誤推到上游。

## 一批一批做

每批：對照預覽 → Marc 核准 → 寫入 Sheet → 開 PR（守門、`npm run check`；只列驗收位置，不截圖、不錄影）→ Marc 本機預覽說「過」→ squash 合併進 develop。

每一批「內容」開始前，先給對照預覽：Forge Steel 的鍵、Sheet ID、以及兩邊英文差在哪。這是唯一需要人判斷的部分。

## 少改上游檔案

上游常更新。改到的上游檔案越少，以後合併越不容易打架。到目前為止動過的上游檔案：

- `src/components/modals/settings/settings-modal.tsx`
- `src/components/controls/markdown/markdown.tsx`
- `src/components/controls/header-text/header-text.tsx`
- `src/components/panels/app-footer/app-footer.tsx`
- `src/components/panels/app-footer/app-footer.scss`
- `src/style/index.scss`
- `src/components/pages/classic-sheet/common.scss`
- `.github/workflows/digitalocean.yml`（部署保護）
- `.github/workflows/do-registry-cleanup.yml`（部署保護）
- `src/components/modals/reference/reference-modal.tsx`（條件名稱與規則、語言名稱、技能名稱與類別）
- `src/components/panels/hero/sidebar/sidebar-panel.tsx`（條件名稱與規則、語言名稱）
- `src/components/panels/condition/condition-panel.tsx`（條件名稱與規則）
- `src/components/panels/health/health-panel.tsx`（條件名稱）
- `src/components/features/feature-data/condition-immunity.tsx`（條件名稱）
- `src/components/modals/hero-customize/hero-customize-modal.tsx`（條件名稱）
- `src/components/panels/classic-sheet/conditions-card/conditions-card.tsx`（條件名稱）
- `src/components/panels/hero/stats/stats-panel.tsx`（屬性名稱）
- `src/components/panels/classic-sheet/stats-resources-card/stats-resources-card.tsx`（屬性名稱）
- `src/components/panels/classic-sheet/components/characteristics-component.tsx`（屬性名稱）
- `src/components/modals/roll/roll-modal.tsx`（屬性名稱）
- `src/components/panels/elements/feature-panel/feature-panel.tsx`（特性名稱與描述）
- `src/components/panels/elements/ancestry-panel/ancestry-panel.tsx`（族裔名稱與描述）
- `src/components/features/feature-data/choice.tsx`（建造時已選特性的名稱）
- `src/components/pages/library/library-list/library-list-page.tsx`（圖書館清單上的名稱）
- `src/components/panels/elements/culture-panel/culture-panel.tsx`（文化名稱）
- `src/components/features/feature-data/language-choice.tsx`（已選語言名稱）
- `src/components/modals/select/language-select/language-select-modal.tsx`（選語言抽屜的語言名稱）
- `src/components/features/feature-data/language.tsx`（語言名稱）
- `src/components/panels/classic-sheet/culture-card/culture-card.tsx`（語言名稱）
- `src/components/panels/elements/sourcebook-panel/sourcebook-panel.tsx`（語言名稱）
- `src/components/modals/party/party-modal.tsx`（語言名稱）
- `src/components/panels/elements/negotiation-panel/negotiation-panel.tsx`（語言名稱）
- `src/components/panels/classic-sheet/components/feature-component.tsx`（語言名稱）
- `src/components/panels/classic-sheet/follower-card/followers-card.tsx`（語言名稱）
- `src/components/panels/classic-sheet/negotiation-sheet/negotiation-npc-card.tsx`（語言名稱）
- `src/components/features/feature-data/skill-choice.tsx`（技能名稱）
- `src/components/modals/select/skill-select/skill-select-modal.tsx`（技能名稱與類別）

## 舊的失敗嘗試，不要再做

- 自己另做一套詞彙，和 Master Sheet 打架。例如 Class 必須是「職業」，Career 必須是「生涯」。
- 一次改太大片。
- 為計算出來的招式文字另寫一套邏輯。
- 在大約 60 個畫面各自掛鉤子。
- 不跟上游同步。
- 從那次嘗試裡撿東西來用。

## 倉庫是公開的

草稿譯文、筆記、還沒核准的內容都不要放進倉庫。快照裡可以有什麼，寫在在地化的說明和腳本裡。

## 守門要過

`node scripts/l10n/check.mjs` 必須通過。每個 pull request 也會在 GitHub Actions 跑它（`.github/workflows/l10n-check.yml`）。

## 改了專案狀態就要更新文件

會改變進度或決定的 pull request，要同時更新 [PROGRESS.md](PROGRESS.md)。有新的決定時，也要寫進 [DECISIONS.md](DECISIONS.md)。
