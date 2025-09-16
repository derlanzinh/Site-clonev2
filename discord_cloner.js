const { Client } = require('discord.js-selfbot-v13');

const cloneDiscordServer = async (token, originalServerId, targetServerId) => {
    const self = new Client();
    
    try {
        await self.login(token);
        
        const guilds = [
            await self.guilds.cache.get(originalServerId),
            await self.guilds.cache.get(targetServerId)
        ];
        
        if (!guilds[0] || !guilds[1]) {
            throw new Error('A conta não está nos dois servidores');
        }

        const originalGuild = guilds[0];
        const targetGuild = guilds[1];

        // Organizar itens para clonagem
        const items = {
            text: originalGuild.channels.cache.filter(c => c.type === 0).sort((a, b) => a.position - b.position).map(c => c),
            voice: originalGuild.channels.cache.filter(c => c.type === 2).sort((a, b) => a.position - b.position).map(c => c),
            category: originalGuild.channels.cache.filter(c => c.type === 4).sort((a, b) => a.position - b.position).map(c => c),
            roles: originalGuild.roles.cache.sort((a, b) => b.position - a.position).map(r => r)
        };

        // Deletar canais e cargos existentes
        await Promise.all([
            ...targetGuild.channels.cache.map(c => c.delete().catch(() => {})),
            ...targetGuild.roles.cache.filter(r => !r.managed && r.name !== '@everyone').map(r => r.delete().catch(() => {})),
            ...targetGuild.emojis.cache.map(e => e.delete().catch(() => {}))
        ]);

        // Configurar servidor
        if (originalGuild.iconURL()) {
            await targetGuild.setIcon(originalGuild.iconURL()).catch(() => {});
        }
        await targetGuild.setName(`${originalGuild.name}`).catch(() => {});

        // Clonar cargos
        for (const role of items.roles) {
            if (role.name === '@everyone') continue;
            
            try {
                await targetGuild.roles.create({
                    name: role.name,
                    color: role.color,
                    permissions: role.permissions,
                    mentionable: role.mentionable,
                    position: role.position
                });
            } catch (error) {
                console.error(`Erro ao criar cargo ${role.name}:`, error.message);
            }
        }

        // Clonar emojis
        for (const emoji of originalGuild.emojis.cache.values()) {
            try {
                await targetGuild.emojis.create({
                    attachment: emoji.url,
                    name: emoji.name
                });
            } catch (error) {
                console.error(`Erro ao criar emoji ${emoji.name}:`, error.message);
            }
        }

        // Clonar categorias
        for (const category of items.category) {
            try {
                const permissionOverwrites = Array.from(category.permissionOverwrites.cache.values()).map(overwrite => {
                    const target = originalGuild.roles.cache.get(overwrite.id) || originalGuild.members.cache.get(overwrite.id);
                    if (!target) return null;
                    
                    const newTarget = target.user ? 
                        targetGuild.members.cache.find(m => m.user.id === target.user.id) :
                        targetGuild.roles.cache.find(r => r.name === target.name);
                    
                    if (!newTarget) return null;
                    
                    return {
                        id: newTarget.id,
                        allow: overwrite.allow,
                        deny: overwrite.deny
                    };
                }).filter(Boolean);

                await targetGuild.channels.create({
                    name: category.name,
                    type: 4, // GUILD_CATEGORY
                    permissionOverwrites,
                    position: category.position
                });
            } catch (error) {
                console.error(`Erro ao criar categoria ${category.name}:`, error.message);
            }
        }

        // Clonar canais de texto
        for (const channel of items.text) {
            try {
                const permissionOverwrites = Array.from(channel.permissionOverwrites.cache.values()).map(overwrite => {
                    const target = originalGuild.roles.cache.get(overwrite.id) || originalGuild.members.cache.get(overwrite.id);
                    if (!target) return null;
                    
                    const newTarget = target.user ? 
                        targetGuild.members.cache.find(m => m.user.id === target.user.id) :
                        targetGuild.roles.cache.find(r => r.name === target.name);
                    
                    if (!newTarget) return null;
                    
                    return {
                        id: newTarget.id,
                        allow: overwrite.allow,
                        deny: overwrite.deny
                    };
                }).filter(Boolean);

                const newChannel = await targetGuild.channels.create({
                    name: channel.name,
                    type: 0, // GUILD_TEXT
                    permissionOverwrites,
                    position: channel.position,
                    topic: channel.topic
                });

                // Definir categoria se existir
                if (channel.parent) {
                    const newParent = targetGuild.channels.cache.find(c => c.name === channel.parent.name && c.type === 4);
                    if (newParent) {
                        await newChannel.setParent(newParent.id).catch(() => {});
                    }
                }
            } catch (error) {
                console.error(`Erro ao criar canal de texto ${channel.name}:`, error.message);
            }
        }

        // Clonar canais de voz
        for (const channel of items.voice) {
            try {
                const permissionOverwrites = Array.from(channel.permissionOverwrites.cache.values()).map(overwrite => {
                    const target = originalGuild.roles.cache.get(overwrite.id) || originalGuild.members.cache.get(overwrite.id);
                    if (!target) return null;
                    
                    const newTarget = target.user ? 
                        targetGuild.members.cache.find(m => m.user.id === target.user.id) :
                        targetGuild.roles.cache.find(r => r.name === target.name);
                    
                    if (!newTarget) return null;
                    
                    return {
                        id: newTarget.id,
                        allow: overwrite.allow,
                        deny: overwrite.deny
                    };
                }).filter(Boolean);

                const newChannel = await targetGuild.channels.create({
                    name: channel.name,
                    type: 2, // GUILD_VOICE
                    permissionOverwrites,
                    position: channel.position,
                    userLimit: channel.userLimit
                });

                // Definir categoria se existir
                if (channel.parent) {
                    const newParent = targetGuild.channels.cache.find(c => c.name === channel.parent.name && c.type === 4);
                    if (newParent) {
                        await newChannel.setParent(newParent.id).catch(() => {});
                    }
                }
            } catch (error) {
                console.error(`Erro ao criar canal de voz ${channel.name}:`, error.message);
            }
        }

        await self.destroy();
        return { success: true, message: 'Servidor clonado com sucesso!' };

    } catch (error) {
        await self.destroy().catch(() => {});
        throw error;
    }
};

module.exports = { cloneDiscordServer };

