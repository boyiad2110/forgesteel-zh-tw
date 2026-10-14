# PERKS-01 專長在地化

2026-10-14。本批對照 Heroes 1.01b 的 47 個專長（Book Master `1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4`，BOOK-02 已核准）。第 1 段只盤點並接入專長名稱與 6 個類別名稱。效果、招式與魔寵數據表留後續段，經 Marc 人工驗收後才做。

## 第 1 段範圍

- 快照納入書本 APPROVED。書本修改時間 `2026-10-14T04:49:24.959Z`，與本次附帶唯讀匯出（2026-10-14 12:49 UTC+8）一致。Forge Steel Master 沿用既有核准快照（修改時間 `2026-10-13T03:54:16.650Z`），未改 Google Sheets。
- 目錄由 Names 60／Strings 872 增至 Names 89／Strings 993。新增 29 個專長名稱、47 個 `heroes.perks.*.effect`，以及 74 個已核准 Career 背景問題。Glossary 僅 `term.group-test` 由「團體考驗」改為核准後的「團隊考驗」；此術語目前沒有網站 mapping，本段畫面不因此改字。
- 本段先新增 24 個名稱 mapping（既有 15 個＋本次 24 個＝39）。2026-10-14 Marc 再核准 4 個只差標點的名稱，mapping 增至 43。效果與 74 個背景問題在目錄中，沒有 mapping，畫面維持英文或維持不顯示。
- 另外 4 個名稱差在大小寫或拼字。它們不進 `english-exceptions.json`。工具已能接受書本 Names 的 Adaptation；畫面仍是英文，直到協調者把核准列貼上 Forge Sheet 並重做快照。

## 對照摘要

名稱是本段接入依據。效果欄位本段不接入，另列以便後續段判斷。

| 狀態 | 名稱 | 效果欄位（空白收成單行後） |
|---|---:|---:|
| exact | 39 | 35 |
| FS text differs from 1.01b | 8 | 12 |
| missing in FS | 0 | 0 |
| extra in FS | 0 | 0 |

核心來源 `src/data/perks/` 與 `src/data/perk-data.ts` 正好 47 項，沒有缺項，也沒有 Heroes 1.01b 以外的額外核心專長。其他來源書另有專長，不在這 47 列：Beastheart 8、社群 6、Age of Secrets 5、Triglav 4。它們沒有書本 Name ID，維持英文。

## PR #68 延後的 3 個名稱

[PR #68](https://github.com/boyiad2110/forgesteel-zh-tw/pull/68) 已於 2026-10-13 squash 合併為 develop `5e7f7220`。當時這 3 個名稱因英文不完全吻合而回退，本段對照穩定 ID 後維持同一決定：

| FS id | 網站英文 | 書本 Name ID | 書本英文 | 核准中文（未接入） |
|---|---|---|---|---|
| `perk-ive-read-about-this-place` | I've Read About This Place | `name.perk.ive-read-about-this-place` | I’ve Read About This Place | 我知道這地方 |
| `perk-put-your-back-into-it` | Put Your Back Into It | `name.perk.put-your-back-into-it` | Put Your Back Into It! | 全力以赴！ |
| `perk-spot-the-tell` | Spot The Tell | `name.perk.spot-the-tell` | Spot the Tell | 發現破綻 |

撇號、驚嘆號與 the／The 都算不同來源，不改寫書本正典。

## 2026-10-14：8 個延後名稱

Marc 在對話中核准這 8 個名稱使用書本 Names 的核准中文，不改網站英文、不改書本正典。

只差標點的 4 個列入 `src/l10n/english-exceptions.json`，kind 為 `punctuation`。正體中文模式顯示核准中文原樣，包含「！」與「……」：

| FS id | 核准中文 |
|---|---|
| `perk-ive-read-about-this-place` | 我知道這地方 |
| `perk-put-your-back-into-it` | 全力以赴！ |
| `perk-ive-got-you` | 我接住你了！ |
| `perk-so-tell-me` | 誠實告訴我…… |

差在大小寫或拼字的 4 個不列例外：`perk-spot-the-tell`、`perk-gum-up-the-works`、`perk-travelling-artisan`、`perk-travelling-sage`。`dual-sheet.mjs` 現在接受 Source Type `Book Name`，Book String ID 填 Names 的 Name ID，雜湊規則與 Book String 相同。核准列貼上 Forge Sheet 並重做快照之後，這 4 個名稱才會顯示中文。

另外 5 個名稱同樣不同，本段才列入：

| FS id | 網站英文 | 書本英文 | 差異 |
|---|---|---|---|
| `perk-gum-up-the-works` | Gum Up The Works | Gum Up the Works | The／the |
| `perk-ive-got-you` | I've Got You | I’ve Got You! | 撇號與驚嘆號 |
| `perk-so-tell-me` | So, Tell Me ... | So Tell Me … | 逗號與省略號 |
| `perk-travelling-artisan` | Travelling Artisan | Traveling Artisan | 拼字；Name ID 為 `traveling-artisan` |
| `perk-travelling-sage` | Travelling Sage | Traveling Sage | 拼字；Name ID 為 `traveling-sage` |

## 47 列覆蓋

定義檔都在 `src/data/perks/<category>.ts`，並由 `src/data/perk-data.ts` 轉出。String ID 皆為 `heroes.perks.<slug>.effect`；Travelling 的書本 slug 是 `traveling`。名稱對照欄用網站名稱對書本 Names。效果對照只比較該專長物件自己的 `description` 與書本來源英文，不改寫任何一方。

| 類別 | FS id | 結構 | 網站英文 | Name ID | 名稱對照 | 效果對照 | 本段顯示 |
|---|---|---|---|---|---|---|---|
| Crafting | `perk-area-of-expertise` | Text | Area of Expertise | `name.perk.area-of-expertise` | exact | exact | 專業領域 |
| Crafting | `perk-expert-artisan` | Text | Expert Artisan | `name.perk.expert-artisan` | exact | exact | 工藝專家 |
| Crafting | `perk-handy` | Text | Handy | `name.perk.handy` | exact | exact | 心靈手巧 |
| Crafting | `perk-improvisation-creation` | Text | Improvisation Creation | `name.perk.improvisation-creation` | exact | exact | 即興創造 |
| Crafting | `perk-inspired-artisan` | Text | Inspired Artisan | `name.perk.inspired-artisan` | exact | exact | 創意工匠 |
| Crafting | `perk-travelling-artisan` | Text | Travelling Artisan | `name.perk.traveling-artisan` | FS text differs from 1.01b | exact | Travelling Artisan |
| Exploration | `perk-brawny` | Text | Brawny | `name.perk.brawny` | exact | exact | 肌肉發達 |
| Exploration | `perk-camouflage-hunter` | Text | Camouflage Hunter | `name.perk.camouflage-hunter` | exact | exact | 迷彩獵人 |
| Exploration | `perk-danger-sense` | Text | Danger Sense | `name.perk.danger-sense` | exact | exact | 危險感知 |
| Exploration | `perk-friend-catapult` | Ability `perk-friend-catapult-1` | Friend Catapult | `name.perk.friend-catapult` | exact | FS text differs from 1.01b | 投擲盟友 |
| Exploration | `perk-ive-got-you` | Ability `perk-ive-got-you-1` | I've Got You | `name.perk.ive-got-you` | FS text differs from 1.01b | FS text differs from 1.01b | I've Got You |
| Exploration | `perk-monster-whisperer` | Text | Monster Whisperer | `name.perk.monster-whisperer` | exact | exact | 怪物溝通師 |
| Exploration | `perk-put-your-back-into-it` | Text | Put Your Back Into It | `name.perk.put-your-back-into-it` | FS text differs from 1.01b | exact | Put Your Back Into It |
| Exploration | `perk-team-leader` | Text | Team Leader | `name.perk.team-leader` | exact | exact | 團隊領袖 |
| Exploration | `perk-teamwork` | Text | Teamwork | `name.perk.teamwork` | exact | FS text differs from 1.01b | 團隊合作 |
| Exploration | `perk-wood-wise` | Text | Wood Wise | `name.perk.wood-wise` | exact | exact | 林野智慧 |
| Interpersonal | `perk-charming-liar` | Text | Charming Liar | `name.perk.charming-liar` | exact | exact | 迷人騙子 |
| Interpersonal | `perk-dazzler` | Text | Dazzler | `name.perk.dazzler` | exact | exact | 閃耀表演 |
| Interpersonal | `perk-engrossing-monologue` | Text | Engrossing Monologue | `name.perk.engrossing-monologue` | exact | exact | 聚焦獨白 |
| Interpersonal | `perk-harmonizer` | Text | Harmonizer | `name.perk.harmonizer` | exact | exact | 和諧之音 |
| Interpersonal | `perk-lie-detector` | Text | Lie Detector | `name.perk.lie-detector` | exact | exact | 測謊專家 |
| Interpersonal | `perk-open-book` | Text | Open Book | `name.perk.open-book` | exact | exact | 坦誠相待 |
| Interpersonal | `perk-pardon-my-friend` | Text | Pardon My Friend | `name.perk.pardon-my-friend` | exact | exact | 代友發言 |
| Interpersonal | `perk-power-player` | Text | Power Player | `name.perk.power-player` | exact | exact | 強勢態度 |
| Interpersonal | `perk-so-tell-me` | Text | So, Tell Me ... | `name.perk.so-tell-me` | FS text differs from 1.01b | exact | So, Tell Me ... |
| Interpersonal | `perk-spot-the-tell` | Text | Spot The Tell | `name.perk.spot-the-tell` | FS text differs from 1.01b | exact | Spot The Tell |
| Intrigue | `perk-criminal-contacts` | Text | Criminal Contacts | `name.perk.criminal-contacts` | exact | exact | 江湖人脈 |
| Intrigue | `perk-forgettable-face` | Text | Forgettable Face | `name.perk.forgettable-face` | exact | exact | 平凡容貌 |
| Intrigue | `perk-gum-up-the-works` | Ability `perk-gum-up-the-works-1` | Gum Up The Works | `name.perk.gum-up-the-works` | FS text differs from 1.01b | FS text differs from 1.01b | Gum Up The Works |
| Intrigue | `perk-lucky-dog` | Text | Lucky Dog | `name.perk.lucky-dog` | exact | exact | 幸運兒 |
| Intrigue | `perk-master-of-disguise` | Text | Master of Disguise | `name.perk.master-of-disguise` | exact | exact | 易容大師 |
| Intrigue | `perk-slipped-lead` | Text | Slipped Lead | `name.perk.slipped-lead` | exact | exact | 脫逃大師 |
| Lore | `perk-but-i-know-who-does` | Text | But I Know Who Does | `name.perk.but-i-know-who-does` | exact | exact | 我知道誰知道 |
| Lore | `perk-eidetic-memory` | SkillChoice | Eidetic Memory | `name.perk.eidetic-memory` | exact | exact | 過目不忘 |
| Lore | `perk-expert-sage` | Text | Expert Sage | `name.perk.expert-sage` | exact | exact | 學術專家 |
| Lore | `perk-ive-read-about-this-place` | Text | I've Read About This Place | `name.perk.ive-read-about-this-place` | FS text differs from 1.01b | FS text differs from 1.01b | I've Read About This Place |
| Lore | `perk-linguist` | Multiple | Linguist | `name.perk.linguist` | exact | FS text differs from 1.01b | 語言學家 |
| Lore | `perk-polymath` | Text | Polymath | `name.perk.polymath` | exact | exact | 博學多聞 |
| Lore | `perk-specialist` | Text | Specialist | `name.perk.specialist` | exact | exact | 專業知識 |
| Lore | `perk-travelling-sage` | Text | Travelling Sage | `name.perk.traveling-sage` | FS text differs from 1.01b | exact | Travelling Sage |
| Supernatural | `perk-arcane-trick` | Ability `perk-arcane-trick-1` | Arcane Trick | `name.perk.arcane-trick` | exact | FS text differs from 1.01b | 奧術戲法 |
| Supernatural | `perk-creature-sense` | Ability `perk-creature-sense-1` | Creature Sense | `name.perk.creature-sense` | exact | FS text differs from 1.01b | 生物感應 |
| Supernatural | `perk-familiar` | Summon `familiar` | Familiar | `name.perk.familiar` | exact | FS text differs from 1.01b | 魔寵 |
| Supernatural | `perk-invisible-force` | Ability `perk-invisible-force-1` | Invisible Force | `name.perk.invisible-force` | exact | FS text differs from 1.01b | 無形念力 |
| Supernatural | `perk-psychic-whisper` | Ability `perk-psychic-whisper-1` | Psychic Whisper | `name.perk.psychic-whisper` | exact | FS text differs from 1.01b | 心靈低語 |
| Supernatural | `perk-ritualist` | Text | Ritualist | `name.perk.ritualist` | exact | exact | 儀式師 |
| Supernatural | `perk-thingspeaker` | Text | Thingspeaker | `name.perk.thingspeaker` | exact | FS text differs from 1.01b | 憶物通靈 |

效果差異的內容（不改規則、不改書本）：

- `perk-teamwork`：網站是 “a montage test”，書本是 “any montage test”。
- `perk-ive-read-about-this-place`：名稱撇號不同；條列符號網站為 `*`、書本為 `•`。
- `perk-thingspeaker`：條列符號網站為 `*`、書本為 `•`。
- `perk-linguist`：網站專長描述只有第一句；7 日拾得語言在子特性 `perk-linguist-1`，語言選擇在 `perk-linguist-2`。書本把兩段寫在同一則效果。
- 招式型專長把完整規則放在招式區段，專長 `description` 只留短句：`perk-friend-catapult`、`perk-ive-got-you`、`perk-gum-up-the-works`、`perk-arcane-trick`、`perk-creature-sense`、`perk-invisible-force`、`perk-psychic-whisper`。
- `perk-familiar`：網站 `description` 為空，規則在召喚物 `familiar`。特性 `familiar-2` 的網站名稱是 Telepathic。

## 類別名稱

6 個 Heroes 類別沿用既有核准用語，本段接到專長選擇抽屜與經典角色卡的專長清單：

| 類別 | 顯示 | 來源 |
|---|---|---|
| Crafting | 工藝類 | `term.crafting-skill-group` |
| Exploration | 探索類 | `term.exploration-skill-group` |
| Interpersonal | 交涉類 | `term.interpersonal-skill-group` |
| Intrigue | 諜報類 | `term.intrigue-skill-group` |
| Lore | 學識類 | `term.lore-skill-group` |
| Supernatural | 超常類 | `ui.hero-builder.supernatural.fe29726a` |

`PerkList.Special` 仍用既有 UI「特殊」，核心 47 項沒有使用這個類別。

## 名稱顯示位置

正體中文只在顯示時套用。改名、自訂與非官方來源維持原文字。

- 專長選擇抽屜與專長詳情：`FeaturePanel` 標籤使用 `perkListText`；文字型專長標題走 `ElementScope`。招式型專長的標題與專長名稱相同，因此只把專長名稱範圍套在招式面板外層；關鍵詞、動作、距離、目標與效果仍留在招式資料，本段不翻譯。
- 已選專長列：`PlayerName`。
- 經典角色卡：官方專長標題與已選專長使用 `PlayerName`；專長類別清單使用 `perkListText`。數量列在正體中文寫成「1 項工藝類 Perk」（多類別為「1 項探索類、交涉類或諜報類 Perk」），Perk 維持英文；英文模式仍是 “1 Crafting Perk”／“2 Exploration Perks”。量詞取自核准提示「選擇 1 項專長。」裡「1 」後面的字，連接詞取自核准的 Small! 描述括號，程式碼本身不另寫漢字。生涯選擇提示沿用核准的「選擇 1 項專長。」，益處句沿用「N 項X類專長」，兩者都不是這條數量列。

## 後續段

每一段都要 Marc 人工驗收後才開始下一段。不改遊戲數值、占位符、存檔或分享格式。英文與書本不一致的欄位，沒有核准 Adaptation 就維持英文。

### 第 2 段：單純文字效果

接入 `description` 與書本來源英文一致的文字型效果，原樣使用 APPROVED 中文。包含名稱仍為英文、但效果英文一致的 `perk-travelling-artisan`、`perk-put-your-back-into-it`、`perk-so-tell-me`、`perk-spot-the-tell`、`perk-travelling-sage`。

先單獨處理這 3 個效果差異，不把書本中文直接套上不同英文：

- `perk-teamwork` 的 any
- `perk-thingspeaker` 的條列符號
- `perk-ive-read-about-this-place` 的撇號與條列符號

`perk-eidetic-memory` 的效果英文一致，可放本段；它的技能選擇 UI 若要連動，先確認是否只翻譯描述。`perk-linguist` 的描述被拆成子特性，不放本段。

### 第 3 段：專長授予的招式

範圍是招式名稱、描述、關鍵詞、動作類型、距離、目標與效果區段：

- `perk-friend-catapult-1`：機動動作，自身
- `perk-ive-got-you-1`：免費反應
- `perk-gum-up-the-works-1`：反應
- `perk-creature-sense-1`：機動動作
- `perk-invisible-force-1`：機動動作，靈能、遠程
- `perk-psychic-whisper-1`：機動動作，靈能、遠程

名稱英文與書本不同的 `I've Got You`、`Gum Up The Works` 仍先維持英文，除非另有核准 Adaptation。數值與占位符照網站計算結果顯示。

### 第 4 段：奧術戲法與魔寵

`perk-arcane-trick-1` 是主要動作、關鍵詞 Magic，效果區有 7 個選項。書本 String `heroes.perks.arcane-trick.effect` 的核准中文要完整顯示，不摘要。

魔寵以 Heroes 1.01b 核准列為準，不用舊 Notion 數字。書本來源與核准中文寫明：

- 理智 0、基礎打擊 0、移動 —
- 體型 1T、速度 5、體力 2 × 等級、穩度 0
- 力量 −3、敏捷 +2、直覺 0、氣場 +1
- 特性名稱 Telepathic／心靈感應

網站目前把速度存成 5、基礎打擊 0、理智 0、氣場 +1，體力則是基礎 0 再加固定 2 與每級 2。這和「2 × 等級」不是同一組儲存數字。第 4 段只做顯示；若無法在不改存檔數值的前提下呈現核准數據表，先停下來請 Marc 決定，不改怪物資料。書本英文來源列印有 Familliar 與 “The While” 字樣，那是來源紀錄，不在網站上「修正」。

`perk-linguist` 的子特性與語言選擇若還沒有獨立核准接點，也放本段處理，避免和第 2 段的單段描述混在一起。

### 第 5 段：收尾

更新 TODO、PROGRESS、README 與本文件的驗收狀態。確認 8 個名稱回退、非 Heroes 專長、74 個背景問題都仍標成未接入。不把第 1–4 段的顯示覆蓋寫成整批專長完成。

## 本段不處理

- 專長效果、招式內文、魔寵數據表與 Telepathic。
- 74 個 Career 背景問題。網站模型沒有這些欄位，快照只保存核准書本譯文。
- 非 Heroes 來源書的專長。
- Google Sheets、遊戲規則、存檔與分享格式。
