-- Sistema de infecção Knox — replicação exata do PZ Build 42
-- Bite: 100% | Laceration: 25% | Scratch: 7%
-- Morte em 60-120 minutos reais após infecção

local QBCore = exports['qb-core']:GetCoreObject()

local Infection = {
    active       = false,
    type         = nil,       -- 'knox' | 'bacterial'
    startTime    = nil,
    deathTime    = nil,
    progress     = 0.0,       -- 0.0 → 1.0
    symptomLevel = 'none'     -- none | queasy | nauseous | sick | dying
}

-- ── CHECAR INFECÇÃO AO RECEBER DANO DE ZUMBI ─────────────────────
-- woundType: 'bite' | 'laceration' | 'scratch'
function CheckKnoxInfection(woundType)
    if Infection.active and Infection.type == 'knox' then return end

    local roll    = math.random()
    local chances = {
        bite       = Config.Infection.biteChance,
        laceration = Config.Infection.lacerationChance,
        scratch    = Config.Infection.scratchChance
    }
    local chance = chances[woundType] or 0

    if roll <= chance then
        StartKnoxInfection(woundType)
    else
        -- Sem infecção Knox, mas ainda é um ferimento bacteriano
        TriggerEvent('deadstate:addWound', woundType)
    end
end

function StartKnoxInfection(source)
    local deathMinutes = math.random(Config.Infection.minDeathTime, Config.Infection.maxDeathTime)

    Infection.active       = true
    Infection.type         = 'knox'
    Infection.startTime    = GetGameTimer()
    Infection.deathTime    = Infection.startTime + (deathMinutes * 60 * 1000)
    Infection.symptomLevel = 'none'
    Infection.progress     = 0.0

    TriggerServerEvent('deadstate:knoxStarted', { deathMinutes = deathMinutes })

    -- PZ não avisa diretamente. Sintoma sutil.
    QBCore.Functions.Notify('Você não está se sentindo bem...', 'error', 4000)
end

-- ── TICK DE PROGRESSÃO ────────────────────────────────────────────
CreateThread(function()
    while true do
        Wait(10000) -- checa a cada 10 segundos

        if Infection.active and Infection.type == 'knox' then
            local now     = GetGameTimer()
            local total   = Infection.deathTime - Infection.startTime
            local elapsed = now - Infection.startTime
            Infection.progress = math.min(1.0, elapsed / total)

            -- Progresso dos sintomas
            local t = Config.Infection.symptoms
            local prevSymptom = Infection.symptomLevel

            if Infection.progress >= t.dying    then SetSymptom('dying')
            elseif Infection.progress >= t.sick     then SetSymptom('sick')
            elseif Infection.progress >= t.nauseous then SetSymptom('nauseous')
            elseif Infection.progress >= t.queasy   then SetSymptom('queasy')
            end

            -- Temperatura sobe com a infecção
            local tempBonus = Config.Infection.tempBonus
            local increase = 0.0
            if Infection.progress >= 0.60 then      increase = tempBonus.severe
            elseif Infection.progress >= 0.35 then  increase = tempBonus.moderate
            else                                     increase = tempBonus.mild
            end
            exports['deadstate']:setBodyTemp(Config.BaseTemp + increase)

            -- Efeitos visuais progressivos
            if Infection.symptomLevel == 'dying' then
                ShakeGameplayCam('SMALL_EXPLOSION_SHAKE', 0.05)
            end

            -- Morte
            if now >= Infection.deathTime then
                KillFromInfection()
                return
            end

            -- Atualiza HUD
            SendNUIMessage({ type = 'updateInfection', infection = Infection })
        end
    end
end)

function SetSymptom(level)
    if Infection.symptomLevel == level then return end
    Infection.symptomLevel = level

    local messages = {
        queasy   = 'Você está enjoado. Febre baixa.',
        nauseous = 'Náusea forte. A febre está subindo.',
        sick     = 'Você está muito doente. Não há cura.',
        dying    = 'Seu corpo está falhando...'
    }

    if messages[level] then
        QBCore.Functions.Notify(messages[level], 'error', 6000)
    end
end

function KillFromInfection()
    TriggerServerEvent('deadstate:playerDiedKnox')
    SetEntityHealth(PlayerPedId(), 0)
    Infection = { active = false, type = nil, startTime = nil, deathTime = nil, progress = 0.0, symptomLevel = 'none' }
end

-- ── DETECTAR GOLPE DE ZUMBI ───────────────────────────────────────
-- Monitora dano recebido e classifica o tipo de ferimento
local lastHealth = 200
CreateThread(function()
    while true do
        Wait(500)
        local ped = PlayerPedId()
        local health = GetEntityHealth(ped)

        if health < lastHealth and not IsPedDeadOrDying(ped, true) then
            local damage = lastHealth - health

            -- Classifica ferimento por intensidade do dano (aproximação)
            -- Em produção: usar eventos de animação específicos
            local woundType
            if damage >= 30 then
                woundType = 'bite'        -- dano alto = mordida
            elseif damage >= 10 then
                woundType = 'laceration'  -- dano médio = laceração
            else
                woundType = 'scratch'     -- dano baixo = arranhão
            end

            -- Só processa se perto de um zumbi
            local nearZombie = false
            local coords = GetEntityCoords(ped)
            local peds = GetGamePool('CPed')
            for _, p in ipairs(peds) do
                if p ~= ped and not IsPedAPlayer(p) then
                    if #(GetEntityCoords(p) - coords) < 3.0 then
                        nearZombie = true
                        break
                    end
                end
            end

            if nearZombie then
                CheckKnoxInfection(woundType)
            end
        end

        lastHealth = math.max(0, GetEntityHealth(PlayerPedId()))
    end
end)

-- Expõe para outros recursos chamarem manualmente
exports('checkInfection', CheckKnoxInfection)
exports('getInfection', function() return Infection end)
