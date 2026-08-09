$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot 'docs/tasks/evidence/TASK-SETTINGS-167'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$rootImagePath = Join-Path $projectRoot 'local-resources/regima/task-outputs/task-slice-117-crafting-ui/backpack1/DefineSprite_119_export.strength.StrengthEquipment/1.png'
$pages = @(
  @{ Id = 'strength'; X = 127; Y = 133; Image = 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites/DefineSprite_198_export.strength.Strength/1.png'; Modern = 'docs/tasks/evidence/TASK-SLICE-142-p1-strength-original-ui-940x590.png' },
  @{ Id = 'fusion'; X = 131; Y = 134; Image = 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites/DefineSprite_169_export.strength.Fusion/1.png'; Modern = 'docs/tasks/evidence/TASK-SLICE-142-p1-fusion-original-ui-940x590.png' },
  @{ Id = 'resolution'; X = 131; Y = 131; Image = 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites/DefineSprite_177_export.strength.Resolution/1.png'; Modern = 'docs/tasks/evidence/TASK-SLICE-142-p1-resolution-original-ui-940x590.png' },
  @{ Id = 'making'; X = 129; Y = 115; Image = 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites/DefineSprite_152_export.strength.Making/1.png'; Modern = 'docs/tasks/evidence/TASK-SLICE-142-p1-making-original-ui-940x590.png' }
)

foreach ($page in $pages) {
  $rootImage = [System.Drawing.Image]::FromFile($rootImagePath)
  $pageImage = [System.Drawing.Image]::FromFile((Join-Path $projectRoot $page.Image))
  $modernImage = [System.Drawing.Image]::FromFile((Join-Path $projectRoot $page.Modern))
  try {
    $original = New-Object System.Drawing.Bitmap 940, 590
    $graphics = [System.Drawing.Graphics]::FromImage($original)
    $graphics.DrawImage($rootImage, 0, 0, 940, 590)
    $graphics.DrawImage($pageImage, $page.X, $page.Y, $pageImage.Width, $pageImage.Height)
    $graphics.Dispose()

    $originalPath = Join-Path $outputDirectory "original-$($page.Id)-940x590.png"
    $original.Save($originalPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $sideBySide = New-Object System.Drawing.Bitmap 1000, 590
    $graphics = [System.Drawing.Graphics]::FromImage($sideBySide)
    $graphics.DrawImage($original, 0, 0, 500, 590)
    $graphics.DrawImage($modernImage, 500, 0, (New-Object System.Drawing.Rectangle 0, 0, 500, 590), [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Dispose()
    $sideBySide.Save((Join-Path $outputDirectory "$($page.Id)-original-modern-side-by-side.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $sideBySide.Dispose()

    $overlay = New-Object System.Drawing.Bitmap 500, 590
    $graphics = [System.Drawing.Graphics]::FromImage($overlay)
    $graphics.DrawImage($original, 0, 0, (New-Object System.Drawing.Rectangle 0, 0, 500, 590), [System.Drawing.GraphicsUnit]::Pixel)
    $attributes = New-Object System.Drawing.Imaging.ImageAttributes
    $matrix = New-Object System.Drawing.Imaging.ColorMatrix
    $matrix.Matrix33 = 0.5
    $attributes.SetColorMatrix($matrix)
    $destination = New-Object System.Drawing.Rectangle 0, 0, 500, 590
    $graphics.DrawImage($modernImage, $destination, 0, 0, 500, 590, [System.Drawing.GraphicsUnit]::Pixel, $attributes)
    $graphics.Dispose()
    $attributes.Dispose()
    $overlay.Save((Join-Path $outputDirectory "$($page.Id)-original-modern-overlay-50.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $overlay.Dispose()
    $original.Dispose()
  }
  finally {
    $rootImage.Dispose()
    $pageImage.Dispose()
    $modernImage.Dispose()
  }
}

Write-Output "Generated four original 940x590 baselines plus side-by-side and 50% overlay evidence in $outputDirectory"
