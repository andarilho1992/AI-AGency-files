-- Servidor: salva e sincroniza stats de sobrevivência entre sessões

local playerStats = {} -- [source] = Stats

RegisterNetEvent('deadstate:saveStats', function(stats)
    local src = source
    playerStats[src] = stats
    -- Aqui vai o MySQL quando adicionar persistência
    -- MySQL.update('UPDATE players SET survival_stats=? WHERE identifier=?', {json.encode(stats), identifier})
end)

RegisterNetEvent('deadstate:syncStats', function(stats)
    playerStats[source] = stats
end)

-- Envia stats salvos quando jogador conecta
AddEventHandler('playerConnecting', function()
    local src = source
    -- Aqui vai o carregamento do MySQL
    -- Por ora inicia com valores padrão
    playerStats[src] = {
        hunger    = 100.0,
        thirst    = 100.0,
        fatigue   = 0.0,
        nutrition = 2000.0,
        bodyTemp  = 36.5
    }
end)

AddEventHandler('playerDropped', function()
    playerStats[source] = nil
end)

-- Expõe stats de um jogador para outros recursos de servidor
exports('getPlayerStats', function(src)
    return playerStats[src]
end)

RegisterNetEvent('deadstate:noiseEvent', function(pos, radius)
    -- Broadcast barulho para todos os clientes próximos
    local src = source
    for _, player in ipairs(GetPlayers()) do
        local pid = tonumber(player)
        if pid ~= src then
            TriggerClientEvent('deadstate:receiveNoise', pid, pos, radius)
        end
    end
end)
