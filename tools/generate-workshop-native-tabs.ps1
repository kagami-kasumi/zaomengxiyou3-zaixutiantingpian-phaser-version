$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $repoRoot 'local-resources/regima/task-outputs/task-settings-060-native-tabs/buttons-state-svg'
$outputRoot = Join-Path $repoRoot 'public/assets/ui/crafting/native-tabs'
$containerSource = Join-Path $repoRoot 'public/assets/ui/crafting/container.png'
$containerOutput = Join-Path $repoRoot 'public/assets/ui/crafting/container-native-background.png'

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

$buttons = @(
  @{ Name = 'strength'; Character = 95 },
  @{ Name = 'fusion'; Character = 99 },
  @{ Name = 'resolution'; Character = 109 },
  @{ Name = 'making'; Character = 113 }
)

foreach ($button in $buttons) {
  $buttonSource = Join-Path $sourceRoot ("DefineButton2_{0}" -f $button.Character)
  Copy-Item -LiteralPath (Join-Path $buttonSource '1_up.svg') -Destination (Join-Path $outputRoot ("{0}-up.svg" -f $button.Name)) -Force
  Copy-Item -LiteralPath (Join-Path $buttonSource '2_over.svg') -Destination (Join-Path $outputRoot ("{0}-over.svg" -f $button.Name)) -Force
  Copy-Item -LiteralPath (Join-Path $buttonSource '3_down.svg') -Destination (Join-Path $outputRoot ("{0}-down.svg" -f $button.Name)) -Force
}

$sourceImage = [System.Drawing.Image]::FromFile($containerSource)
try {
  $background = New-Object System.Drawing.Bitmap 940, 590, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($background)
    try {
      $graphics.DrawImage($sourceImage, 0, 0, 940, 590)
      $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::Black)
      try {
        # character 119's bottom strip is solid black. Erase only the four
        # flattened up-state button canvases before recomposing native children.
        $graphics.FillRectangle($brush, 64, 546, 303, 38)
      }
      finally {
        $brush.Dispose()
      }
    }
    finally {
      $graphics.Dispose()
    }
    $background.Save($containerOutput, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $background.Dispose()
  }
}
finally {
  $sourceImage.Dispose()
}

Write-Output 'Generated native workshop background and 12 button-state SVG assets.'
