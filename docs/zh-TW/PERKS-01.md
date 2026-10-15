# PERKS-01 專長在地化

2026-10-14。本批對照 Heroes 1.01b 的 47 個專長（Book Master `1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4`，BOOK-02 已核准）。第 1 段已由 Marc 驗收（head `f8cf1d3`）：47 個專長名稱與 6 個類別。第 2 段已由 Marc 驗收。第 3 段的核准招式欄位與整段算式顯示已接入。第 4 段的核准短描述、七個效果、魔寵散文、心靈感應與標籤已接入。都在同一 PR #69。

## 第 1 段範圍

- 第 1 段最初的快照納入書本 APPROVED。當時書本修改時間 `2026-10-14T04:49:24.959Z`，Forge Steel Master 沿用修改時間 `2026-10-13T03:54:16.650Z`。這兩個時間已被下方這一輪取代。
- 目錄由 Names 60／Strings 872 增至 Names 89／Strings 993。新增 29 個專長名稱、47 個 `heroes.perks.*.effect`，以及 74 個已核准 Career 背景問題。Glossary 僅 `term.group-test` 由「團體考驗」改為核准後的「團隊考驗」；此術語目前沒有網站 mapping，本段畫面不因此改字。
- 本段先新增 24 個名稱 mapping（既有 15 個＋本次 24 個＝39）。2026-10-14 Marc 再核准其餘 8 個名稱：4 個標點例外，以及 4 個 Book Name Adaptation。mapping 現為 47。效果與 74 個背景問題在目錄中，沒有 mapping，畫面維持英文或維持不顯示。
- 2026-10-14 稍後的雙來源快照已套用。書本修改時間 `2026-10-14T06:02:56.566Z`，內容指紋 `7d2ea2a6a762ac0a76679c3f197b4957898996aa515095c7a237341931c7ab65`。Forge Steel Master 修改時間 `2026-10-14T06:07:05.257Z`，內容指紋 `9a61faa8348c65c779d65387fe32fc2d078fe45520b291354e1803fb16783182`。目錄為 Glossary 332、Names 101、Strings 1037、UI 209。
- 同一次書本擷取裡，他人在 2026-10-14 14:02:56（UTC+8）寫入的核准套裝列也被刷新工具納入，因為工具會收進所有 APPROVED。多出的是 12 個套裝／招牌招式名稱，以及 44 筆 `heroes.kits.*` 字串，都沒有網站 mapping，畫面不改。Glossary 的 `term.enhancement` 狀態是 NEW，未納入。既有核准列的英文、中文與更新日期沒有變。

未接入的 12 個名稱：`name.kit.arcane-archer` 魔弓、`name.kit-ability.exploding-arrow` 爆裂箭矢、`name.kit.battlemind` 戰念、`name.kit-ability.unmooring` 脫韁解錨、`name.kit.cloak-and-dagger` 潛襲、`name.kit-ability.fade` 回身掠影、`name.kit.dual-wielder` 雙持、`name.kit-ability.double-strike` 雙重打擊、`name.kit.guisarmier` 長兵、`name.kit-ability.forward-thrust-backward-smash` 前刺後劈、`name.kit.martial-artist` 武術、`name.kit-ability.battle-grace` 戰鬥之舞。44 筆字串是這 6 個套裝的 description、equipment、bonus 與 signature，ID 前綴為 `heroes.kits.arcane-archer.`、`heroes.kits.battlemind.`、`heroes.kits.cloak-and-dagger.`、`heroes.kits.dual-wielder.`、`heroes.kits.guisarmier.`、`heroes.kits.martial-artist.`。

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

差在大小寫或拼字的 4 個不列例外：`perk-spot-the-tell`、`perk-gum-up-the-works`、`perk-travelling-artisan`、`perk-travelling-sage`。`dual-sheet.mjs` 接受 Source Type `Book Name`，Book String ID 填 Names 的 Name ID，雜湊規則與 Book String 相同。這 4 列已是 Forge Master 的 APPROVED，並寫進本次快照的 `names.csv` `fs`。正體中文顯示書本核准中文；英文模式仍是網站英文。

| FS id | 核准中文 | 網站英文 |
|---|---|---|
| `perk-spot-the-tell` | 發現破綻 | Spot The Tell |
| `perk-gum-up-the-works` | 妨礙運作 | Gum Up The Works |
| `perk-travelling-artisan` | 旅行工匠 | Travelling Artisan |
| `perk-travelling-sage` | 旅行學者 | Travelling Sage |

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
| Crafting | `perk-travelling-artisan` | Text | Travelling Artisan | `name.perk.traveling-artisan` | FS text differs from 1.01b | exact | 旅行工匠 |
| Exploration | `perk-brawny` | Text | Brawny | `name.perk.brawny` | exact | exact | 肌肉發達 |
| Exploration | `perk-camouflage-hunter` | Text | Camouflage Hunter | `name.perk.camouflage-hunter` | exact | exact | 迷彩獵人 |
| Exploration | `perk-danger-sense` | Text | Danger Sense | `name.perk.danger-sense` | exact | exact | 危險感知 |
| Exploration | `perk-friend-catapult` | Ability `perk-friend-catapult-1` | Friend Catapult | `name.perk.friend-catapult` | exact | FS text differs from 1.01b | 投擲盟友 |
| Exploration | `perk-ive-got-you` | Ability `perk-ive-got-you-1` | I've Got You | `name.perk.ive-got-you` | FS text differs from 1.01b | FS text differs from 1.01b | 我接住你了！ |
| Exploration | `perk-monster-whisperer` | Text | Monster Whisperer | `name.perk.monster-whisperer` | exact | exact | 怪物溝通師 |
| Exploration | `perk-put-your-back-into-it` | Text | Put Your Back Into It | `name.perk.put-your-back-into-it` | FS text differs from 1.01b | exact | 全力以赴！ |
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
| Interpersonal | `perk-so-tell-me` | Text | So, Tell Me ... | `name.perk.so-tell-me` | FS text differs from 1.01b | exact | 誠實告訴我…… |
| Interpersonal | `perk-spot-the-tell` | Text | Spot The Tell | `name.perk.spot-the-tell` | FS text differs from 1.01b | exact | 發現破綻 |
| Intrigue | `perk-criminal-contacts` | Text | Criminal Contacts | `name.perk.criminal-contacts` | exact | exact | 江湖人脈 |
| Intrigue | `perk-forgettable-face` | Text | Forgettable Face | `name.perk.forgettable-face` | exact | exact | 平凡容貌 |
| Intrigue | `perk-gum-up-the-works` | Ability `perk-gum-up-the-works-1` | Gum Up The Works | `name.perk.gum-up-the-works` | FS text differs from 1.01b | FS text differs from 1.01b | 妨礙運作 |
| Intrigue | `perk-lucky-dog` | Text | Lucky Dog | `name.perk.lucky-dog` | exact | exact | 幸運兒 |
| Intrigue | `perk-master-of-disguise` | Text | Master of Disguise | `name.perk.master-of-disguise` | exact | exact | 易容大師 |
| Intrigue | `perk-slipped-lead` | Text | Slipped Lead | `name.perk.slipped-lead` | exact | exact | 脫逃大師 |
| Lore | `perk-but-i-know-who-does` | Text | But I Know Who Does | `name.perk.but-i-know-who-does` | exact | exact | 我知道誰知道 |
| Lore | `perk-eidetic-memory` | SkillChoice | Eidetic Memory | `name.perk.eidetic-memory` | exact | exact | 過目不忘 |
| Lore | `perk-expert-sage` | Text | Expert Sage | `name.perk.expert-sage` | exact | exact | 學術專家 |
| Lore | `perk-ive-read-about-this-place` | Text | I've Read About This Place | `name.perk.ive-read-about-this-place` | FS text differs from 1.01b | FS text differs from 1.01b | 我知道這地方 |
| Lore | `perk-linguist` | Multiple | Linguist | `name.perk.linguist` | exact | FS text differs from 1.01b | 語言學家 |
| Lore | `perk-polymath` | Text | Polymath | `name.perk.polymath` | exact | exact | 博學多聞 |
| Lore | `perk-specialist` | Text | Specialist | `name.perk.specialist` | exact | exact | 專業知識 |
| Lore | `perk-travelling-sage` | Text | Travelling Sage | `name.perk.traveling-sage` | FS text differs from 1.01b | exact | 旅行學者 |
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
- 已選專長列：名稱用 `PlayerName`。效果用 `officialPerkDescriptionKey`，所以這列和抽屜、經典角色卡讀同一則核准效果。改寫過的描述沒有這個鍵，維持英文。
- 經典角色卡：官方專長標題與已選專長使用 `PlayerName`；專長類別清單使用 `perkListText`。數量列在正體中文寫成「1 項工藝類 Perk」（多類別為「1 項探索類、交涉類或諜報類 Perk」），Perk 維持英文；英文模式仍是 “1 Crafting Perk”／“2 Exploration Perks”。量詞取自核准提示「選擇 1 項專長。」裡「1 」後面的字，連接詞取自核准的 Small! 描述括號，程式碼本身不另寫漢字。生涯選擇提示沿用核准的「選擇 1 項專長。」，益處句沿用「N 項X類專長」，兩者都不是這條數量列。

## 後續段

每一段都要 Marc 人工驗收後才開始下一段。不改遊戲數值、占位符、存檔或分享格式。英文與書本不一致的欄位，沒有核准 Adaptation 就維持英文。

### 第 2 段：單純文字效果

沿用第 1 段快照，不重新擷取。37 個純文字效果以 APPROVED `heroes.perks.*.effect` 原樣接入，不摘要、不截斷。網站英文與書本英文相同的有 35 個。`perk-ive-read-about-this-place` 與 `perk-thingspeaker` 只有條列符號和空行差異，走既有標點例外。我知道這地方的畫面沿用書本圓點。憶物通靈的核准中文仍是 ①②③，目錄不改；顯示時只把行首圈號換成與網站英文相同的 `*` 清單，每個字維持原樣，後面的句子留在清單外。套裝招式裡的 ①②③ 是階序，不套用這個轉換。旅行工匠與旅行學者的書本 ID 是 `traveling`（一個 l），網站 id 是 `travelling`。

已接入：`perk-area-of-expertise`、`perk-brawny`、`perk-but-i-know-who-does`、`perk-camouflage-hunter`、`perk-charming-liar`、`perk-criminal-contacts`、`perk-danger-sense`、`perk-dazzler`、`perk-eidetic-memory`、`perk-engrossing-monologue`、`perk-expert-artisan`、`perk-expert-sage`、`perk-forgettable-face`、`perk-handy`、`perk-harmonizer`、`perk-improvisation-creation`、`perk-inspired-artisan`、`perk-ive-read-about-this-place`、`perk-lie-detector`、`perk-lucky-dog`、`perk-master-of-disguise`、`perk-monster-whisperer`、`perk-open-book`、`perk-pardon-my-friend`、`perk-polymath`、`perk-power-player`、`perk-put-your-back-into-it`、`perk-ritualist`、`perk-slipped-lead`、`perk-so-tell-me`、`perk-specialist`、`perk-spot-the-tell`、`perk-team-leader`、`perk-thingspeaker`、`perk-travelling-artisan`、`perk-travelling-sage`、`perk-wood-wise`。

`perk-eidetic-memory` 是技能選擇。詳情抽屜與經典角色卡都顯示完整效果。角色卡的計數列用核准的「{list}技能」模板，顯示「1 學識類技能」。尚未選擇的占位使用核准 UI `ui.hero-builder.unselected.26118cfc`，正體中文是「尚未選擇」，英文模式仍是 `Unselected`。改寫過的官方效果維持英文。

肌肉發達與幸運兒的書本英文和網站英文相同，不是版本差異。抽屜有英雄時，上游把 “your level” 換成該英雄的等級數字，靜態中文因此對不上。這兩則書本列沒有 Forge Steel 版；計算綁定直接指核准書本列，把上游整數投射進「等級」，並沿用既有綁定在數字後留一個空格，所以 1 級顯示「1d6 + 1 的體力」。沒有英雄時仍是「等級」。沒有新增中文，也沒有 Adaptation。未知改寫仍顯示完整計算後英文。

維持英文，本段不接：

- `perk-teamwork`：網站是 “during a montage test”，書本是 “during any montage test”。Marc 已於 2026-10-14 核准 Adaptation `fs-adapt:heroes.perks.teamwork.effect`。中文只刪掉書本句的「任何」，其餘逐字保留，並已接入 mapping。
- `perk-linguist`：網站父項多了 “You have an ear for languages.”，子項再拆成 7 日句子與語言選擇。Marc 已於 2026-10-14 核准兩列 Adaptation。父項 `fs-adapt:heroes.perks.linguist.effect` 寫進書本列的 Forge Steel 版，中文只留「你自動學會 2 種新語言，前提是你曾經有機會經常聽到或讀到這些語言。」整段父項換成這句，多出來的英文句子在正體中文模式不會出現。子項 `fs-adapt:heroes.perks.linguist.effect.1` 對應 `perk-linguist-1`，刪掉「此外，」和「（詳見第 12 章〈休整專案〉）」，保留句號；同一書本列的第二次用途留在 `adaptations.json`，由 usage key 選出。這個子特性的英文名稱與專長相同，畫面重用 `name.perk.linguist` 的「語言學家」。語言選擇 `perk-linguist-2` 沒有書本句子；名稱與提示重用核准 UI「語言」和「選擇 2 種語言。」。角色卡上尚未選擇的占位使用同一筆核准 UI「尚未選擇」。
- 招式型短描述（第 3 段，當時尚未核准）：`perk-friend-catapult`、`perk-ive-got-you`、`perk-gum-up-the-works`、`perk-creature-sense`、`perk-invisible-force`、`perk-psychic-whisper`。短描述與完整招式不同，不把書本整段套上去。Marc 其後核准 Adaptation，接入方式見第 3 段。
- 第 4 段結構（當時尚未核准）：`perk-arcane-trick`、`perk-familiar`。Marc 其後核准 Adaptation 與 UI，接入方式見第 4 段。

mapping 985。英文例外 17。帶 Forge Steel 版本的字串列是 326。語言學家父項與子項都已接入；子項不是另一筆 Forge Steel 字串列。這次刷新書本 Strings 多 24 筆，Glossary 與 Names 不變；這些新列沒有 mapping。UI 多 1 筆「尚未選擇」，已接入經典角色卡占位。快照：書本 `2026-10-14T08:59:41.775Z` 指紋 `23bbba7157315271b85aff4ff4a2aa0553d6336ddfa37eedfcc88797a4cc8573`，Forge `2026-10-14T09:03:19.136Z` 指紋 `d5e2cbd87713b26eb51924af2ad9d232b3ed513711d5fc7467f758355790c4f7`。目錄 Glossary 333／Names 131／Strings 1192／UI 210。

### 第 3 段：專長授予的招式

Marc 已核准第 3 段草稿，並把 Distance / Target 定為「射程 / 目標」（半形斜線，兩側各一個半形空格）。snapshot-capture-7：書本修改時間與指紋不變（`2026-10-14T08:59:41.775Z`，`23bbba7157315271b85aff4ff4a2aa0553d6336ddfa37eedfcc88797a4cc8573`）。Forge 修改時間 `2026-10-15T03:07:32.421Z`，指紋 `a3720f4e9e951eaea3c40e6fb51cdcf9ec3b234eb684030db7f5fc82269d7a50`。目錄 Glossary 333／Names 131／Strings 1192／UI 219。書本 Strings 多出的 24 筆套裝列仍沒有 mapping。

Forge Steel UI 第 212–220 列已接入：射程、目標、射程 / 目標、自身、效果、觸發、靈能、反應動作、免費反應動作。反應動作與免費反應動作使用這些 UI 列。書本沒有 `heroes.actions.triggered.rules` 與 `heroes.actions.free-triggered.rules`，畫面不引用它們。

Adaptations 第 333–348 列、Adaptation Sources 第 339–354 列已接入。ID 是 `fs-adapt:heroes.perks.<perk>.effect`，以及 `.short`、`.trigger`、`.target`。書本沒有這三個後綴 ID，每一列的來源都是該專長的 `.effect`。作者寫的 usage key 與現有文法相同，守門已接受，沒有改 Sheet 儲存格：`element:perk-<id>:description`、`section:perk-<id>-1:0`、`element:perk-<id>-1:trigger`、`element:perk-<id>-1:target`。沒有後綴的適配寫進書本列的 Forge Steel 版，帶 Forge Steel 版本的字串列由 326 增至 332。短描述、觸發與目標由 usage key 選出。mapping 1012。英文例外仍是 17。

六個招式都沒有檢定階級。標題在英文仍與專長相同時重用名稱鍵。`Maneuver` 與 `Ranged` 重用詞彙；「遠程 10」只換詞、保留上游數字。類型列在正體中文是「機動動作」「反應動作」「免費反應動作」。色帶其後改成兩字，見下方「色帶兩字」。CSS 類別維持 `type-maneuver`、`type-trigger`、`type-free`。英文模式的色帶仍是小寫單字。

我接住你了的效果中文已改成書本句的刪節：「你可以安全地接住他。你和盟友都不會受到墜落造成的傷害。」Adaptations 第 337 列 `fs-adapt:heroes.perks.ive-got-you.effect` 的 Forge Steel Target Text 就是這句。

有英雄時，投擲盟友的上游計算把兩處 “twice your Might score” 換成整數。綁定 `section:perk-friend-catapult-1:0` 改寫整段「等於你力量 ×2 的格數」：力量 2 顯示「推動最多 4 格」與「墜落的有效距離會減少 4 格」。量詞「格」取自該段核准原文。數字兩側各留一個半形空格。沒有英雄時仍是「等於你力量 ×2 的格數」。肌肉發達與幸運兒已是「1d6 + 1 的體力」，擒抱與擊退已是「體型 ≦ 2 的生物」，發光眼已是「等於 1d10 + 2 的心靈傷害」，龍鱗與命定視線沿用核准 Calculation Display。這些句子已經通順，沒有改綁定，也不需要新的 Adaptation。未知改寫保留完整計算後英文。Node 24.21.0 的 `node scripts/l10n/verify.mjs` 在 head `ec9d01a2` 通過：guard、lint 0 errors（26 個既有 warnings）、TypeScript、1041/1041 測試、正式建置、audit 0 漏洞。

### 第 4 段：奧術戲法與魔寵

Marc 已核准第 4 段。snapshot-capture-8：書本修改時間與指紋不變（`2026-10-14T08:59:41.775Z`，`23bbba7157315271b85aff4ff4a2aa0553d6336ddfa37eedfcc88797a4cc8573`）。Forge 修改時間 `2026-10-15T04:33:19.904Z`，指紋 `5e7a4c1c337ce106adf66a731e48243ad014e114513add273ca061de572cc757`。目錄 Glossary 333／Names 131／Strings 1192／UI 226。mapping 1027。英文例外仍是 17。帶 Forge Steel 版本的字串列由 332 增至 334。書本 Strings 沒有改。

Forge Steel UI 第 221–227 列已接入。主要動作、移動、免疫、弱點、每級模板、召喚物只作用在這兩個專長。`term.main-action` 仍不進 mapping，因為守門要的是 `heroes.actions.main.rules`，目錄只有 `heroes.actions.main-actions.rules`。色帶 CSS 維持 `type-main`。capture-8 的色帶可見文字曾是「主要動作」，其後改為「主要」，見下方「色帶兩字」。

Adaptations 第 349–363 列、Adaptation Sources 第 355–369 列已接入。沒有後綴的 `fs-adapt:heroes.perks.arcane-trick.effect` 與 `fs-adapt:heroes.perks.familiar.effect` 寫進書本列的 Forge Steel 版，分別只留引言「選擇以下 1 種效果：」與魔寵第一段。短描述、七個效果、其餘三段散文與心靈感應由 usage key 選出，不新增 mapping 鍵文法。第 3 項光源效果的核准中文沒有「由你選擇」，畫面也不補。

奧術戲法短描述是「你施展一個趣味的法術，創造出微小但令人驚豔的魔法效果。」七個效果在抽屜與招式卡排成與憶物通靈相同的項目清單。標題、魔法、自身、射程 / 目標沿用既有列。

魔寵名稱仍重用「魔寵」。圖示縮寫仍取英文 Familiar 的字母。數據表標籤只在怪物 id 為 `familiar` 時使用核准詞。其他怪物維持英文。屬性字母仍是 M／A／R／I／P。儲存值沒有改：理智 0、基礎打擊 0、力量 −3、敏捷 2、直覺 0、氣場 1、體型 1T、速度 5、穩度 0、基礎體力 0、加值 2 與每級 2。沒有移動模式時數值仍是 —（U+2014），標籤是「移動」。

正體中文的魔寵在免疫與弱點為空時仍顯示「免疫：—」與「弱點：—」。英文模式維持上游，空列不顯示。有英雄時，抽屜體力顯示上游加值在該英雄等級的結果：1 級是 2、5 級是 10。沒有英雄時，數值改取書本句裡的「2 × 你的等級」。經典角色卡的 `familiar-1` 使用「每級 +2」，`{value}` 保留正號。這些都只改顯示，不改存檔。心靈感應是「心靈感應」與「若你和你的魔寵相距 10 格內……」。經典角色卡的類型字是「召喚物」。

47 個專長在英雄 1 級與 5 級的抽屜、經典角色卡、招式卡與已選列不再留下英文句子。刻意保留的英文只有量詞 Perk，以及按鈕與圖示既有的 Perks、info-circle、close、right、left、thunderbolt、potency、etc、Auto-calculate damage。屬性字母與 `type-main` 仍是英文。Node 24.21.0 的 `node scripts/l10n/verify.mjs` 在 head `12ff28e5` 通過：guard、lint 0 errors（26 個既有 warnings）、TypeScript、1042/1042 測試、正式建置、audit 0 漏洞。

### 色帶兩字

Marc 驗收第 4 段後，把能力卡色帶改成兩字。刷新使用 Forge Master 修改時間 `2026-10-15T05:07:31.438Z`，指紋 `b89e086e22cc1febcdd14b24d53ff818aed1aaa7cdfd6ac16a2fa892f888bb56`。書本指紋不變（`2026-10-14T08:59:41.775Z`，`23bbba7157315271b85aff4ff4a2aa0553d6336ddfa37eedfcc88797a4cc8573`）。UI 由 226 增至 230。mapping 1031。英文例外仍是 17。Forge Steel 字串列仍是 334。

Forge Steel UI 第 222 列 `main` 的目標改為「主要」。第 228–231 列是 `maneuver`「機動」、`move`「移動」、`free`「免費」、`trigger`「反應」。這些列直接對上 `getMonogram()` 的單字，所有顯示這些色帶的招式都使用。類型列維持全名，例如「機動動作」「主要動作」「反應動作」「免費反應動作」。兩字不會加上 `labeled`。villain、champion、perform 與劇情面板的 Encounter、Montage、Negotiation、Map 維持英文。英文模式的色帶仍是小寫單字。

Node 24.21.0 的 `node scripts/l10n/verify.mjs` 在 head `610b7670` 通過：guard、lint 0 errors（26 個既有 warnings）、TypeScript、1043/1043 測試、正式建置、audit 0 漏洞。

### 第 5 段：收尾

更新 TODO、PROGRESS、README 與本文件的驗收狀態。8 個先前維持英文的專長名稱已在第 1 段接入。確認非 Heroes 專長、74 個背景問題，以及這次一併進入目錄、尚未 mapping 的套裝列，都仍標成未接入。第 1–4 段的 47 個 Heroes 專長已無剩餘英文句子，量詞 Perk 除外；這不是整站中文化完成。

## 本段不處理

- `perk-linguist-2` 仍是語言選擇，沒有書本句子。第 4 段的核准列已接入。
- 74 個 Career 背景問題。網站模型沒有這些欄位，快照只保存核准書本譯文。
- 非 Heroes 來源書的專長。
- Google Sheets、遊戲規則、存檔與分享格式。
