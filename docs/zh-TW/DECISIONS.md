# 現行決策與歷史索引

## 維護決策（2026-10-10）

- **DEC-0010 多來源過期偵測**：取代 DEC-0009 的「合併只看第一列」取捨；每個 Forge Steel 版記錄全部依賴 Sheet ID、英文／中文 hash 與核准 fs hash，守門檢查任何來源變動。中文刪字與接合限制不變。實作及多用途方案見 [P4-STRUCTURE](P4-STRUCTURE.md)。
- **DEC-0011 多用途對照**：方案採 Master Sheet 獨立 Forge Steel 對照分頁，每用途一列、引用書本 ID 與完整依賴；現有欄位先維持兼容，第一個實際多用途批次再按核准欄位遷移，不建立翻譯平台。這是結構方案定案，不是未存在譯文的核准。
- **DEC-0012 維護驗收與結案**：本次使用者授權免人工驗收完成維護 1–5；一般內容仍走預覽／Marc 核准。批次紀錄集中原 PR，不再每批另開結案 PR；TODO 是唯一目前待辦。
- **DEC-0013 上游與門檻**：main 僅 fast-forward 鏡像；整合走 develop PR 且必須通過 l10n（含六項檢查與瀏覽器回歸），不要求第二位審查者。禁止 force push／刪分支；main 不要求 PR，以保留鏡像更新。每週 Upstream watch 唯讀比較 main 與 develop，不自動合併或部署。
- **DEC-0014 最小依賴修補**：同步至上游 14.207.0 後，稽核剩 brace-expansion／minimatch 兩項 high；既有 brace-expansion override 從 5.0.8 更新到 5.0.12，不放寬 audit，不執行 audit fix --force。依據 [官方公告](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr)，實際結果見 PROGRESS。
- **DEC-0015 官方文化摘要的正體中文標點（2026-10-10）**：P2-1-5 原決定保留來源標點；本批僅對已由既有保護條件確認為官方三面向組合摘要的內容，在正體中文模式使用「、」分隔並以「。」結尾，保留面向順序與 APPROVED 名稱。英文模式保留原文；自訂自由描述、改名、Homebrew、未知格式及其他不符合官方資料的內容維持原值。此決定不改寫 P2-1-5 歷史、不做全站標點替換、不修改資料或存檔，亦不新增翻譯／mapping。實作與驗收見 DISPLAY-01 批次 PR。

## 仍有效的內容決策

- **DEC-0009 靜態 Forge Steel 版**：保留書本譯文；網站版必須核准，只能按已核准例外刪字或原樣接合，不補字／改寫。英文欄與網站 trim 後原文一致，enHash 仍使用未 trim 原文，Basis Hash 對書本中文。多來源部分由 DEC-0010 取代。
- **P2-1-5 文化摘要名稱顯示**：沿用既有 APPROVED 三面向名稱，只在官方 ID、原名稱／描述及面向組合完全吻合時顯示。標點例外限縮依 DEC-0015；P2-1-5 歷史原文不變。
- 動態綁定只投射上游數字；命定末視的自然句型只採 Sheet APPROVED Note。靜態限制不因動態核准而放寬。
- P2-1-4／P2-1-5：已核准玩家族裔／文化／昔日族裔名稱與官方文化三面向摘要；後者取代「文化摘要一律留英文」。官方 ID、原名、原描述與面向組合都須相符。DISPLAY-01 已補上右側建角 Field 的面向名稱，PR #59 已接核准描述與清冊內 UI；13 個 Bespoke Culture Field 來源／元件 DOM 已核對，剩餘生成 UI 與龍鱗模板見 NEXT-BATCH。歷史原批次紀錄不變。
- 官方來源入口保留 Core、Orden、The Beastheart、The Summoner 及既有旗標控制的官方內容；社群／第三方隱藏，Homebrew 保留。
- 名稱、預設語言、localStorage、字型、符號字母、英文搜尋、分叉不部署與發布界線依 RULES。
- Enhancement 的核准仍由 Marc 決定，不能 AI 自行補完。

## 只在需要時讀的核准例外

完整原始理由保留 [歷史決策](history/DECISIONS-2026-10-10.md)，檔首已標示取代事項；以下例外仍有效，不須每次重讀全部：

| 主題 | 歷史文件搜尋詞 |
|---|---|
| 英文差異與標記 | 標點、冠詞、spelling、Kalliac／Kalliak、強調標記、大小寫 |
| 文化名稱裁表格欄 | 只留第一格、五格、Pauper Neighborhood、高等精靈／幻林精靈、Bespoke Culture |
| 屬性與字型 | 單字母、符號、中文字型 |
| 族裔描述／特性 | 126、433、Grounded、Nonstop、符文銘刻、虹彩鱗片 |
| 招式與段落選擇 | Glowing Eyes、Glamor of Terror、Grab、Knockback、命定末視、哈肯人 |
| 歷史驗收與版本 | [歷史進度](history/PROGRESS-2026-10-10.md)；不作目前待辦 |

已完成且不再待實作：快照與 Note 整合 #37、全域總數集中 #34、來源掃描快取與驗證入口 #53。它們的過去提案保留於歷史，但已由完成紀錄取代。

同步 PR 使用 merge commit 保留 upstream 提交祖先，讓每週比較與下一次合併能準確判斷已整合；一般內容 PR 維持 squash。GitHub 預設分支為 develop，分叉排程及 PR 範本由 develop 載入。
