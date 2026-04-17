Write-Host ""
Write-Host "=== EVOLUTION API — SETUP AUTOMATICO ===" -ForegroundColor Cyan
Write-Host ""

# Volta pro projeto petsgo-agents
Set-Location "C:\Users\viaje\Projeto 1\petsgo-agents"

Write-Host "1. Obtendo URL do servidor petsgo-agents..." -ForegroundColor Yellow
railway domain

Write-Host ""
Write-Host "2. Configurando variaveis da Evolution API no petsgo-agents..." -ForegroundColor Yellow

railway variables set EVOLUTION_API_URL=https://evolution-petsgo.up.railway.app
railway variables set EVOLUTION_API_KEY=petsgo-evolution-2026

Write-Host ""
Write-Host "3. Redeploy com WhatsApp ativo..." -ForegroundColor Yellow
railway up

Write-Host ""
Write-Host "=== PRONTO ===" -ForegroundColor Green
Write-Host "Acesse o painel da Evolution API para conectar o WhatsApp:" -ForegroundColor White
Write-Host "https://evolution-petsgo.up.railway.app/manager" -ForegroundColor Cyan
