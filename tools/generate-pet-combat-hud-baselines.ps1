$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-191-pet-ui/png/DefineSprite_662_export.pet.ShowPetInfo/1.png'
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-191'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$states = @(
  'no-pet-p1', 'active-full-p1', 'active-hit-p1', 'active-dead-p1', 'rested-p1',
  'no-pet-p2', 'active-full-p2', 'active-hit-p2', 'active-dead-p2', 'rested-p2'
)

function Save-Baseline {
  param([Parameter(Mandatory = $true)][string]$State)
  $canvas = New-Object System.Drawing.Bitmap 940, 590
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    if ($State -like 'active-*') {
      $source = [System.Drawing.Image]::FromFile($sourcePath)
      try {
        if ($State -like '*-p2') {
          $mirrored = New-Object System.Drawing.Bitmap $source
          try {
            $mirrored.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)
            $graphics.DrawImage($mirrored, [single]733.5, [single]64.45, $mirrored.Width, $mirrored.Height)
          }
          finally { $mirrored.Dispose() }
        }
        else {
          $graphics.DrawImage($source, [single]-87.2, [single]64.45, $source.Width, $source.Height)
        }
      }
      finally { $source.Dispose() }
    }
    $canvas.Save((Join-Path $outputDirectory "original-$State-940x590.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $canvas.Dispose()
  }
}

foreach ($state in $states) { Save-Baseline -State $state }
Write-Output "Generated $($states.Count) SWF-derived pet combat HUD baselines in $outputDirectory"
