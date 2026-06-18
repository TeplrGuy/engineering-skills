param(
    [Parameter(Mandatory = $true)][string]$ResultFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ResultFile)) {
    throw "Result file not found: $ResultFile"
}

$raw = Get-Content $ResultFile -Raw | ConvertFrom-Json

$quality = [int]$raw.quality_score
$determinism = [int]$raw.determinism_score
$tokenEfficiency = [int]$raw.token_efficiency_score
$latency = [int]$raw.latency_score

Write-Host "quality=$quality determinism=$determinism token_efficiency=$tokenEfficiency latency=$latency"

if ($quality -lt 85 -or $determinism -lt 90 -or $tokenEfficiency -lt 80) {
    throw "Skill score gate failed."
}

Write-Host "Skill score gate passed."
