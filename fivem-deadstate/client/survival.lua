-- Sistema de sobrevivência — fome, sede, fadiga, temperatura
-- Espelha os sistemas core do PZ Build 42

local QBCore = exports['qb-core']:GetCoreObject()

local Stats = {
    hunger    = 100.0,
    thirst    = 100.0,
    fatigue   = 0.0,
    nutrition = 2000.0, -- calorias diárias (separado de fome, como no PZ)
    bodyTemp  = Config.BaseTemp
}

local Moodles = {
    hunger  = 'fine',
    thirst  = 'fine',
    fatigue = 'fine',
    temp    = 'fine'
}

-- ── TICK PRINCIPAL ────────────────────────────────────────────────
CreateThread(function()
    while true do
        Wait(Config.TickRate)

        local ped = PlayerPedId()
        if not IsPedDeadOrDying(ped, true) then
            TickStats(ped)
            UpdateMoodles()
            ApplyEffects(ped)
            SendNUIMessage({ type = 'updateStats', stats = Stats, moodles = Moodles })
        end
    end
end)

-- ── SYNC COM SERVIDOR (a cada 30s) ───────────────────────────────
local syncTick = 0
CreateThread(function()
    while true do
        Wait(30000)
        TriggerServerEvent('deadstate:saveStats', Stats)
    end
end)

function TickStats(ped)
    -- Fome cai devagar
    Stats.hunger = math.max(0, Stats.hunger - Config.HungerRate)

    -- Sede cai mais rápido
    Stats.thirst = math.max(0, Stats.thirst - Config.ThirstRate)

    -- Fadiga aumenta. Mais rápido ao correr
    local vel = GetEntityVelocity(ped)
    local speed = #(vector3(vel.x, vel.y, vel.z))
    local fatigueGain = Config.FatigueRate
    if speed > 4.0 then fatigueGain = fatigueGain * Config.FatigueRunMultiplier end
    Stats.fatigue = math.min(100, Stats.fatigue + fatigueGain)

    -- Nutrição drena separado de fome (mecânica B42 — ambas precisam ser gerenciadas)
    Stats.nutrition = math.max(0, Stats.nutrition - 1.5)
end

function UpdateMoodles()
    -- Fome
    if Stats.hunger >= Config.HungerMoodles.fine then       Moodles.hunger = 'fine'
    elseif Stats.hunger >= Config.HungerMoodles.peckish then Moodles.hunger = 'peckish'
    elseif Stats.hunger >= Config.HungerMoodles.hungry then  Moodles.hunger = 'hungry'
    elseif Stats.hunger >= Config.HungerMoodles.veryHungry then Moodles.hunger = 'veryHungry'
    else Moodles.hunger = 'starving' end

    -- Sede
    if Stats.thirst >= 80 then      Moodles.thirst = 'fine'
    elseif Stats.thirst >= 60 then  Moodles.thirst = 'thirsty'
    elseif Stats.thirst >= 30 then  Moodles.thirst = 'veryThirsty'
    else Moodles.thirst = 'dehydrated' end

    -- Fadiga
    if Stats.fatigue < 30 then      Moodles.fatigue = 'fine'
    elseif Stats.fatigue < 60 then  Moodles.fatigue = 'tired'
    elseif Stats.fatigue < 80 then  Moodles.fatigue = 'veryTired'
    else Moodles.fatigue = 'exhausted' end

    -- Temperatura
    if Stats.bodyTemp >= Config.TempThresholds.hyperthermic then Moodles.temp = 'hyperthermic'
    elseif Stats.bodyTemp >= Config.TempThresholds.sunstruck then Moodles.temp = 'sunstruck'
    elseif Stats.bodyTemp >= Config.TempThresholds.hot then Moodles.temp = 'hot'
    else Moodles.temp = 'fine' end
end

function ApplyEffects(ped)
    -- Morrendo de fome: drena HP
    if Stats.hunger < 10 then
        SetEntityHealth(ped, math.max(100, GetEntityHealth(ped) - 1))
    end

    -- Desidratado: drena HP mais rápido
    if Stats.thirst < 10 then
        SetEntityHealth(ped, math.max(100, GetEntityHealth(ped) - 2))
    end

    -- Exausto: reduz velocidade (PZ: movimento mais lento)
    if Stats.fatigue > 90 then
        SetPedMoveRateOverride(ped, 0.65)
    elseif Stats.fatigue > 70 then
        SetPedMoveRateOverride(ped, 0.85)
    else
        SetPedMoveRateOverride(ped, 1.0)
    end

    -- Hipertérmico: efeitos visuais
    if Stats.bodyTemp >= Config.TempThresholds.hyperthermic then
        SetTimecycleModifier('Drunk')
        SetTimecycleModifierStrength(0.3)
    else
        ClearTimecycleModifier()
    end
end

-- ── API PÚBLICA — Restaurar stats ao consumir itens ───────────────
RegisterNetEvent('deadstate:consumeFood', function(item)
    Stats.hunger    = math.min(100, Stats.hunger    + (item.hungerRestore  or 0))
    Stats.thirst    = math.min(100, Stats.thirst    + (item.thirstRestore  or 0))
    Stats.nutrition = math.min(2000, Stats.nutrition + (item.calories       or 0))
end)

RegisterNetEvent('deadstate:consumeWater', function(amount)
    Stats.thirst = math.min(100, Stats.thirst + amount)
end)

-- Exposição de Stats para outros recursos
exports('getStats', function() return Stats end)
exports('setBodyTemp', function(temp) Stats.bodyTemp = temp end)
