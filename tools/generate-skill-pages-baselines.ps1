$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-175d-skill-pages/exports-png'
$svgRoot = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-175d-skill-pages/exports-svg'
$taskOutput = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-settings-175d-skill-pages'
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-175D'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$activeSvgSource = Get-ChildItem -LiteralPath $svgRoot -Directory |
  Where-Object { $_.Name -like 'DefineSprite_868*' } |
  Select-Object -First 1
if (-not $activeSvgSource) { throw 'Missing character 868 SVG export' }
$activeSvgPath = Join-Path $activeSvgSource.FullName '1.svg'
$activeStaticSvgPath = Join-Path $taskOutput 'active-static.svg'
$activeStaticPngPath = Join-Path $taskOutput 'active-static.png'
$activeSvg = [System.IO.File]::ReadAllText($activeSvgPath)
$activeSvg = [regex]::Replace($activeSvg, '(?m)^\s*<use[^>]*ffdec:characterId="865"[^>]*/>\r?\n', '')
[System.IO.File]::WriteAllText($activeStaticSvgPath, $activeSvg, [System.Text.UTF8Encoding]::new($false))
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path -LiteralPath $edge)) { throw 'Microsoft Edge is required to rasterize the source-only active-page layer' }
$activeStaticUri = ([Uri]$activeStaticSvgPath).AbsoluteUri
& $edge --headless --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=889,425 --screenshot="$activeStaticPngPath" $activeStaticUri | Out-Null
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $activeStaticPngPath)) { throw 'Failed to rasterize the source-only active-page layer' }

function Find-ExportFile {
  param([int]$CharacterId, [int]$Frame = 1)
  $directory = Get-ChildItem -LiteralPath $sourceRoot -Directory |
    Where-Object { $_.Name -like "DefineSprite_$CharacterId*" } |
    Select-Object -First 1
  if (-not $directory) { throw "Missing sprite export for character $CharacterId" }
  $file = Join-Path $directory.FullName "$Frame.png"
  if (-not (Test-Path -LiteralPath $file)) { throw "Missing sprite frame ${CharacterId}:$Frame" }
  return $file
}

function Draw-SourceImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Path,
    [float]$X,
    [float]$Y
  )
  $image = [System.Drawing.Image]::FromFile($Path)
  try { $Graphics.DrawImage($image, $X, $Y, $image.Width, $image.Height) }
  finally { $image.Dispose() }
}

function New-SkillBaseline {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [ValidateSet('active', 'bind', 'passive', 'closed')][string]$Page,
    [ValidateSet('p1', 'p2')][string]$Owner = 'p1',
    [ValidateRange(1, 10)][int]$TreeFrame = 1
  )

  $canvas = New-Object System.Drawing.Bitmap 940, 590
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    if ($Page -ne 'closed') {
      Draw-SourceImage $graphics (Find-ExportFile 250) 0 0

      $selectorIds = @(218, 223, 228, 233, 871)
      $selectedRole = if ($Page -eq 'active' -or $Page -eq 'bind') {
        [math]::Ceiling($TreeFrame / 2)
      } elseif ($Owner -eq 'p2') { 2 } else { 1 }
      if ($selectedRole -eq 1) {
        Draw-SourceImage $graphics (Find-ExportFile 218 2) 50 15
        Draw-SourceImage $graphics (Find-ExportFile 223 1) 140 15
      }
      else {
        Draw-SourceImage $graphics (Find-ExportFile 218 1) 50 15
        Draw-SourceImage $graphics (Find-ExportFile $selectorIds[$selectedRole - 1] 2) 140 15
      }

      if ($Page -eq 'active' -or $Page -eq 'bind') {
        Draw-SourceImage $graphics $activeStaticPngPath 34 84
        Draw-SourceImage $graphics (Find-ExportFile 865 $TreeFrame) 272 124
      }
      if ($Page -eq 'bind') {
        Draw-SourceImage $graphics (Find-ExportFile 417) 208 110
        if ($Owner -eq 'p2') {
          $slotIds = @(393, 398, 403, 408, 413)
          $slotX = @(231, 325, 417, 510, 603)
          for ($i = 0; $i -lt $slotIds.Count; $i += 1) {
            Draw-SourceImage $graphics (Find-ExportFile $slotIds[$i] 2) $slotX[$i] 339
          }
        }
      }
      if ($Page -eq 'passive') {
        Draw-SourceImage $graphics (Join-Path $sourceRoot '198.png') 116 83
        $rowX = @(124, 122, 122, 122, 122)
        $rowY = @(141.35, 218.35, 301.35, 378.35, 457.35)
        for ($i = 0; $i -lt 5; $i += 1) {
          Draw-SourceImage $graphics (Find-ExportFile 212 ($i + 1)) $rowX[$i] $rowY[$i]
        }
      }
    }
  }
  finally { $graphics.Dispose() }

  try {
    $target = Join-Path $outputDirectory "original-$Id-940x590.png"
    $canvas.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally { $canvas.Dispose() }
}

for ($frame = 1; $frame -le 10; $frame += 1) {
  $role = [math]::Ceiling($frame / 2)
  $tree = (($frame - 1) % 2) + 1
  $owner = if ($role -eq 2) { 'p2' } else { 'p1' }
  New-SkillBaseline -Id "active-role$role-tree$tree-$owner" -Page active -Owner $owner -TreeFrame $frame
}
New-SkillBaseline -Id 'bind-p1' -Page bind -Owner p1 -TreeFrame 1
New-SkillBaseline -Id 'bind-p2' -Page bind -Owner p2 -TreeFrame 3
New-SkillBaseline -Id 'passive-p1' -Page passive -Owner p1
New-SkillBaseline -Id 'passive-p2' -Page passive -Owner p2
New-SkillBaseline -Id 'closed-return' -Page closed

Write-Output "Generated 15 restored-SWF-derived 940x590 skill-page structural baselines in $outputDirectory"
