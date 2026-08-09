Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$sourceRoot = Join-Path $repoRoot 'local-resources/regima/task-outputs/task-settings-170b2/baselines'
$outputDir = Join-Path $repoRoot 'docs/tasks/evidence/TASK-SETTINGS-170B2'
$outputPath = Join-Path $outputDir 'representative-original-resources-940x590.png'

$sources = @(
  @{ Label = 'Role5 idle_sword #297 (dynamic yf/wq)'; Path = 'role5-idle-sword/DefineSprite_297_idle_sword/1.png'; X = 18; Y = 42 },
  @{ Label = 'Role4 SHOVEL_521 #159'; Path = 'ss-fj-c-521/DefineSprite_159_ROLE4_SHOVEL_521/1.png'; X = 328; Y = 42 },
  @{ Label = 'Role4 ARROW_521 #218'; Path = 'ss-fj-g-521/DefineSprite_218_ROLE4_ARROW_521/1.png'; X = 618; Y = 42 },
  @{ Label = 'Role1 EQUIP_520 #82'; Path = 'wk-wq-520/DefineSprite_82_ROLE1_EQUIP_520/1.png'; X = 18; Y = 356 },
  @{ Label = 'inventory _clj #18'; Path = 'eicon1/18__clj.png'; X = 350; Y = 410 },
  @{ Label = 'fmtstx candidate title #424'; Path = 'eicon1/424_role_title_fmtstx.png'; X = 490; Y = 410 },
  @{ Label = 'role_title_dgg #2'; Path = 'title-dgg/2_role_title_dgg.png'; X = 720; Y = 410 }
)

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$canvas = New-Object System.Drawing.Bitmap 940, 590
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::FromArgb(255, 34, 34, 34))
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$labelFont = New-Object System.Drawing.Font 'Arial', 11
$titleFont = New-Object System.Drawing.Font 'Arial', 14, ([System.Drawing.FontStyle]::Bold)
$white = [System.Drawing.Brushes]::White
$grayPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 90, 90, 90)), 1

try {
  $graphics.DrawString('TASK-SETTINGS-170B2 source-derived representative contact sheet', $titleFont, $white, 18, 12)
  foreach ($entry in $sources) {
    $absoluteSource = Join-Path $sourceRoot $entry.Path
    if (-not (Test-Path -LiteralPath $absoluteSource)) {
      throw "Missing selective FFDec baseline: $absoluteSource"
    }
    $image = [System.Drawing.Image]::FromFile($absoluteSource)
    try {
      $graphics.DrawRectangle($grayPen, $entry.X - 1, $entry.Y - 1, $image.Width + 1, $image.Height + 1)
      $graphics.DrawImageUnscaled($image, $entry.X, $entry.Y)
      $graphics.DrawString($entry.Label, $labelFont, $white, $entry.X, $entry.Y + $image.Height + 5)
    }
    finally {
      $image.Dispose()
    }
  }
  $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $grayPen.Dispose()
  $labelFont.Dispose()
  $titleFont.Dispose()
  $graphics.Dispose()
  $canvas.Dispose()
}

Write-Output "Generated $outputPath"
