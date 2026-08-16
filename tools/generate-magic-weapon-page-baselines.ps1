$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-175b-magic-weapon-page/exports-png'
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-175B'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$rootPath = Join-Path $sourceRoot 'DefineSprite_596_export.strength.SutraInterface/1.png'
$upgradeConfirmPath = Join-Path $sourceRoot 'DefineSprite_200_updataFBWithLvdyl/1.png'
$sharedConfirmPath = Join-Path $sourceRoot 'DefineSprite_34_renewalseThisSZ/1.png'

function New-MagicWeaponBaseline {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [ValidateSet('none', 'upgrade', 'reset', 'close', 'confirm-ok')][string]$Button = 'none',
    [ValidateSet('normal', 'over', 'down')][string]$ButtonState = 'normal',
    [ValidateSet('none', 'upgrade', 'shared')][string]$Confirm = 'none',
    [switch]$Hidden
  )

  $rootImage = [System.Drawing.Image]::FromFile($rootPath)
  $upgradeConfirmImage = [System.Drawing.Image]::FromFile($upgradeConfirmPath)
  $sharedConfirmImage = [System.Drawing.Image]::FromFile($sharedConfirmPath)
  try {
    $canvas = New-Object System.Drawing.Bitmap 940, 590
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      if (-not $Hidden) { $graphics.DrawImage($rootImage, 0, 0, 940, 590) }
      if ($Confirm -eq 'upgrade') { $graphics.DrawImage($upgradeConfirmImage, 0, 0, 940, 590) }
      if ($Confirm -eq 'shared') { $graphics.DrawImage($sharedConfirmImage, 0, 0, 940, 590) }

      if ($ButtonState -ne 'normal') {
        $buttonSpec = switch ($Button) {
          'upgrade' { @(436, 396, 404) }
          'reset' { @(368, 491, 403) }
          'close' { @(31, 710, 81) }
          'confirm-ok' { @(19, 376, 329) }
          default { throw "A non-normal state requires a button target" }
        }
        $frameName = if ($ButtonState -eq 'over') { '2_over' } else { '3_down' }
        $buttonPath = Join-Path $sourceRoot "DefineButton2_$($buttonSpec[0])/$frameName.png"
        $buttonImage = [System.Drawing.Image]::FromFile($buttonPath)
        try { $graphics.DrawImage($buttonImage, $buttonSpec[1], $buttonSpec[2], $buttonImage.Width, $buttonImage.Height) }
        finally { $buttonImage.Dispose() }
      }
    }
    finally { $graphics.Dispose() }
    $canvas.Save((Join-Path $outputDirectory "original-$Id-940x590.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
  }
  finally {
    $rootImage.Dispose()
    $upgradeConfirmImage.Dispose()
    $sharedConfirmImage.Dispose()
  }
}

New-MagicWeaponBaseline -Id 'unequipped-p1' -Hidden
New-MagicWeaponBaseline -Id 'normal-level1-p1'
New-MagicWeaponBaseline -Id 'upgrade-hover-p1' -Button upgrade -ButtonState over
New-MagicWeaponBaseline -Id 'upgrade-pressed-p1' -Button upgrade -ButtonState down
New-MagicWeaponBaseline -Id 'reset-hover-p1' -Button reset -ButtonState over
New-MagicWeaponBaseline -Id 'reset-pressed-p1' -Button reset -ButtonState down
New-MagicWeaponBaseline -Id 'close-hover-p1' -Button close -ButtonState over
New-MagicWeaponBaseline -Id 'close-pressed-p1' -Button close -ButtonState down
New-MagicWeaponBaseline -Id 'after-soul-upgrade-p1'
New-MagicWeaponBaseline -Id 'upgrade-refused-soul-p1'
New-MagicWeaponBaseline -Id 'upgrade-confirm-material-p1' -Confirm upgrade
New-MagicWeaponBaseline -Id 'upgrade-confirm-special-p1' -Confirm shared
New-MagicWeaponBaseline -Id 'confirm-ok-hover-p1' -Confirm upgrade -Button confirm-ok -ButtonState over
New-MagicWeaponBaseline -Id 'confirm-ok-pressed-p1' -Confirm upgrade -Button confirm-ok -ButtonState down
New-MagicWeaponBaseline -Id 'upgrade-confirm-cancelled-p1'
New-MagicWeaponBaseline -Id 'reset-confirm-p1' -Confirm shared
New-MagicWeaponBaseline -Id 'reset-confirm-cancelled-p1'
New-MagicWeaponBaseline -Id 'reset-refused-material-p1' -Confirm shared
New-MagicWeaponBaseline -Id 'reset-complete-p1'
New-MagicWeaponBaseline -Id 'p2-no-entry' -Hidden
New-MagicWeaponBaseline -Id 'closed' -Hidden

Write-Output "Generated 21 SWF-derived 940x590 magic-weapon-page structural baselines in $outputDirectory"
