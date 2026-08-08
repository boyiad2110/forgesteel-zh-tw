# Reviewer 必讀原則

- 文件位置：`docs/REVIEWER-PRINCIPLES.md`
- 文件分類：現行權威
- 最終決策者：專案負責人
- 適用：需求、實作、翻譯、測試、Git／PR、發布 Review

## 1. 文件角色

本文件定義 Reviewer 的**權限、判斷邊界與治理原則**。

操作流程由 `docs/project-review-skill/PROJECT-REVIEW-SKILL.md` 定義；兩份文件不得維護兩套重複規則。

Reviewer 的責任是確認核准需求、控制實際風險、取得最低足夠證據並協助工作收斂，不是成為規格作者或讓流程持續變複雜。

## 2. Authority

優先順序：

1. 專案負責人在目前對話中的最新明確決定。
2. repository 現行權威文件。
3. 已核准 requirements、decision records、測試標準。
4. code、tests、PR、CI、人工驗收與歷史文件，作為現況或證據。

文件存在、語氣正式、程式已實作、Agent 稱為 final，都不等於正式核准。

Authority 衝突且現在必須決定時，交由專案負責人裁定。

## 3. 決策邊界

### 必須由專案負責人決定

- V1 產品範圍與排除項目。
- 新功能或重大流程變更。
- 新中文遊戲術語、正式譯名或會改變語意的中文措辭。
- Beta／正式發布與重大風險接受。
- 會改變 schema、canonical data、save compatibility 或資料行為的重大技術取捨。

### Reviewer 可自行決定

在不改變核准語意、產品範圍與資料行為的前提下：

- 合理 Batch 邊界與驗證強度。
- 最低足夠 tests／manual smoke。
- 一般 Git／PR 技術執行細節與本批 merge method。
- 已核准譯文的純機械變體，例如 singular／plural、`a/an`、大小寫、不改變語意的標點、英文 plural `s`、dynamic placeholder 周圍的純文法調整。

機械變體不得藉此建立新術語或改變意思；有真正語意取捨時仍回到專案負責人。

Reviewer 不得把個人偏好、技術不確定性或純機械細節轉嫁給專案負責人。

## 4. Findings

Review 結果只分三類：

### Blocker

不處理會造成至少一項：功能失效、規則／資料錯誤、save／ID／enum／parser／reference／canonical data 破壞、核准需求或定稿未完成、明確安全／資料損失／發布風險。

Blocker 必須說明直接影響與證據。

### Non-blocking Observation

值得改善但不影響本批 Acceptance，例如文件格式、個人偏好、可延後重構。不得因此退回成果。

### User Decision

只有「真正產品／語意／翻譯／重大技術取捨 + 現在必須決定 + authority 無答案 + Reviewer 無權決定」時才提出。

## 5. 已核准內容、Review 輪次與停止

- Owner 已核准的中文、V1 scope、排除項目、發布與技術／流程決策視為凍結。
- 不改變語意的機械變體包含在已核准內容內，不需逐項重新送核。
- 同一成果最多兩輪完整 Review。
- 第一輪一次提出所有實質問題；第二輪只檢查修正與新重大問題。
- 第二輪仍有結構性 blocker 時停止補丁循環並重評方案／範圍。
- 不因 Non-blocking Observation 進第三輪。
- 人工驗收與必要測試通過後，功能／內容 Review 結束；其後只做必要收尾。

## 6. Batch 與成本控制

Batch 預設以**coherent、可獨立驗收的 UI／功能 slice**為單位，不以單一詞彙、單一 call site 或單一小檔案切批；只有隔離風險、authority 或 dependency 明確需要時才縮小。

也不得為了「一次做完」把 shared architecture、遊戲內容與不相關功能混進同一批。

任何追加工作都要能回答：

1. 降低什麼具體風險？
2. 現在是否必須？
3. 是否產生可驗證成果？
4. 是否有更小、更便宜的方法？

無法回答時，排除或延後。

## 7. 證據與文件治理

Review 優先：實際程式／資料正確 → 實際畫面與流程 → canonical／save safety → tests／CI → 必要文件 → 格式整理。

- Agent 自述不是獨立證據；依風險核對實際 diff、tests、PR、CI 或人工驗收。
- 沒有證據時，不宣稱「已完整收斂」「只剩最後一個問題」「一定不影響其他功能」。
- 同一主題原則上只保留一份現行正式文件；正式文件直接更新，由 Git history 保存舊版。
- `REVIEWER-PRINCIPLES.md` 管政策；`PROJECT-REVIEW-SKILL.md` 管 workflow。

## 8. Forge Steel 繁中專案特別要求

- 中文只改 display，不得修改 canonical data、規則、計算、ID、enum、parser、reference 或 save format。
- 英文 canonical data 是資料與規則基準。
- 專案負責人是新中文遊戲術語、正式譯文、產品範圍與發布的最終決策者。
- 未核准的新遊戲術語保留 canonical English；不得自行建立暫譯、中文別名或中英對照。
- 已核准譯文的純機械變體依第 3 節處理。
- codebase 盤點只為建立 UI／資料邊界、dependency 與風險地圖，不建立百科。
- 不得從翻譯 completeness 推導 runtime allowlist。
- localization 不得順手重構 shared component、storage 或 schema，除非有 blocker evidence 與明確授權。

## 9. Reviewer Self-Check

- [ ] 我知道唯一目標與現行 authority。
- [ ] 我沒有把現況誤當正式決策。
- [ ] 我沒有擴張 scope 或重開已核准內容。
- [ ] 我只把實質風險列為 blocker。
- [ ] 我沒有把純機械差異丟回 Owner。
- [ ] 我沒有使用未核准的新中文遊戲術語。
- [ ] 驗證成本與風險相稱。
- [ ] 結論有實際 evidence。
- [ ] 本輪有明確停止條件。
