-- Sistema de zumbis com IA e sentidos randomizados por indivíduo
-- Mecânica central do PZ B42: cada zumbi tem valores únicos de visão/audição/olfato

local spawnedZombies = {} -- { entity, senses, isChasing }
local noiseQueue     = {} -- { pos, radius, expires }

-- ── SPAWN LOOP ────────────────────────────────────────────────────
CreateThread(function()
    while true do
        Wait(Config.Zombies.spawnInterval)

        local playerPos = GetEntityCoords(PlayerPedId())
        PurgeDistantZombies(playerPos)

        if #spawnedZombies < Config.Zombies.maxPerArea then
            SpawnBatch(playerPos, math.random(1, 3))
        end
    end
end)

function SpawnBatch(origin, count)
    for i = 1, count do
        local angle   = math.random() * 2 * math.pi
        local dist    = math.random(60, Config.Zombies.spawnRadius)
        local x       = origin.x + math.cos(angle) * dist
        local y       = origin.y + math.sin(angle) * dist
        local z       = origin.z

        local found, groundZ = GetGroundZFor_3dCoord(x, y, z + 10.0, false)
        if found then z = groundZ end

        SpawnZombie(vector3(x, y, z))
    end
end

function SpawnZombie(pos)
    local modelName = Config.Zombies.models[math.random(#Config.Zombies.models)]
    local model     = GetHashKey(modelName)

    RequestModel(model)
    local t = 0
    while not HasModelLoaded(model) and t < 50 do Wait(100); t = t + 1 end
    if not HasModelLoaded(model) then return end

    local zombie = CreatePed(4, model, pos.x, pos.y, pos.z, math.random(0, 360), false, true)
    if not DoesEntityExist(zombie) then return end

    -- Sentidos únicos e randomizados — mechânica core do B42
    local r = Config.Zombies.senseRanges
    local senses = {
        sight   = r.sight.min   + math.random() * (r.sight.max   - r.sight.min),
        hearing = r.hearing.min + math.random() * (r.hearing.max - r.hearing.min),
        smell   = r.smell.min   + math.random() * (r.smell.max   - r.smell.min)
    }

    -- Comportamento de zumbi via GTA nativo
    SetPedFleeAttributes(zombie, 0, false)
    SetPedCombatAttributes(zombie, 292, true) -- sem cobertura
    SetPedCombatAttributes(zombie, 46, true)  -- ataca alvos em chamas
    SetBlockingOfNonTemporaryEvents(zombie, true)
    SetPedAsEnemy(zombie, true)
    SetPedCanFlyThroughWindscreen(zombie, false)
    RemoveAllPedWeapons(zombie, true)
    GiveWeaponToPed(zombie, GetHashKey('WEAPON_UNARMED'), 1, false, true)
    TaskWanderStandard(zombie, 10.0, 10)
    SetEntityInvincible(zombie, false)

    local data = { entity = zombie, senses = senses, isChasing = false }
    table.insert(spawnedZombies, data)
    SetModelAsNoLongerNeeded(model)

    CreateThread(function() ZombieAI(data) end)
end

-- ── AI INDIVIDUAL ─────────────────────────────────────────────────
function ZombieAI(data)
    while DoesEntityExist(data.entity) and not IsPedDeadOrDying(data.entity, true) do
        Wait(800)

        local zPos      = GetEntityCoords(data.entity)
        local player    = PlayerPedId()
        local pPos      = GetEntityCoords(player)
        local dist      = #(zPos - pPos)

        -- Visão: se jogador está dentro do range e há linha de visão
        if dist <= data.senses.sight then
            if HasEntityClearLosToEntity(data.entity, player, 17) then
                TaskCombatPed(data.entity, player, 0, 16)
                data.isChasing = true
            end

        -- Audição: vai até a fonte de barulho mais próxima
        elseif not data.isChasing then
            for _, noise in ipairs(noiseQueue) do
                local nDist = #(zPos - noise.pos)
                if nDist <= math.min(noise.radius, data.senses.hearing) then
                    TaskGoToCoordAnyMeans(data.entity, noise.pos.x, noise.pos.y, noise.pos.z, 1.5, 0, false, 786603, 0.0)
                    break
                end
            end
        end
    end

    -- Remove da lista quando morre
    for i = #spawnedZombies, 1, -1 do
        if spawnedZombies[i].entity == data.entity then
            if DoesEntityExist(data.entity) then DeleteEntity(data.entity) end
            table.remove(spawnedZombies, i)
            break
        end
    end
end

-- ── NOISE SYSTEM ──────────────────────────────────────────────────
function EmitNoise(pos, radius, duration)
    table.insert(noiseQueue, {
        pos     = pos,
        radius  = radius,
        expires = GetGameTimer() + (duration or 6000)
    })
end

-- Limpa barulhos expirados
CreateThread(function()
    while true do
        Wait(1000)
        local now = GetGameTimer()
        for i = #noiseQueue, 1, -1 do
            if noiseQueue[i].expires < now then
                table.remove(noiseQueue, i)
            end
        end
    end
end)

-- Tiro atrai zumbis (ruído principal do jogo)
AddEventHandler('gameEventTriggered', function(name, args)
    if name == 'CEventGunShot' then
        local pos    = GetEntityCoords(PlayerPedId())
        local weapon = GetSelectedPedWeapon(PlayerPedId())
        local radius = Config.NoiseRadius.gunshot

        if weapon == GetHashKey('WEAPON_SHOTGUN') or
           weapon == GetHashKey('WEAPON_PUMPSHOTGUN') then
            radius = Config.NoiseRadius.shotgun
        end

        EmitNoise(pos, radius, 12000)
        TriggerServerEvent('deadstate:noiseEvent', pos, radius)
    end
end)

-- Motor do carro atrai zumbis continuamente
CreateThread(function()
    while true do
        Wait(3000)
        local ped = PlayerPedId()
        if IsPedInAnyVehicle(ped, false) then
            local vehicle = GetVehiclePedIsIn(ped, false)
            if GetIsVehicleEngineRunning(vehicle) then
                EmitNoise(GetEntityCoords(vehicle), Config.NoiseRadius.carEngine, 3500)
            end
        end
    end
end)

-- ── CLEANUP ───────────────────────────────────────────────────────
function PurgeDistantZombies(playerPos)
    for i = #spawnedZombies, 1, -1 do
        local z = spawnedZombies[i]
        if DoesEntityExist(z.entity) then
            if #(GetEntityCoords(z.entity) - playerPos) > Config.Zombies.despawnRadius then
                DeleteEntity(z.entity)
                table.remove(spawnedZombies, i)
            end
        else
            table.remove(spawnedZombies, i)
        end
    end
end

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    for _, z in ipairs(spawnedZombies) do
        if DoesEntityExist(z.entity) then DeleteEntity(z.entity) end
    end
end)
