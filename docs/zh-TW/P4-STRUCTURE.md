# P4 資料結構決策

2026-10-10 維護批次。結論：目前保留每列單一 `fs` 及既有顯示層，先啟用所有來源的過期偵測。P4 多用途採用 **Master Sheet 內獨立的 Forge Steel 對照分頁**；核准資料與分頁尚未具備，因此本批只定案資料契約，不建分頁、不遷移、不增加譯文或 mapping。

## 已實作：多來源依賴追蹤

`src/l10n/source-dependencies.json` 是核准來源檢查點，只含 Sheet ID、版本及 SHA-256，不儲存譯文，也不是第二份翻譯來源。初始資料取自既有 APPROVED 快照與已接受的合併決策，涵蓋現有 105 個 Forge Steel 版。所有列皆記錄書本 `en`／`zh`、合成 `fs.en`／`fs.zh`；以下五組依序追蹤所有合併列：

| Forge Steel 版所在列 | 其他依賴列 | 既有核准證據 |
|---|---|---|
| `heroes.ancestries.dwarf.signature.runic-carving.intro` | `heroes.ancestries.dwarf.signature.runic-carving.limit` | Strings 134＋141；P2-9-2／CHG-0071 |
| `heroes.ancestries.hakaan.description.1` | `heroes.ancestries.hakaan.description.2` | Strings 204＋205；P2-9-1／CHG-0068 |
| `heroes.ancestries.hakaan.trait.doomsight.effect.1` | `heroes.ancestries.hakaan.trait.doomsight.effect.2`、`.effect.3` | Strings 220＋221＋222；P2-9-1／CHG-0068 |
| `heroes.ancestries.revenant.description.1` | `heroes.ancestries.revenant.description.2` | 已核准快照的合成文字與兩列書本中文原樣接合 |
| `heroes.ancestries.revenant.trait.vengeance-mark.effect.1` | `heroes.ancestries.revenant.trait.vengeance-mark.effect.2` | 已核准快照的合成文字與兩列書本中文原樣接合 |

虹彩鱗片的六個網站選項名稱，是 P2-9-3／CHG-0073 明確核准的限縮例外；來源為各自的 Strings 942–947，不能誤稱成多列合併。回歸測試另外確認其餘所有 Forge Steel 中文均可從所宣告書本中文依序刪字、接合得到，避免初始盤點漏掉後續來源。

守門由 `scripts/l10n/source-dependencies.mjs` 負責，與 `check.mjs` 共用 issue 格式。只讀取 generated APPROVED 目錄；若來源刪除、未再匯出、英文或中文變動、合成內容變動、來源清單缺漏或重排、檢查點缺失或重複，皆失敗。來源清單另有 SHA-256，並以回歸測試固定已知五組來源；不能靠刪掉依賴來讓守門恢復成功。CRLF／CR 正規化為 LF，其餘文字與空白保持精確比對。

這項檢查取代 DEC-0009 的「多列合併只檢查第一列」限制；第一列既有 Basis Hash 與上游英文檢查繼續有效。動態句型仍由原 calculation-display／binding 守門負責。

更新時先確認 Master Sheet 原文、全部來源及合成版本皆已核准，再一起更新快照、generated、必要 mapping 與來源檢查點，跑完整守門及相關回歸。工具不會自動重算檢查點來掩蓋過期訊息；雜湊匹配只代表核准版本未變，不能代替核准紀錄。快照不足時回查 Master Sheet，不猜依賴或中文。

## 多用途方案比較與定案

| 面向 | 在 Strings 列內嵌多用途 `fs` | Master Sheet 獨立 Forge Steel 對照分頁 |
|---|---|---|
| 同一書本條目的多網站用途 | 改成陣列／物件可容納，但既有 P–V 欄位需重新設計 | 每個網站用途一列，可分別核准 description／section／name |
| 多來源接合 | 在同一書本列塞來源清單與多份版本 | 每個用途記錄有序來源 Sheet ID 與來源雜湊 |
| 核准與過期偵測 | 原列有多個版本，狀態及 Basis Hash 意義容易混淆 | 每用途獨立 APPROVED 狀態、英文及中文檢查點 |
| 現有功能成本 | 仍須改匯出器、mapping、runtime 與測試 | 同樣須改匯出器及查鍵，但既有書本列可保持原樣 |
| 接手與維護 | 欄位與巢狀版本隨用途增加 | Sheet 可直接篩選用途、狀態與來源；避免擴成翻譯平台 |

**採用獨立分頁**，仍放在唯一的 Master Sheet，不另建資料庫或外部翻譯平台。每列最小契約：

- 穩定 Adaptation ID；對應一個網站用途鍵（現有 `element:`／`section:`／`data:` 等）。
- 有序 Source Sheet IDs；每來源書本 `en`／`zh` SHA-256，不以實體列號當永久識別。
- Forge Steel Source Text、Target Text、Status（僅 APPROVED 匯出）、核准日期／紀錄。
- 合成 `en`／`zh` SHA-256；必要時延用核准 Calculation Display Note。

同一來源可有多列用途；一個用途可有多個來源。mapping 以 Adaptation ID 選擇核准用途，upstream enHash、未知改寫回退與動態數值投射維持現有原則。未來匯出需拒絕重複用途、未核准來源、缺雜湊與過期來源；同一用途出現多個可選版本時須失敗，不能任意取第一筆。

## 進入實作的界線

現在不把舊 `fs` 改成多用途，也不建立空白功能占位。要實作獨立分頁，須先取得 Master Sheet 已核准的分頁欄位及至少一個真實多用途案例；再以單批遷移驗證匯出、對照、守門、動態內容與顯示回歸。舊 `fs` 可暫時共存，但同一網站用途必須只有一個權威版本。

P4 內容與 P3 UI 尚無核准資料的區段繼續保留英文。這是資料依賴邊界，不代表本次結構評估尚未定案。
