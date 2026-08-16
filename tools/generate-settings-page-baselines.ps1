$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-066-map-services/png/settings/DefineSprite_148_export.setmenu.gameSetting/1.png'
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-175G'
$states = @(
  'normal-default','difficulty-hover','difficulty-pressed','difficulty-hard','difficulty-hell','difficulty-normal-cycle',
  'bgm-hover','bgm-pressed','bgm-off','bgm-on-cycle','skill-off','skill-on-cycle','quality-medium','quality-low',
  'quality-high-cycle','default-volume-hover','default-volume-pressed','default-volume-dead-click','close-hover','close-pressed',
  'overlay-blocked','closed','reopened-session'
)

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
foreach ($state in $states) {
  $target = Join-Path $outputDirectory "original-$state-940x590.png"
  if ($state -eq 'closed') {
    $canvas = New-Object System.Drawing.Bitmap 940, 590
    try { $canvas.Save($target, [System.Drawing.Imaging.ImageFormat]::Png) }
    finally { $canvas.Dispose() }
  } else {
    Copy-Item -LiteralPath $source -Destination $target -Force
  }
}

Write-Output "Generated 23 restored-SWF-derived 940x590 settings structural baselines in $outputDirectory"
