# 已拍板的決定

除了另註日期的，都是 2026-10-03 決定的。

- **產品名稱暫定「Forge Steel 正體中文版」。** 依 DRAW STEEL Creator License。先有一個對外名稱，聲明方式和倉庫裡的授權說明一致。
- **預設語言是中文。** 翻譯還沒補齊時，中英夾雜可以接受。網站是給中文讀者用的，缺譯文就暫時留英文。
- **語言存在瀏覽器的 localStorage，鍵名 `forgesteel-language`。** 這樣不會寫進英雄檔或分享碼。右下角工具列、Reference 的左邊有一顆固定大小的按鈕，顯示「中文」或「EN」。設定抽屜裡的選項寫「正體中文」。
- **主持人（Director）的資料沒有「一律留英文」的特別處理。** 只是優先順序比較後面；Master Sheet 譯了，畫面上就會出現中文。
- **隱藏社群與第三方來源書。** 預覽先集中在正式內容。
- **Forge Steel 的英文和書不一樣時，在表上另加一欄「Forge Steel 版」，而且要 Marc 核准。** 改表之前先把欄位設計給負責人看。書和程式的英文有時不同，不能私下填。
- **介面文字維持英文，直到表上的「Forge Steel UI」分頁定稿。** 還沒有核准的介面譯文，網站不能先走。
- **網站不直接讀線上的 Sheet。** 匯出腳本把快照寫進倉庫，表有更新就重跑腳本、再開一個 pull request。上線的內容必須是審過的那一版。
- **快照只含 APPROVED 的列，以及需要的欄。** 負責人不希望自己的譯文就這樣公開。上線前要先決定怎麼發佈。注意：一旦網站釋出，GPL-3.0 要求原始碼連同譯文一併公開。
- **開發期間倉庫維持公開。** 這個分叉本來就是公開的，開發繼續在公開倉庫進行。
- **中文字型用自備、切成小塊的思源黑體（Noto Sans TC），只在中文模式下載。** 斜體裡的中文由瀏覽器斜過去。沒裝中文字的電腦也不能出現方框，英文模式則不要多下載。
- **在地化守門不接進 `npm run check`。** 那一行是上游的，常常一起改到會衝突。改由只在這個分叉跑的 GitHub Actions 執行。
- **這個分叉不自動部署。** 避免把上游的正式站蓋掉或另外部署出去。
- **每個顯示位置自己呼叫 `src/l10n` 裡的對照助手。** 查表集中在那裡。不把翻譯寫進遊戲邏輯，也不在每個畫面各寫一套。
- **表上規則的標題行在顯示當下拿掉。** 匯出檔保持表上的原文。守門確認拿掉標題之後，表上的英文和程式裡的規則相同。
- **遭遇編輯器的九個狀態按鈕這批先留英文。** 那是另一個大檔，條件這批不順手改它。
- **單字母縮寫 M、A、R、I、P 維持英文。** 側欄、小螢幕只取第一個字母的地方、怪物面板，還有經典表格裡用符號字型畫的字母，都不改。那些字母是符號字型用的，換成中文會畫不出來。
- **經典表格上，符號字母留著，後面改接中文全名。** 英文模式仍是字母加上英文剩下的部分。中文模式是同一個字母，後面換成這個屬性的中文全名。
- **「Characteristic」這個詞這批不譯。** 介面文字等 Master Sheet 的「Forge Steel UI」分頁，也就是 P3。
- **英文只差在標點或冠詞時，視為相同。** 必須列在 `src/l10n/english-exceptions.json`。每一筆寫鍵、差別種類（`punctuation` 或 `article`）、以及短註。`scripts/l10n/check.mjs` 拿快照裡的英文（匯出檔的 `en`，來自 Source Text，這欄本來就有，所以沒有加欄）和 Forge Steel 的英文比。標題行先拿掉再比，跟顯示時一樣。只有標點或冠詞（a、an、the）的差別可以列進去；兩種都有，或差在用字，就不能列。已經相同的英文也不必列。
- **Forge Steel 英文和書不同、且不只是標點或冠詞差異時，用 Master Sheet 的「Forge Steel 版」（DEC-0009）。** 書本譯文留在快照裡。正體中文模式優先顯示該列 Forge Steel 版的中文。Forge Steel 版中文只能從書本中文刪字（整句或句首連接詞），不補字、不改寫；例：126 飛翼不補「倒地」。Forge Steel 一段英文跨書上多列時，Forge Steel 版放第一列，中文為各列原文相接、英文分段處空一行；U 欄註明併入哪列；過期偵測只看第一列，Marc 已接受（2026-10-06）。歐克的 Grounded、Nonstop，以及矮人、哈肯人、梅莫人裡同樣裁過的描述，都走這條。族裔名稱也可以走 Forge Steel 版（例：Elf (high)）。`scripts/l10n/check.mjs` 守門：比對 Forge Steel 版英文時先去掉頭尾空白，再和該欄英文比（2026-10-06；enHash 仍是未去空白的英文雜湊）；Basis Hash 必須等於目前書本中文的 UTF-8 sha256，不符就失敗，訊息寫明 Forge Steel version is stale（書本中文改過就要重新核准）；這種鍵不能列進 `english-exceptions.json`，也不能設 `stripHeading`。快照裡有 Forge Steel 版、卻沒有任何對照鍵的列也會失敗。
- **共用標題等 P3。** 例如「Purchased Traits」。那是介面標籤，不是這一條特性專有的名字。Choose 1 of the following options、傷害類型選項名稱、Edge／When 條件文字等程式組出的文字也一樣。
- **Kalliac／Kalliak：表不改，Kalliak 是官方拼法（2026-10-06）。** Heroes 1.01b 寫 Kalliak。Forge Steel 只有 `src/data/ancestries/orc.ts` 的歐克文化語言，以及 Sanctuary Horn（`src/data/items/leveled-implement-data.ts`）拼成 Kalliac。上游不改。P2-5 語言批時，把 Kalliac 對到 Names 的 `heroes.language.kalliak`。例外清單到時新增「拼字變體」一類。
- **Strings 第 366 列 `heroes.background.culture.name` 的 TM Check 為 PASS（2026-10-06）。** 理由是無適用 TM（TM-000001–000010 都是條件片語）。
- **433 平權的 Forge Steel 版刪去「，社群會共同做出影響多數成員的重要決策」（2026-10-06）。** 書本中文第 1 句含英文第 2 句。Forge Steel 只有第 1 句，中文刪去該子句，不補字。Marc 已接受。
- **畫面上只多了強調標記時，仍視為同一句英文（2026-10-05）。** 顯示前會把 slowed、grabbed 這類條件字包成 `**…**`，效力註記則包成行內程式碼。查字時先拿掉 `**`、行內程式碼，以及同等的 `<strong>`／`<b>`，再對資料原文。句子真的被改寫（數字、加字）仍留英文。英文模式仍顯示加粗後的原文。中文顯示時，把那些加粗的條件詞對回詞彙表的中文，在譯文裡加上同樣的 `**`。詞彙表的條件名不在這一句、但同一句裡有唯一的較長核准詞條前綴（grabbed 對上擒抱），就加粗那個詞。對不上就維持譯文，不加字、也不改別的詞。英文粗體在中文對應處也加粗，不確定加在哪個詞時問 Marc。
- **職業型文化的名稱走 Forge Steel 版，描述留英文，不在表上加列（2026-10-06）。** 16 個職業型文化的名稱對到書上「文化範例」表既有的列。Forge Steel 只顯示名稱。描述（例：Urban, bureaucratic, creative.）這批不譯。Marc 已核准。
- **書上表格列含多格時，Forge Steel 版中文可刪去其他格、只留第一格（2026-10-06）。** 例：「工匠公會｜城市｜官僚｜創作」只留「工匠公會」。不補字、不改寫。Marc 已核准。
- **Pauper Neighborhood 照書顯示「勞工社區」（2026-10-06）。** Forge Steel 名稱是 Pauper Neighborhood，書上是 Laborer neighborhood，對到 `heroes.background.culture.archetypical.laborer-neighborhood`。同一個文化（城市／平權／勞動）。Marc 已核准。
- **不新增大小寫例外（2026-10-06）。** Forge Steel 版英文欄照抄原文（例：Artisan Guild），不把大小寫差列進 `english-exceptions.json`。
- **Bespoke Culture 表上無對應，留英文（2026-10-06）。**
- **建造頁右邊選取摘要（Field）留到 P3（2026-10-06）。** 自訂文化已選面向的 Field 仍是英文。

## 尚未決定

目前沒有。
