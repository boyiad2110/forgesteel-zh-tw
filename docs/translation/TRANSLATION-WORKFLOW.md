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

## 2.1 Repository-native Localization Pipeline Gate

Translation batch 必須使用 current repository pipeline，完成適用的 deterministic validation。Reviewer 的 Batch Contract 應列出適用 command 與 evidence；Agent final report 應回報 pipeline result。

`npm run loc:status` 從 live V1 manifest、production catalog 與既有 completeness / validation implementation 產生 status；`npm run loc:status -- --json` 提供同一份 machine-readable report；`npm run loc:verify` 則在 missing、unapproved 或 catalog issue 存在時失敗。這些 output 是 manifest / catalog / canonical authority 的衍生 report，不是第二個 translation denominator，也不得以 committed generated status artifact 取代 live analysis。

`unresolvedDomains` 與 integrity failure 不同：前者表示尚未完整 enumerate 的 V1 範圍，因此會使 V1 complete 為 false，但不會使已知 denominator 的 `loc:verify` 失敗。pipeline 不會自動判斷中文語意品質或授予 Owner approval；新術語、正式譯名與其他 semantic Chinese decisions 仍屬專案負責人 authority。

CLI/report 不取代 packet canonical-alignment、Glossary Delta 或其他 workflow-specific gate，除非未來該功能明確由 pipeline 實作並成為該 gate 的正式執行方式。

---

## 2.2 Repository-native Verification Primitives

repository 提供三層、各自解決不同問題的 verification primitive：

1. **Manifest／catalog integrity：**`npm run loc:status`、`npm run loc:status -- --json`、`npm run loc:verify`，以 live manifest／catalog／既有 completeness validation 提供 evidence。
2. **Locale／canonical-state differential safety：**`src/localization/test-support/localization-differential-invariants.ts`，只在 batch 實際有 locale、state 或 calculation risk 時使用。
3. **Approved packet canonical alignment：**`src/localization/test-support/packet-canonical-alignment.ts`，在 approved packet handoff／implementation preflight 時使用。

三者不互相取代：`loc:verify` green 不代表 packet canonical alignment 已完成；packet alignment PASS 不代表 locale switching／Hero state safety 已證明；differential harness PASS 也不代表 manifest completeness 或 packet authority 正確。manifest、catalog 與 completeness 仍是正式 translation denominator evidence，helper 不建立第二套 denominator；Owner 仍決定 semantic Chinese。不要為了工具而要求不相關 batch 使用不適用的 gate。

### Packet Preflight 與 Permanent Regression 的分工

approved packet canonical alignment 預設是 **handoff／implementation preflight evidence**。它回答的問題只有一個：

> 這份 approved packet 是否仍對應目前 live canonical source？

該 translation slice 已 merge 之後，permanent regression 的主要 evidence 應改為來自 live canonical source／independent expected evidence，並依序驗證：

> live canonical source／independent expected evidence → manifest → catalog → 適用的 public presentation behavior／locale／canonical-state assertions。

除非 Batch Contract 指出具體、可說明的特殊風險，否則不要求 permanent tests 永久保存或重播 historical packet revision 或 canonical hash map；該 evidence 的作用在 merge 當下已經實現，長期保留只會讓 regression 綁在一份歷史 snapshot 上，而不是綁在目前的 canonical truth。

packet verifier 本身保留，供 future packet preflight 使用。

本規則不降低 Owner semantic approval、manifest／catalog integrity、locale safety，或任何其他適用的 verification gate；expected evidence 的獨立性原則見 `docs/project-review-skill/RISK-AND-VERIFICATION.md`。

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

### Batch Cost Checkpoint

Reviewer 在固定 Batch Contract 前執行一次；目的是讓 batch 邊界反映實際成本與風險，而不是憑感覺切分。checkpoint 至少考慮：

- 本批需要的 Owner semantic decision 量；
- 涉及的 calculated／dynamic grammar families；
- 是否需要 presenter extension；
- class-specific public-behavior test 的成本；
- 鄰近 slice 是否真正共享 authority、risk 與 presentation architecture；
- artifact、Review、PR 等每批都會重複付出的固定成本。

明確界線：

- **不設 identity count、LOC、changed files 等硬數字門檻。** 「identities 太少」本身不是錯誤 batch 的判準。
- 小 slice 若有 risk、authority 或 dependency 隔離理由，仍可獨立成批。
- 不得為了攤平固定成本，把不相關內容或 shared architecture 硬塞進 translation batch。
- 「需要改 presenter」本身**不自動要求拆出 technical batch**：
  - existing bounded／identity-bound extension point 的擴充可留在同一個 translation batch；
  - 只有真正新增 cross-cutting shared architecture、parser／calculator boundary 或 fallback policy 時，才考慮 separate technical batch。

checkpoint 的產出是 Contract 中的 batch 邊界理由，不是新的 progress denominator。

---

## 11. Translation Worksheet / Approval Packet

記錄目前已驗證可用的實際工作方式，用於將第 3 節第 4–6 步落實為具體 artifact：

1. Reviewer 從 live canonical source／manifest evidence、現有 approved translations、glossary、Owner decisions 與現行 mechanical-variant authority 建立翻譯工作表。
2. **Pre-handoff classification gate：**交付 Owner 前，Reviewer 必須先將每一 row 分為 Owner-required 或 Reviewer-derived／mechanical；不得把所有 rows 一律標為 Owner 待定稿。Owner-required 限於新術語、新正式譯名、新 authored prose、改變語意的中文措辭、context-specific semantic choice，或無法依既有 authority 安全推導的真正翻譯選擇。相同 canonical English 跨多個 identities 本身不構成 mechanical relationship；語意或 presentation context 不同時，仍由 Owner 決定。
3. Reviewer-derived／mechanical 包含在相同相關 context、且既有 authority 支持下的已核准譯文直接重用、singular／plural、`a/an`、大小寫、不改變語意的標點、plural `s`、dynamic placeholder 周圍純文法變化，以及已核准 terminology／presentation grammar 的純機械套用。這些由 Reviewer 依現有 authority 處理，不得要求 Owner 逐項重新核准。
4. 工作表應清楚分開 canonical English、AI／Reviewer suggestion、Owner-editable finalized zh-TW，並讓 Owner 辨識需要 action 的 rows 與已由 Reviewer 依 authority 處理的 rows。mechanical rows 不得維持為空白的「Owner finalized required」狀態、不得計入 Owner 尚待完成數量，且 instructions 不得預設要求 Owner 完成全部 rows；handoff summary 應回報實際需要 Owner 決定的 row count。可使用 decision／status column、分區／filter 或同等清楚的方法，不固定永久欄位名稱。
5. AI suggestion 不是正式譯文；Owner-required rows 的 finalized zh-TW 仍由 Owner 決定。Reviewer-derived mechanical rows 的 authority 來自底層已核准 translation／Owner decision 加上 Reviewer Principles 的 mechanical-variant permission，不需要 Owner 再逐 row 輸入。Owner 仍可覆寫預先分類為 mechanical 的 Final value；最新 Owner Final zh-TW 依 identity 成為後續 packet authority。
6. Owner 回傳後，Reviewer 仍負責 completeness／blank、duplicate identity、row／identity alignment 與 clerical mapping 檢查，並可依新取得的 Owner 核心譯文補齊其衍生 mechanical variants；不得因此自行改變 Owner translation semantics。context-specific readings 不得壓縮為全域 glossary mapping，除非 Owner 已核准可重用的 standalone mapping。
7. 經確認後，可產生 machine-readable approved JSON／packet，包含：record count、canonical identity、approved zh-TW、SHA-256，給 Agent 作 exact implementation authority。
8. **Glossary Delta Gate：**本批 translation authority 收斂後，Reviewer 檢查本批是否產生新的 reusable approved terminology；若本批需要新的 Owner approval，於該 approval 收斂後作此決定。只有已有明確 Owner／approved authority 的詞才同步至 `docs/translation/TRANSLATION-GLOSSARY.csv`。個別 ability／feature 名稱、一次性 authored prose、target sentence／template 不要求 mirror；真正新術語尚未核准時仍交 Owner 決定，不得自行加入。
9. XLSX／JSON 都是 handoff working material：不建立第二套正式 V1 denominator；不預設 commit 到 repository。
10. repository 正式 progress evidence 仍然是：manifest、catalog、completeness；glossary 仍只是 curated terminology evidence。
11. `docs/translation/TRANSLATION-GLOSSARY.csv` 是 curated reusable terminology evidence，不要求把每一筆 Skill／Language／authored-content record 全部 mirror 進 glossary。

### Packet Source-Integrity Rule

試算表 render、visual preview 或 inspection output 只可作 review evidence；只要工具可能截斷或縮寫字串，它們就不是 packet generation 的 authority input。Reviewer 必須從 direct full cell values、lossless machine-readable worksheet export 或其他可取得完整值的來源產生 packet；canonical snapshot 與 Owner-approved zh-TW 都必須來自該完整值來源。snapshot 必須保留 leading／trailing whitespace、Markdown、punctuation、escaping 與 structured text，不得讓 synthetic ellipsis 或 abbreviated display value 成為 authority。`canonicalSha256` 必須由完整 canonical value 計算；packet approval 前，Reviewer 必須將每一筆 packet identity、canonical snapshot 與 hash 對 live canonical source 作 machine comparison。alignment declaration 不得只以 packet 內部 self-consistency 為依據。

### Packet Canonical Alignment Gate

approved implementation packet 交付 Agent 前，Reviewer 必須將**全部** packet canonical identities／snapshots 與 live canonical extraction／manifest authority 做 machine-verifiable comparison，並回報 `N/N aligned` 與 zero drift。比較須保留 identity-sensitive 的 leading／trailing newline、whitespace、Markdown、punctuation、escaped 與 structured text；不得只靠目視比對。

若有 mismatch，先修正 Reviewer artifact authority，Agent 不得開始 implementation 或靜默重建內容。

#### Alignment timing（三層）

alignment 不是流程末端的一次性檢查，固定在以下三個時點執行：

1. **Reviewer → Owner worksheet handoff 前。**
   對 intended live canonical slice 與 worksheet／packet canonical evidence 做 machine alignment。任何 newline／whitespace／Markdown／snapshot／hash drift 先修 Reviewer artifact，再交 Owner。Reviewer artifact defect 屬 Reviewer 自行修正範圍，不得包裝成 Owner decision 或 semantic question。
2. **Owner finalization 後、approved implementation packet freeze／Agent handoff 前。**
   對 final packet 再做一次 alignment，涵蓋 normalization、Owner override 記錄與 packet generation 可能引入的 drift。這是 packet freeze 的前置條件。
3. **Agent implementation preflight。**
   保留現有 preflight（見 `docs/project-review-skill/AGENT-TASK-CONTRACT.md` 的 Translation Packet Preflight）作 defense in depth。它是最後一道防線，**不應**是正常流程第一次發現 Reviewer packet defect 的地方；若 preflight 首次發現 drift，除了依既有規則 STOP，還代表前兩層 timing 未被執行。

三層都可使用現行的 `src/localization/test-support/packet-canonical-alignment.ts`，或明確等價的 machine comparison。本 gate 不新增 CLI、npm script 或新 helper；發現的 mechanical drift 依 **Packet Revision Rule** 處理。

### Packet Revision Rule

Reviewer packet 的 canonical snapshot／transcription 若有機械錯誤，而 approved zh-TW semantics 未變，必須發行新 packet revision、將舊 revision 標記為 superseded、記錄改變的 canonical snapshot，並更新 packet identity／hash。不得靜默改舊 approved artifact；也不得只因這種 mechanical Reviewer correction 重開 Owner translation approval。若 zh-TW semantics 會變，仍依正常 Owner authority。

### Mandatory Glossary Delta Decision

本批 translation authority 收斂後，packet／batch 必須明確記錄其中一項；若需要新的 Owner approval，則在該 approval 收斂後作此決定：

- `glossaryDelta =` exact approved reusable entries；或
- `glossaryDelta = []` 加簡短理由。

個別 ability／feature name 不會自動成為 glossary term；有 approved authority 且確有 cross-record reuse 的 class-defining name 才可能符合。不得從 context-only prose 發明 standalone mapping。

### Agent Handoff Additions

implementation handoff 另須列出 current packet revision／identity、canonical alignment result、exact glossary-delta decision，以及（適用時）calculated presentation matrix／required representative production evidence。這些是 handoff evidence，不建立第二套正式 V1 denominator。

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

### Calculated Presentation Matrix

Agent Task 前，Reviewer 必須辨識 live source 中 materially distinct 的 dynamic presentation grammar families。matrix 可輕量、毋須成為 repository artifact，但每個 family 至少記錄：

- representative localization identity；
- canonical dynamic grammar family；
- Hero／no-Hero production path；
- 預期安全 zh-TW projection 或 fallback；
- 所需 representative production evidence。

只分類實際存在於該 batch 的 family；例如 characteristic-based values、half／twice Speed、potency、damage、condition Markdown emphasis、push／pull／slide、`vertical pull` 等 modified movement phrase、calculated content 周圍需保留的 structural phrase，或 unsupported calculated rewrite fallback。不得把此清單變成每批必跑的 checklist。

## 14. Class／Subclass Level 1 Non-Ability Required Identity

本節固定「這個 slice 的 required identities 要怎麼可靠 enumerate」。它不建立第二套 denominator：正式 translation denominator 仍然是 manifest + catalog + completeness，依第 2 節與第 7 節。

### Default：shared bounded walk

Class／Subclass 的 Level 1 non-Ability Feature tree，預設依 **current repository shared bounded-walk semantics** enumerate。production 與 test 端各有一份實作，兩者是刻意分離的獨立 evidence，不可互相取代。

current semantics 以 live code 為準；本文件不複製一份可能過期的完整型別實作，只固定 stable contract：

- **Ability boundary**：Ability 節點不貢獻 identity，也不被下探；其 authored content 屬各 class 自己的 ability slice。
- **non-Ability player-facing fields**：其餘每個節點貢獻自己的 name，以及非空的 description。
- **HeroicResource gain triggers**：HeroicResource 另外貢獻每個 gain 的 trigger，以該 gain 在 list 中的位置定址；空 trigger 不帶讀值而跳過，其餘 trigger 維持原 index。
- **bounded descent**：只從 Choice 的 options 各自的 feature 與 Multiple 的 features 下探；不走其他 Feature type 的 selection 或 child data。

canonical values 依原樣記錄，不 trim、不 normalize、不改寫。

### 不得做 class-specific arbitrary exclusion

identity 只要落在 shared bounded walk 內，就是 required。不得因為某個 class 覺得它是 generated、composed、grouping wrapper 或「看起來重複」而自行排除。

**已合併 precedent：Tactician 的 Mark Multiple grouping（`tactician-1-5`）。** 它的 description 由 Feature factory 從兩個 ability 子節點的名稱組成，而不是直接 authored；即使如此，FeaturePanel 仍把它 render 成這個 grouping 自己的 player-facing 文字，因此它與其他讀值一樣 required。canonical English 是直接寫的還是 factory 組的，不改變它是否 player-facing。

判準是**實際 rendered player-facing presentation**，不是 canonical 值的產生方式。

### Explicit supplemental fields

若 current model 加上實際 player-facing presentation 證明某 canonical field 是 required，但 shared bounded walk 本身不涵蓋它，該 field 可作為 **supplemental identity，明確加入該 slice 自己的 denominator**。

supplemental 必須具備：

- stable localization identity；
- live canonical source；
- 支持「它確實 player-facing」的最小足夠 evidence。

不得以「這個 class 比較特殊」這類模糊理由加入。

**已合併 precedent：Shadow Insight 與 Talent Clarity 的 HeroicResource `details`。** 兩者都在各自的 completion denominator 明列 `details` 並帶 duplicate-identity guard；shared walker 沒有因此被擴張。

這兩筆只是 precedent：`details` 不是唯一合法的 supplemental field，所有 HeroicResource 的 `details` 也不自動 required。仍以該 field 實際的 player-facing presentation contract 為準。

### 不為單一 class 擴張 shared walk

出現 supplemental field 時，不得只為了消掉那一筆 explicit supplement 就改 shared walker。多一筆明列的 supplement 是 bounded 且可審查的；擴張 shared traversal 則會同時改變所有既有 slice 的 denominator。

只有在 evidence 顯示該 field 是**跨 class 的共同 traversal contract**，而且該 Batch 明確授權 shared-architecture change 時，才納入或另開適當的 technical batch。在 translation batch 中途改 shared traversal semantics，不是本節允許的路徑。

### 與其他 identity family 的邊界

本節只管 Class／Subclass Level 1 **non-Ability** slice。下列各有既有 identity 與 workflow，不被本節取代：

- subclass metadata，例如 `subclassName` 與 subclass 自身的 element fields；
- Class／Subclass 的 authored Ability fields；
- calculated presentation，依第 13 節。

manifest + catalog + completeness 仍是唯一正式 translation denominator。bounded walk 與 supplemental rule 只回答「這個 slice 要怎麼可靠 enumerate」，不建立平行 inventory，也不改變第 6 節對 `unresolvedDomains` 的處理。

### 不 retroactive churn

不為了形式一致回頭重開已完成且 frozen 的 slice。本規則適用於：

- 未來的新 batch；以及
- 既有 slice 因其他 substantive work 被重新觸及時。

若人工驗收或後續 review 發現既有 slice 真的漏掉 V1 required content，依第 6 節處理：承認 denominator 不完整、補回 required identity、重跑 completeness。那是實質缺漏修補，不是形式一致性重構。
