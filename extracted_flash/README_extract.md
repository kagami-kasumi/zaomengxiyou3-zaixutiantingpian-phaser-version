# Flash extraction notes

Tool used:

- JPEXS Free Flash Decompiler / FFDec 26.0.0
- CLI: `C:\Program Files (x86)\FFDec\ffdec-cli.exe`

Generated directories:

- `ffdec_extract_all/`: SWF candidates preserved from the extraction pass.
- `scripts/`: Decompiled ActionScript sources.
- `resources/`: Exported images, sounds, binary data, and SymbolClass CSV files.

Most important extracted SWFs:

- `[172845].swf`: valid AS3 game package, 662 exported `.as` files. This is the best primary source tree to inspect first.
- `[25034429].swf`: valid AS3 game package, 663 exported `.as` files. It is very similar to `[172845].swf`, with extra/debug-related content.
- `[220390368].swf`: valid AS3 package containing `fonts.FZCY`.
- `[23451485].swf`: small valid AS3 package containing `Main`.

Key source entry points:

- `scripts/172845/scripts/GMain.as`
- `scripts/172845/scripts/config/Config.as`
- `scripts/172845/scripts/base/BaseHero.as`
- `scripts/172845/scripts/base/BaseMonster.as`
- `scripts/172845/scripts/my/AllEquipment.as`
- `scripts/172845/scripts/export/hero/Role1.as` through `Role5.as`
- `scripts/172845/scripts/export/monster/`
- `scripts/172845/scripts/export/level/`
- `scripts/172845/scripts/export/bullet/`
- `scripts/172845/scripts/export/magicWeapon/`

Export summary:

- ActionScript: 1327 `.as` files, about 20.83 MB total.
- Images: 136 `.png` and 11 `.jpg`, about 17.64 MB total.
- Sounds: 17 `.flv` files were exported, but they appear to be zero-byte or empty in this pass.
- Symbol mappings: 7 `.csv` files.
- SWF candidates: 75 files, including several false positives or damaged embedded fragments.

Known noisy/invalid candidates:

- Several very large files such as `[133030771].swf`, `[161705678].swf`, `[188557417].swf`, `[223622265].swf`, `[339747462].swf`, `[372144279].swf`, `[403886823].swf`, and `[418035442].swf` are likely false positives, Scaleform/GFX-like fragments, or damaged slices. FFDec can sometimes export a few images from them, but they should not be treated as primary game source.
- `[192519354].swf` and `[343709399].swf` look like damaged/false-positive SWF matches.

Recommended next step:

Use `scripts/172845/scripts` as the main reverse-engineering source, then compare with `scripts/25034429/scripts` only when a class is missing or suspicious. For a Phaser rewrite, start by porting the data/model layer (`my`, `config`, `base`) and one vertical combat slice (`BaseHero`, one `Role*`, `BaseMonster`, one `Monster*`, one `StageListener*`, bullet classes).
