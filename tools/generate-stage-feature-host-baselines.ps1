$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$taskOutput = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-175c-stage-feature-host'
$spriteRoot = Join-Path $taskOutput 'exports-png'
$buttonRoot = Join-Path $taskOutput 'exports/buttons'
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-175C'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$roleInfoPath = Join-Path $spriteRoot 'DefineSprite_574_export.RoleInfo/1.png'
$settingsPath = Join-Path $spriteRoot 'DefineSprite_371_export.setmenu.SetMenu/1.png'
$helpActionPath = Join-Path $spriteRoot 'DefineSprite_444_export.Help/1.png'
$helpPetPath = Join-Path $spriteRoot 'DefineSprite_444_export.Help/2.png'

$hudButtons = @{
  'settings' = @(549, 63.65, 563.15)
  'backpack' = @(555, 32.9, 540.5)
  'skills' = @(561, 28.5, 504.85)
  'magic-weapon' = @(567, 55.15, 475.4)
  'pets' = @(573, 91.35, 472.65)
}

$settingsButtons = @{
  'close' = @(337, 597.95, 102.95, $true)
  'continue' = @(342, 415.05, 139.1, $false)
  'map' = @(347, 415.5, 221.95, $false)
  'help' = @(351, 415.35, 263.7, $false)
  'menu' = @(355, 402.6, 345.15, $false)
  'sound-open' = @(359, 414.85, 180.3, $false)
  'sound-close' = @(362, 414.85, 180.2, $false)
  'spawn-speed' = @(370, 402.6, 303.65, $false)
}

$helpButtons = @{
  'action' = @(436, 104.1, 558.7)
  'pet' = @(440, 223.05, 558.95)
  'back' = @(441, 848.7, 11.35)
}

function Add-ButtonFrame {
  param(
    [Parameter(Mandatory = $true)][System.Drawing.Graphics]$Graphics,
    [Parameter(Mandatory = $true)][int]$CharacterId,
    [Parameter(Mandatory = $true)][ValidateSet('up', 'over', 'down', 'hit')][string]$State,
    [Parameter(Mandatory = $true)][double]$X,
    [Parameter(Mandatory = $true)][double]$Y,
    [switch]$Centered
  )
  $frameNumber = @{ up = 1; over = 2; down = 3; hit = 4 }[$State]
  $frameSuffix = @{ up = 'up'; over = 'over'; down = 'down'; hit = 'hittest' }[$State]
  $buttonPath = Join-Path $buttonRoot "DefineButton2_$CharacterId/$($frameNumber)_$frameSuffix.png"
  $buttonImage = [System.Drawing.Image]::FromFile($buttonPath)
  try {
    $left = if ($Centered) { $X - $buttonImage.Width / 2 } else { $X }
    $top = if ($Centered) { $Y - $buttonImage.Height / 2 } else { $Y }
    $Graphics.DrawImage($buttonImage, [single]$left, [single]$top, $buttonImage.Width, $buttonImage.Height)
  }
  finally { $buttonImage.Dispose() }
}

function Save-Canvas {
  param([Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Canvas, [Parameter(Mandatory = $true)][string]$Id)
  $Canvas.Save((Join-Path $outputDirectory "original-$Id-940x590.png"), [System.Drawing.Imaging.ImageFormat]::Png)
}

function New-TransparentBaseline {
  param([Parameter(Mandatory = $true)][string]$Id)
  $canvas = New-Object System.Drawing.Bitmap 940, 590
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try { $graphics.Clear([System.Drawing.Color]::Transparent); Save-Canvas $canvas $Id }
  finally { $graphics.Dispose(); $canvas.Dispose() }
}

function New-HudBaseline {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [ValidateSet('p1', 'p2')][string]$Owner = 'p1',
    [ValidateSet('none', 'settings', 'backpack', 'skills', 'magic-weapon', 'pets')][string]$Button = 'none',
    [ValidateSet('up', 'over', 'down', 'hit')][string]$ButtonState = 'up'
  )
  $source = [System.Drawing.Image]::FromFile($roleInfoPath)
  try {
    $canvas = New-Object System.Drawing.Bitmap 940, 590
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      if ($Owner -eq 'p1') {
        $graphics.DrawImage($source, -62.15, -19, $source.Width, $source.Height)
      }
      else {
        $mirrored = New-Object System.Drawing.Bitmap $source
        try {
          $mirrored.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)
          $graphics.DrawImage($mirrored, 119.25, -19, $mirrored.Width, $mirrored.Height)
        }
        finally { $mirrored.Dispose() }
        # RoleInfo.setPos negates each feature-button child scale after GameInfo mirrors
        # the parent. Repaint those scoped children in readable orientation; the other
        # P2 HUD fields remain a structural parent-transform reference outside 175C.
        foreach ($entry in $hudButtons.Keys) {
          $entrySpec = $hudButtons[$entry]
          $entryX = 920 - [double]$entrySpec[1]
          $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
          $transparentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::Transparent)
          try { $graphics.FillRectangle($transparentBrush, [single]($entryX - 30), [single]([double]$entrySpec[2] - 30), 60, 60) }
          finally { $transparentBrush.Dispose() }
          $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        }
        foreach ($entry in $hudButtons.Keys) {
          $entrySpec = $hudButtons[$entry]
          $entryX = 920 - [double]$entrySpec[1]
          Add-ButtonFrame -Graphics $graphics -CharacterId $entrySpec[0] -State up -X $entryX -Y $entrySpec[2] -Centered
        }
      }
      if ($Button -ne 'none') {
        $spec = $hudButtons[$Button]
        $x = if ($Owner -eq 'p1') { [double]$spec[1] } else { 920 - [double]$spec[1] }
        Add-ButtonFrame -Graphics $graphics -CharacterId $spec[0] -State $ButtonState -X $x -Y $spec[2] -Centered
      }
    }
    finally { $graphics.Dispose() }
    Save-Canvas $canvas $Id
    $canvas.Dispose()
  }
  finally { $source.Dispose() }
}

function New-SettingsBaseline {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [ValidateSet('none', 'close', 'continue', 'map', 'help', 'menu', 'sound-open', 'sound-close', 'spawn-speed')][string]$Button = 'none',
    [ValidateSet('up', 'over', 'down', 'hit')][string]$ButtonState = 'up'
  )
  $source = [System.Drawing.Image]::FromFile($settingsPath)
  try {
    $canvas = New-Object System.Drawing.Bitmap 940, 590
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
      if ($Button -ne 'none') {
        $spec = $settingsButtons[$Button]
        Add-ButtonFrame -Graphics $graphics -CharacterId $spec[0] -State $ButtonState -X $spec[1] -Y $spec[2] -Centered:$spec[3]
      }
    }
    finally { $graphics.Dispose() }
    Save-Canvas $canvas $Id
    $canvas.Dispose()
  }
  finally { $source.Dispose() }
}

function New-HelpBaseline {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [ValidateSet('action', 'pet')][string]$Frame,
    [ValidateSet('none', 'action', 'pet', 'back')][string]$Button = 'none',
    [ValidateSet('up', 'over', 'down', 'hit')][string]$ButtonState = 'up'
  )
  $sourcePath = if ($Frame -eq 'pet') { $helpPetPath } else { $helpActionPath }
  $source = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $canvas = New-Object System.Drawing.Bitmap 940, 590
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
      if ($Button -ne 'none') {
        $spec = $helpButtons[$Button]
        Add-ButtonFrame -Graphics $graphics -CharacterId $spec[0] -State $ButtonState -X $spec[1] -Y $spec[2]
      }
    }
    finally { $graphics.Dispose() }
    Save-Canvas $canvas $Id
    $canvas.Dispose()
  }
  finally { $source.Dispose() }
}

New-HudBaseline -Id 'hud-p1-normal'
foreach ($button in $hudButtons.Keys) {
  foreach ($state in @('over', 'down', 'hit')) {
    # Flash hittest is non-rendered geometry; its visual baseline remains the up frame.
    $visualState = if ($state -eq 'hit') { 'up' } else { $state }
    New-HudBaseline -Id "hud-p1-$button-$state" -Button $button -ButtonState $visualState
  }
}
New-HudBaseline -Id 'hud-p2-normal' -Owner p2
foreach ($button in $hudButtons.Keys) {
  New-HudBaseline -Id "hud-p2-$button-over" -Owner p2 -Button $button -ButtonState over
}

foreach ($id in @(
  'gate-skills-special-denied', 'gate-backpack-special-denied', 'gate-backpack-dead-denied',
  'gate-magic-unequipped-denied'
)) { New-HudBaseline -Id $id }
New-TransparentBaseline -Id 'gate-pets-dead-allowed'
foreach ($id in @('page-backpack-open', 'page-skills-open', 'page-magic-open', 'page-pets-open', 'page-closed-return', 'map-origin-no-shared-chrome')) {
  New-TransparentBaseline -Id $id
}

New-SettingsBaseline -Id 'settings-normal-sound-on-speed1'
New-SettingsBaseline -Id 'settings-sound-off-speed2' -Button sound-open
New-SettingsBaseline -Id 'settings-speed4' -Button spawn-speed
New-SettingsBaseline -Id 'settings-close-over' -Button close -ButtonState over
New-SettingsBaseline -Id 'settings-close-down' -Button close -ButtonState down
New-HelpBaseline -Id 'help-action' -Frame action
New-HelpBaseline -Id 'help-pet' -Frame pet
New-HelpBaseline -Id 'help-back-over' -Frame action -Button back -ButtonState over
New-HelpBaseline -Id 'help-back-down' -Frame action -Button back -ButtonState down

Write-Output "Generated 42 SWF-derived 940x590 scoped host baselines in $outputDirectory"
