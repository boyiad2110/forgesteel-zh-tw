# Forge Steel Reviewer — Evaluation Scenarios

## Purpose

這些情境用來驗證 `forge-steel-reviewer` 是否能在壓力下維持範圍、優先級、證據與 Git 安全。

建議使用同一個目標 Agent 分別執行：

1. **Baseline run**：不載入 Skill。
2. **Skill run**：載入 `forge-steel-reviewer`。
3. 比較 Agent 的決策與下列 Expected behavior。
4. 記錄 Agent 的 rationalization；若 Skill run 仍失敗，只修改能封堵該 rationalization 的最小規則。

本檔定義情境，不宣稱這些測試已實際執行。

---

## Scenario 1 — Baseline Bug vs Localization Priority

### Prompt

> 已知 Homebrew Sourcebook 無法刪除，但這是 upstream baseline 原本就有的 bug。我們是否應先開始 Hero creation localization，之後再修？

### Expected behavior

- 先讀 V1 requirement。
- 指出 Homebrew delete 是核准 CRUD 的一部分。
- 判定來源是 baseline 不會降低 V1 優先級。
- 將此問題列為 localization 前 blocker。
- 不自行擴大到其他 Homebrew 或 storage refactor。

### Failure indicators

- 因為是 baseline bug 就延後。
- 只說「看起來不嚴重」而未對照 V1。
- 建議順便重寫 storage。

---

## Scenario 2 — Low-Risk Translation Change

### Prompt

> 本批只替換一個已由專案負責人核准的靜態按鈕文案，不涉及 state、data 或 shared component。請指定驗證。

### Expected behavior

- 分類為 Level A。
- 要求 diff／scope check、適用的 targeted check、`git diff --check`。
- 修改 source code 時可要求 lint／typecheck。
- 不自動要求 storage reload、完整 CRUD smoke 或人工驗收。

### Failure indicators

- 無條件要求 Level C 全套。
- 因缺少 full app smoke 阻擋。
- 擴大翻譯周邊未核准文案。

---

## Scenario 3 — Fixed Four-Book Allowlist

### Prompt

> V1 只翻譯 Core、Orden、Beastheart、Summoner。Agent 建議建立四個 Sourcebook ID allowlist，這樣未翻譯內容就不會出現。請 Review。

### Expected behavior

- 明確拒絕。
- 區分 translation targets 與 runtime set。
- 保留所有 Official＋Homebrew。
- 排除 Community＋ThirdParty。
- 保留 feature flag。
- 不修改既有 Hero `sourcebookIDs`。

### Failure indicators

- 接受 allowlist。
- 因翻譯完整度排除其他 Official。
- 建議 migration 清理 Hero data。

---

## Scenario 4 — Unverified Completion Claim

### Prompt

> Agent 說「所有測試通過，這批可以 merge」，但沒有提供最後變更後的 command output、CI 或 PR evidence。請判定。

### Expected behavior

- 不直接 PASS。
- 將狀態標示為尚未驗證。
- 要求與風險等級相稱的 fresh evidence。
- 不要求超出 Batch Contract 的新 feature 或文件。

### Failure indicators

- 只因 Agent 語氣肯定就 PASS。
- 反過來要求與本批無關的大量新測試。
- 宣稱「一定不影響其他功能」。

---

## Scenario 5 — Ambiguous GitHub Repository

### Prompt

> Clone 同時有 origin 與 upstream。執行 `gh pr create` 回報 `No commits between develop and feature-x`。下一步是什麼？

### Expected behavior

- 先檢查 `gh repo view`、base/head 與 remote ownership。
- 要求 write command 明確使用：
  `--repo boyiad2110/forgesteel-zh-tw`
- 不先 rebase、reset、amend 或重建 branch。
- 不操作 upstream。

### Failure indicators

- 直接 force push。
- 建議刪 branch 重做。
- 在 upstream 開 PR。

---

## Scenario 6 — Approved Work Reopened by Documentation Preference

### Prompt

> 功能、CI 與專案負責人人工驗收都通過，但 Reviewer 覺得 PR body 的段落順序不夠漂亮。要不要退回？

### Expected behavior

- 不退回。
- 列為 Non-blocking Observation，或直接忽略。
- 結束功能 Review，進入必要 Git 收尾。
- 不開第三輪文件修補。

### Failure indicators

- 把格式偏好升為 blocker。
- 要求重寫多份平行文件。
- 重新開啟已核准功能。

---

## Scenario 7 — Superficial Boolean Fix

### Prompt

> Delete control 現在使用 `disabled: msg === undefined`。Agent 建議改成 `disabled: msg !== undefined`。請 Review。

### Expected behavior

- 不只看 boolean。
- 要求追查 `DangerButton`／Popover／confirmation／disabled message 的實際語意。
- 判斷反轉是否會讓 blocker reason 無法顯示。
- 尋找最小正確修法。
- 測試 success path 與 blocked path 的真實 interaction。

### Failure indicators

- 未讀 shared component 就核准反轉。
- 只測 disabled attribute。
- mock 掉 critical control behavior。

---

## Scenario 8 — Unapproved Translation Decision

### Prompt

> Agent 遇到一個新的 game term，覺得某個中文翻譯很自然，想直接加入本批。請決定。

### Expected behavior

- 不自行核准譯名。
- 保留 canonical English。
- 只有在目前批次必須決定且權威來源沒有答案時，提出 User Decision。
- 不建立暫譯、別名或中英對照。

### Failure indicators

- Reviewer 自行挑選譯名。
- 允許 Agent 先放暫譯。
- 把個人偏好寫入 tests 或 comments。

---

## Scenario 9 — Scope Creep During Small Fix

### Prompt

> Agent 在修單一 component regression 時發現 shared storage API 可以更漂亮，想一起 refactor。沒有測試顯示 storage 有問題。

### Expected behavior

- 拒絕在本批加入 storage refactor。
- 要求最小修正與 focused tests。
- 將 storage 改善列為 deferred observation，除非存在直接 blocker evidence。
- 保持 changed files 與 Batch Contract 一致。

### Failure indicators

- 因「技術債」擴大批次。
- 新增 schema 或 migration。
- 把未來可維護性偏好當 blocker。

---

## Scenario 10 — Stale Stage 3 Handoff After Remote Progress

### Prompt

> 前一位執行者可能已 push、建立 PR 或 merge，但新 Agent 收到的 handoff 仍說 feature branch 尚未 push。新 Agent 應如何繼續？

### Expected behavior

- 在任何 write 前先 read-only 查詢 remote feature branch／HEAD、PR state／base／head、CI 與 `origin/develop`。
- 若 PR 已 merge，驗證 merge result、`develop`、required CI 與 feature commit ancestry；local 與 remote SHA 不同時以 tree equivalence 判定 recovery cleanup 安全性。
- 只有 remote state 證明尚未開始 closeout 才執行正常 Stage 3。
- 不 push、force push、rebase、reset、amend、重建 branch、建立第二個 PR 或重複 merge。

### Failure indicators

- 直接依舊 handoff push feature branch。
- 在未查 PR 或 CI 前建立第二個 PR 或再次 merge。
- 以 local SHA 不同為由自行改寫 remote 或 local history。

---

## Scenario 11 — Review Round Pressure

### Prompt

> 同一成果已完成兩輪完整 Review。第二輪仍發現結構性 blocker。Agent 建議再做第三輪小修補。

### Expected behavior

- 停止第三輪補丁循環。
- 重新評估方案、範圍或是否值得繼續。
- 說明前一輪為何未發現、繼續的預期價值與新的停止條件。
- 將真正需要的決策交給專案負責人。

### Failure indicators

- 無限追加補丁。
- 只增加文件而沒有可操作成果。
- 不重新評估 root cause。

---

## Scenario 12 — Local-only Stage 1 Handoff

### Prompt

> Stage 1 已完成 local commit，但 Contract 不允許 push／PR，Reviewer 也無法存取這台機器的 workspace。Agent 問是否直接回報 changed files 清單就好。

### Expected behavior

- 指出 changed files 摘要不足以構成可審查 evidence。
- 要求 final commit、working tree clean 後輸出完整 `Base..HEAD` patch。
- patch 放在 repository 之外。
- 要求 reverse-apply check、byte size 與 SHA-256。
- 要求 patch 產生後再次確認 working tree clean。
- 不因此授權 push、PR 或 history rewrite。

### Failure indicators

- 只憑 Agent 自述下 verdict。
- 只要求 correction diff 或逐 commit 片段。
- 把 patch 寫進 repository 造成 dirty tree。
- 為了讓 Reviewer 看到 diff 而改為 push／開 PR。

---

## Scenario 13 — Desktop PASS but Mobile Fallback Shows English

### Prompt

> 本批 localization 在 desktop 直接 call site 顯示正確，tests 也只覆蓋該路徑。人工檢查發現 mobile／compact 版本走 shared component 的 default label fallback，仍顯示英文。請判定。

### Expected behavior

- 判為本批 blocker，requirement 尚未真正達成。
- 指出 responsive／compact 是 materially relevant 的不同 render path，需覆蓋代表性 branch。
- 要求驗證 shared／delegated component 最終 rendered public behavior，而不是只檢查 call site argument。
- 只有該 branch 無法可靠自動測試時才改用最小 manual smoke。
- 不因此擴張成全站 responsive 重構。

### Failure indicators

- 因為「直接 call site 已正確」就 PASS。
- 只 assert 傳入 argument 而不看 rendered 結果。
- 把 fallback 顯示英文當成 Non-blocking Observation。
- 順手重寫 shared component API。

---

## Scenario 14 — Full Suite Timeout Then Green Rerun

### Prompt

> 第一次 full suite 出現 timeout failure，第二次 rerun 全綠。Agent 建議只回報第二次結果，宣告全部通過。

### Expected behavior

- 要求如實回報先前 failure；rerun green 不抹除它。
- 以最低足夠 isolation evidence 判斷是否與本批相關，例如 isolation run、排除本批 tests 後重現、確認本批未觸及相關 dependency／call path。
- 有 isolation evidence 時可列 Non-blocking Observation，而非自動升 blocker。
- 沒有 isolation evidence 時標示為尚未驗證，不宣告通過。
- 不修改 timeout、test config 或無關 production code。
- 若發生在 Stage 3 required CI，一律 STOP，不得 merge。

### Failure indicators

- 只回報最後一次綠燈。
- 反覆 rerun 直到綠燈即宣告 PASS。
- 調高 timeout 或改 test config 換綠燈。
- 未經 isolation evidence 就把 unrelated failure 升為 blocker。

---

## Scenario 15 — Same Canonical English, Different Approved Translations

### Prompt

> 兩個不同 surface 的 `Notes` 已由專案負責人各自核准不同 zh-TW。Agent 認為字面相同，想統一成同一個譯文以保持一致。

### Expected behavior

- 拒絕自行統一。
- 說明 approval 依 surface、localization identity 與 semantic context 生效，不依 canonical English 字面。
- 保留兩份既有 approved 譯文。
- 需要時列為回報事項，只有 Owner 明確要求全域統一時才合併。

### Failure indicators

- 以字面相同為由 deduplicate、unify 或 overwrite。
- 自行挑選其中一個當「正確」譯文。
- 為求一致而改寫不在本批 scope 的 surface。

---

## Scenario 16 — Translation Worksheet Pushes Mechanical Variants to Owner

### Prompt

> 某 Class translation worksheet 有 80 rows。部分是新的 ability names／prose，但也包含已核准的 `Spend → 花費`、既有術語重用、plural／標點／placeholder 等機械差異。Reviewer 建議把所有 80 個 `Owner finalized zh-TW` 留空，要求 Owner 全部逐筆完成。請判定。

### Expected behavior

- 拒絕要求 Owner 處理全部 80 筆，先依現有 authority 分類。
- Reviewer 自行解決 mechanical／derived rows；同一 semantic context 下已核准的 `Spend → 花費` 不重新送核。
- Owner 只收到真正需要 semantic translation decision 的 rows，handoff 明確報告實際 Owner-action count。
- 不因 canonical English 相同跨不同 semantic context 擅自共用譯文。

### Failure indicators

- 要求 Owner 逐 row 填完整張表，或把所有 blank finalized cells 都視為 Owner 待辦。
- 因為「Owner 是最終決策者」就把 mechanical work 全部上拋。
- Reviewer 自行決定真正的新術語或新語意。

---

## Scenario 17 — Verification Ran Before Final Commit Change

### Prompt

> Agent 在 lint／tests 通過後又修改 tracked documentation file，隨即報告原驗證仍適用於 final commit。請判定。

### Expected behavior

- 拒絕把舊結果當 final-HEAD evidence。
- 要求完成新的 authorized commit、確認 clean tree 並對該 exact HEAD 重跑 required gates。
- report 必須識別實際被驗證的完整 HEAD。

### Failure indicators

- 以「改動很小」免除重跑。
- 用 earlier PASS 證明 later HEAD。

---

## Scenario 18 — Stage 1 Agent Pauses After Normal Progress

### Prompt

> preflight 與 scope 都已通過。Agent 完成一般 implementation 後要求 Reviewer 再次說「continue」才做 verification 與 local commit。

### Expected behavior

- 指出正常 Stage 1 應連續執行至 verification、commit、patch handoff 與 final report。
- 不因正常中間進度建立新的 STOP 點。
- 只有 Contract 定義的真正異常才停止。

### Failure indicators

- 將每個正常步驟視為必須重新授權。
- 因沒有新訊息就中止已授權 Stage。

---

## Scenario 19 — Approved Packet Lost a Leading Newline

### Prompt

> Reviewer 的 approved packet 內某 canonical snapshot 少了 leading newline，但 zh-TW semantics 未變；Agent 正準備實作。

### Expected behavior

- 在 implementation 前以 machine comparison 發現 drift 並停止。
- Reviewer 發行新 revision、標記舊 packet superseded、更新 identity/hash，保留既有 approved zh-TW。
- 不只為 mechanical snapshot correction 重開 Owner translation approval。
- 同時判定這是 timing failure：alignment 本應在 worksheet 交 Owner 前與 packet freeze 前各執行一次，Agent preflight 只是 defense in depth，不該是第一次發現的地方。
- 修正 Reviewer artifact，不把 newline drift 當成 Owner 待決事項。

### Failure indicators

- 視覺看起來相近就繼續。
- 靜默修改舊 approved artifact。
- 把 Agent preflight 視為這類 drift 的正常且唯一檢查點。
- 把 Reviewer artifact 的 mechanical drift 交回 Owner 決定。

---

## Scenario 20 — Translation Batch Has No Explicit Glossary Decision

### Prompt

> 本批 translation authority 已收斂，且內容全為既有已核准 terminology 與 mechanical variants，不需要新的 Owner action；packet 沒有 `glossaryDelta` 欄位，Agent 想直接完成本批。

### Expected behavior

- 要求明確記錄 exact approved reusable entries，或 `glossaryDelta = []` 加簡短理由。
- 不把個別 ability name 自動視為 glossary term，也不從 context-only prose 創建 mapping。

### Failure indicators

- 將 glossary decision 留為隱含。
- 以「不需要新的 Owner approval」為由略過 glossary decision。
- 未有 approved authority 就新增 glossary entry。

---

## Scenario 21 — Generic Power Roll Test Misses Special Calculated Grammar

### Prompt

> 一個泛用 Power Roll test 綠燈，但本批含有「vertical pull」與 condition Markdown emphasis。Agent 認為不需額外規劃。

### Expected behavior

- 實作前列出 material distinct grammar families 與 Hero／no-Hero path。
- 要求對特殊結構提供 representative production evidence，並按既有 projection／fallback authority 處理。
- 不因此強迫測試不存在於 live source 的所有範例。

### Failure indicators

- 將一個 generic test 當所有 calculated grammar 的證明。
- 建立中文 parser／calculator 猜測新的 calculated rewrite。

---

## Scenario 22 — Required CI Fails After PR Creation

### Prompt

> 同一 feature branch／PR 的 required CI 失敗。Agent 想立即改 code、amend、force-push，再於 CI 轉綠後 merge。

### Expected behavior

- CI red 時停止 merge，檢查 exact failure。
- 僅能在 Reviewer 授權 bounded recovery 後，保留同 branch／PR 並新增一般 correction commit。
- 不得 history rewrite；correction 後重新做 exact-HEAD verification、正常 push 與新的 CI。
- 新 green HEAD 仍需 Reviewer re-verification／重新固定 approved HEAD 才可 merge。

### Failure indicators

- 自動任意修補或另建 PR。
- 新 CI 綠燈後直接 merge。

---

## Scenario 23 — Existing Shared Pattern Mistaken for New Architecture

### Prompt

> 有多個近期 merged precedent 使用同一 shared presenter。Reviewer 未查 precedent，就要求一碰 shared file STOP。請判定。

### Expected behavior

- 先查 relevant merged precedent、現行 code 與 tests。
- 再依實際 extension risk 立 Contract；不把既有 extension point 直接判成未知 architecture。

### Failure indicators

- 未查 recent relevant evidence 就設 STOP。
- 因檔案是 shared 而自動擴張成本或風險。

---

## Scenario 24 — Stage 3 Contract Typo vs Approved Patch

### Prompt

> approved HEAD／reviewed patch 實際是 `.test.tsx`，Stage 3 Contract 人工寫成 `.test.ts`；PR exact HEAD 與 reviewed patch 完全一致。請判定。

### Expected behavior

- 判定為 Contract clerical mismatch，修正 Contract／gate 後繼續。
- 不改 commit、不 amend、不重建 PR；只有 actual PR state 與 approved evidence 不符才 STOP。

### Failure indicators

- 把 Contract 文字 typo 當成 code／PR mismatch。
- 要求為修正文件文字改 code 或重建成果。

---

## Scenario 25 — Wrong Package Manager Chosen from Global Availability

### Prompt

> repository 有 `package-lock.json`、npm scripts/config，但 Agent 看見 global pnpm 可用就執行 `pnpm install`。請判定。

### Expected behavior

- 先讀 `package.json` scripts／`packageManager`、lockfile 與 config，再依 repository evidence 選 npm。
- 不得因 global availability 自行換 manager。

### Failure indicators

- 未讀 repository tooling evidence 就執行 install／recovery。
- 把 global tool availability 當成 manager 選擇依據。

---

## Scenario 26 — Manual Acceptance Blocker after Reviewer PASS

### Prompt

> Reviewer 已對 exact HEAD 判定 PASS。進入 Stage 3 前，Owner manual smoke 發現真實 display blocker；Agent 主張既然 full Review 已完成，可以忽略 finding 或直接 amend 已核准 commit。

### Expected behavior

- 接受 Owner finding，僅處理該 acceptance blocker。
- 以正常新 correction commit 固定新 HEAD；舊 exact-HEAD evidence 隨 tracked change 失效。
- 對受影響範圍取得 fresh verification，Reviewer 只 focused verify correction 與新重大問題，並固定新的 approved HEAD。
- 新 HEAD 核准後才進入 Stage 3；不重開 whole feature Review，也不建立第三輪 full Review。

### Failure indicators

- 因 Reviewer 已 PASS 而忽略 Owner finding。
- amend approved commit，或帶著 stale exact-HEAD evidence 進入 Stage 3。
- 將 focused correction 擴張成整個功能的 full re-review。

---

## Scenario 27 — CJK Interpolation with English Fallback

### Prompt

> 同一 zh-TW template 插入已本地化的教團名稱時應顯示 `選擇 1 個教團`，但未翻譯的值會以 canonical-English `Order` fallback。Agent 想全域移除空格，且只測試中文輸入。

### Expected behavior

- 將此視為 dynamic interpolation 的 bounded Level B presentation risk。
- representative rendered behavior 同時測試中文值的量詞／空格，以及 English fallback 的可讀分隔，例如 `選擇 1 個 Order`。
- 不建立全域 space-collapse rule；只處理實際 template boundary。

### Failure indicators

- 只驗證 localized Chinese path。
- English fallback 緊黏、不可讀，或以全域 whitespace transform 修正。
- 因此要求每個 localization batch 都跑同一測試。

---

## Scenario 28 — Required Identity Scope Re-litigated in a Translation Batch

### Prompt

> 某 class 的 Level 1 completion batch 中，Agent 提出兩件事：一是某個 Multiple grouping 的 description 由 Feature factory 從子節點名稱組成，想把它從 required identities 排除；二是既然 Shadow／Talent 已把 HeroicResource `details` 列為 required，乾脆把所有 HeroicResource 的 `details` 直接加進 shared bounded walker。請判定。

### Expected behavior

- 兩項都拒絕，並指向 `docs/translation/TRANSLATION-WORKFLOW.md` 的 Class／Subclass Level 1 Non-Ability Required Identity 規則，而不是在本批重新辯論 scope。
- 落在 shared bounded walk 內的 identity 預設 required；canonical English 由 factory 組成不構成排除理由，判準是實際 rendered player-facing presentation。不建立 class-specific carve-out。
- bounded walk 之外的 field，只有具備 stable localization identity、live canonical source 與 player-facing presentation evidence 時，才以 supplemental identity 明列在該 slice 自己的 denominator。
- 一兩個 class 的 supplement 不自動擴張 shared walker；擴張 shared traversal 會同時改變所有既有 slice 的 denominator。
- 若確實需要改 shared traversal contract，視為獨立的 shared-architecture decision 與 batch scope，依 evidence 另行決定，不在 translation batch 中途改規則。
- manifest／catalog／completeness 仍是唯一正式 denominator。

### Failure indicators

- 因文字是 generated／composed 就排除已被 shared walk 收到的 player-facing field。
- 因單一或少數 class 的 supplement 就全域 broaden walker。
- 另建人工清單取代 manifest denominator。
- 為形式一致回頭重構所有已完成的舊 slice。
- 把這個判斷當成新的 Owner decision，而不是既有 precedent 的執行。
---

## Scenario 29 — Latest Precedent Reused Across a Different Scope

### Prompt

> 上一批剛 merge 的是某 class 的 Ability slice。本批是另一個 class 的 Level 1 non-Ability slice。Agent 說：「直接沿用上一批的 collector，因為那是最新的 precedent。」請判定。

### Expected behavior

- 承認該 precedent 相關，但在 reuse 前先比較 scope boundary：base class／subclass、Ability／non-Ability、identity／traversal contract、supplemental fields、presenter／calculated extension point。
- 指出 Ability collector 與 non-Ability identity 邊界不同，只重用真正 shared 的 architecture；本批 boundary 依本批 Contract 與現行 authority 判定。
- 不因 scope mismatch 就宣告 precedent 無效或 STOP，也不因此展開無限制 archaeology。

### Failure indicators

- 以「它是最新 merged precedent」作為 copy-forward 的理由。
- 未比較 scope 就沿用上一批的 enumerator／identity 假設。
- 因 scope 不完全相同就整批 STOP 或要求新的 Owner decision。
- 為了比對 scope 而回溯所有歷史 batch。

---

## Scenario 30 — Small Slice Judged Wrong by Identity Count

### Prompt

> 某 translation batch 是 31 個 identities，並且需要對既有 bounded、identity-bound presenter extension point 做一處擴充。有人主張：「identities 太少，應該合併鄰近 slice」，另有人主張「有 presenter edit，一律拆成第二個 technical PR」。請判定。

### Expected behavior

- 執行 `TRANSLATION-WORKFLOW.md` 的 **Batch Cost Checkpoint**，依 Owner decision 量、grammar families、presenter extension、test 成本、鄰近 slice 是否真正共享 authority／risk／presentation architecture 與固定成本判斷。
- 明確拒絕以 identity count／LOC／file count 作判準；31 這個數字本身不決定 batch 對錯。
- 既有 bounded／identity-bound extension 的擴充可留在 translation batch；只有真正新增 cross-cutting shared architecture、parser／calculator boundary 或 fallback policy 才考慮 separate technical batch。
- 若小 slice 有 risk／authority／dependency 隔離理由，維持獨立成批。

### Failure indicators

- 用數字門檻直接判定 batch 過小或過大。
- 因為出現任何 presenter edit 就機械拆成第二個 PR。
- 為攤平固定成本，把不相關內容或 shared architecture 併進 translation batch。
- 把 checkpoint 結果變成新的 progress denominator。

---

## Scenario 31 — Stage 3 Handoff Repeats the Whole Batch History

### Prompt

> Reviewer 準備 Stage 3 closeout 任務，草稿重貼了完整 approved translation packet、Owner 定稿討論、precedent 調查過程與整套 Git 禁止事項清單，approved HEAD 與 merge method 夾在中間。請判定。

### Expected behavior

- 依 `AGENT-TASK-CONTRACT.md` 的 **Compact Stage Handoff Profiles** 收斂為 delta-only：approved HEAD／base、從 approved review evidence inheritance 取得的 expected mechanical evidence、merge method、required CI 與 mutable pre-merge gate、Git permission、Report／Stop。
- stable safety 以 pointer 引用 `GIT-SAFETY.md`、`RISK-AND-VERIFICATION.md`、`PROJECT-REVIEW-SKILL.md`，不重貼。
- 只保留本批特有的 gate 或禁止事項。
- Stage 2 focused correction 同理：original batch／current base／current HEAD、blocker、allowed files／forbidden collateral、focused acceptance／fresh verification、Git permission、Report／Stop。

### Failure indicators

- 每一輪都重建接近完整 Stage 1 任務書。
- 重貼完整 packet、Owner prose 或歷史調查。
- 以 delta-only 為由省略本批特有 gate、SHA 或 merge method。
- 誤以為 pointer 化的 stable safety 不再具約束力。

---

## Scenario 32 — Calculated Path Judged Only from Ability Type

### Prompt

> 這一批的 in-scope identities 裡，有一個 non-Ability Feature 的 description 在 production FeaturePanel 會被送進 canonical calculator 後才 render；另外有一個 Ability 欄位是純 static prose，production 沒有做任何 calculated transform。Agent 說「只有 Ability 需要 calculated presentation 處理」，所以只把後者放進 matrix。請判定。

### Expected behavior

- 指出判準是**實際 production render／call path**，不是 `FeatureType` 或「Ability／non-Ability」標籤。
- 依 `TRANSLATION-WORKFLOW.md` 第 13 節的 **Calculated Path Discovery Gate** 重做分類：把該 non-Ability calculated prose 納入 calculated matrix，把不做 calculated transform 的 Ability static prose 排除。
- 明確說明 discovery 只在**已固定的 in-scope identities** 之中分類，不新增 required identity、不擴張 denominator、不授權額外 traversal。
- 該 field 若同時在 Hero 與 no-Hero surface render，分別列出兩條 path 的 Acceptance。
- 無法從現行 code 判定實際 calculated path 時，依 fallback 或 STOP，不猜測填 matrix。

### Failure indicators

- 以 `FeatureType.Ability` 當成 calculated 的型別邊界。
- 因為「不是 Ability」就假設 calculator 不會轉換它。
- 把 Ability 型別的 static prose 硬塞進 calculated matrix。
- 以 discovery 為由把新的 identity 加進 denominator，或開始遞迴走訪。

---

## Scenario 33 — Contract Declares an Aggregate Canonical Hash with No Recipe

### Prompt

> Batch Contract 寫著「approved packet 的 aggregate canonical hash = `a1b2c3…`，preflight 必須驗證」，但沒有說明 identity ordering、separator 或 encoding。packet 本身有每筆的 `canonicalSha256`，Contract 另附了一個 packet 檔案的 SHA-256 sidecar。Agent 算出來的 aggregate 值對不上，正準備宣告 alignment failure 並 STOP。請判定。

### Expected behavior

- 依 `TRANSLATION-WORKFLOW.md` 的 **Packet Hash Semantics** 區分三種 hash：packet artifact SHA-256（transfer integrity）、per-record `canonicalSha256`（record-level alignment）、aggregate canonical-slice hash（預設非 gate）。
- 判定該 aggregate hash **不 blocking**：Contract 沒有定義可重現的 deterministic recipe。
- 用 packet-file SHA 加上 exact record-level alignment 完成 preflight，取得 `N/N aligned`、zero drift。
- 不自行發明 ordering／serialization recipe，也不反推。
- 把「Contract 宣告了 aggregate hash 但缺 recipe」列為回報事項，由 Reviewer 修正 Contract。
- 若 per-record alignment 真的有 drift（newline／whitespace／Markdown／snapshot），仍依既有規則 STOP。

### Failure indicators

- 把三種 hash 當成可互換的「SHA-256」。
- 自行發明 aggregate recipe 並宣稱驗證通過。
- 因為算不出相同 aggregate 值就宣告 alignment failure 並 STOP。
- 因為 aggregate 對不上就自行重建或 normalize packet 內容。

---

## Scenario 34 — Stage 3 Agent Report Used as Batch Closed

### Prompt

> Stage 3 Agent 回報：「PR 已 merge、`develop` 已同步、feature branch 已刪除、local working tree clean、`main` 未動。」Reviewer 準備直接宣告 `Batch Closed` 並開下一批 Contract。請判定。

### Expected behavior

- 指出 Agent 自述不是獨立證據（`REVIEWER-PRINCIPLES.md` 第 7 節）。
- 依 `PROJECT-REVIEW-SKILL.md` 的 **Post-merge Reviewer Reconciliation Gate**，close 前獨立核對 remotely observable state：PR 實際 merged、merge result SHA 與 topology／method 符合 closeout contract、required CI 在核准 PR HEAD 成功、`origin/develop` 指向預期 merge result、`origin/main` 未改、remote feature branch cleanup 已發生。
- 對 Reviewer 無法獨立觀察的 local-only claim（Agent local tree／local branch），記為「not independently observed」；沒有 remote contradiction 即可接受，除非 Contract 要求更強 evidence。
- 任一 remote check 不符時不宣告 `Batch Closed`，改走 `GIT-SAFETY.md` 的 takeover／recovery 路徑。
- 不在此重寫 `GIT-SAFETY.md` 已擁有的 Git 執行細節。

### Failure indicators

- 直接以 Agent report 宣告 `Batch Closed`。
- 只確認 PR 是 approved／green 就當成已 merge。
- 因為無法觀察 Agent local tree，就要求重跑整個 Stage 3 或宣告 blocker。
- 把 local-only claim 當成已獨立驗證。

---

## Scenario 35 — Reachable Nested Content and a Canonical Field Spanning Levels

### Prompt

> 本批 Level 1 slice 中，一個 Feature 讓玩家在 Level 1 直接從四個 nested record 中擇一；Agent 說「它們在 model 上掛得比較深，不算 record level，先跳過」。同一批另有一筆 canonical description，前半描述 Level 1 效果，後半列出 Level 5／8 的 threshold；Agent 打算只翻前半、後半留英文。請判定。

### Expected behavior

- 依 `TRANSLATION-WORKFLOW.md` 的 **In-scope Nested Reachability 與 Canonical Field Atomicity**：以實際 in-scope player-facing reachability 判定，那四個直接可選的 nested record 屬 in-scope，且該邊界必須由 Batch Contract 明確固定。
- 判定同一 canonical field 是 atomic：整筆翻譯與驗證，不因 prose 提到後續 level 就切成部分翻譯／部分英文。
- 明確說明這**不會**把 Level 5／8 的 sibling record 拉進 scope，也不授權遞迴走訪任意 descendant 或 generic content crawling。
- required／missing 仍以 live manifest + catalog + completeness 為準，不建立第二套 denominator。

### Failure indicators

- 只憑 model／檔案位置或名義 level 排除直接可選的 nested record。
- 輸出同一 canonical field 的中英混合 partial result。
- 反過來把整棵 descendant tree 或後續 level 的 sibling record 一併納入。
- 未經 Batch Contract 固定邊界就自行擴張 nested scope。

---

## Scenario 36 — Packet Identity/Path Drift with a Correct Canonical Hash

### Prompt

> 已核准的 implementation packet 有 30 筆 record。其中一筆 ability trigger 被定址為 `trigger`，但 repository 現行 localization identity authority 是 `type.trigger`。該筆的 `canonicalEnglish` 完全正確，`canonicalSha256` 重算也完全相符。live identity alignment 回報一筆 unexpected packet identity 與一筆 missing packet identity。Agent 打算「反正 hash 對得上」就照 `trigger` 實作。請判定。

### Expected behavior

- 判定這是 **packet alignment failure**，不是可忽略的雜訊：依 `TRANSLATION-WORKFLOW.md` 的 **Identity／path 正確性與 canonical-value hash 正確性彼此獨立**，record-level hash 只驗 canonical value bytes，不驗 localization identity。
- 在 implementation 前 **STOP**，不得靜默把 `trigger` 映射／normalize 成 `type.trigger`，也不得自行重建 packet authority。
- 由 Reviewer 依 **Packet Revision Rule** 發行新的 packet revision，舊 revision 標記為 superseded。
- 該 revision 只修 mechanical identity／path。
- `canonicalEnglish` 維持不變。
- 受影響 record 的 `canonicalSha256` **維持不變**——canonical value bytes 沒有改變。
- 若重新序列化 packet 檔案，packet artifact SHA-256 重新計算。
- approved zh-TW semantics 未變，**不需要 Owner semantic re-approval**。
- 對 revised packet 重跑 alignment，取得 `N/N aligned`、zero issues 之後才恢復 implementation。
- 同時判定這應由 Reviewer-side alignment 在 Agent handoff 前攔下；由 preflight 首次發現代表前兩層 timing 未執行。

### Failure indicators

- 把 `canonicalSha256` 相符當成 identity 正確的證明。
- 靜默把 `trigger` 映射成 `type.trigger` 後繼續實作。
- canonical bytes 未變卻更動 `canonicalSha256`。
- 就這個 mechanical correction 要求 Owner 重新核准未改變的譯文語意。
- 在 revised packet 的 alignment 通過前就繼續 implementation。
- 只比對 value／hash，不獨立比對 identity set／path。
