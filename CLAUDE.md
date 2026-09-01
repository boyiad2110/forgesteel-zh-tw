# 專案工作規範

## Authority / workflow entry

- 規劃、Reviewer、Agent task、code review、PR closeout、handoff 前，先依 `docs/project-review-skill/PROJECT-REVIEW-SKILL.md`。
- 權限與決策邊界依 `docs/REVIEWER-PRINCIPLES.md`。
- V1 scope 依 `docs/requirements/V1-REQUIREMENTS.md`。
- translation batch 另依 `docs/translation/TRANSLATION-WORKFLOW.md`。
- Stage 1 預設使用可用且乾淨的 Owner primary clone，從核准 `develop` 建 feature branch，以保留 local live preview；例外與 closeout routing 依 `ONLINE-HANDOFF.md`、`GIT-SAFETY.md`。

## Canonical safety

- 不自行建立新正式中文遊戲術語。
- 中文只在 presentation boundary。
- 不修改 canonical data、ID、enum、reference、parser、calculations、save format。
- 不做與 Batch 無關的大型重構。

## Sourcebook policy

- runtime 保留 `Official` + `Homebrew`。
- 排除 `Community` + `ThirdParty`。
- Official Patreon / Playtest 沿用原版 feature flag。
- translation completeness 不得決定 runtime allowlist。

## Verification

- 不要求每批固定跑 `lint + typecheck + test + build`。
- verification 依 `docs/project-review-skill/RISK-AND-VERIFICATION.md` 與 Batch Contract 採 risk-matched minimum sufficient evidence。

## Git

- `develop` 為 integration branch；`main` frozen。
- Git permission 依 Batch Contract。
- 不對 upstream write。
