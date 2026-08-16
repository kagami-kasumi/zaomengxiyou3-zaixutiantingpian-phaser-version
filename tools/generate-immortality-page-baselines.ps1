$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$taskOutput = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-175e-immortality-page'
$spriteRoot = Join-Path $taskOutput 'exports-png'
$buttonRoot = Join-Path $taskOutput 'exports-buttons'
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-175E'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$rootSvgDirectory = Get-ChildItem -LiteralPath (Join-Path $taskOutput 'exports-svg') -Directory |
  Where-Object { $_.Name -like 'DefineSprite_990*' } | Select-Object -First 1
if (-not $rootSvgDirectory) { throw 'Missing character 990 SVG export' }
$rootSvg = [System.IO.File]::ReadAllText((Join-Path $rootSvgDirectory.FullName '1.svg'))
$rootSvg = [regex]::Replace($rootSvg, '(?m)^\s*<use[^>]*ffdec:characterId="968"[^>]*/>\r?\n', '')
$staticRootSvgPath = Join-Path $taskOutput 'immortality-static-root.svg'
$staticRootPngPath = Join-Path $taskOutput 'immortality-static-root.png'
[System.IO.File]::WriteAllText($staticRootSvgPath, $rootSvg, [System.Text.UTF8Encoding]::new($false))
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path -LiteralPath $edge)) { throw 'Microsoft Edge is required to rasterize the runtime-static character 990 layer' }
& $edge --headless --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=940,590 --screenshot="$staticRootPngPath" ([Uri]$staticRootSvgPath).AbsoluteUri | Out-Null
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $staticRootPngPath)) { throw 'Failed to rasterize character 990 without constructor-hidden eat buttons' }

function Find-Sprite([int]$CharacterId, [int]$Frame = 1) {
  $directory = Get-ChildItem -LiteralPath $spriteRoot -Directory |
    Where-Object { $_.Name -like "DefineSprite_$CharacterId*" } | Select-Object -First 1
  if (-not $directory) { throw "Missing character $CharacterId sprite export" }
  return Join-Path $directory.FullName "$Frame.png"
}

function Draw-Image([System.Drawing.Graphics]$Graphics, [string]$Path, [float]$X, [float]$Y) {
  $image = [System.Drawing.Image]::FromFile($Path)
  try { $Graphics.DrawImage($image, $X, $Y, $image.Width, $image.Height) }
  finally { $image.Dispose() }
}

function Draw-Button([System.Drawing.Graphics]$Graphics, [int]$CharacterId, [ValidateSet('up','over','down')][string]$State, [float]$X, [float]$Y) {
  $file = @{ up = '1_up.png'; over = '2_over.png'; down = '3_down.png' }[$State]
  Draw-Image $Graphics (Join-Path $buttonRoot "DefineButton2_$CharacterId/$file") $X $Y
}

function New-Baseline {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [ValidateSet('page','dialog','closed')][string]$Surface = 'page',
    [ValidateSet('wk','ts','ss','bj','bl')][string]$Role = 'wk',
    [ValidateSet('none','back','make1','eat1','compound1','dialog-close')][string]$Button = 'none',
    [ValidateSet('up','over','down')][string]$ButtonState = 'up'
  )
  $canvas = New-Object System.Drawing.Bitmap 940, 590
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    if ($Surface -ne 'closed') {
      Draw-Image $graphics $staticRootPngPath 0 0
      $roleIds = @{ wk = 218; ts = 223; ss = 228; bj = 233; bl = 871 }
      if ($Id -eq 'selected-p2-wk') {
        Draw-Image $graphics (Find-Sprite 223 1) 50 540
        Draw-Image $graphics (Find-Sprite 218 2) 140 540
      }
      else { Draw-Image $graphics (Find-Sprite $roleIds[$Role] 2) 50 540 }
      if ($Surface -eq 'dialog') { Draw-Image $graphics (Find-Sprite 1006) 0 0 }
      switch ($Button) {
        'back' { Draw-Button $graphics 973 $ButtonState 853.3 23.35 }
        'make1' { Draw-Button $graphics 989 $ButtonState 80.7 178.9 }
        'eat1' { Draw-Button $graphics 968 $ButtonState 201.85 155.85 }
        'compound1' { Draw-Button $graphics 989 $ButtonState 589.8 146.4 }
        'dialog-close' { Draw-Button $graphics 997 $ButtonState 700.3 87.35 }
      }
    }
  }
  finally { $graphics.Dispose() }
  try { $canvas.Save((Join-Path $outputDirectory "original-$Id-940x590.png"), [System.Drawing.Imaging.ImageFormat]::Png) }
  finally { $canvas.Dispose() }
}

New-Baseline -Id 'normal-p1-wk'
foreach ($role in @('ts','ss','bj','bl')) { New-Baseline -Id "selected-p1-$role" -Role $role }
New-Baseline -Id 'selected-p2-wk' -Role wk
New-Baseline -Id 'back-hover' -Button back -ButtonState over
New-Baseline -Id 'back-pressed' -Button back -ButtonState down
New-Baseline -Id 'make-hover' -Button make1 -ButtonState over
New-Baseline -Id 'make-pressed' -Button make1 -ButtonState down
New-Baseline -Id 'eat-hover' -Button eat1 -ButtonState over
New-Baseline -Id 'eat-pressed' -Button eat1 -ButtonState down
foreach ($id in @('locked-grid','consumed-grid','consume-refused-soul','consume-success')) { New-Baseline -Id $id }
New-Baseline -Id 'craft-dialog' -Surface dialog
New-Baseline -Id 'compound-hover' -Surface dialog -Button compound1 -ButtonState over
New-Baseline -Id 'compound-pressed' -Surface dialog -Button compound1 -ButtonState down
New-Baseline -Id 'dialog-close-hover' -Surface dialog -Button dialog-close -ButtonState over
New-Baseline -Id 'dialog-close-pressed' -Surface dialog -Button dialog-close -ButtonState down
foreach ($id in @('craft-refused-material','craft-refused-capacity','craft-success','craft-fire-success')) { New-Baseline -Id $id -Surface dialog }
New-Baseline -Id 'closed-return' -Surface closed

Write-Output "Generated 26 restored-SWF-derived 940x590 immortality-page structural baselines in $outputDirectory"
