# FPP-factory: rules for changing this code

React 19 + Vite PWA for factory-floor tablets. The UI is in Japanese and all data is mock data (there is no backend).
Every screen is designed in px for a **1920x1200 landscape** stage and scaled to the device by `ScaleToFit`.
The team's main branch is `deleteHorizontal`. `surface2` is no longer used.

## Hard rules

1. **No Thai characters anywhere**: code, comments, UI text, CSS, file names, commit messages.
   Write comments in English or Japanese.
2. **Landscape only.** Portrait mode was removed. Do not add `isLandscape`, `useOrientation`, portrait JSX branches,
   or `.set-header` / `.set-body` portrait layouts to new or existing pages.
   The dispatch / inbound pages (`apps/VehicleDispatch`, `apps/VehicleInbound`) are legacy portrait pages. Do not copy them.
3. **No layout sizes in TSX.** Never put `width`, `minWidth`, `maxWidth`, `height`, `flex*` or `boxSizing` in `style={{...}}`
   on `input`, `select`, `textarea`, field `label`s or `.set-field-landscape` boxes. Sizes go in
   `src/app/styles/fieldSizes.css` (see below).
4. **All global CSS lives in `src/app/styles/`.** The only CSS entry point is `src/app/styles/index.css` (imported by `src/main.jsx`).
   `globalStyle.css` and `src/pages/mainPage.scss` were removed. Do not recreate them or add CSS imports in pages.
   Component-local CSS next to its component (e.g. `ActionFooter.css`) is the only exception.
5. **Do not change the look of existing screens unless the task asks for it.** If you refactor, the result must
   look exactly the same (compare before/after in the browser at 1920x1200).
6. **No `!important`.** The few existing ones are legacy.
7. Do not edit or copy from these dead files (never imported): `DispatchEnter.tsx`, `WorkOrderCompletionXXX.tsx`,
   `WorkOrderCompletion_Choose_WO_XXX.tsx`, `WorkOrderTimeRegistrationChiba.tsx`, `WorkOrderTimeRegistrationGosen.tsx`,
   `InventoryRecordsOrientationChoose.tsx`, `routes/PrivateRoute.jsx`.

## Where CSS goes

`index.css` imports the files in cascade order. Keep the order: tokens, shared components, `pages/*`, overrides, shell, fieldSizes.

| File | Put here |
|---|---|
| `tokens.css` | Colours and gradients used in 2+ places (`--color-*`, `--gradient-*`). Use them via `var(--...)`. |
| `base.css` | Element-level defaults only. |
| `layout.css` | Header bar and body frame (`.set-header-landscape`, `.set-body-landscape*`). |
| `form.css` | Form rows, field boxes, labels, inputs (`.set-form-landscape*`, `.set-field-landscape*`, printer row). |
| `button.css` | `.set-btn*`, colour variants (`.set-primary`, `.set-success`, `.set-warning`, `.set-danger`, `.set-purple`...), small buttons. |
| `table.css` | `TableSection` (`.tf-table*`), cell inputs, `.inbound-table-landscape` (shared landscape table), generic `col-*`. |
| `modal.css` | Dialogs (`.set-modal*`). |
| `picker.css` | Date field, calendar, time picker. |
| `hand-form.css` | Legacy `.hand-*` form (dispatch / inbound only). |
| `pages/<feature>.css` | Rules used by one feature only, mostly table column widths and alignment. For a new feature, create a file and add its `@import` to `index.css` before `overrides.css`. |
| `pages/common-tables.css` | Table rules shared by several features. |
| `overrides.css` | Only rules that must come after the page files to win at equal specificity. Each one needs a comment saying why. |
| `shell.css` | Main menu and the page / stage / frame (`.mockup-*`). |
| `fieldSizes.css` | Sizes of labels, field boxes and fields, one section per page. |

Format CSS like the surrounding file: 2-space indent, one declaration per line (except `fieldSizes.css`, which is a one-line-per-rule table).

## Page skeleton

```tsx
<div className='mockup-page page-<slug>'>
  <ScaleToFit active designWidth={1920} designHeight={1200}>
    <div className='mockup-stage mockup-stage-dark mockup-stage-landscape'>
      <div className='mockup-frame'>
        <div className='set-header-landscape'>
          <span className='set-header-title'>画面名</span>
          <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
        </div>
        <div className='set-body-landscape set-body-landscape-3row'>
          <div className='set-form-landscape'>
            <div className='set-form-landscape-row'>
              <div className='set-field-landscape set-field-fill'>
                <label>保管場所</label>
                <input className='field-storage' value={...} onChange={...} />
              </div>
            </div>
          </div>
          <TableSection ... />
          <ActionFooter columns={5} gapX={50} className='set-actionfooter-landscape-offset'>...</ActionFooter>
        </div>
        {/* modals: set-modal-backdrop > set-modal > set-modal-header / set-modal-body / set-modal-actions */}
      </div>
    </div>
  </ScaleToFit>
</div>
```

- `<slug>` is the route path after `/factory/` with `/` replaced by `-` (e.g. `page-inventory-hand-input`).
  Existing pages already have one: reuse it.
- `set-field-fill` makes a field box share the row width equally (`flex: 1 1 0`).
- Size the design in px for 1920x1200. Do not use `position: fixed` (it is relative to the scaled stage, not the screen).

## Field sizes (`fieldSizes.css`)

Every page has a section. Each line is one rule; the comment is the label shown on screen:

```css
/* ===== 入庫実績登録 手入力登録 — /factory/inventory-hand-input
         src/app/New-normal/InventoryRecord/InventoryRecordsHandInputPage.tsx ===== */
#root .page-inventory-hand-input .set-field-landscape > label { width: 220px; flex-shrink: 0; } /* label column */
#root .page-inventory-hand-input .field-storage               { width: 350px; flex-shrink: 0; } /* 保管場所 */
#root .page-inventory-hand-input .field-warehouse             { flex: 1; min-width: 0; }        /* 倉庫 */
```

- **Always start selectors with `#root .page-<slug>`.** The `#root` prefix gives these rules the priority the old inline styles had,
  so they beat the generic rules in `form.css`. Without it, sizes silently stop working.
- **Fields:** add `className='field-<name>'` to the input / select / textarea and one line in the page's section.
  Reuse an existing name for the same kind of field, e.g. `field-warehouse` 倉庫, `field-storage` 保管場所, `field-qty` 数量,
  `field-item-no` 品目No., `field-lot` ロット, `field-serial` シリアル, `field-lot-serial` ロットシリアル, `field-jan` JANコード,
  `field-part-no` 品番, `field-item-name` 品名, `field-wo-no` WO番号, `field-expiry` 有効期限, `field-printer` 出力先プリンター.
  New names: `field-` + short English kebab-case.
- **Labels:** the page's `label column` line sets every field label on that page. For a label with a different width, add
  `className='field-<name>-label'` and a line `#root .page-<slug> .set-field-landscape > label.field-<name>-label { width: ...; }`.
- **Field boxes:** use `set-field-fill` for equal-width boxes. Use a named class for fixed-width boxes
  (e.g. `field-col-left` on WO部品払出) with `flex`, `min-width` and `gap` in the page section.
- **Units:** follow the page family. Pages under `apps/` use character widths (`box-sizing: content-box; width: 15ch; flex: 0 0 auto;`).
  Pages under `New-normal/` and `new-high/` use px (`width: 350px; flex-shrink: 0;`) or fill (`flex: 1; min-width: 0;`).
- **New page:** add a section in menu order. Keep alignment and the Japanese comment.
- **Inline styles are still fine for:** values computed at runtime (e.g. `--qty-len`), and non-size styling that already exists.
  For new static styling, prefer a class in the matching CSS file.

## Colours

- Use the tokens in `tokens.css` when the value matches (e.g. `var(--color-input-border)`, `var(--color-disabled-bg)`, `var(--gradient-header)`).
- If a new colour is used in more than one place, add a token. Do not invent near-duplicates of existing colours.

## Bringing in code written against the old structure

Code from `surface2` or branches based on it uses `globalStyle.css`, inline sizes and portrait branches. Before merging it:
1. Remove the portrait branch (keep only the landscape JSX) and any `useOrientation` / `isLandscape` / `orientationState`.
2. Move field / label / box sizes into the page's `fieldSizes.css` section as described above.
3. Put each CSS rule it added to `globalStyle.css` into the matching file above, keeping it after the rules it overrides.
4. Check that the screen looks the same as in the source branch.

## Removing CSS

Only delete a rule after searching `src/` for every class it uses, including template literals and string concatenation.

## Before you finish

```bash
npm run build                                                                    # must pass
git grep --untracked -nP "[\x{0E00}-\x{0E7F}]" -- . ':!*.png' ':!*.jpg'          # must print nothing (no Thai)
git grep -nE "isLandscape|useOrientation|orientationState" -- src                # must print nothing
git diff -U0 HEAD -- src | grep -E "^\+.*style=\{\{[^}]*(width|minWidth|height|flex|boxSizing)"   # review every hit: no sizes on fields / labels / field boxes
```
(Older inline sizes on buttons and wrappers still exist; the last command only shows lines you added.)

Then open the changed screens with `npm run dev` at 1920x1200 (browser device toolbar) and at 1280x800, including their dialogs.
ESLint is not configured for `.tsx` files, so lint does not catch TSX mistakes.

## Known quirks (do not "fix" silently; ask first)

- `.set-modal-no` has no CSS, so はい / いいえ buttons look the same. Some buttons have a truncated class `set-m`.
- Several mock flows have spec questions (unreachable error messages, F2 / F3 shortcuts that do nothing, etc.).
  Change behaviour only when the task asks for it.
