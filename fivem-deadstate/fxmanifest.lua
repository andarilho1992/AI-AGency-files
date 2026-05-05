fx_version 'cerulean'
game 'gta5'
author 'Dead State RP'
description 'Project Zomboid B42 survival mechanics for FiveM'
version '1.0.0'

shared_scripts {
    'shared/config.lua'
}

client_scripts {
    'client/survival.lua',
    'client/infection.lua',
    'client/zombies.lua'
}

server_scripts {
    'server/survival.lua',
    'server/infection.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html'
}
