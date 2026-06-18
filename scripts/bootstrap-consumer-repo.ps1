param(
    [Parameter(Mandatory = $true)][string]$RepoPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $RepoPath)) {
    throw "Repo path does not exist: $RepoPath"
}

$root = Split-Path -Parent $PSScriptRoot
$templatesDir = Join-Path $root "templates"
$skillsSourceDir = Join-Path $root "skills"
$schemaSource = Join-Path $root "schemas\\skill-output.schema.json"
$manifestSource = Join-Path $root "skills-manifest.json"
$skillsDir = Join-Path $RepoPath ".github\\skills"
$wfDir = Join-Path $RepoPath ".github\\workflows"

New-Item -ItemType Directory -Path $skillsDir -Force | Out-Null
New-Item -ItemType Directory -Path $wfDir -Force | Out-Null

Copy-Item (Join-Path $templatesDir "skills.lock.json") (Join-Path $skillsDir "skills.lock.json") -Force
Copy-Item (Join-Path $templatesDir "skills-sync.yml") (Join-Path $wfDir "skills-sync.yml") -Force
Copy-Item (Join-Path $templatesDir "skills-validate.yml") (Join-Path $wfDir "skills-validate.yml") -Force
Copy-Item $schemaSource (Join-Path $skillsDir "skill-output.schema.json") -Force
Copy-Item $manifestSource (Join-Path $skillsDir "skills-manifest.json") -Force
Copy-Item (Join-Path $skillsSourceDir "*") $skillsDir -Recurse -Force

Write-Host "Bootstrapped skills in $RepoPath"
