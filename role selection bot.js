require('dotenv').config(); // ใช้ .env สำหรับเก็บ Token
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    Events
} = require('discord.js');

// === ⚙️ ตั้งค่าพื้นฐาน (Configuration) ⚙️ ===
// แนะนำให้ใส่ Token ในไฟล์ .env ชื่อ DISCORD_TOKEN
const TOKEN = process.env.DISCORD_TOKEN;

// ข้อมูลเกี่ยวกับแบนเนอร์และข้อความหลัก
const SETUP_CHANNEL_ID = process.env.SETUP_CHANNEL_ID; // 🔴 เปลี่ยนในไฟล์ .env
const BANNER_URL = process.env.BANNER_URL; // 🔴 เปลี่ยนในไฟล์ .env

// === 🎮 ข้อมูลเกมและแรงค์ (Games & Ranks Data) 🎮 ===
// กำหนดข้อมูลเกม, อีโมจิ (โลโก้), Role ID ของเกม และ Role ID ของแรงค์ต่างๆ
const gameData = {
    'valorant': {
        label: 'Valorant',
        description: 'เลือกหากคุณเล่น Valorant',
        emoji: '🔫', // สามารถใส่ Custom Emoji ID เช่น '<:logo_val:123456789>'
        roleId: 'ROLE_ID_VALORANT', // 🔴 เปลี่ยนเป็น Role ID ของเกม Valorant
        ranks: [
            { label: 'Iron', value: 'rank_val_iron', roleId: 'ROLE_ID_VAL_IRON', emoji: '🪨' },
            { label: 'Bronze', value: 'rank_val_bronze', roleId: 'ROLE_ID_VAL_BRONZE', emoji: '🥉' },
            { label: 'Silver', value: 'rank_val_silver', roleId: 'ROLE_ID_VAL_SILVER', emoji: '🥈' },
            { label: 'Gold', value: 'rank_val_gold', roleId: 'ROLE_ID_VAL_GOLD', emoji: '🥇' },
            { label: 'Platinum', value: 'rank_val_plat', roleId: 'ROLE_ID_VAL_PLAT', emoji: '💠' },
            { label: 'Diamond', value: 'rank_val_dia', roleId: 'ROLE_ID_VAL_DIA', emoji: '💎' },
            { label: 'Ascendant', value: 'rank_val_asc', roleId: 'ROLE_ID_VAL_ASC', emoji: '🟢' },
            { label: 'Immortal', value: 'rank_val_imm', roleId: 'ROLE_ID_VAL_IMM', emoji: '🔴' },
            { label: 'Radiant', value: 'rank_val_rad', roleId: 'ROLE_ID_VAL_RAD', emoji: '✨' }
        ]
    },
    'apex': {
        label: 'Apex Legends',
        description: 'เลือกหากคุณเล่น Apex Legends',
        emoji: '🏃',
        roleId: 'ROLE_ID_APEX', // 🔴 เปลี่ยนเป็น Role ID ของเกม Apex
        ranks: [
            { label: 'Bronze', value: 'rank_apex_bronze', roleId: 'ROLE_ID_APEX_BRONZE', emoji: '🥉' },
            { label: 'Silver', value: 'rank_apex_silver', roleId: 'ROLE_ID_APEX_SILVER', emoji: '🥈' },
            { label: 'Gold', value: 'rank_apex_gold', roleId: 'ROLE_ID_APEX_GOLD', emoji: '🥇' },
            { label: 'Platinum', value: 'rank_apex_plat', roleId: 'ROLE_ID_APEX_PLAT', emoji: '💠' },
            { label: 'Diamond', value: 'rank_apex_dia', roleId: 'ROLE_ID_APEX_DIA', emoji: '💎' },
            { label: 'Master', value: 'rank_apex_master', roleId: 'ROLE_ID_APEX_MASTER', emoji: '🟣' },
            { label: 'Predator', value: 'rank_apex_pred', roleId: 'ROLE_ID_APEX_PRED', emoji: '🔴' }
        ]
    },
    // สามารถเพิ่มเกมอื่นๆ ได้ตามต้องการ โดยคัดลอกโครงสร้างด้านบน
};

// สร้าง Client ของบอท พร้อมกำหนด Intents (สิทธิ์การเข้าถึงข้อมูล)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});

client.once(Events.ClientReady, c => {
    console.log(`✅ บอทพร้อมทำงานแล้วในชื่อ ${c.user.tag}`);
});

// === 🛠️ คำสั่งสำหรับให้บอทสร้างข้อความรับยศ (!setup-roles) ===
client.on(Events.MessageCreate, async (message) => {
    // ป้องกันบอทตอบตัวเอง หรือข้อความจากบอทตัวอื่น
    if (message.author.bot) return;

    // คำสั่ง !setup-roles ใช้สำหรับสร้างข้อความหลักที่มีเมนูเลือกเกม
    // (ควรให้เฉพาะแอดมินใช้คำสั่งนี้ได้)
    if (message.content === '!setup-roles') {
        // ตรวจสอบสิทธิ์ (เปิดคอมเมนต์ด้านล่างหากต้องการจำกัดสิทธิ์เฉพาะแอดมิน)
        /*
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('คุณไม่มีสิทธิ์ใช้คำสั่งนี้ครับ');
        }
        */

        const channel = client.channels.cache.get(SETUP_CHANNEL_ID);
        if (!channel) return message.reply('ไม่พบห้องที่ตั้งค่าไว้ กรุณาตรวจสอบ SETUP_CHANNEL_ID');

        // 1. สร้าง Embed Message (แบนเนอร์และข้อความ)
        // ปรับแต่งให้เหมือนในรูปตัวอย่าง (มีแค่รูปภาพ เปลี่ยนสีขอบ)
        const embed = new EmbedBuilder()
            .setColor('#FFA500') // สีขอบ Embed (สีส้มแบบในรูป)
            .setImage(BANNER_URL); // ใส่รูปแบนเนอร์

        // 2. สร้าง Select Menu สำหรับเลือกเกม
        const gameSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_game') // ไอดีสำหรับตรวจสอบเวลามีคนกด
            .setPlaceholder('เลือกยศ/เกมที่ต้องการ (เลือกได้หลายอัน)') // ปรับข้อความให้เหมือนในรูปตัวอย่าง
            .setMinValues(1)
            .setMaxValues(Object.keys(gameData).length); // อนุญาตให้เลือกได้หลายเกมพร้อมกัน

        // เพิ่มตัวเลือก (Options) เข้าไปในเมนูตามข้อมูลใน gameData
        for (const [key, data] of Object.entries(gameData)) {
            gameSelectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(data.label)
                    .setDescription(data.description)
                    .setValue(key) // ค่าที่บอทจะได้รับเมื่อผู้ใช้เลือก
                    .setEmoji(data.emoji)
            );
        }

        const row = new ActionRowBuilder().addComponents(gameSelectMenu);

        // 3. ส่งข้อความเข้าไปในห้องที่กำหนด
        await channel.send({ embeds: [embed], components: [row] });
        message.reply('✅ สร้างข้อความรับยศเกมเรียบร้อยแล้วที่ห้อง <#' + SETUP_CHANNEL_ID + '>');
    }
});

// === 🖱️ จัดการเมื่อผู้ใช้กดเลือกจาก Select Menu ===
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    // === 🎮 กรณีที่ผู้ใช้เลือก "เกม" (select_game) ===
    if (interaction.customId === 'select_game') {
        const selectedGames = interaction.values; // ค่า (Value) ของเกมที่ถูกเลือก
        const member = interaction.member;

        let responseMessage = 'คุณได้รับยศเกมต่อไปนี้:\n';
        const rankSelectionComponents = []; // เก็บเมนูเลือกแรงค์ที่จะส่งให้ผู้ใช้

        // วนลูปตามเกมที่ผู้ใช้เลือก
        for (const gameKey of selectedGames) {
            const gameInfo = gameData[gameKey];
            if (gameInfo) {
                // 1. ให้ยศเกมนั้นกับผู้ใช้
                const role = interaction.guild.roles.cache.get(gameInfo.roleId);
                if (role) {
                    // ตรวจสอบว่ามี Role อยู่แล้วหรือไม่ (ใช้ Toggle: ถ้ามีให้เอาออก ถ้าไม่มีให้เพิ่ม)
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                        responseMessage += `➖ ลบยศ **${gameInfo.label}** ออกแล้ว\n`;
                    } else {
                        await member.roles.add(role);
                        responseMessage += `➕ ได้รับยศ **${gameInfo.label}**\n`;

                        // 2. ถ้ามีระบบแรงค์ ให้สร้าง Select Menu สำหรับเลือกแรงค์ของเกมนี้
                        if (gameInfo.ranks && gameInfo.ranks.length > 0) {
                            const rankMenu = new StringSelectMenuBuilder()
                                .setCustomId(`select_rank_${gameKey}`) // ตั้งชื่อไอดีเป็น select_rank_valorant เป็นต้น
                                .setPlaceholder(`เลือกระดับแรงค์ของคุณใน ${gameInfo.label}`)
                                .setMinValues(1)
                                .setMaxValues(1); // ปกติเกมเดียวมีแรงค์เดียว

                            gameInfo.ranks.forEach(rank => {
                                rankMenu.addOptions(
                                    new StringSelectMenuOptionBuilder()
                                        .setLabel(rank.label)
                                        .setValue(rank.value)
                                        .setEmoji(rank.emoji)
                                );
                            });

                            rankSelectionComponents.push(new ActionRowBuilder().addComponents(rankMenu));
                        }
                    }
                } else {
                    console.error(`ไม่พบ Role ID สำหรับเกม ${gameInfo.label}`);
                }
            }
        }

        // 3. ตอบกลับผู้ใช้ (ตอบกลับแบบ ephemeral คือเห็นคนเดียว)
        // ถ้าได้รับยศใหม่และเกมนั้นมีให้เลือกแรงค์ จะส่งเมนูเลือกแรงค์ไปให้ด้วย
        await interaction.reply({ 
            content: responseMessage, 
            components: rankSelectionComponents,
            ephemeral: true 
        });
    }

    // === 🏅 กรณีที่ผู้ใช้เลือก "แรงค์" (select_rank_...) ===
    else if (interaction.customId.startsWith('select_rank_')) {
        // แยกเอาชื่อเกมออกมาจาก customId (เช่น จาก 'select_rank_valorant' เป็น 'valorant')
        const gameKey = interaction.customId.replace('select_rank_', ''); 
        const selectedRankValue = interaction.values[0]; // แรงค์ที่เลือก
        const member = interaction.member;
        const gameInfo = gameData[gameKey];

        if (!gameInfo) return interaction.reply({ content: 'เกิดข้อผิดพลาด ไม่พบข้อมูลเกมนี้', ephemeral: true });

        // 1. หาข้อมูลแรงค์ที่ผู้ใช้เลือก
        const rankInfo = gameInfo.ranks.find(r => r.value === selectedRankValue);
        if (!rankInfo) return interaction.reply({ content: 'เกิดข้อผิดพลาด ไม่พบข้อมูลแรงค์นี้', ephemeral: true });

        const newRankRole = interaction.guild.roles.cache.get(rankInfo.roleId);
        if (!newRankRole) return interaction.reply({ content: 'เกิดข้อผิดพลาด ไม่พบ Role แรงค์ในเซิร์ฟเวอร์ กรุณาแจ้งแอดมิน', ephemeral: true });

        // 2. (สำคัญ) ลบยศแรงค์เก่าของเกมนี้ออกก่อน เพื่อไม่ให้มียศแรงค์ทับซ้อนกัน
        // วนลูปดูทุกแรงค์ในเกมนี้ แล้วถ้าผู้ใช้มียศนั้นอยู่ ให้ถอดออก
        const rankRolesToRemove = gameInfo.ranks.map(r => r.roleId);
        for (const rId of rankRolesToRemove) {
             if (member.roles.cache.has(rId) && rId !== newRankRole.id) {
                 const oldRole = interaction.guild.roles.cache.get(rId);
                 if (oldRole) await member.roles.remove(oldRole);
             }
        }

        // 3. เพิ่มยศแรงค์ใหม่ที่เลือก
        await member.roles.add(newRankRole);

        // 4. อัปเดตข้อความเพื่อแจ้งเตือนความสำเร็จ
        await interaction.update({ 
            content: `✅ อัปเดตข้อมูลเรียบร้อย!\nคุณได้รับยศแรงค์ **${rankInfo.label}** สำหรับเกม **${gameInfo.label}** แล้วครับ`, 
            components: [] // เอาเมนูเลือกแรงค์ออก
        });
    }
});

// ล็อกอินเข้าสู่ระบบ Discord
client.login(TOKEN);