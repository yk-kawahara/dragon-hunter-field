$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$worldPath = Join-Path $PSScriptRoot "..\src\data\maps\world.js"
$docsDir = Join-Path $PSScriptRoot "..\docs"
$pngPath = Join-Path $docsDir "world-map-preview.png"
$svgPath = Join-Path $docsDir "world-map-preview.svg"

New-Item -ItemType Directory -Force -Path $docsDir | Out-Null

$content = Get-Content -LiteralPath $worldPath
function Get-MapRows($name) {
  $list = New-Object System.Collections.Generic.List[string]
  $inside = $false
  foreach ($line in $content) {
    if ($line -match "const $name = \[") {
      $inside = $true
      continue
    }
    if ($inside -and $line -match '^\s*\];') {
      break
    }
    if ($inside -and $line -match '"([.\+~T#\^_C\*=]+)"') {
      $list.Add($Matches[1])
    }
  }
  return $list
}

function Get-MapRow($name) {
  foreach ($line in $content) {
    if ($line -match "const $name = `"([.\+~T#\^_C\*=]+)`";") {
      return $Matches[1]
    }
  }
  return ""
}

$rows = Get-MapRows "WORLD_MAP"
if ($rows.Count -eq 0) {
  $baseRows = Get-MapRows "BASE_MAP"
  $eastRows = Get-MapRows "EAST_EXPANSION"
  $southRows = Get-MapRows "SOUTH_EXPANSION"
  $southGateRow = Get-MapRow "SOUTH_GATE_ROW"
  $deepSouthRows = Get-MapRows "DEEP_SOUTH_EXPANSION"
  $eclipseGateRow = Get-MapRow "ECLIPSE_GATE_ROW"
  $chapter2Rows = Get-MapRows "CHAPTER2_EXPANSION"
  $voidGateRow = Get-MapRow "VOID_GATE_ROW"
  $chapter3Rows = Get-MapRows "CHAPTER3_EXPANSION"
  $frostGateRow = Get-MapRow "FROST_GATE_ROW"
  $chapter4Rows = Get-MapRows "CHAPTER4_EXPANSION"
  if ($baseRows.Count -gt 0 -and $baseRows.Count -eq $eastRows.Count) {
    $rows = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $baseRows.Count; $i += 1) {
      $baseRow = $baseRows[$i]
      $openEast = ($i -ge 15 -and $i -le 21) -or ($i -ge 28 -and $i -le 35) -or ($i -ge 49 -and $i -le 51) -or ($i -ge 58 -and $i -le 66)
      if ($openEast) {
        $baseRow = $baseRow.Substring(0, $baseRow.Length - 1) + "+"
      }
      $rows.Add($baseRow + $eastRows[$i])
    }
    if ($southGateRow.Length -gt 0 -and $deepSouthRows.Count -gt 0) {
      for ($i = 0; $i -lt $southRows.Count - 1; $i += 1) {
        $rows.Add($southRows[$i])
      }
      $rows.Add($southGateRow)
      if ($eclipseGateRow.Length -gt 0 -and $chapter2Rows.Count -gt 0) {
        for ($i = 0; $i -lt $deepSouthRows.Count - 1; $i += 1) {
          $rows.Add($deepSouthRows[$i])
        }
        $rows.Add($eclipseGateRow)
        if ($voidGateRow.Length -gt 0 -and $chapter3Rows.Count -gt 0) {
          for ($i = 0; $i -lt $chapter2Rows.Count - 1; $i += 1) {
            $rows.Add($chapter2Rows[$i])
          }
          $rows.Add($voidGateRow)
          if ($frostGateRow.Length -gt 0 -and $chapter4Rows.Count -gt 0) {
            for ($i = 0; $i -lt $chapter3Rows.Count - 1; $i += 1) {
              $rows.Add($chapter3Rows[$i])
            }
            $rows.Add($frostGateRow)
            foreach ($row in $chapter4Rows) {
              $rows.Add($row)
            }
          } else {
            foreach ($row in $chapter3Rows) {
              $rows.Add($row)
            }
          }
        } else {
          foreach ($row in $chapter2Rows) {
            $rows.Add($row)
          }
        }
      } else {
        foreach ($row in $deepSouthRows) {
          $rows.Add($row)
        }
      }
    } else {
      foreach ($row in $southRows) {
        $rows.Add($row)
      }
    }
  }
}

if ($rows.Count -eq 0) {
  throw "WORLD_MAP rows were not found."
}

$width = $rows[0].Length
$height = $rows.Count
foreach ($row in $rows) {
  if ($row.Length -ne $width) {
    throw "WORLD_MAP row width mismatch."
  }
}

$palette = @{
  "." = "#45a653"
  "+" = "#b5a67a"
  "~" = "#2f8ed8"
  "T" = "#186b34"
  "#" = "#696763"
  "^" = "#a63732"
  "_" = "#9d9784"
  "C" = "#171717"
  "*" = "#7fcc4a"
  "=" = "#b7cc45"
}

$tileSize = 8
$bmp = New-Object System.Drawing.Bitmap ($width * $tileSize), ($height * $tileSize)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor

$svg = New-Object System.Text.StringBuilder
[void]$svg.AppendLine("<svg xmlns=`"http://www.w3.org/2000/svg`" width=`"$($width * $tileSize)`" height=`"$($height * $tileSize)`" viewBox=`"0 0 $($width * $tileSize) $($height * $tileSize)`">")

for ($y = 0; $y -lt $height; $y += 1) {
  for ($x = 0; $x -lt $width; $x += 1) {
    $ch = [string]$rows[$y][$x]
    if (-not $palette.ContainsKey($ch)) {
      throw "Unknown tile '$ch' at $x,$y."
    }
    $hex = $palette[$ch]
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex))
    $graphics.FillRectangle($brush, $x * $tileSize, $y * $tileSize, $tileSize, $tileSize)
    $brush.Dispose()
    [void]$svg.AppendLine("<rect x=`"$($x * $tileSize)`" y=`"$($y * $tileSize)`" width=`"$tileSize`" height=`"$tileSize`" fill=`"$hex`"/>")
  }
}

$npcBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#ffd166"))
foreach ($line in $content) {
  if ($line -match 'type: "npc".*x: (\d+), y: (\d+)') {
    $x = [int]$Matches[1]
    $y = [int]$Matches[2]
    $graphics.FillRectangle($npcBrush, $x * $tileSize, $y * $tileSize, $tileSize, $tileSize)
    [void]$svg.AppendLine("<rect x=`"$($x * $tileSize)`" y=`"$($y * $tileSize)`" width=`"$tileSize`" height=`"$tileSize`" fill=`"#ffd166`" stroke=`"#111`" stroke-width=`"1`"/>")
  }
}
$npcBrush.Dispose()

[void]$svg.AppendLine("</svg>")

$graphics.Dispose()
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
[System.IO.File]::WriteAllText($svgPath, $svg.ToString(), [System.Text.Encoding]::UTF8)

Write-Output "Generated $pngPath and $svgPath ($width x $height tiles)."
