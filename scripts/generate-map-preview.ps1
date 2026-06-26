$ErrorActionPreference = "Stop"

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) {
  $nodeCommand.Source
} else {
  Join-Path $HOME ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
}

if (-not (Test-Path -LiteralPath $nodePath)) {
  throw "Node.js was not found. Run scripts/generate-map-preview.js with an available Node.js runtime."
}

$scriptPath = Join-Path $PSScriptRoot "generate-map-preview.js"
& $nodePath $scriptPath
if ($LASTEXITCODE -ne 0) {
  throw "Map preview generation failed with exit code $LASTEXITCODE."
}
