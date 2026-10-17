# KITS-CLASSIC-UI：Classic View 套裝標題

## 範圍與來源

Forge Steel Master 已新增並核准六筆獨立 UI 條目，沒有對應書本 Name／String，因此不建立 Adaptation 或來源關聯：

| 網站原文 | 正體中文 |
|---|---|
| Equipment and Modifiers | 裝備與調整值 |
| Weapon / Implement | 武器／法器 |
| Armor / Ward | 護甲／護咒 |
| Melee Damage Bonus | 近戰傷害加值 |
| Ranged Damage Bonus | 遠程傷害加值 |
| Effects | 效果 |

六筆 UI 對照已納入正式雙來源快照、英文守門、mapping 與 Classic View `ModifiersCard`。數據、計算及角色資料結構未變更。

## 驗證

送審前執行套裝回歸測試與 `node scripts/l10n/verify-isolated.mjs`；驗證版本、結果及 PR CI 連結記錄於 [PROGRESS](PROGRESS.md)。未部署。

## Marc 人工驗收

在正體中文模式開啟 Classic View，檢查含有套裝的角色卡：

1. 卡片標題顯示「裝備與調整值」。
2. 裝備兩欄顯示「武器／法器」與「護甲／護咒」。
3. 傷害區標題顯示「近戰傷害加值」與「遠程傷害加值」，下方效果區顯示「效果」。
4. 切換 English，確認六個標題恢復英文；切回正體中文後確認套裝名稱、數值、裝備值及招式仍正常。
