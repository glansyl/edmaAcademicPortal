# Detect existing JDK 17 or install Temurin 17 (user-local), set JAVA_HOME for user, then build
$found = Get-ChildItem 'C:\Program Files\Java','C:\Program Files (x86)\Java',$env:USERPROFILE -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match 'jdk[- ]?17|temurin-17|jdk-17' } | Select-Object -First 1

if ($found) {
    Write-Host "Found existing JDK 17 at: $($found.FullName)"
    [Environment]::SetEnvironmentVariable('JAVA_HOME',$found.FullName,'User')
    $newPath = $found.FullName + '\\bin;' + [Environment]::GetEnvironmentVariable('PATH','Process')
    [Environment]::SetEnvironmentVariable('PATH',$newPath,'Process')
    Write-Host "Set JAVA_HOME (User) to $($found.FullName)"
    & java -version
} else {
    Write-Host 'No JDK 17 found. Downloading Temurin 17 (user install)...'
    $api = 'https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse'
    $tmpZip = Join-Path $env:TEMP 'temurin17.zip'
    Invoke-WebRequest -Uri $api -OutFile $tmpZip -UseBasicParsing -ErrorAction Stop
    $extractDir = Join-Path $env:TEMP 'temurin17'
    if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
    Expand-Archive -Path $tmpZip -DestinationPath $extractDir -Force
    $inner = Get-ChildItem -Path $extractDir -Directory | Select-Object -First 1
    $dest = Join-Path $env:USERPROFILE 'jdk-17'
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Move-Item $inner.FullName $dest
    Remove-Item $tmpZip -Force
    Remove-Item $extractDir -Recurse -Force
    setx JAVA_HOME $dest | Out-Null
    $userPath = [Environment]::GetEnvironmentVariable('Path','User')
    if ($userPath -notlike "*$($dest)\\bin*") { setx Path ("$dest\\bin;" + $userPath) | Out-Null }
    [Environment]::SetEnvironmentVariable('JAVA_HOME',$dest,'Process')
    [Environment]::SetEnvironmentVariable('PATH',"$dest\\bin;" + [Environment]::GetEnvironmentVariable('PATH','Process'),'Process')
    Write-Host "Installed Temurin 17 to $dest"
    & java -version
}

Write-Host 'Starting Maven build (skip tests)...'
Set-Location -Path 'C:\Users\Glansyl dsouza\Downloads\edmaAcademicPortal-main'
mvn -DskipTests package -e
