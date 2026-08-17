param(
  [string]$EvidenceRoot = 'docs/tasks/evidence/TASK-SLICE-187'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

Add-Type -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;

public sealed class PartyCreationPixelDiff
{
    public int PixelCount { get; set; }
    public int MismatchPixels { get; set; }
    public double MeanAbsoluteChannelDelta { get; set; }
    public int MaxChannelDelta { get; set; }
}

public static class PartyCreationVisualEvidence
{
    public static PartyCreationPixelDiff Compare(Bitmap original, Bitmap modern, Rectangle region)
    {
        long absoluteDelta = 0;
        int mismatchPixels = 0;
        int maxChannelDelta = 0;
        for (int y = region.Top; y < region.Bottom; y++)
        {
            for (int x = region.Left; x < region.Right; x++)
            {
                Color a = original.GetPixel(x, y);
                Color b = modern.GetPixel(x, y);
                int[] deltas = {
                    Math.Abs(a.R - b.R), Math.Abs(a.G - b.G),
                    Math.Abs(a.B - b.B), Math.Abs(a.A - b.A)
                };
                bool mismatch = false;
                foreach (int delta in deltas)
                {
                    absoluteDelta += delta;
                    maxChannelDelta = Math.Max(maxChannelDelta, delta);
                    mismatch |= delta != 0;
                }
                if (mismatch) mismatchPixels++;
            }
        }
        int pixelCount = region.Width * region.Height;
        return new PartyCreationPixelDiff {
            PixelCount = pixelCount,
            MismatchPixels = mismatchPixels,
            MeanAbsoluteChannelDelta = pixelCount == 0 ? 0 : absoluteDelta / (pixelCount * 4.0),
            MaxChannelDelta = maxChannelDelta
        };
    }

    public static void SaveSideBySide(Bitmap original, Bitmap modern, string outputPath)
    {
        using (Bitmap result = new Bitmap(original.Width * 2, original.Height, PixelFormat.Format32bppArgb))
        using (Graphics graphics = Graphics.FromImage(result))
        {
            graphics.DrawImageUnscaled(original, 0, 0);
            graphics.DrawImageUnscaled(modern, original.Width, 0);
            result.Save(outputPath, ImageFormat.Png);
        }
    }

    public static void SaveOverlay(Bitmap original, Bitmap modern, string outputPath)
    {
        using (Bitmap result = new Bitmap(original.Width, original.Height, PixelFormat.Format32bppArgb))
        using (Graphics graphics = Graphics.FromImage(result))
        using (ImageAttributes attributes = new ImageAttributes())
        {
            graphics.DrawImageUnscaled(original, 0, 0);
            ColorMatrix matrix = new ColorMatrix();
            matrix.Matrix33 = 0.5f;
            attributes.SetColorMatrix(matrix, ColorMatrixFlag.Default, ColorAdjustType.Bitmap);
            graphics.DrawImage(modern, new Rectangle(0, 0, modern.Width, modern.Height),
                0, 0, modern.Width, modern.Height, GraphicsUnit.Pixel, attributes);
            result.Save(outputPath, ImageFormat.Png);
        }
    }
}
'@ -ReferencedAssemblies System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $repoRoot 'docs/reverse-engineering/ground-truth/manifests/task-settings-175i-party-creation.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding utf8 | ConvertFrom-Json
$outputRoot = Join-Path $repoRoot $EvidenceRoot
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null

$stateIds = @(
  'number-normal',
  'role1-hover-p1',
  'two-player-p1-role1-selected-p2-role2-hover'
)

$results = foreach ($stateId in $stateIds) {
  $originalPath = Join-Path $repoRoot "docs/tasks/evidence/TASK-SETTINGS-175I/original-$stateId-940x590.png"
  $modernPath = Join-Path $outputRoot "modern-$stateId-940x590.png"
  if (-not (Test-Path -LiteralPath $modernPath)) {
    throw "Missing modern screenshot: $modernPath"
  }

  $original = [System.Drawing.Bitmap]::new($originalPath)
  $modern = [System.Drawing.Bitmap]::new($modernPath)
  try {
    if ($original.Width -ne 940 -or $original.Height -ne 590 -or
        $modern.Width -ne 940 -or $modern.Height -ne 590) {
      throw "$stateId evidence must be 940x590."
    }

    [PartyCreationVisualEvidence]::SaveSideBySide(
      $original,
      $modern,
      (Join-Path $outputRoot "side-by-side-$stateId.png")
    )
    [PartyCreationVisualEvidence]::SaveOverlay(
      $original,
      $modern,
      (Join-Path $outputRoot "overlay-$stateId.png")
    )

    $fullStage = [PartyCreationVisualEvidence]::Compare(
      $original,
      $modern,
      [System.Drawing.Rectangle]::new(0, 0, 940, 590)
    )
    $objects = foreach ($object in $manifest.displayObjects) {
      $placement = $object.placements | Where-Object { $_.stateId -eq $stateId } | Select-Object -First 1
      if (-not $placement -or -not $placement.visible -or -not $placement.stageBounds) { continue }
      $bounds = $placement.stageBounds
      $left = [Math]::Max(0, [Math]::Floor([double]$bounds.left))
      $top = [Math]::Max(0, [Math]::Floor([double]$bounds.top))
      $right = [Math]::Min(940, [Math]::Ceiling([double]$bounds.left + [double]$bounds.width))
      $bottom = [Math]::Min(590, [Math]::Ceiling([double]$bounds.top + [double]$bounds.height))
      if ($right -le $left -or $bottom -le $top) { continue }
      $diff = [PartyCreationVisualEvidence]::Compare(
        $original,
        $modern,
        [System.Drawing.Rectangle]::new($left, $top, $right - $left, $bottom - $top)
      )
      [ordered]@{
        objectId = $object.id
        bounds = [ordered]@{ left = $left; top = $top; width = $right - $left; height = $bottom - $top }
        pixelCount = $diff.PixelCount
        mismatchPixels = $diff.MismatchPixels
        mismatchRatio = [Math]::Round($diff.MismatchPixels / [Math]::Max(1, $diff.PixelCount), 6)
        meanAbsoluteChannelDelta = [Math]::Round($diff.MeanAbsoluteChannelDelta, 6)
        maxChannelDelta = $diff.MaxChannelDelta
      }
    }

    [ordered]@{
      stateId = $stateId
      original = "docs/tasks/evidence/TASK-SETTINGS-175I/original-$stateId-940x590.png"
      modern = "$EvidenceRoot/modern-$stateId-940x590.png"
      sideBySide = "$EvidenceRoot/side-by-side-$stateId.png"
      overlay = "$EvidenceRoot/overlay-$stateId.png"
      fullStage = [ordered]@{
        pixelCount = $fullStage.PixelCount
        mismatchPixels = $fullStage.MismatchPixels
        mismatchRatio = [Math]::Round($fullStage.MismatchPixels / $fullStage.PixelCount, 6)
        meanAbsoluteChannelDelta = [Math]::Round($fullStage.MeanAbsoluteChannelDelta, 6)
        maxChannelDelta = $fullStage.MaxChannelDelta
      }
      objects = @($objects)
    }
  }
  finally {
    $original.Dispose()
    $modern.Dispose()
  }
}

$report = [ordered]@{
  truthId = $manifest.truthId
  generatedBy = 'tools/generate-party-creation-visual-evidence.ps1'
  stage = [ordered]@{ width = 940; height = 590 }
  comparison = 'RGBA exact comparison; anti-aliasing and transparent-edge differences remain visible in the reported metrics.'
  states = @($results)
}
$report | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $outputRoot 'visual-diff.json') -Encoding utf8
Write-Output "Generated party-creation visual evidence for $($stateIds.Count) states."
