# 快照更新

網站與 CI 仍只讀倉庫快照。Codex 使用 Google Drive 連接器取得資料，再由離線腳本整合；不是獨立登入 Google 的終端機下載器。只在已核准批次使用，不自動核准文字、建立 mapping 或計算綁定。下列單來源流程是 Stage D 前的正式路徑；Stage C 雙來源工具只供隔離驗證，不得以 `--apply` 切換正式產物。

## Stage C 雙來源契約

- 書本 Sheet `1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4` 只擷取 Glossary、Names 與 Strings A–O 書本欄位；網站 Sheet `1bbtgLVODKGrghfsGDnp4ePECcqS9j3SnCXvcptxXWaw` 擷取 Forge Steel UI、Adaptations、Adaptation Sources。TM 留在書本 QA 工作流。
- 各 Sheet 分別讀取前後 Drive 修改時間、驗證 Spreadsheet ID；任一讀取失敗、來源版本變更或欄位缺漏就丟棄兩份擷取。依標題投影；只將 APPROVED 與必要來源關聯送入離線整合，原始草稿不落盤。
- `scripts/l10n/dual-sheet.mjs` 以 Adaptation ID 關聯有序來源，核對 Book APPROVED、Basis／Source List／英中 SHA-256、Usage Key 唯一性與動態 Note；兩個歷史空白 Usage Key 保留。雙來源快照額外含 `adaptations.csv`、`adaptation-sources.csv`；生成的 `adaptations.json` 以穩定 ID 保存多用途關聯，既有四份有效目錄結構不變。`source.json` 與生成 metadata 記錄兩份 Spreadsheet ID、修改時間及內容指紋。重讀快照須逐項重建且核對指紋。
- `scripts/l10n/refresh-dual-sheet.mjs --input <approved-dual-capture.json>` 預設僅試跑；通過 staged 匯出與守門後才可套用。Stage D 授權及相關內容 PR 合併前，禁止 `--apply`。異常時保留原正式產物；可捕捉的寫入失敗依既有 `replaceFiles` 還原。

## 狀態與結案寫入

- 先讀 metadata 與標題，確認分頁 ID、實際欄位和有界資料範圍。以 Batch ID／Key 查找 Project State、Status 的現有列，不從回傳陣列長度推算列號。
- 寫入前讀回精確目標範圍及左右鍵值，列出欄位的原值與新值；Google A1 列號從 1 開始，updateCells 索引從 0 開始。移除內容也須有該格原值與本批異動的證據。
- 新批次先查是否已存在；不存在才用 appendCells，既有批次只更新剛確認的列。Changelog 新序號須讀取完整、有界的 ID 欄，檢查重複並取最大已用序號＋1，不從前 50 列或最後一筆猜下一號。
- 更新前再次確認鍵值／原值未變；若他人同時修改就重新讀取。連接器寫入不具條件式版本鎖，維持單一寫入者，縮短讀寫間隔；原子 batchUpdate 只包含已確認的範圍。
- 寫入後逐一回讀變更範圍，確認 ID 唯一、欄位正確、日期與數字對應本批最新證據，且鄰接歷史列未變。失敗或遭自動審查拒絕時先查明原因；不改用其他介面繞過拒絕。
- 狀態寫入不代表重新擷取核准譯文；未改翻譯資產時不刷新快照，不修改既有 APPROVED、計數或書本 BATCH-006 的進度。

## 同次取得

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

## 離線整合與檢查

```powershell
node scripts/l10n/refresh-sheet.mjs --input .l10n-approved-capture.json
node scripts/l10n/refresh-sheet.mjs --input .l10n-approved-capture.json --apply
node scripts/l10n/export-sheet.mjs --check
node scripts/l10n/check.mjs
```

- 預設試跑，不更新正式檔案；列出變更檔名、sha256、核准列數及動態 Note 數。
- 同一份輸入同時產生四份 CSV（含 `ui.csv`）、`calculation-displays.json`、`source.json`，交由既有匯出器產生 JSON。CSV 按 ID 排序；欄位值、換行、空白及 Note 不改寫。
- 先在暫存目錄匯出並跑完整守門。守門以目前 repo 的上游英文／mapping／綁定對照暫存產物，不誤用舊產物。缺少已啟用句型、Basis Hash 過期、目標範圍不符、重複 ID／紀錄、未核准或不合法句型均失敗。
- `--apply` 驗證成功後才更新六個快照與五個產物。可捕捉的寫入失敗還原已碰觸檔案；還原失敗時明確回報，先排錯。這不是多檔案檔案系統交易，無法保證斷電或程序強制終止時自動復原；不同時執行多個更新。
- 完整重建動態 Note 集合，不合併舊 Note 掩蓋遺漏。沒有句型的列不需要 Note；已啟用句型的列缺 Note 由守門拒絕。
- 成功後移除暫存輸入並核對 `git diff`。來源時間是這次取得時間，後續寫 Project State／Status 不代表譯文再取得一次。非本批的譯文差異另列對照預覽，不順帶納入。

相關測試：`npx vitest run scripts/l10n/refresh-sheet.test.mjs scripts/l10n/check.test.mjs`。每批依 RULES 跑 `node scripts/l10n/verify.mjs` 並如實記錄未通過項目；不改預設逾時或依賴來讓本批過關。
# 多來源核准檢查點（2026-10-10）

每個 Forge Steel 版的完整來源 ID／en／zh 雜湊與合成內容雜湊另存 `src/l10n/source-dependencies.json`，只有 ID 與雜湊，不是翻譯來源。整合腳本的 staged 守門沿用 repo 核准檢查點來檢查新的 catalog；後續來源變動、刪列或缺檢查點會停止發布。不能自動重算雜湊消掉警告：先依 Master Sheet 重新確認所有來源及網站版本已核准，檢閱並更新檢查點後再整合。完整方案見 [P4-STRUCTURE.md](P4-STRUCTURE.md)。
