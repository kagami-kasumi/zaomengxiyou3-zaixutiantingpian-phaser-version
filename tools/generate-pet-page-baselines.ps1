$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-175a-pet-page/exports-png'
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-175A'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$rootPath = Join-Path $sourceRoot 'DefineSprite_932_export.pet.PetInterface/1.png'
$rowPath = Join-Path $sourceRoot 'DefineSprite_1224_petlist/1.png'
$confirmPath = Join-Path $sourceRoot 'DefineSprite_1221_giveUpThisPet/1.png'
$fightOverPath = Join-Path $sourceRoot 'DefineButton2_835/2_over.png'
$fightDownPath = Join-Path $sourceRoot 'DefineButton2_835/3_down.png'

function New-PetBaseline {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [int]$Rows = 0,
    [ValidateSet('normal', 'over', 'down')][string]$FightState = 'normal',
    [switch]$Confirm,
    [switch]$Closed
  )

  $rootImage = [System.Drawing.Image]::FromFile($rootPath)
  $rowImage = [System.Drawing.Image]::FromFile($rowPath)
  $confirmImage = [System.Drawing.Image]::FromFile($confirmPath)
  try {
    $canvas = New-Object System.Drawing.Bitmap 940, 590
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      if (-not $Closed) { $graphics.DrawImage($rootImage, 0, 0, 940, 590) }
      for ($index = 0; $index -lt $Rows; $index += 1) {
        $graphics.DrawImage($rowImage, 350, (143 + 26 * $index), $rowImage.Width, $rowImage.Height)
      }
      if ($FightState -ne 'normal') {
        $buttonPath = if ($FightState -eq 'over') { $fightOverPath } else { $fightDownPath }
        $buttonImage = [System.Drawing.Image]::FromFile($buttonPath)
        try { $graphics.DrawImage($buttonImage, 404, 296, $buttonImage.Width, $buttonImage.Height) }
        finally { $buttonImage.Dispose() }
      }
      if ($Confirm) { $graphics.DrawImage($confirmImage, 0, 0, 940, 590) }
    }
    finally { $graphics.Dispose() }
    $canvas.Save((Join-Path $outputDirectory "original-$Id-940x590.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
  }
  finally {
    $rootImage.Dispose()
    $rowImage.Dispose()
    $confirmImage.Dispose()
  }
}

New-PetBaseline -Id 'empty-p1'
New-PetBaseline -Id 'page1-five-p1' -Rows 5
New-PetBaseline -Id 'page2-five-p1' -Rows 5
New-PetBaseline -Id 'selected-resting-p1' -Rows 5
New-PetBaseline -Id 'selected-fighting-p1' -Rows 5
New-PetBaseline -Id 'selected-eight-skills-p1' -Rows 5
New-PetBaseline -Id 'skill-hover-p1' -Rows 5
New-PetBaseline -Id 'button-hover-p1' -Rows 5 -FightState over
New-PetBaseline -Id 'button-pressed-p1' -Rows 5 -FightState down
New-PetBaseline -Id 'release-confirm-p1' -Rows 5 -Confirm
New-PetBaseline -Id 'after-attribute-reroll-p1' -Rows 5
New-PetBaseline -Id 'after-skill-reroll-p1' -Rows 5
New-PetBaseline -Id 'after-evolution-p1' -Rows 5
New-PetBaseline -Id 'empty-p2'
New-PetBaseline -Id 'selected-p2' -Rows 5
New-PetBaseline -Id 'closed' -Closed

Write-Output "Generated 16 SWF-derived 940x590 pet-page structural baselines in $outputDirectory"
