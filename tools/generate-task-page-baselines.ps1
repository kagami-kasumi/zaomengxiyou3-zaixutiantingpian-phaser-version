$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-066-map-services/png/shop-task/DefineSprite_85_export.taskInterface.TaskInterface/1.png'
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-175H'
$states = @(
  'daily-initial','daily-tab-hover','daily-tab-pressed','activity-tab-hover','activity-tab-pressed',
  'daily-selected','tile-hover','tile-pressed','completed-unclaimed','claim-pressed','claimed-selected',
  'claimed-p1-p2','reward-three-candidates','reward-four-candidates','previous-hover','previous-pressed',
  'next-hover','next-pressed','daily-page2-same-row','daily-last-page-three-tiles',
  'daily-last-page-stale-row4','next-last-boundary','activity-empty','activity-empty-stale-detail',
  'close-hover','close-pressed','closed','reopened-daily'
)

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$sourceImage = [System.Drawing.Image]::FromFile($source)
try {
  foreach ($state in $states) {
    $target = Join-Path $outputDirectory "original-$state-940x590.png"
    $canvas = New-Object System.Drawing.Bitmap 940, 590
    try {
      if ($state -ne 'closed') {
        $graphics = [System.Drawing.Graphics]::FromImage($canvas)
        try {
          $graphics.DrawImage($sourceImage, 0, 0, [System.Drawing.Rectangle]::new(0, 0, 940, 590), [System.Drawing.GraphicsUnit]::Pixel)
        } finally { $graphics.Dispose() }
      }
      $canvas.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $canvas.Dispose() }
  }
} finally { $sourceImage.Dispose() }

Write-Output "Generated 28 restored-SWF-derived 940x590 task-page structural baselines in $outputDirectory"
