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
- **英文只差在標點或冠詞時，視為相同。** 必須列在 `src/l10n/english-exceptions.json`。每一筆寫鍵、差別種類（`punctuation` 或 `article`）、以及短註。`scripts/l10n/check.mjs` 拿快照裡的英文（匯出檔的 `en`，來自 Source Text，這欄本來就有，所以沒有加欄）和 Forge Steel 的英文比。標題行先拿掉再比，跟顯示時一樣。只有標點或冠詞（a、an、the）的差別可以列進去；兩種都有，或差在用字，就不能列。已經相同的英文也不必列。2026-10-06 起，`language:` 鍵可以另列 `spelling`（拼字變體）；每一筆都要 Marc 核准，其他鍵不能用。
- **Forge Steel 英文和書不同、且不只是標點或冠詞差異時，用 Master Sheet 的「Forge Steel 版」（DEC-0009）。** 書本譯文留在快照裡。正體中文模式優先顯示該列 Forge Steel 版的中文。Forge Steel 版中文只能從書本中文刪字（整句或句首連接詞），不補字、不改寫；例：126 飛翼不補「倒地」。Forge Steel 一段英文跨書上多列時，Forge Steel 版放第一列，中文為各列原文相接、英文分段處空一行；U 欄註明併入哪列；過期偵測只看第一列，Marc 已接受（2026-10-06）。歐克的 Grounded、Nonstop，以及矮人、哈肯人、梅莫人裡同樣裁過的描述，都走這條。族裔名稱也可以走 Forge Steel 版（例：Elf (high)）。`scripts/l10n/check.mjs` 守門：比對 Forge Steel 版英文時先去掉頭尾空白，再和該欄英文比（2026-10-06；enHash 仍是未去空白的英文雜湊）；Basis Hash 必須等於目前書本中文的 UTF-8 sha256，不符就失敗，訊息寫明 Forge Steel version is stale（書本中文改過就要重新核准）；這種鍵不能列進 `english-exceptions.json`，也不能設 `stripHeading`。快照裡有 Forge Steel 版、卻沒有任何對照鍵的列也會失敗。
- **共用標題等 P3。** 例如「Purchased Traits」。那是介面標籤，不是這一條特性專有的名字。Choose 1 of the following options、傷害類型選項名稱、Edge／When 條件文字等程式組出的文字也一樣。
- **Kalliac／Kalliak：表不改，Kalliak 是官方拼法（2026-10-06）。** Heroes 1.01b 寫 Kalliak。Forge Steel 只有 `src/data/ancestries/orc.ts` 的歐克文化語言，以及 Sanctuary Horn（`src/data/items/leveled-implement-data.ts`）拼成 Kalliac。上游不改。P2-5 語言 5-1 把 Kalliac 對到 Names 的 `heroes.language.kalliak`，例外清單新增 `spelling`。細節見下方同一天的決定。
- **Strings 第 366 列 `heroes.background.culture.name` 的 TM Check 為 PASS（2026-10-06）。** 理由是無適用 TM（TM-000001–000010 都是條件片語）。
- **433 平權的 Forge Steel 版刪去「，社群會共同做出影響多數成員的重要決策」（2026-10-06）。** 書本中文第 1 句含英文第 2 句。Forge Steel 只有第 1 句，中文刪去該子句，不補字。Marc 已接受。
- **畫面上只多了強調標記時，仍視為同一句英文（2026-10-05）。** 顯示前會把 slowed、grabbed 這類條件字包成 `**…**`，效力註記則包成行內程式碼。查字時先拿掉 `**`、行內程式碼，以及同等的 `<strong>`／`<b>`，再對資料原文。句子真的被改寫（數字、加字）仍留英文。英文模式仍顯示加粗後的原文。中文顯示時，把那些加粗的條件詞對回詞彙表的中文，在譯文裡加上同樣的 `**`。詞彙表的條件名不在這一句、但同一句裡有唯一的較長核准詞條前綴（grabbed 對上擒抱），就加粗那個詞。對不上就維持譯文，不加字、也不改別的詞。英文粗體在中文對應處也加粗，不確定加在哪個詞時問 Marc。
- **職業型文化的名稱走 Forge Steel 版，描述留英文，不在表上加列（2026-10-06）。** 16 個職業型文化的名稱對到書上「文化範例」表既有的列。Forge Steel 只顯示名稱。描述（例：Urban, bureaucratic, creative.）這批不譯。Marc 已核准。
- **書上表格列含多格時，Forge Steel 版中文可刪去其他格、只留第一格（2026-10-06）。** 例：「工匠公會｜城市｜官僚｜創作」只留「工匠公會」。不補字、不改寫。Marc 已核准。
- **Pauper Neighborhood 照書顯示「勞工社區」（2026-10-06）。** Forge Steel 名稱是 Pauper Neighborhood，書上是 Laborer neighborhood，對到 `heroes.background.culture.archetypical.laborer-neighborhood`。同一個文化（城市／平權／勞動）。Marc 已核准。
- **不新增大小寫例外（2026-10-06）。** Forge Steel 版英文欄照抄原文（例：Artisan Guild），不把大小寫差列進 `english-exceptions.json`。
- **Bespoke Culture 表上無對應，留英文（2026-10-06）。**
- **建造頁右邊選取摘要（Field）留到 P3（2026-10-06）。** 自訂文化已選面向的 Field 仍是英文。
- **建造頁自訂文化的「Choose a name for your culture.」留到 P3（2026-10-06）。** 介面字。Marc 已核准。
- **族裔文化的名稱走 Forge Steel 版，描述留英文，不在表上加列（2026-10-06）。** 11 個族裔文化的名稱對到書上「典型族裔文化」表既有的列。Forge Steel 只顯示名稱。描述（例：Secluded, bureaucratic, creative.）這批不譯。Marc 已核准。
- **「只留第一格」也適用五格的列，包括典型族裔文化的語言格（2026-10-06）。** 例：「歐克｜卡力語｜荒野｜平權｜創作」只留「歐克」。不補字、不改寫。Marc 已核准。
- **高等精靈、幻林精靈的文化名稱對到典型族裔文化表自己的列（2026-10-06）。** High Elf／Wode Elf 對到第 378／377 列。族裔名稱列的 Forge Steel 版 Elf (high)／Elf (wode) 不動。Marc 已核准。
- **雲端代理的 PR 與回報都只列 Marc 驗收位置，不截圖、不錄影（2026-10-06）。**
- **語言描述留英文（2026-10-06）。** 不用表格列刪字拼句。那樣會補字，違反 DEC-0009。Marc 已核准。
- **語言名稱用新鍵型 `language:<Forge Steel 英文名>`（2026-10-06）。** Forge Steel 語言資料沒有 id，不替上游資料補 id。鍵對到 Names 的 `heroes.language.<slug>`。41 個名稱和 Names 的 Source Name 完全相同，含 `The First Language`、`Proto-Ctholl` 這類原樣名稱。Za'hariax（Names 第 25 列，Source Name 是彎引號）這批不對照；Forge Steel 語言清單裡是直引號，和 Source Name 不是同一個字面值。沿用 Names 既有列，不寫 Sheet。Marc 已核准。
- **拼字變體例外只用於 `language:` 鍵（2026-10-06）。** `english-exceptions.json` 新增 `language:Kalliac`，kind 為 `spelling`，對到 `heroes.language.kalliak`（卡力語）。Kalliac 只出現在歐克文化的預選語言 `orc.ts`；Kalliak 是官方拼法；Names K9 已有備註。`scripts/l10n/check.mjs` 限定 `spelling` 只能用在 `language:` 鍵。每一筆 spelling 都要 Marc 核准。例外清單原本只收標點、冠詞，現在多這一類。Marc 已核准。
- **語言特性名、Field 標籤、類型標籤、以及程式組出的「Choose a language.」留到 P3（2026-10-06）。** 包括 Language、Languages、Default Language、Field 標籤 Language、類型標籤 Common／Regional／Cultural／Dead。Marc 已核准。
- **選語言抽屜的搜尋維持只認英文（2026-10-06）。** Marc 已核准。
- **語言分兩批（2026-10-06）。** 5-1 是文化面板與建造頁的語言名稱。5-2 是英雄側欄 sidebar-panel、經典表格 culture-card、reference-modal、sourcebook-panel、party-modal、negotiation-panel。Marc 已核准。
- **編輯器下拉選單留英文（2026-10-06）。** culture-edit、negotiation-edit、EditLanguage 等不在範圍內，因為下拉值就是存檔內容。Marc 已核准。
- **5-2 只換語言名稱的顯示（2026-10-06）。** 存檔值、比對、排序、搜尋維持英文。5-1 沒碰過的經典表格 `ChoiceFeatureComponent`、隨從卡、協商表格一起做。`ChoiceFeatureComponent` 只在 LanguageChoice 時換名稱，Choice 與 ItemChoice 不動。程式組出來的「I Speak Their Language (…)」、「Unselected」、「None」和類型標題留到 P3。「Related to:」字樣留到 P3，後面的語言名稱換中文。sourcebook-panel 編輯模式留英文。經典表格排版估算（sheet-formatter）不改。Marc 已核准。
- **Glossary 定稿後由 Marc 核准新增技能與類別（2026-10-06）。** 57 個技能與 5 個類別放 Glossary 分頁（不是 Names），Marc 知道 Glossary 標了定稿，是他自選的例外。實際新增 62 列（第 257–318 列，CHG-0059），全部是技能專用列；ID 依 Glossary 後綴慣例 term.<group>-skill-group／term.<slug>-skill。Marc 已核准。
- **Climb、Jump、Swim、Culture、Timescape 與既有列分開（2026-10-06）。** 這五個技能和 Glossary 既有的 term.climb／term.jump／term.swim／term.culture／term.timescape 英文、中文相同，但含義不同（移動方式、英雄文化、世界觀名詞），分開建技能專用列 term.climb-skill 等（第 314–318 列）；既有列不動，不作技能對照。Marc 已核准。
- **技能名稱用新鍵型 `skill:<Forge Steel 英文名>`（2026-10-06）。** 技能類別用既有的 enum:SkillList:<類別>。SkillList.Custom 不對照，維持英文。Marc 已核准。
- **技能中文取自技能表的名稱格，類別取自類別句原字（2026-10-06）。** 技能名稱來自 Strings 第 20–24 列技能表的「中文（English）｜用途」行，可刪去括號英文與用途格，不補字（新刪法）。類別用第 19 列的「工藝類、探索類、交涉類、諜報類、學識類」原字。Marc 已核准。
- **來源列檢查代替 Basis Hash（2026-10-06）。** Glossary 沒有 Basis Hash，Glossary 列的 Source Reference／Usage Note 寫明來源 Strings 列；check.mjs 守門檢查中文仍在來源 Strings 列的表格行（類別：類別句）裡。Marc 已核准。
- **技能描述留英文（2026-10-06）。** Marc 已核准。
- **技能分兩批（2026-10-06）。** 6-1 是建造頁技能選擇、選技能視窗、Reference 技能頁；6-2 是其他顯示技能名稱的位置。Marc 已核准。
- **程式組出的字、HeaderText 標籤、以及「Other skills」等介面字留到 P3（2026-10-06）。** 搜尋、排序維持英文；編輯器下拉留英文。技能類別標籤除外，見同日 6-2。Marc 已核准。
- **技能類別標籤換中文（2026-10-06）。** 側欄與選技能視窗的類別標籤顯示工藝類等。6-1「HeaderText 標籤留 P3」改成技能類別標籤除外。Marc 已核准。
- **側欄分組標題「<類別> Skills」留 P3（2026-10-06）。** 設定「Show skills in groups」打開時的分組標題維持英文。Marc 已核准。
- **擲骰修正說明整句留 P3（2026-10-06）。** 句中技能名也不換。Marc 已核准。
- **隨從面板、專案面板的技能欄不在 6-2（2026-10-06）。** 之後跟這兩處的語言一起補。Marc 已核准。
- **6-2 只換顯示（2026-10-06）。** 排序、搜尋、存檔維持英文。經典表格技能卡英文模式保留 Criminal Und. 縮寫，排版估算不改。feature-component 只在 SkillChoice 時換。不寫 Sheet（沿用 6-1 的 62 個對照）。Marc 已核准。

## 尚未決定

目前沒有。
