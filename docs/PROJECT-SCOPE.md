# Project Scope — Quick Summary

> 本文件只提供專案範圍的快速導覽，不建立第二套需求或產品規則。
> 正式 V1 scope、排除項目與完成標準以 `docs/requirements/V1-REQUIREMENTS.md` 為準。

## V1 核心方向

- 建立 Forge Steel 的繁體中文版，預設顯示 `zh-TW`，並可一鍵切換英文且記住選擇。
- 中文只改變 presentation；英文 canonical data、規則、計算、ID、enum、reference、parser 與 save format 保持不變。
- Runtime 保留所有 `Official` 與 `Homebrew` Sourcebooks。
- `Official` Patreon／Playtest 沿用原版 feature flag。
- 排除 `Community` 與 `ThirdParty` Sourcebooks，且此 policy 與 locale 無關。

## V1 翻譯目標

V1 必須完成 Core、Orden、Beastheart、Summoner 中建立與使用 Level 1–3 Hero 所需的 player-facing content 與必要 UI。

其他允許的 Official、Homebrew 與 GM 內容可依 V1 requirements 顯示 canonical English fallback，不因翻譯完整度改變 runtime allowlist。

## 翻譯決策

- 專案負責人是新中文遊戲術語、正式譯名與會改變語意之中文措辭的最終決策者。
- 未核准的新遊戲術語保持 canonical English。
- 已核准譯文的純機械變體，例如 singular／plural、`a/an`、大小寫、不改變語意的標點、英文 plural `s` 與 placeholder 周圍的純文法調整，可依 `docs/REVIEWER-PRINCIPLES.md` 由 Reviewer／Agent 處理，不需逐項重新送核。

## 不在本摘要重複維護的內容

測試、發布條件、V1.1、授權、部署、Beta 與完整排除項目，直接依 `docs/requirements/V1-REQUIREMENTS.md`。
