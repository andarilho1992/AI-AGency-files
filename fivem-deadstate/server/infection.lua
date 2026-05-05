-- Servidor: rastreia infecção Knox por jogador (autoritativo)

local infected = {} -- [source] = { deathTime, symptomLevel }

RegisterNetEvent('deadstate:knoxStarted', function(data)
    local src = source
    infected[src] = {
        startedAt  = os.time(),
        deathAt    = os.time() + (data.deathMinutes * 60),
        symptom    = 'queasy'
    }

    print(string.format('[DeadState] Jogador %s infectado. Morte em %d minutos.', src, data.deathMinutes))

    -- Futuramente: salvar no MySQL para persistir entre reconexões
end)

RegisterNetEvent('deadstate:playerDiedKnox', function()
    local src = source
    infected[src] = nil
    print(string.format('[DeadState] Jogador %s morreu da infecção Knox.', src))
    -- Aqui: lógica de respawn, perda de itens, log de morte
end)

AddEventHandler('playerDropped', function()
    -- Mantém infecção mesmo se desconectar (persistência futura via MySQL)
    -- infected[source] = nil  <-- não limpa, para que reinfecte ao voltar
end)

-- Checa infecções ativas no servidor a cada minuto (log/auditoria)
CreateThread(function()
    while true do
        Wait(60000)
        local now = os.time()
        for src, data in pairs(infected) do
            local remaining = data.deathAt - now
            if remaining > 0 then
                print(string.format('[DeadState] Jogador %s — %d minutos até morte por Knox.', src, math.ceil(remaining / 60)))
            end
        end
    end
end)

exports('isPlayerInfected', function(src)
    return infected[src] ~= nil
end)

exports('getInfectionData', function(src)
    return infected[src]
end)
