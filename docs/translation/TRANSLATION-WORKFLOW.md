# Forge Steel 繁中翻譯工作流

## 文件角色

本文件只定義 **V1 翻譯工作的執行方式**，目的是讓內容盤點、正式翻譯與進度追蹤使用同一套 evidence，避免重複建立第二套翻譯分母。

本文件不取代：

- 專案負責人的最新明確決定
- `docs/REVIEWER-PRINCIPLES.md`
- `docs/project-review-skill/PROJECT-REVIEW-SKILL.md`
- 現行 V1 requirements
- repository code、tests、PR、CI 與人工驗收 evidence

Authority 衝突依 `docs/REVIEWER-PRINCIPLES.md` 處理；repository code、tests、PR、CI 與人工驗收 evidence 用於判定實際現況，不得覆蓋較高 authority。

Reviewer / Agent 的 Batch、Review、Git / PR workflow 仍依 `PROJECT-REVIEW-SKILL.md`；本文件不建立第二套 Reviewer 流程。

---

## 1. V1 翻譯範圍

V1 翻譯完整性 denominator 固定針對：

- Core
- Orden
- Beastheart
- Summoner

中建立與使用 Level 1–3 Hero 所需的 player content 與必要 player-facing UI。

Runtime 可用的 Official / Patreon / Playtest / Homebrew 範圍是另一件事，**不得拿 runtime Sourcebook allowlist 當作 V1 翻譯 denominator**。

---

## 2. Manifest、Catalog、Completeness 各自代表什麼

### Manifest：目前已確認「必須翻什麼」

`v1LocalizationManifest.requiredCanonicalEnglish` 保存目前已經可靠 enumerate 的 V1 required localization identities 與 canonical English。

`unresolvedDomains` 保存尚未完整 enumerate 的 V1 區域。

因此：

> **只要 `unresolvedDomains` 還不是 0，目前的 requiredCount / missing 只代表「已知分母」，不能當成完整 V1 翻譯百分比。**

### Catalog：哪些譯文已正式核准

現行 production localization catalog 只保存專案負責人已核准的繁中譯文。

未核准的新譯文不得當成 production translation。

### Completeness：目前已知還缺什麼

現行 completeness check 會檢查：

- missing
- unapproved
- catalog validation issues / canonical drift
- unresolved domains
- complete / incomplete

它是 V1 翻譯缺漏 gate 的主要自動 evidence。

---

## 3. 從現在開始的翻譯方式

不再把工作硬拆成：

> 全部盤點完 → 才開始全部翻譯

預設改成：

> **確認一個 coherent content slice → 補齊這一批 denominator → 翻這一批 → 寫入 catalog → 自動更新 completeness → 下一批**

每一個正常 translation batch，仍先依 `PROJECT-REVIEW-SKILL.md` 建立 Batch Contract。

實際工作通常是：

1. 確認這一批屬於 V1 player-facing scope，並取得 canonical English。
2. 核對 manifest 是否已完整涵蓋這一批。
3. 若只缺少可安全補上的 identities，在同一批補入 manifest。
4. 整理 translation packet 給專案負責人審核。
5. 專案負責人核准正式繁中譯文。
6. Agent 將核准譯文加入 production localization catalog。
7. 執行 validator、completeness 與本批必要 tests。
8. 回報這一批完成後的 required / missing / unresolved 變化。

如果某個 slice 已有完整且經驗證的 manifest coverage，就直接進入翻譯，不重新做整批人工盤點。

Translation packet 是工作材料，不必預設成為另一份 repository 正式進度文件。

---

## 4. 純 denominator Batch 的原則

**預設不要為了盤點而盤點。**

但不是完全禁止純 denominator Batch。

如果 Reviewer 判斷分開處理能降低具體風險，或存在下列情況，可以另外開 coherent technical batch：

- 沒有穩定 localization identity
- canonical content 無法可靠取得
- nested / reachable content traversal 邊界尚未能安全定義
- scope / authority 尚未能可靠判定
- 同批處理會增加 false green、漏算或 shared-architecture 風險
- 依 Reviewer Principles，dependency 或風險隔離明確需要分批

是否拆開由 Reviewer 依現行 authority、風險與最低足夠 evidence 決定，不以「一定要同批」作為硬規則。

---

## 5. 翻譯決策

Agent / AI 可以：

- 擷取 canonical English
- 整理 translation packet
- 找出缺漏
- 提供翻譯建議
- 檢查 placeholder、格式、重複與 canonical drift

但下列事項仍由專案負責人決定：

- 新中文遊戲術語
- 正式譯名
- 會改變語意的中文措辭
- 既有正式譯文的語意性修改

已核准譯文的純機械變體依 `REVIEWER-PRINCIPLES.md` 處理，不需要逐項重新送核。

若本批需要新的 Owner 翻譯決策，未取得核准前不得把該譯文寫成正式 production translation。

---

## 6. `unresolvedDomains` 的用途

`unresolvedDomains` 代表：

> 這個 V1 區域目前還沒有被完整、可驗證地納入自動 completeness denominator。

只要某個 domain 尚未完整 enumerate，就必須保持 unresolved。

只有當該 domain 的 V1 required identities 已完整且有足夠 evidence 支持時，才移除。

不得為了讓進度數字看起來更好而提前移除。

如果後續 code review、翻譯作業或人工驗收發現 manifest 漏掉 V1 required content：

1. 先承認 denominator 不完整；
2. 補回 required identity / unresolved state；
3. 重新執行 completeness。

不得用舊的綠燈結果掩蓋新發現的漏項。

---

## 7. 不建立第二套「正式翻譯分母」

正式翻譯缺漏與進度 evidence 以 manifest + catalog + completeness 為主。

不應另外建立一份平行人工清單，重新定義：

- V1 總共有多少 required items
- 哪些算完成
- 哪些算缺漏

否則會形成兩套可能互相矛盾的 denominator。

### 但人工驗收 checklist 仍然可以，而且 V1 有些是必須的

V1 requirements 仍要求：

- 完整人工檢查 Core、Orden、Beastheart、Summoner 的所有 Level 1–2 player content
- 抽樣人工檢查 Level 3 content 與 level-up flow
- 其他已明確要求的功能、資料、語言切換與相容性驗收

因此可以使用人工 checklist / 驗收紀錄作為 **acceptance evidence**。

差別是：

> 人工 checklist 用來確認內容、語意、畫面與流程是否正確；
> manifest / completeness 用來維護正式翻譯 denominator 與缺漏狀態。

如果人工驗收發現漏翻項目，不另外維護第二份進度表；應回補 manifest / catalog，再重新跑 completeness。

---

## 8. 進度怎麼報

當 `unresolvedDomains.length > 0` 時：

- 可以回報已知 requiredCount
- 可以回報目前 missing / satisfied
- **不得把它稱為完整 V1 翻譯百分比**

應明確標示為：

> 「目前已納入 denominator 的內容進度」

只有當所有 V1 domains 都已完整 enumerate、`unresolvedDomains = 0`，才有資格把 completeness denominator 當作完整 V1 翻譯分母。

---

## 9. V1 翻譯完成候選

翻譯工作應持續讓：

- `missing` → 0
- `unapproved` → 0
- catalog validation issues → 0
- `unresolvedDomains` → 0

但這些自動結果本身仍不等於 V1 正式完成。

還必須同時符合 V1 requirements，包括：

- 必要自動測試與 production build
- Level 1–2 完整人工 content verification
- Level 3 規定的抽樣人工驗收
- Hero flow / save / locale / sourcebook / Homebrew 等既定驗收
- 授權與發布條件
- 專案負責人最終批准正式發布

---

## 10. Batch 選擇原則

下一個 translation batch 優先選擇：

- coherent、可獨立驗收的 player-facing content slice
- 已有穩定 identity，或可在同批安全補齊 identity
- 能實際增加已核准翻譯量
- 能讓 completeness evidence 產生可驗證進展

避免：

- 為了盤點而盤點
- 為了漂亮的進度數字拆過多小批
- 建立平行的正式 progress denominator
- 把與本批無關的 shared architecture 重構一起做

---

## 11. Translation Worksheet / Approval Packet

記錄目前已驗證可用的實際工作方式，用於將第 3 節第 4–6 步落實為具體 artifact：

1. Reviewer 從 live canonical source／manifest evidence、現有 approved translations、glossary、Owner decisions 與現行 mechanical-variant authority 建立翻譯工作表。
2. **Pre-handoff classification gate：**交付 Owner 前，Reviewer 必須先將每一 row 分為 Owner-required 或 Reviewer-derived／mechanical；不得把所有 rows 一律標為 Owner 待定稿。Owner-required 限於新術語、新正式譯名、新 authored prose、改變語意的中文措辭、context-specific semantic choice，或無法依既有 authority 安全推導的真正翻譯選擇。
3. Reviewer-derived／mechanical 包含已核准譯文直接重用、singular／plural、`a/an`、大小寫、不改變語意的標點、plural `s`、dynamic placeholder 周圍純文法變化，以及已核准 terminology／presentation grammar 的純機械套用。這些由 Reviewer 依現有 authority 處理，不得要求 Owner 逐項重新核准。
4. 工作表應清楚分開 canonical English、AI／Reviewer suggestion、Owner-editable finalized zh-TW，並讓 Owner 辨識需要 action 的 rows 與已由 Reviewer 依 authority 處理的 rows。mechanical rows 不得維持為空白的「Owner finalized required」狀態、不得計入 Owner 尚待完成數量，且 instructions 不得預設要求 Owner 完成全部 rows；handoff summary 應回報實際需要 Owner 決定的 row count。可使用 decision／status column、分區／filter 或同等清楚的方法，不固定永久欄位名稱。
5. AI suggestion 不是正式譯文；Owner-required rows 的 finalized zh-TW 仍由 Owner 決定。Reviewer-derived mechanical rows 的 authority 來自底層已核准 translation／Owner decision 加上 Reviewer Principles 的 mechanical-variant permission，不需要 Owner 再逐 row 輸入。
6. Owner 回傳後，Reviewer 仍負責 completeness／blank、duplicate identity、row／identity alignment 與 clerical mapping 檢查，並可依新取得的 Owner 核心譯文補齊其衍生 mechanical variants；不得因此自行改變 Owner translation semantics。
7. 經確認後，可產生 machine-readable approved JSON／packet，包含：record count、canonical identity、approved zh-TW、SHA-256，給 Agent 作 exact implementation authority。
8. **Glossary Delta Gate：**Owner approval packet 收斂後，Reviewer 檢查本批是否產生新的 reusable approved terminology；只有已有明確 Owner／approved authority 的詞才同步至 `docs/translation/TRANSLATION-GLOSSARY.csv`。個別 ability／feature 名稱、一次性 authored prose、target sentence／template 不要求 mirror；真正新術語尚未核准時仍交 Owner 決定，不得自行加入。
9. XLSX／JSON 都是 handoff working material：不建立第二套正式 V1 denominator；不預設 commit 到 repository。
10. repository 正式 progress evidence 仍然是：manifest、catalog、completeness；glossary 仍只是 curated terminology evidence。
11. `docs/translation/TRANSLATION-GLOSSARY.csv` 是 curated reusable terminology evidence，不要求把每一筆 Skill／Language／authored-content record 全部 mirror 進 glossary。

## 12. 簡化版流程

一般情況：

**找出這批 canonical English → 確認 / 補齊 manifest → 專案負責人定稿中文 → Agent 寫入 catalog → 自動檢查缺漏 → 必要驗收 → 下一批。**

如果 manifest 已完整涵蓋：

**直接從翻譯開始。**

如果 manifest 少了一部分，而且可以安全補齊：

**在同一批補上，再繼續翻譯。**

如果 identity、traversal、scope 或風險需要獨立處理：

**由 Reviewer 依 Batch Contract 拆出必要的 technical denominator batch。**

## 13. Class Ability Authored Content

Class ability 的 calculated localization 一律 canonical-English-first：raw canonical English 經 canonical calculator 取得 calculated English，再以 raw canonical identity 取得 approved zh-TW，僅投影可安全證明的 calculated presentation change。zh-TW 不得送入 `AbilityLogic`、parser 或 calculator。

同一 ability 出現在 Hero Builder 與 Library 時，是兩條不同的 presentation path。Hero context 可使用 calculator 實際解析出的數值；Library／no-Hero 的 characteristic、potency、Presence、Recovery、Speed 等 expression 未解析時，保留 approved raw zh-TW，不得因缺少數值 fallback English。

projection 的結果限於三種：

1. calculator 已解析：投影其實際 canonical 結果。
2. canonical grammar 未變但仍 unresolved：保留 approved raw zh-TW，只投影安全 formatting。
3. unsupported structural rewrite：完整 fallback calculated English。

不得猜數字、在中文層重新計算，或輸出中英混合 partial result。規則同時適用於 Power Roll tier text 與 non-roll authored effect／prose；canonical calculated result 若新增如 `**slowed**` 的 Markdown emphasis，approved 中文也保留相同 emphasis。

已核准的 presentation 慣例為：ability section heading 中 `Spend` 譯為「花費」；authored prose 的 calculated damage／Stamina 寫作「N 點神聖傷害」、「N 點心靈傷害」、「恢復 N 點體力」。compact Power Roll 維持「N 神聖傷害」，不強制加入「點」。raw approved 中文中的「等於你氣場…／復元值／速度」等 expression 在 no-Hero 未解析時維持原文；解析後使用 calculator 實際數值，不寫成「等於 N」。

若 Hero Builder 與 Library 都 render，automated evidence 至少涵蓋代表性的 Hero 與 no-Hero production behavior、實際 production Class data／localization 與 rendered presentation／Markdown，並證明 English、canonical state／serialization 未變，且沒有 zh-TW 進入 calculator。slice-specific manifest test 只固定本 slice 的 identities、delta 或 domain contract，不得寫死不相關的 global `requiredCount` 或完整 `unresolvedDomains`；若 batch 改動 manifest denominator，最後變更後跑 full suite。完成單一 Class 不代表 `official-ability-authored-content` 完成，僅在整個 domain 完整 enumerate 後才能移除 unresolved。
