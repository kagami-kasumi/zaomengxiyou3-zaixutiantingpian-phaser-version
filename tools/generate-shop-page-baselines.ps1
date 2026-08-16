$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$taskOutput = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-175f-shop-page'
$spriteRoot = Join-Path $taskOutput 'exports-png'
$buttonRoot = Join-Path $taskOutput 'exports-buttons'
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-175F'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

function Find-Sprite([int]$CharacterId) {
  $directory = Get-ChildItem -LiteralPath $spriteRoot -Directory |
    Where-Object { $_.Name -like "DefineSprite_$CharacterId*" } | Select-Object -First 1
  if (-not $directory) { throw "Missing character $CharacterId PNG export" }
  return Join-Path $directory.FullName '1.png'
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

$pageStates = @(
  'normal-p1-all-page1','category-gem-selected','category-item-selected','category-fashion-selected','category-pet-selected',
  'category-all-hover','category-all-pressed','card-buy-hover','card-buy-pressed','quantity-up-hover','quantity-up-pressed',
  'quantity-down-hover','quantity-down-pressed','page-all-middle','page-all-last','page-prev-boundary','page-next-boundary',
  'quantity-zero-refused','quantity-99','quantity-100','purchase-refused-soul','purchase-success','p2-selected','back-hover','back-pressed'
)
$dialogStates = @('confirm-dialog','confirm-ok-hover','confirm-ok-pressed','confirm-cancel-hover','confirm-cancel-pressed')

foreach ($id in @($pageStates + $dialogStates + 'closed-return')) {
  $canvas = New-Object System.Drawing.Bitmap 940, 590
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    if ($id -ne 'closed-return') {
      Draw-Image $graphics (Find-Sprite 721) 0 0
      Draw-Button $graphics 658 down 131.3 99
      Draw-Button $graphics 675 over 465.3 449.3
      switch ($id) {
        'category-gem-selected' { Draw-Button $graphics 658 up 131.3 99; Draw-Button $graphics 643 down 207.3 99 }
        'category-item-selected' { Draw-Button $graphics 658 up 131.3 99; Draw-Button $graphics 636 down 283.3 99 }
        'category-fashion-selected' { Draw-Button $graphics 658 up 131.3 99; Draw-Button $graphics 653 down 359.3 99 }
        'category-pet-selected' { Draw-Button $graphics 658 up 131.3 99; Draw-Button $graphics 648 down 435.25 99 }
        'category-all-hover' { Draw-Button $graphics 658 over 131.3 99 }
        'category-all-pressed' { Draw-Button $graphics 658 down 131.3 99 }
        'card-buy-hover' { Draw-Button $graphics 703 over 272.8 207.45 }
        'card-buy-pressed' { Draw-Button $graphics 703 down 272.8 207.45 }
        'quantity-up-hover' { Draw-Button $graphics 711 over 322.3 187.25 }
        'quantity-up-pressed' { Draw-Button $graphics 711 down 322.3 187.25 }
        'quantity-down-hover' { Draw-Button $graphics 716 over 322.3 196.75 }
        'quantity-down-pressed' { Draw-Button $graphics 716 down 322.3 196.75 }
        'p2-selected' { Draw-Button $graphics 675 up 465.3 449.3; Draw-Button $graphics 680 over 553.3 449.3 }
        'back-hover' { Draw-Button $graphics 719 over 866.7 10.8 }
        'back-pressed' { Draw-Button $graphics 719 down 866.7 10.8 }
      }
      if ($dialogStates -contains $id) {
        Draw-Image $graphics (Find-Sprite 624) 0 0
        if ($id -eq 'confirm-ok-hover') { Draw-Button $graphics 617 over 403.3 319 }
        if ($id -eq 'confirm-ok-pressed') { Draw-Button $graphics 617 down 403.3 319 }
        if ($id -eq 'confirm-cancel-hover') { Draw-Button $graphics 622 over 490.3 319 }
        if ($id -eq 'confirm-cancel-pressed') { Draw-Button $graphics 622 down 490.3 319 }
      }
    }
  }
  finally { $graphics.Dispose() }
  try { $canvas.Save((Join-Path $outputDirectory "original-$id-940x590.png"), [System.Drawing.Imaging.ImageFormat]::Png) }
  finally { $canvas.Dispose() }
}

Write-Output "Generated 31 restored-SWF-derived 940x590 shop-page structural baselines in $outputDirectory"
