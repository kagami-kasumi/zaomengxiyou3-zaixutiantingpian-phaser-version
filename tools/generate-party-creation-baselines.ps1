$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetRoot = Join-Path $projectRoot 'public/assets/ui/save-party'
$outputRoot = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-175I'
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

function Draw-ImageNativeAlpha(
  [System.Drawing.Graphics]$graphics,
  [System.Drawing.Image]$image,
  [int]$x,
  [int]$y
) {
  $destination = [System.Drawing.Rectangle]::new($x, $y, $image.Width, $image.Height)
  $graphics.DrawImage(
    $image,
    $destination,
    0,
    0,
    $image.Width,
    $image.Height,
    [System.Drawing.GraphicsUnit]::Pixel
  )
}

$numberStates = @{
  'number-normal' = 'select-number-up.png'
  'number-1p-hover' = 'select-number-1p-over.png'
  'number-1p-pressed' = 'select-number-1p-down.png'
  'number-2p-hover' = 'select-number-2p-over.png'
  'number-2p-pressed' = 'select-number-2p-down.png'
  'number-back-hover' = 'select-number-back-over.png'
  'number-back-pressed' = 'select-number-back-down.png'
}
foreach ($entry in $numberStates.GetEnumerator()) {
  Copy-Item -LiteralPath (Join-Path $assetRoot $entry.Value) -Destination (Join-Path $outputRoot "original-$($entry.Key)-940x590.png") -Force
}

$roleX = @(0, 188, 376, 564, 752)
$roleRegistrationX = @(118.05, 306.4, 494.2, 682, 870.2)
function New-RoleBaseline([string]$state, [int]$roleIndex = 0, [string]$visual = '', [string]$marker = '') {
  $canvas = New-Object System.Drawing.Bitmap 940, 590
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $root = [System.Drawing.Image]::FromFile((Join-Path $assetRoot 'select-role-up.png'))
    try { Draw-ImageNativeAlpha $graphics $root 0 0 } finally { $root.Dispose() }
    if ($visual) {
      $overlay = [System.Drawing.Image]::FromFile((Join-Path $assetRoot "role$roleIndex-$visual.png"))
      try { Draw-ImageNativeAlpha $graphics $overlay $roleX[$roleIndex - 1] 0 } finally { $overlay.Dispose() }
    }
    if ($marker) {
      $markerImage = [System.Drawing.Image]::FromFile((Join-Path $assetRoot "marker-$marker.png"))
      try { Draw-ImageNativeAlpha $graphics $markerImage ([int]($roleRegistrationX[$roleIndex - 1] - 50)) 40 } finally { $markerImage.Dispose() }
    }
    $canvas.Save((Join-Path $outputRoot "original-$state-940x590.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $canvas.Dispose()
  }
}

New-RoleBaseline 'role-normal-p1'
for ($role = 1; $role -le 5; $role += 1) {
  New-RoleBaseline "role$role-hover-p1" $role '2_over' 'p1'
  New-RoleBaseline "role$role-pressed-p1" $role '3_down' 'p1'
  New-RoleBaseline "role$role-selected-p1" $role '3_down'
}

# Representative two-player ordering: P1 keeps Role1 selected while P2 points at Role2.
$p2State = 'two-player-p1-role1-selected-p2-role2-hover'
$canvas = New-Object System.Drawing.Bitmap 940, 590
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
try {
  foreach ($draw in @(
    @{ file = 'select-role-up.png'; x = 0; y = 0 },
    @{ file = 'role1-3_down.png'; x = 0; y = 0 },
    @{ file = 'role2-2_over.png'; x = 188; y = 0 },
    @{ file = 'marker-p2.png'; x = 256; y = 40 }
  )) {
    $image = [System.Drawing.Image]::FromFile((Join-Path $assetRoot $draw.file))
    try { Draw-ImageNativeAlpha $graphics $image $draw.x $draw.y } finally { $image.Dispose() }
  }
  $canvas.Save((Join-Path $outputRoot "original-$p2State-940x590.png"), [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $graphics.Dispose()
  $canvas.Dispose()
}

foreach ($state in @('number-cancelled','role-cancelled','complete-1p','complete-2p','reloaded-1p','reloaded-2p')) {
  $blank = New-Object System.Drawing.Bitmap 940, 590
  try { $blank.Save((Join-Path $outputRoot "original-$state-940x590.png"), [System.Drawing.Imaging.ImageFormat]::Png) }
  finally { $blank.Dispose() }
}

Write-Output "Generated 30 restored-SWF-derived party-creation baselines in $outputRoot"
