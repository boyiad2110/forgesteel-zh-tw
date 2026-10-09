# 已拍板的決定

除了另註日期的，都是 2026-10-03 決定的。

- **驗證維護第一階段（2026-10-10，Marc 核准實作）。** 來源掃描測試沿用現有快取介面，每次測試只建立一份索引，保留原斷言與預設逾時。新增分叉專用 `scripts/l10n/verify.mjs`，完整執行守門、Lint、TypeScript、Vitest、正式建置、npm audit，失敗不中斷後項，全部成功才回傳成功；CI 分項呼叫相同入口。上游 package scripts、測試設定與套件版本保持原樣；漏洞不得忽略，依賴修補另案。此決策更新 RULES 的驗證入口，不放寬原檢查；本批仍跑原始 `npm run check` 驗證相容性。上游同步、分支保護、文件瘦身及內容批次不在本批。

- **P2-1-5 玩家族裔與文化選擇流程名稱一致性（2026-10-09）。** Marc 核准還魂屍 Former Life 族裔下拉、族裔特性下拉的候選與收合後已選名稱，沿用既有 APPROVED 對照；以及 27 個官方文化卡的既有三面向摘要，將英文面向名稱以 13 個 APPROVED 面向名稱替換，保留原順序與標點。僅在官方文化 ID／名稱／描述和三個面向皆符合原始資料、描述完全符合原三項組合格式時顯示；Homebrew、自訂、改名、未知或自由描述原樣保留，英文模式維持英文。此項限縮取代 2026-10-06「族裔／職業型文化摘要留英文」決定，其他任意文化描述仍不翻譯。共用 CulturePanel 使用位置一併受影響並驗收。建角右側 Field 摘要、UI 標籤與提示留 P3；描述文字、資料、計算、存檔、分享碼、排序、搜尋不變。不新增譯文、mapping、Forge Steel 版或英文例外，總數維持 428／105／11；實作與驗收見 PROGRESS。
- **產品名稱暫定「Forge Steel 正體中文版」。** 依 DRAW STEEL Creator License。先有一個對外名稱，聲明方式和倉庫裡的授權說明一致。
- **預設語言是中文。** 翻譯還沒補齊時，中英夾雜可以接受。網站是給中文讀者用的，缺譯文就暫時留英文。
- **P2-1-4 玩家族裔、文化與特性名稱顯示一致性（2026-10-09）。** Marc 核准沿用既有 APPROVED 名稱對照，整合英雄總覽一般／精簡列、還魂屍昔日族裔摘要、英雄特性清單精簡列，以及經典表格頁首族裔、昔日族裔值、文化名稱與三個文化面向。名稱只在官方資料 ID 與原英文吻合時顯示中文；改名、自訂、Homebrew 及未對照值原樣保留。共用詳情 name scope 一併驗證原名；高等／幻林精靈族裔與文化各用自己的鍵。只改顯示，不改資料、計算、存檔、分享碼、排序、搜尋或經典表格估算；UI 標籤留 P3、建角右側摘要延後、生涯待翻譯。預期不新增譯文、mapping、英文例外或 Forge Steel 版，總數維持 428／105／11。經典表格保留原英文格式，人工檢查正體中文截斷、重疊與溢出；實作與驗收進度見 PROGRESS。
- **語言存在瀏覽器的 localStorage，鍵名 `forgesteel-language`。** 這樣不會寫進英雄檔或分享碼。右下角工具列、Reference 的左邊有一顆固定大小的按鈕，顯示「中文」或「EN」。設定抽屜裡的選項寫「正體中文」。
- **主持人（Director）的資料沒有「一律留英文」的特別處理。** 只是優先順序比較後面；Master Sheet 譯了，畫面上就會出現中文。
- **內建來源只載入官方內容（2026-10-09，Marc 核准實作）。** 排除 Community、第三方來源、Community 預覽及 Age of Secrets；Sourcebooks 視窗、英雄建造與英雄設定只保留 Official／Homebrew 入口。Core、Orden、The Beastheart、The Summoner 保留；官方 Patreon／Playtest 沿用既有旗標條件。社群預覽旗標從可啟用清單移除，既有儲存值不移轉或清理。Homebrew 建立與匯入功能保留；網站尚未開放，不做既有非官方英雄的相容或移轉機制。原始資料檔及來源列舉保留以利同步上游；分享碼的凍結壓縮字典不重建。不新增譯文、mapping、Forge Steel 版或英文例外，集中總數維持 428／105／11。此條補充原「隱藏社群與第三方來源書」決定；進度與驗收見 PROGRESS。
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
- **Forge Steel 英文和書不同、且不只是標點或冠詞差異時，用 Master Sheet 的「Forge Steel 版」（DEC-0009）。** 書本譯文留在快照裡。正體中文模式優先顯示該列 Forge Steel 版的中文。Forge Steel 版中文只能從書本中文刪字（整句或句首連接詞；表格其他格、括號英文與用途格、句中括號參照、行首標籤「效果：」也可刪，各見該日決定），不補字、不改寫；例：126 飛翼不補「倒地」。Forge Steel 一段英文跨書上多列時，Forge Steel 版放第一列，中文為各列原文相接、英文分段處空一行；U 欄註明併入哪列；過期偵測只看第一列，Marc 已接受（2026-10-06）。歐克的 Grounded、Nonstop，以及矮人、哈肯人、梅莫人裡同樣裁過的描述，都走這條。族裔名稱也可以走 Forge Steel 版（例：Elf (high)）。`scripts/l10n/check.mjs` 守門：比對 Forge Steel 版英文時先去掉頭尾空白，再和該欄英文比（2026-10-06；enHash 仍是未去空白的英文雜湊）；Basis Hash 必須等於目前書本中文的 UTF-8 sha256，不符就失敗，訊息寫明 Forge Steel version is stale（書本中文改過就要重新核准）；這種鍵不能列進 `english-exceptions.json`，也不能設 `stripHeading`。快照裡有 Forge Steel 版、卻沒有任何對照鍵的列也會失敗。
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
- **Glossary 新增 16 列動作名稱（2026-10-06）。** 第 319–334 列，CHG-0060。ID 是 `term.<slug>-action`。中文照抄 Strings `heroes.actions.<slug>.rules` 的標題行。Glossary 標了定稿，這是 Marc 自選的例外。Marc 已核准。
- **Make Or Assist A Test 的 Source Term 寫 Forge Steel 原樣（2026-10-06）。** 書上寫 Make or Assist a Test。Usage Note 註明書上寫法。不加大小寫例外，也不把這一筆放進 `english-exceptions.json`。Marc 已核准。
- **Make or Assist a Test、Use Consumable 併入那 16 列（2026-10-06）。** Marc 已核准。
- **Free Strike、Opportunity Attack、Claw Dirt 直接對既有 Glossary 列（2026-10-06）。** `term.free-strike`（基礎打擊）、`term.opportunity-attack`（藉機攻擊）、`term.claw-dirt`（挖土）。英文完全相同，不加來源列檢查。Marc 已核准。
- **Free Strike (melee)、Free Strike (ranged)、Go Prone、Swap 留英文（2026-10-06）。** Marc 已核准。
- **動作描述留到 7-3（2026-10-06）。** 9 段用 Forge Steel 版，5 段直接對照。Escape Grab、Grab、Knockback 留招式批次。Marc 已核准。
- **動作類型標籤、分組標題、Reference Abilities 分頁標籤、經典表格參考卡留 P3（2026-10-06）。** 包括 Main Action 這類標籤，以及 `primary-reference-card.tsx`、`reference-cards.tsx`。Marc 已核准。
- **P2-7 分三批（2026-10-06）。** 7-1 是網頁上的動作名稱（Reference 的 Abilities 頁、點開招式的視窗、列印頁、英雄頁招式列表、側欄 Triggers）。7-2 是經典表格上的動作名稱。7-3 是動作描述。顯示的名稱仍等於資料英文才換；英雄用 abilityCustomizations 改過的名字維持使用者輸入。存檔、排序、搜尋、比對、剪貼簿維持英文。英文模式不變。Marc 已核准。
- **來源列檢查擴及動作名稱（2026-10-06）。** 對到 `term.<slug>-action` 的鍵，Glossary 中文必須等於 `heroes.actions.<slug>.rules` 的標題行。來源列不在，或標題改了字，守門就失敗。Marc 已核准。
- **7-2 只換名稱的顯示（2026-10-06）。** 經典表格招式卡（ability-card）、英雄頁 Standard Abilities 檢視、設定裡選基本動作的抽屜、表格預覽頁的 Included Standard Abilities 選單。AbilitySheet 資料、排序、key、class、存檔維持英文。排版估算不改（名稱不參與卡片高度估算與排序）。不寫 Sheet，沿用 7-1 的 19 個對照。Marc 已核准。
- **ability-component.tsx 不改（2026-10-06）。** 只畫怪物／隨從／同伴／召喚物／機關／地形的招式，不會出現基本動作。Marc 已核准。
- **經典表格上的 Melee Free Strike／Ranged Free Strike 留英文（2026-10-06）。** 名稱是經典表格程式寫死的，不是資料英文。Glossary 雖有近戰基礎打擊／遠程基礎打擊，這批不新增鍵型。Marc 已核准。
- **經典表格不套用基本動作的自訂名稱（2026-10-06）。** 上游本來就不套用，畫面上是資料英文名，所以中文模式顯示中文。不修上游這個行為。Marc 已核准。
- **動作類型標籤仍留 P3（2026-10-06）。** 卡片頂端標籤、Tag、選動作抽屜分組標題。Marc 已核准。
- **Forge Steel 版新刪法：句中括號參照（2026-10-07）。** Forge Steel 版中文除了整句、句首連接詞、表格其他格、括號英文與用途格之外，也可刪去句中的括號參照（書上「（詳見…）」，對應英文 see … 的括號）。只在 Forge Steel 英文也刪了時才刪，不補字、不改寫。用於 7-3 的 Ride、Catch Breath、Make Or Assist A Test、Search、Charge、Defend、Free Strike。Marc 已核准。
- **Charge 的 Forge Steel 版刪去「（期間不能跳躍）」（2026-10-07）。** Forge Steel 原文沒有 without jumping，中文照 Forge Steel。Marc 已核准。
- **Free Strike 的 Forge Steel 版只留第 1 句（2026-10-07）。** Marc 已核准。
- **新鍵型 `section:<ability id>:<n>`（2026-10-07）。** 招式的第 n 個文字段。stripHeading 可用在 data 與 section 鍵。Marc 已核准。
- **7-3 也換經典表格招式卡的描述（2026-10-07）。** 排版估算不改（中文顯示寬度約為英文的 0.5–0.7 倍）。只在顯示文字仍等於資料英文時才換（加了 Effect 前綴或被改寫的段維持英文）。Marc 已核准。
- **Master Sheet 寫入動作描述的 Forge Steel 版（2026-10-07）。** Strings 第 34、37、40、42、43、45、47、48、49 列 P–V，Changelog CHG-0061。Marc 已核准。
- **待修：「拆分到在其他」（2026-10-07）。** Strings 第 33 列（Disengage，直接對照）與第 34 列（Ride，Forge Steel 版）的書本譯文「拆分到在其他機動動作和主要動作之間」多一個「在」。這批不改，畫面照現有譯文顯示。之後若 Marc 修 Sheet：第 33 列改完重出快照即可；第 34 列的 H 欄改了之後，Forge Steel 版會被守門判為過期（stale），要同時改 R 欄並重算 T 欄（Basis Hash）再出快照。Marc 已核准這批不改。（已在 8-1 修正，見下方 CHG-0063 那條。）
- **Remember your Oath、Draconic Pride 的名稱走 Forge Steel 版（2026-10-07）。** 中文與書本相同，不刪字。英文差在大小寫（Remember your Oath／Remember Your Oath）與用字（Draconic／Draconian）。依「不新增大小寫例外」與 Artisan Guild 先例，不把大小寫差列進 `english-exceptions.json`。Changelog CHG-0062。Marc 已核准。
- **Strings 第 33、34 列「拆分到在其他」已改為「拆分到其他」（2026-10-07）。** Changelog CHG-0063。第 33 列（Disengage）只改書本中文。第 34 列（Ride）同步更新 Forge Steel 版中文與 Basis Hash。Marc 已核准。
- **招式批次分三批（2026-10-07）。** 8-1 是族裔招式名稱。8-2 是族裔描述與內文段。8-3 是 Escape Grab、Grab、Knockback 的內文段。Marc 已核准對照預覽全照建議。
- **一列只能有一個 Forge Steel 版時，選規則句（2026-10-07）。** 第 91 列（Glowing Eyes）、第 191 列（Glamor of Terror）的書本中文第 1 句是 Forge Steel 的 description，第 2 句是文字段。Forge Steel 版選文字段（`section:devil-feature-2-3:0`、`section:high-elf-feature-2-0:0`），description 留英文。不改 Sheet 結構（不讓一列有多個 Forge Steel 版）。8-2 執行。Marc 已核准。
- **第 38、39、41 列選「效果：」那行（2026-10-07）。** Escape Grab、Grab、Knockback 各自只能有一個 Forge Steel 版，選 sections 第 2 段（`section:escape-grab:2`、`section:grab:2`、`section:knockback:2`）。其他段（引言 s0、Grab 的 s3、擲骰行）留英文。8-3 執行，不改程式。Marc 已核准。
- **Forge Steel 版新刪法：行首標籤「效果：」（2026-10-07）。** 只在 Forge Steel 英文也沒有 Effect: 時才刪。不補字、不改寫。用於 8-3 的第 38、39、41 列。因為選的是「效果：」那行，「引言句英文 the following→this」那一項不適用。Marc 已核准。
- **擲骰（tier）文字不新增鍵型，留英文（2026-10-07）。** 族裔招式的擲骰行在 Strings 沒有列。tier 字是 `getTierEffect` 解析英文再組出來的；翻譯運算後的字是 RULES 列的失敗嘗試，先翻資料又會弄壞解析。基本動作第 38、39、41 列的 T1–T3 行同樣留英文。等 P4 職業招式再整體評估。Marc 已核准。
- **招式關鍵字留英文（2026-10-07）。** Area、Magic、Melee、Psionic、Ranged、Strike、Weapon。不用 `enum:AbilityKeyword:<Member>`。排到 P3 或之後另開關鍵字批。Glossary 只有 Melee、Ranged、Strike，其他查無專用列。Marc 已核准。
- **招式的距離、目標、觸發句留英文（2026-10-07）。** 表上沒有獨立列；距離是 `getDistance` 組出來的字；觸發句多數是改寫。Distance／Target／Trigger 標籤本身是 P3。Marc 已核准。
- **Shadowmeld 文字段走 Forge Steel 版，中文不刪字（2026-10-07）。** 第 287 列（`section:polder-feature-1:0`）。Q 照抄 Forge Steel 原文，包括少了 made、把 creatures 打成 creates、多一個分段；R 等於 H，不刪字。上游不改。8-2 執行。Marc 已核准。
- **Forge Steel 改寫的招式段留英文（2026-10-07）。** 共 18 段：Draconian Guard 的 description、觸發句、文字段；Remember your Oath 的文字段；The Wode Defends 的 description；Detect the Supernatural 的 description；Resist the Unnatural 的觸發句、文字段；Determination 的文字段；Keeper of Order 的觸發句、文字段；Reactive Tumble 的觸發句、文字段；Beyondsight 的 description、文字段；Foresight（2-2b）的觸發句、文字段；Psionic Bolt 的 description。DEC-0009 只准刪字。Marc 已核准。
- **`abilityNameKey`／`abilitySectionKey` 只擴到族裔招式（2026-10-07）。** 從族裔資料收集招式 id，保留「畫面英文等於資料英文」的條件。8-1 已擴 `abilityNameKey`；8-2 擴 `abilitySectionKey`，並新增族裔招式 description 的鍵。職業、套組、領域、專長招式不擴。Marc 已核准。
- **只有引言的列不對照（2026-10-07）。** 第 177、331、356 列（You have the following signature ability…、Choose one signature ability…）。Forge Steel 畫面沒有這句。Marc 已核准。
- **職業、套組、領域、專長的招式不在招式批次（2026-10-07）。** 職業排在 P4，Strings 上也沒有這些列。Marc 已核准。
- **Foresight（`time-raider-feature-2-2b`）只做名稱（2026-10-07）。** 名稱直接對第 349 列（8-1 已做）。文字段是改寫，而且第 350 列已是 2-2a 的 Forge Steel 版，所以留英文。Marc 已核准。

- **8-2 的 17 鍵與 8 列 Forge Steel 版已定稿（2026-10-07）。** Marc 明確回覆「8-2 全照建議定稿」。Strings 第 58、65、69、91、191、245、287、304 列 P–V，CHG-0064；description 10 鍵（直接對照 6、Forge Steel 版 4），文字段 7 鍵（直接對照 3、Forge Steel 版 4）。第 287 列 Q 沿用 7-3 方案 A 去掉頭尾空白，段內分段與拼字差異保留；enHash 仍取 Forge Steel 未去空白原文。中文只刪字、不改寫；第 287 列 R 等於 H。實作只換顯示，經典表格加了 Effect 前綴的文字段仍留英文，資料與排版估算不改。Marc 於 2026-10-07 回覆「驗收通過」，已接受（PR #28）。

- **8-3 保留 Forge Steel 自動計算並投射數值到核准中文（2026-10-07）。** Marc 明確要求「跟原文一樣會自動計算，但會顯示正確的中文」，並核准開始實作。Grab／Knockback 的第 2 文字段以原英文查鍵，再把上游計算結果中的力量數字填到核准中文的「你力量」位置；關閉自動計算時恢復原樣。靜態譯文與 DEC-0009 刪字限制維持，執行時數值替換是顯示規則，不另寫計算器。綁定只記替換位置、en／zh 的 sha256 與排版空白；文字變動會由守門要求重新核准位置。未知改寫保留完整計算後英文，避免固定中文覆蓋數值。只支援 `section:grab:2`／`section:knockback:2`；Escape Grab 效果段沿用核准中文，擲骰仍由上游算 Might／Agility。這條補充原「8-3 不改程式」的決定；tier、距離、目標、關鍵字仍留英文。Marc 明確授權唯讀參考備份舊專案的成功方法，以目前 Master Sheet 與顯示層為實作依據。

- **8-3 追修：已翻譯文字段的自動計算也必須正確顯示正體中文（2026-10-07）。** Marc 指出專案目標是 Forge Steel 中文化，原文的計算數字變動時，中文要跟著變，並核准修正治理稽核發現的回歸。共用原文查鍵限於已有顯示綁定的段落；未綁定或未知改寫不能被固定中文蓋掉。新增閃耀熾目（Glowing Eyes，`section:devil-feature-2-3:0`）的等級綁定，英文 `your level` 對應核准中文「你等級」，用同一個轉接器投射上游數字；不改靜態譯文，不新增計算器。此條擴充前條只支援擒抱／擊退的範圍。Strings U91 補註 CHG-0067；Q/R/S/T 不變，mapping 418 鍵、Forge Steel 版 96 列。測試遍歷已翻譯的基本動作及族裔文字段，要求上游數值改動已有中文綁定；英文備援僅為未知情況的暫時保護，不能當作完成該段中文化。未核准的段落及 tier 等既有延後範圍維持。

- **P2-9-1：哈肯人總覽與命定末視（2026-10-07）。** Marc 核准 Strings 204＋205 合併為總覽、220＋221＋222 合併為命定末視 Forge Steel 版；譯文只接合書本核准中文，不補字、不改寫。Hacaarl 在書本中文未譯出，Forge Steel 版不補。命定末視的 `your Recovery value` 以共用顯示轉接器投射上游已計算數字至核准中文「你復元值」位置；未知改寫保留完整計算後英文。該段資料模板含排版用的頭尾空白，Forge Steel Source Text 依既有方案儲存裁去頭尾空白的文字；mapping enHash 仍雜湊未裁切的上游原文，綁定位置則以核准 Forge Steel 版文字為準。共用查鍵只會替單一且有動態綁定的元素欄位提供候選鍵，轉接器仍須驗證實際數字位置。

- **P2-9-1 動態中文句型（2026-10-07）。** Marc 核准命定末視計算後顯示「在 12 小時後，你會恢復 {value} 點體力。」。DEC-0009 繼續限制靜態譯文；動態顯示可使用另行核准的語序與量詞，不更改書本或 Forge Steel 靜態譯文。句型記錄於 Master Sheet Strings U220（CHG-0069），原樣 Note 快照匯出為 fs.calculationDisplay；綁定記錄啟用句型及目標範圍，程式函式不寫獨立中文句子。共用轉接器只投射上游數字，未知改寫保留完整計算後英文。先只啟用命定末視，其他項目逐項對照核准。追修進度見 PROGRESS。

- **P2-9-1 經驗納入後續批次治理（2026-10-08）。** Marc 要求把 P2-9-1 稽核經驗及改善方式寫入治理文件，供新對話接續。稽核未發現另寫計算器、改上游資料／邏輯或各畫面新增翻譯；兩份 Forge Steel 靜態中文都是書本核准中文的原樣接合，動態 Note 與 Sheet 一致。主要改善為預覽提前核准自然動態中文、先確認環境再調整設定、明確記錄檢查缺口、同步快照及減少重複維護。操作規則集中於 RULES「後續批次執行與驗證」，不另建立一套流程。9-1 的分項驗證不能追認成完整 npm run check／本批 npm audit 通過；快照自動整合與既有總鍵數斷言集中化仍待實作，見 PROGRESS。

- **P2-9-2 符文銘刻主說明（2026-10-08）。** Marc 核准以 Strings 第 134 列作 Forge Steel 版，合併第 141 列限制段。Forge Steel Source Text 保存上游兩段原文；Forge Steel Target Text 原樣接合兩列書本核准中文，僅刪去對應 Forge Steel 已刪除的「從以下選擇 1 項：」，段落間空一行。新增 `element:dwarf-feature-1:description` 對照。值 10 分鐘、20 格、10 格、1 哩均為固定原文，本項不涉及自動計算或動態句型。DEC-0009 仍限制靜態譯文不得補字、改寫；動態顯示核准規則不適用於本項。Strings P–V 與核准紀錄見 CHG-0071；實作與驗收進度見 PROGRESS。

- **在地化全域總數集中檢查（2026-10-08）。** P2-9-2 新增一個 mapping 與一列 Forge Steel 版後，六組歷史批次測試仍預期全域 mapping 為 420，CI 失敗；Forge Steel Strings 列數也須由 98 更新為 99。Marc 選擇另開維護 PR，集中 mapping、Forge Steel Strings 列與英文例外總數於 `src/l10n/inventory.test.ts`，各以獨立測試核對明確預期值；各內容批次保留自身鍵與行為檢查。維護 PR 先沿用 develop 的 420／98／10，合併後 P2-9-2 更新基底與集中預期值 421／99／10。不從實際結果產生預期值，不放寬成下限；快照自動整合另列待辦。

- **P2-9-3 虹彩鱗片六個選項（2026-10-08）。** Marc 核准六個網站名稱「虹彩鱗片（酸蝕／寒冷／腐朽／火焰／閃電／毒素）」，作為 DEC-0009 的限縮例外：僅可在這六個 Forge Steel 名稱中，把傷害類型接在既有核准名稱後，不擴及其他靜態譯文。經典表格中的這六個免疫值保留 Forge Steel 原順序，以正體中文傷害類型加上游計算值呈現（例：「酸蝕 2」）；不更動計算邏輯，也不翻譯其他共用免疫摘要或 UI。Master Sheet Strings 942–947 與 CHG-0073 記錄六項名稱；實作與驗收見 PROGRESS。

- **快照 CSV 與核准動態 Note 整合（2026-10-08，Marc 核准實作）。** 使用既有 Google Drive 連接器取得資料，將核准必要欄位投影交給離線整合腳本；不新增 Google 登入、線上 runtime 或 CI 下載。靜態 CSV 與動態 Note 同次重建，以 String ID 關聯，前後修改時間不一致即停止；暫存產物通過既有匯出與守門才更新正式檔案，可捕捉的寫入失敗還原。不是多檔案交易，不宣稱可復原斷電／強制終止。中文、句型、綁定與計算規則維持原核准範圍；驗收進度見 PROGRESS。

## 尚未決定

網站這邊目前沒有。Master Sheet Project State 的 Open Decisions 是 1：Glossary 第 160 列 `term.enhancement`（Enhancement）翻譯未定、狀態 NEW（CHG-0013、CHG-0014）。那是書本翻譯的事，和網站批次無關，AI 不自行補完。
