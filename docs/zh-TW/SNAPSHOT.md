# 快照更新

網站與 CI 只讀倉庫快照。一般更新以 Google Drive 連接器同次擷取兩份 Master Sheet，由離線腳本整合；不使用終端機登入 Google。只匯入 APPROVED，不自動核准文字、建立 mapping 或計算綁定。正式更新路徑為雙來源流程；下方舊單來源程序只供依核准回復程序還原 D1，不得用於日常更新。

## 正式雙來源契約

- 書本 Sheet `1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4` 只擷取 Glossary、Names 與 Strings A–O 書本欄位；網站 Sheet `1bbtgLVODKGrghfsGDnp4ePECcqS9j3SnCXvcptxXWaw` 擷取 Forge Steel UI、Adaptations、Adaptation Sources。TM 留在書本 QA 工作流。
- 各 Sheet 分別讀取前後 Drive 修改時間、驗證 Spreadsheet ID；任一讀取失敗、來源版本變更或欄位缺漏就丟棄兩份擷取。依標題投影；只將 APPROVED 與必要來源關聯送入離線整合，原始草稿不落盤。
- `scripts/l10n/dual-sheet.mjs` 以 Adaptation ID 關聯有序來源，核對 Book APPROVED、Basis／Source List／英中 SHA-256、Usage Key 唯一性與動態 Note；兩個歷史空白 Usage Key 保留。Source Type 可以是 `Book String` 或 `Book Name`。Book Name 的 Source Record ID，以及 Adaptations 的 Book String ID，都填 Names 的 Name ID；核准後把四個 Forge Steel 欄寫進 `names.csv`，匯出成該名稱的 `fs`。Calculation Display 仍只用於 Book String。雙來源快照額外含 `adaptations.csv`、`adaptation-sources.csv`；生成的 `adaptations.json` 以穩定 ID 保存多用途關聯，既有四份有效目錄結構不變。現有 runtime／`mapping.ts` 對應維持不變；本切換只納入已核准且受既有 mapping 使用的網站用途。`source.json` 與生成 metadata 記錄兩份 Spreadsheet ID、修改時間及內容指紋。重讀快照須逐項重建且核對指紋。
- `scripts/l10n/refresh-dual-sheet.mjs --input <approved-dual-capture.json>` 預設僅試跑。確認雙來源版本、指紋、核准清冊與預期檔案差異後，才可在隔離工作分支以 `--apply` 更新待審查檔案。工具會先在暫存目錄重建並執行守門；異常時不更新正式檔案，可捕捉的寫入失敗依 `replaceFiles` 還原。

## 一次擷取與正式匯出

1. 讀取並核對兩份 Sheet metadata：書本 Master `1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4` 的 Glossary、Names、Strings 書本正典欄位；Forge Steel Master `1bbtgLVODKGrghfsGDnp4ePECcqS9j3SnCXvcptxXWaw` 的 Forge Steel UI、Adaptations、Adaptation Sources。欄位依標題辨識，不依實體列號。
2. 各來源分別記錄讀取前／後 `modifiedTime`；任何讀取錯誤、截斷、Spreadsheet ID 不符、欄位缺漏或前後時間不同，丟棄整次擷取並停止。重新擷取不可沿用另一輪的分頁資料。
3. 對完整範圍核對唯一 ID、Status、核准與來源關聯，計算本輪內容指紋。只將必要欄位、APPROVED 資料及其來源關聯寫入暫存輸入；草稿、私有筆記及不需匯出的欄位不落盤。保留來源文字、空白、換行和 Calculation Display Note 原值。
4. 在隔離工作分支執行 `node scripts/l10n/refresh-dual-sheet.mjs --input <approved-dual-capture.json>` dry-run。檢查四份 CSV、生成目錄、Adaptations、Source 關聯、metadata 和所有檔案雜湊；未預期的有效目錄差異、核准 Hash 不符或檢查失敗即停止。
5. 僅在 dry-run 和該工具的 staged 守門通過後，以相同命令加 `--apply`。套用後的穩定版本依 RULES 跑一次完整驗證，不另手動重跑已被涵蓋的守門或匯出一致性。PR 保留雙來源 metadata 與指紋供審查。
6. 檢視完整 Git diff，確認沒有草稿、私有筆記、譯文／Hash／mapping／runtime 的非授權變更，並移除暫存擷取檔。來源時間或內容在套用前再次改變時，停止並從步驟 1 重新開始。

## 狀態與結案寫入

- 先讀 metadata 與標題，確認分頁 ID、實際欄位和有界資料範圍。以 Batch ID／Key 查找 Project State、Status 的現有列，不從回傳陣列長度推算列號。
- 寫入前讀回精確目標範圍及左右鍵值，列出欄位的原值與新值；Google A1 列號從 1 開始，updateCells 索引從 0 開始。移除內容也須有該格原值與本批異動的證據。
- 新批次先查是否已存在；不存在才用 appendCells，既有批次只更新剛確認的列。Changelog 新序號須讀取完整、有界的 ID 欄，檢查重複並取最大已用序號＋1，不從前 50 列或最後一筆猜下一號。
- 更新前再次確認鍵值／原值未變；若他人同時修改就重新讀取。連接器寫入不具條件式版本鎖，維持單一寫入者，縮短讀寫間隔；原子 batchUpdate 只包含已確認的範圍。
- 寫入後逐一回讀變更範圍，確認 ID 唯一、欄位正確、日期與數字對應本批最新證據，且鄰接歷史列未變。失敗或遭自動審查拒絕時先查明原因；不改用其他介面繞過拒絕。
- 狀態寫入不代表重新擷取核准譯文；未改翻譯資產時不刷新快照，不修改既有 APPROVED、計數或書本 BATCH-006 的進度。
- Sheet 只寫該批必要狀態。驗收敘述與合併結果留在原 PR；結果尚未發生前不寫成已驗收或已合併。不為把這些結果抄進 repo 文件而另開提交，也不改寫歷史列。

## 舊單來源流程（僅回復 D1 快照）

> 此流程讀取舊 Master Sheet 的 Forge Steel 欄位，僅用於依 Reviewer 核准的 Git 回復程序重建 D1 快照。不得作一般快照更新，也不得把舊 Forge Steel UI 或 Strings P–V 當成目前網站來源。


1. 依 README 先讀 Project State、Status、Changelog，再讀 Sheet metadata，確認 ID、實際分頁與資料範圍。Master Sheet ID 為 `1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4`。
2. 載入 `scripts/l10n/sheet-capture.mjs` 的 `captureSheet(readMetadata, readTab)`。此模組無 Node 相依，可在連接器執行環境使用；不要手動重寫投影或句型。
3. `readMetadata` 對接 Google Drive `get_file_metadata`，讀 `id,mimeType,modifiedTime`；連接器回傳欄名為 `id,mime_type,modified_time`。
4. `readTab` 對接 `get_spreadsheet_range`，回傳 `structuredContent`。依 metadata 對 Glossary、Names、Strings、Forge Steel UI 四頁讀完整、有界的資料區域，保留標題列。若分次讀取，先合併且只保留一個標題列；工具錯誤、截斷或未取得的區段都停止，不用先前回應補齊。每次先核對實際列數與欄位；以下範例範圍只供當次 metadata 涵蓋時使用。
5. `captureSheet` 先讀修改時間，再取得四頁，最後再讀修改時間。不一致時整次丟棄並重新取得。這是跨請求的一致性檢查，不是 Google 版本鎖定。
6. 原始回應只留在執行環境記憶體；動態句型若未核准或不合法，擷取即失敗，不產生暫存輸入。只將回傳的核准欄位寫入暫存輸入，不把完整 Sheet 回應或草稿存進 repo、log 或公開 PR。

動態 Note 指的是 Strings 的 **Forge Steel Note 欄位文字**（目前 U 欄），不是 Google CellData.note 或留言。所有欄位以標題辨識，以 String ID 關聯，不固定第 220 列。只保留具有 Calculation Display 紀錄的核准 Forge Steel 列之完整原樣 Note，其他欄位筆記不擷取。書本 APPROVED、Forge Steel 版未核准的列只保留書本欄位。

### Codex 執行範例

以下在 `functions.exec` 執行；首次使用須先讀 Google Drive／Google Sheets 技能，並依剛讀回的 metadata 確認範圍。只從已審查本機模組載入程式，不執行 Sheet 內容。

```js
const source = await tools.exec_command({
  cmd: 'Get-Content -Raw scripts/l10n/sheet-capture.mjs', max_output_tokens: 5000
});
if (source.exit_code !== 0) throw new Error('cannot load capture module');
const { captureSheet } = new Function(
  source.output.replace(/^export /gm, '') + '; return { captureSheet };'
)();
const spreadsheet_id = '1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4';
// Reconfirm bounds from get_spreadsheet_metadata before every capture.
const ranges = {
  Glossary: 'A1:M1000', Names: 'A1:M1000', Strings: 'A1:V1000',
  'Forge Steel UI': 'A1:Z1000'
};
const unwrap = result => {
  if (result.isError || !result.structuredContent) throw new Error('connector read failed');
  return result.structuredContent;
};
const approved = await captureSheet(
  async () => unwrap(await tools.mcp__codex_apps__google_drive_get_file_metadata({
    fileId: spreadsheet_id, fields: 'id,mimeType,modifiedTime'
  })),
  async sheet_name => unwrap(await tools.mcp__codex_apps__google_drive_get_spreadsheet_range({
    spreadsheet_id, sheet_name, range: ranges[sheet_name]
  }))
);
// Write only the approved projection, never the original responses.
const body = JSON.stringify(approved, null, 2);
await tools.apply_patch('*** Begin Patch\n*** Add File: .l10n-approved-capture.json\n+'
  + body.split('\n').join('\n+') + '\n*** End Patch');
```

## 舊單來源離線整合（僅回復 D1 快照）

```powershell
node scripts/l10n/refresh-sheet.mjs --input .l10n-approved-capture.json
node scripts/l10n/refresh-sheet.mjs --input .l10n-approved-capture.json --apply
```

- 預設試跑，不更新正式檔案；列出變更檔名、sha256、核准列數及動態 Note 數。
- 同一份輸入同時產生四份 CSV（含 `ui.csv`）、`calculation-displays.json`、`source.json`，交由既有匯出器產生 JSON。CSV 按 ID 排序；欄位值、換行、空白及 Note 不改寫。
- 先在暫存目錄匯出並跑完整守門。守門以目前 repo 的上游英文／mapping／綁定對照暫存產物，不誤用舊產物。缺少已啟用句型、Basis Hash 過期、目標範圍不符、重複 ID／紀錄、未核准或不合法句型均失敗。
- `--apply` 驗證成功後才更新六個快照與五個產物。可捕捉的寫入失敗還原已碰觸檔案；還原失敗時明確回報，先排錯。這不是多檔案檔案系統交易，無法保證斷電或程序強制終止時自動復原；不同時執行多個更新。
- 完整重建動態 Note 集合，不合併舊 Note 掩蓋遺漏。沒有句型的列不需要 Note；已啟用句型的列缺 Note 由守門拒絕。
- 成功後移除暫存輸入並核對 `git diff`。來源時間是這次取得時間，後續寫 Project State／Status 不代表譯文再取得一次。非本批的譯文差異另列對照預覽，不順帶納入。

套用後的穩定版本依 RULES 跑一次完整驗證，並如實記錄未通過項目；不在完整驗證之外再手動重跑守門、匯出一致性或單檔測試。不改預設逾時或依賴來讓本批過關。

## PERKS-01 結案快照（2026-10-15）

Marc 已驗收，PERKS-01 為 COMPLETE：Heroes 47/47 專長、6 個類別。正式快照仍是雙來源。書本 Master 修改時間 `2026-10-14T08:59:41.775Z`，指紋 `23bbba7157315271b85aff4ff4a2aa0553d6336ddfa37eedfcc88797a4cc8573`。Forge Master 修改時間 `2026-10-15T05:07:31.438Z`，指紋 `b89e086e22cc1febcdd14b24d53ff818aed1aaa7cdfd6ac16a2fa892f888bb56`。目錄 Glossary 333／Names 131／Strings 1192／UI 230。mapping 1031。這次書本快照多出的 24 筆 Book Strings（套裝列）沒有 mapping，不在 PERKS-01 範圍，不另做對照。刻意保留英文：量詞 Perk、既有圖示與按鈕字、villain／champion／perform 色帶。合併狀態見 [PR #69](https://github.com/boyiad2110/forgesteel-zh-tw/pull/69)。

## 專長計數列模板（2026-10-16）

三筆 Marc 已核准的 Forge Steel UI 已寫入並回讀：perk-count-list、perk-count、list-or。書本 Master 修改時間 `2026-10-14T08:59:41.775Z`，指紋 `23bbba7157315271b85aff4ff4a2aa0553d6336ddfa37eedfcc88797a4cc8573`。Forge Master 修改時間 `2026-10-16T05:39:26.084Z`，指紋 `8dcce02b146b050beb254dac6398e0d388426714e072b6601519b87ccd6d1197`。目錄 Glossary 333／Names 131／Strings 1192／UI 233。mapping 1034。程式 `1802f6b1` 的隔離驗證見 [PROGRESS](PROGRESS.md)。Marc 已於 2026-10-16 驗收；合併狀態見 [PR #71](https://github.com/boyiad2110/forgesteel-zh-tw/pull/71)。Project State 的歷史遷移筆數 209 未改。

# 多來源核准檢查點（2026-10-10）

每個 Forge Steel 版的完整來源 ID／en／zh 雜湊與合成內容雜湊另存 `src/l10n/source-dependencies.json`，只有 ID 與雜湊，不是翻譯來源。整合腳本的 staged 守門沿用 repo 核准檢查點來檢查新的 catalog；後續來源變動、刪列或缺檢查點會停止發布。不能自動重算雜湊消掉警告：先依 Master Sheet 重新確認所有來源及網站版本已核准，檢閱並更新檢查點後再整合。完整方案見 [P4-STRUCTURE.md](P4-STRUCTURE.md)。
