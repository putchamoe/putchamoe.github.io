## Getting started

- **Open a file**: double-click it in Finder (once Hannun is your default app), press `⌘O`, drag a file onto the window, or pick from recent documents in the clock (⏱) menu
- **New document**: press `⌘N` or click `+` in the tab bar. A **scratch document** opens right away — no save dialog. It's backed up automatically and is still there after you quit and reopen the app. Press `⌘S` to save it as a regular file.
- **Default app**: in Settings › General › Default App, you can set Hannun as the default for Markdown, text, PDF, and data documents, one type at a time.

## The window (Mac)

| Area | What's there |
|---|---|
| Title bar | Document status on the left. On the right, three groups of buttons — **Go** (clock: tabs and recent documents / location: show in Finder) · **View** (content width / table of contents / switch view) · **Export & app** (share / settings) |
| Tab bar | Open documents (type icon + name) · `+` for a new document · a tab count on the right when two or more tabs are open |
| Status bar | Only while editing — line:column · encoding (click to reopen with another encoding) · line ending style |

When there are more tabs than fit, the tab bar scrolls sideways (trackpad swipe or mouse wheel).

## View modes — `⌘/`

Cycles through **Preview → Split → Editor**.

- **Preview**: the rendered document, full window. Default for Markdown files
- **Split**: editor on the left, preview on the right. Drag the divider to resize; each tab remembers its position. Both sides scroll together
- **Editor**: the editor, full window. Default for `.txt`
- Data documents (`.json` `.xml` `.yaml`) have no Split view and switch between **Preview ⇄ Editor** only — see "Data View" below

## Zoom

Same everywhere: **pinch on the trackpad** or **⌘ + scroll**.

- Preview: page scale (zoom out to see more of the document at once)
- Editor: font size (11–24 pt)
- PDF: page scale
- Also works inside the image and diagram zoom window
- From the menu: `⌘ +` / `⌘ −` / `⌘ 0` (remembered separately for preview and editor)

## Syntax Palette — hold `⌥` (Mac)

While editing, hold `⌥` (Option) and the palette opens at the bottom right. It's laid out like your keyboard; while you hold `⌥`, press a key to apply that format. **Every format is a toggle** — press the same key again to remove it.

| Key | Action | Key | Action |
|---|---|---|---|
| 1–6, 0 | Heading 1–6 · Body | A | Cycle headings |
| S | Bold (`⌘B`) | D | Italic (`⌘I`) |
| F | Strikethrough | G | Inline code |
| H | Bullet | J | Numbered list |
| K | Checkbox | L | Quote |
| Z | Link (`⌘K`) | X | Image |
| C | Code block (`⌘⇧K`) | V | Table |
| B | Divider | | |

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘O` / `⌘N` / `⌘S` / `⌘W` | Open / New document / Save / Close tab |
| `⌘/` | Switch between view and edit |
| `⌘F` | Find (in preview and editor) |
| `⌘⇧T` | Table of contents |
| `⌘1–9` | Go to tab 1–9 |
| `⌘⇧[` / `⌘⇧]` | Previous / next tab |
| `⌘,` | Settings |

## Preview features

- **Change fonts quickly**: Click the "Aa" button in the toolbar to switch the body and heading fonts (serif or sans-serif) and the theme (automatic, light, or dark). It changes the same values as Settings › Preview, so your choice applies to every document and stays the next time you open Hannun.
- **Table of contents**: `⌘⇧T` or the table of contents button — a sidebar on the left; drag to resize. Click an entry to jump to it
- **Content width**: Full / Wide / Medium / Narrow (the left-right arrow button)
- **Zoom into images and diagrams**: click to open a larger view. Drag to move, pinch or ⌘ + scroll to zoom, double-click to toggle fit ⇄ 100%, `Esc` to close
- **Links between documents**: clicking `[doc](./other.md)` opens it in a new tab (`doc.md#section` jumps to that heading). Web links open in your browser
- Supports **Mermaid diagrams, math (KaTeX), and front matter cards**

## Editing features

- Full support for Korean, Japanese, and Chinese input (IME) — formatting never interferes while you compose characters
- Markdown syntax highlighting, line numbers, current line highlight
- **Byte-for-byte saving** — encoding, BOM, and line endings stay exactly as they were
- If text looks garbled, click the encoding in the status bar to reopen the file with a different encoding

## Managing files

- **Outside changes**: when another app changes an open file, Hannun reloads it automatically. If you were editing, a banner asks what to do
- **Session restore**: quit and reopen, and your tabs, view modes, and scroll positions are right where you left them
- **Allow access to image folders**: if a document's images don't show, click "Allow Folder…" in the banner at the top (a macOS security requirement)

## PDF

- PDF files open in the built-in viewer (it remembers your page)
- **Export Markdown to PDF**: choose File › **Export as PDF…**, then in the save dialog, choose the **format** (one continuous page / A4 pages), **scale**, and whether to **fit wide tables and diagrams** to the page

## Settings (`⌘,`)

- **General**: theme (Auto/Light/Dark) · language (Korean/English/Japanese/Chinese, applies after restart) · detect outside changes · default app · Automatically check for updates (free Mac version from our website only)
  - Default app — for types where Hannun is already the default, you'll see **"Default"** instead of a button
- **Preview**: content width · body typeface (Serif/Sans-serif) · heading typeface · font size · **Data View** (Source/Tree/List)
- **Editor**: monospaced font · font size

## Supported files

| Type | Extensions | Preview | Edit |
|---|---|---|---|
| Markdown | `.md` `.markdown` `.mdown` `.mkd` | Rendered | ✅ |
| Plain text | `.txt` | — (opens in the editor) | ✅ |
| JSON · XML | `.json` `.xml` | Source, Tree, or List, as set | ✅ with highlighting |
| YAML | `.yaml` `.yml` | Source + folding | ✅ with highlighting |
| PDF | `.pdf` | Built-in viewer | — |

- Every type opens the same ways — `⌘O`, drag from Finder, the location button (Mac), the Files button (iPhone and iPad), or a link inside a document
- A link like `[other doc](./other.md)` inside a document also opens in a new Hannun tab, as long as it points to one of the types above

### Data View (JSON · XML · YAML)

Data documents are read in the preview with **collapsible sections**. Choose how they look in **Settings › Preview › Data View**. Change it with a document open and it redraws on the spot.

| View | What it looks like |
|---|---|
| **Source** (default) | The file exactly as written, folding at each bracket — just like an editor such as VS Code. A folded line shows as `{ … },` |
| **Tree** | Drops the quotes and brackets and shows only names and values. The small number next to a folded line is how many items are inside. Runs of items with the same shape become a **table**, shown 200 rows at a time with "Show N more rows" to continue |
| **List** | Key, type, and value in three columns — the same layout as an Xcode property list |

- **YAML** shows in Source only and folds **by indentation**. Tree and List views for YAML are coming in an update
- Large files (more than 1,000 nodes) open with **only the first two levels** expanded
- Zoom, Find, PDF export, theme, and content width all work just as they do for Markdown
- **Text inside a folded section isn't found by Find** — it isn't on screen. Expand it first, then search
- You can't edit values in the preview. To make changes, press `⌘/` to switch to the editor, edit, and save with `⌘S`

## iPad · iPhone

- **Open a file**: tap the Files button and pick a document from the Files app. It opens in place, and your edits are saved to the original
- **Syntax Palette**: tap the button at the bottom right of the editor
- **Find & Replace**: on iPad, use the menu bar
- **Zoom**: pinch with two fingers
