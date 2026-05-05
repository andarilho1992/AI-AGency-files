Config = {}

-- ── TICK ──────────────────────────────────────────────────────────
Config.TickRate = 5000 -- ms entre cada tick de sobrevivência

-- ── SURVIVAL RATES (baseado nos valores exatos do PZ B42) ─────────
Config.HungerRate  = 0.10  -- perda por tick (fome)
Config.ThirstRate  = 0.15  -- perda por tick (sede cai mais rápido)
Config.FatigueRate = 0.05  -- ganho por tick (cansaço)
Config.FatigueRunMultiplier = 2.0 -- multiplicador ao correr

-- ── THRESHOLDS DE FOME (espelhando moodles do PZ) ─────────────────
Config.HungerMoodles = {
    fine        = 85,
    peckish     = 75,
    hungry      = 55,
    veryHungry  = 30,
    starving    = 0
}

-- ── TEMPERATURA CORPORAL ──────────────────────────────────────────
Config.BaseTemp = 36.5
Config.TempThresholds = {
    hot          = 38.0,
    sunstruck    = 40.0,
    hyperthermic = 41.0
}

-- ── KNOX INFECTION (valores exatos do PZ B42) ────────────────────
Config.Infection = {
    biteChance       = 1.00,  -- 100% — sempre fatal
    lacerationChance = 0.25,  -- 25%
    scratchChance    = 0.07,  -- 7%

    -- Tempo até morte (minutos reais, escalado de 48-72h do PZ)
    minDeathTime = 60,   -- 60 minutos
    maxDeathTime = 120,  -- 120 minutos

    -- Progressão dos sintomas (% do timer decorrido)
    symptoms = {
        queasy   = 0.15,
        nauseous = 0.35,
        sick     = 0.60,
        dying    = 0.85
    },

    -- Aumento de temperatura por estágio
    tempBonus = {
        mild     = 0.5,  -- sintoma: queasy
        moderate = 1.0,  -- sintoma: nauseous/sick
        severe   = 2.0   -- sintoma: dying
    }
}

-- ── WOUND INFECTION (B42: letal, damage factor 1.0) ───────────────
Config.WoundInfection = {
    damagePerTick      = 2.0,   -- HP perdido por tick com ferida infectada
    dirtyBandageRisk   = 0.30,  -- 30% de infectar por tick
    cleanBandageRisk   = 0.10,
    sterilizedRisk     = 0.01,
    disinfectedBonus   = 0.50   -- reduz risco à metade
}

-- ── NOISE SYSTEM ──────────────────────────────────────────────────
Config.NoiseRadius = {
    gunshot   = 300.0,
    shotgun   = 250.0,
    explosion = 500.0,
    carEngine = 80.0,
    carAlarm  = 200.0,
    running   = 15.0,
    walking   = 5.0
}

-- ── ZUMBIS ────────────────────────────────────────────────────────
Config.Zombies = {
    maxPerArea    = 30,
    spawnRadius   = 150.0,
    despawnRadius = 300.0,
    spawnInterval = 5000, -- ms

    -- Sentidos randomizados por zumbi (mecânica B42)
    senseRanges = {
        sight   = { min = 10.0, max = 60.0 },
        hearing = { min = 5.0,  max = 40.0 },
        smell   = { min = 3.0,  max = 20.0 }
    },

    -- Modelos GTA V com aparência de zumbi
    models = {
        's_m_y_zombie_01',
        's_m_m_zombie_01'
    }
}
