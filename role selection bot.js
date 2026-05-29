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
const TOKEN = process.env.DISCORD_TOKEN;

// ข้อมูลเกี่ยวกับแบนเนอร์และข้อความหลัก
const SETUP_CHANNEL_ID = process.env.SETUP_CHANNEL_ID; // 🔴 เปลี่ยนในไฟล์ .env
const BANNER_URL = process.env.BANNER_URL; // 🔴 เปลี่ยนในไฟล์ .env

// === 💡 ฟังก์ชันช่วยแปลง Emoji ID ให้แสดงผลในแชทปกติได้ถูกต้อง ===
// หากส่งเป็น ID ตัวเลขเปล่าๆ บอทจะจัดรูปแบบเป็น <:name:ID> เพื่อให้แสดงเป็นรูปภาพในข้อความแชท
function formatEmoji(emojiStr) {
    if (!emojiStr) return '';
    if (/^\d+$/.test(emojiStr)) {
        return `<:_:${emojiStr}>`; // แปลง ID ตัวเลขเป็นรูปแบบ Custom Emoji ของ Discord
    }
    return emojiStr; // หากเป็น Unicode Emoji ปกติ ให้ส่งกลับไปตรงๆ
}
// === 🎮 ข้อมูลเกมและแรงค์ (Games & Ranks Data) 🎮 ===
// 💡 วิธีการใส่โลโก้ (Custom Emoji) ของตัวเอง:
// 1. นำรูปโลโก้เกมไปอัปโหลดลง Discord Server (Settings > Emoji)
// 2. พิมพ์ \:ชื่ออีโมจิ: ในช่องแชทดิสคอร์ด (เช่น \:rov_logo:) แล้วกดส่ง
// 3. จะได้ข้อความรูปแบบ <:rov_logo:123456789012345678>
// 4. ให้คัดลอกเฉพาะ "ตัวเลขไอดีด้านหลัง" (เช่น 123456789012345678) มาใส่ในช่อง emoji ด้านล่างนี้แทนอีโมจิปกติ
const gameData = {
    // ==========================================
    // 🏆 กลุ่มที่ 1: เกมที่มีระบบแรงค์ (มีเมนูเลือกแรงค์ต่อ)
    // ==========================================
    'valorant': {
        label: 'Valorant',
        description: '',
        emoji: '1509921504152916068', // 🔴 สามารถใส่เป็น ID ของ Custom Emoji ที่อัปโหลดในเซิร์ฟเวอร์ได้เลย (ไม่ต้องใส่ < : >)
        roleId: 'ROLE_ID_VALORANT',
        ranks: [
            { label: 'Platinum', value: 'rank_val_plat', roleId: '1509960992094949396', emoji: '💠' },
            { label: 'Diamond', value: 'rank_val_dia', roleId: '1509963430801703043', emoji: '💎' },
            { label: 'Ascendant', value: 'rank_val_asc', roleId: '1509963598162825526', emoji: '🟢' },
            { label: 'Immortal', value: 'rank_val_imm', roleId: '1509963715837956197', emoji: '🔴' },
            { label: 'Radiant', value: 'rank_val_rad', roleId: '1509963820657938614', emoji: '✨' }
        ]
    },
    'rov': {
        label: 'RoV',
        description: '',
        emoji: '1509921978600132638', // สามารถใช้ Unicode Emoji ปกติ หรือเปลี่ยนเป็น ID แบบด้านบนได้เช่นกัน
        roleId: 'ROLE_ID_ROV',
        ranks: [
            { label: 'Diamond', value: 'rank_rov_dia', roleId: '1509965084284162139', emoji: '💎' },
            { label: 'Commander', value: 'rank_rov_commander', roleId: '1509965167172128971', emoji: '👑' },
            { label: 'Conqueror', value: 'rank_rov_conqueror', roleId: '1509965355060170782', emoji: '🔴' },
            { label: 'Supreme Conqueror', value: 'rank_rov_supreme', roleId: '1509965421636485201', emoji: '🔴' },
            { label: 'Glorious Ruler', value: 'rank_rov_glorious', roleId: '1509965599374311655', emoji: '✨' }
        ]
    },
    'mlbb': {
        label: 'Mobile Legends (MLBB)',
        description: '',
        emoji: '1509921694993612902',
        roleId: 'ROLE_ID_MLBB',
        ranks: [
            { label: 'Epic', value: 'rank_ml_epic', roleId: '1509966317904466023', emoji: '🟢' },
            { label: 'Legend', value: 'rank_ml_legend', roleId: '1509966388683477202', emoji: '🔮' },
            { label: 'Mythic', value: 'rank_ml_mythic', roleId: '1509966490370179325', emoji: '🌟' }
        ]
    },
    'pubg': {
        label: 'PUBG',
        description: '',
        emoji: '1509924287291850793',
        roleId: 'ROLE_ID_PUBG',
        ranks: [
            { label: 'Diamond', value: 'rank_pubg_dia', roleId: '1509967203808837875', emoji: '💎' },
            { label: 'Crown', value: 'rank_pubg_crown', roleId: '1509967242505490432', emoji: '👑' },
            { label: 'Ace', value: 'rank_pubg_ace', roleId: '1509967438996049932', emoji: '🔥' },
            { label: 'Conqueror', value: 'rank_pubg_conq', roleId: '1509967497028173904', emoji: '🌟' }
        ]
    },
    'freefire': {
        label: 'Free Fire',
        description: '',
        emoji: '1509924266886430872',
        roleId: 'ROLE_ID_FREEFIRE',
        ranks: [
            { label: 'Heroic', value: 'rank_ff_heroic', roleId: '1509970712167710942', emoji: '🦅' },
            { label: 'Grandmaster', value: 'rank_ff_grandmaster', roleId: '1509970797102366933', emoji: '🌟' }
        ]
    },

    // ==========================================
    // 🎈 กลุ่มที่ 2: เกมที่ไม่มีระบบแรงค์ (กดแล้วได้ยศเกมนั้นทันที)
    // ==========================================
    'roblox': {
        label: 'Roblox',
        description: '',
        emoji: '1509921844235468930',
        roleId: '1509971476898386001'
    },
    'genshin': {
        label: 'Genshin Impact',
        description: '',
        emoji: '1509921757933342923',
        roleId: '1509971614589259837'
    },
    'gtav': {
        label: 'FiveM',
        description: '',
        emoji: '1509920973984366783',
        roleId: '1509971554497466540'
    },
    'minecraft': {
        label: 'Minecraft',
        description: '',
        emoji: '1509922045469655122',
        roleId: '1509971701683851345'
    }
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
    if (message.author.bot) return;

    if (message.content === '!setup-roles') {
        const channel = client.channels.cache.get(SETUP_CHANNEL_ID);
        if (!channel) return message.reply('ไม่พบห้องที่ตั้งค่าไว้ กรุณาตรวจสอบ SETUP_CHANNEL_ID ในไฟล์ .env');

        // 1. สร้าง Embed Message (แบนเนอร์และสีขอบสวยงามตามภาพตัวอย่าง)
        const embed = new EmbedBuilder()
            .setColor('#FFA500') // สีส้มทองยอดนิยม
            .setImage(BANNER_URL);

        // 2. สร้าง Select Menu สำหรับเลือกเกม
        const gameSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_game') 
            .setPlaceholder('เลือกยศ/เกมที่ต้องการ (เลือกได้หลายอัน)') 
            .setMinValues(1)
            .setMaxValues(Object.keys(gameData).length); // สามารถติ๊กเลือกได้ครบทุกเกมพร้อมกัน

        // เพิ่มตัวเลือก (Options) เข้าไปในเมนูตามข้อมูลใน gameData
        for (const [key, data] of Object.entries(gameData)) {
            gameSelectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(data.label)
                    .setDescription(data.description)
                    .setValue(key) 
                    .setEmoji(data.emoji)
            );
        }

        const row = new ActionRowBuilder().addComponents(gameSelectMenu);

        // 3. ส่งข้อความเข้าไปในห้องที่กำหนด
        await channel.send({ embeds: [embed], components: [row] });
        message.reply(`✅ สร้างข้อความรับยศเรียบร้อยแล้วที่ห้อง <#${SETUP_CHANNEL_ID}>`);
    }
});

// === 🖱️ จัดการเมื่อผู้ใช้คลิกเลือกจากเมนู ===
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    // === 🎮 กรณีที่ผู้ใช้เลือก "เกม" (select_game) ===
    if (interaction.customId === 'select_game') {
        const selectedGames = interaction.values; // อาเรย์เก็บรหัสเกมที่ผู้ใช้เลือก
        const member = interaction.member;

        let responseMessage = '⚙️ **ระบบจัดการยศอัตโนมัติ:**\n';
        const rankSelectionComponents = []; // เก็บเมนูเลือกแรงค์สำหรับเกมที่มีแรงค์

        // วนลูปประมวลผลเกมทั้งหมดที่ผู้ใช้ติ๊กเลือก
        for (const gameKey of selectedGames) {
            const gameInfo = gameData[gameKey];
            if (gameInfo) {
                const role = interaction.guild.roles.cache.get(gameInfo.roleId);
                if (role) {
                    // ทำการสลับยศ (Toggle Role): ถ้ามีอยู่แล้วจะถอดออก ถ้าไม่มีจะใส่ให้
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                        responseMessage += `➖ ถอดยศเกม **${gameInfo.label}** ออกแล้ว\n`;
                    } else {
                        await member.roles.add(role);
                        responseMessage += `➕ มอบยศเกม **${gameInfo.label}** เรียบร้อยแล้ว\n`;

                        // 💡 ส่วนสำคัญ: ตรวจสอบว่าเกมนี้มีระบบแรงค์ให้เลือกต่อหรือไม่ (เช่น Valorant, RoV, Free Fire)
                        if (gameInfo.ranks && gameInfo.ranks.length > 0) {
                            const rankMenu = new StringSelectMenuBuilder()
                                .setCustomId(`select_rank_${gameKey}`) 
                                .setPlaceholder(`เลือกระดับแรงค์ใน ${gameInfo.label}`)
                                .setMinValues(1)
                                .setMaxValues(1);

                            gameInfo.ranks.forEach(rank => {
                                rankMenu.addOptions(
                                    new StringSelectMenuOptionBuilder()
                                        .setLabel(rank.label)
                                        .setValue(rank.value)
                                        .setEmoji(rank.emoji)
                                );
                            });

                            // บันทึกตัวเลือกแรงค์ลงในแถว
                            rankSelectionComponents.push(new ActionRowBuilder().addComponents(rankMenu));
                        }
                    }
                } else {
                    console.error(`ไม่พบ Role ID: ${gameInfo.roleId} สำหรับเกม ${gameInfo.label} ในเซิร์ฟเวอร์`);
                }
            }
        }

        // ป้องกัน Error หากผู้ใช้เลือกเกมที่มีแรงค์เยอะเกิน 5 เกมพร้อมกัน (Discord บังคับส่งปุ่ม/เมนูได้ไม่เกิน 5 แถวต่อครั้ง)
        if (rankSelectionComponents.length > 5) {
            rankSelectionComponents.splice(5);
            responseMessage += `⚠️ *เนื่องจากคุณเลือกเกมหลายเกมพร้อมกัน ระบบจึงแสดงกล่องเลือกแรงค์ได้สูงสุดเพียง 5 เกมแรกเท่านั้น*`;
        }

        // ตอบกลับผู้ใช้เฉพาะตัวบุคคล (Ephemeral Message) เพื่อไม่ให้รกห้องแชทหลัก
        await interaction.reply({ 
            content: responseMessage, 
            components: rankSelectionComponents,
            ephemeral: true 
        });
    }

    // === 🏅 กรณีที่ผู้ใช้เลือก "แรงค์" จากเมนูย่อย ===
    else if (interaction.customId.startsWith('select_rank_')) {
        const gameKey = interaction.customId.replace('select_rank_', ''); 
        const selectedRankValue = interaction.values[0]; 
        const member = interaction.member;
        const gameInfo = gameData[gameKey];

        if (!gameInfo) return interaction.reply({ content: '❌ เกิดข้อผิดพลาด: ไม่พบข้อมูลเกมนี้', ephemeral: true });

        const rankInfo = gameInfo.ranks.find(r => r.value === selectedRankValue);
        if (!rankInfo) return interaction.reply({ content: '❌ เกิดข้อผิดพลาด: ไม่พบข้อมูลแรงค์นี้', ephemeral: true });

        const newRankRole = interaction.guild.roles.cache.get(rankInfo.roleId);
        if (!newRankRole) return interaction.reply({ content: '❌ ไม่พบ Role ของแรงค์นี้ในดิสคอร์ด กรุณาติดต่อผู้ดูแลระบบ', ephemeral: true });

        // ล้างแรงค์เก่าของเกมนี้ออกทั้งหมดก่อน เพื่อไม่ให้ผู้ใชั้นมียศหลายแรงค์ในเกมเดียวกัน
        const rankRolesToRemove = gameInfo.ranks.map(r => r.roleId);
        for (const rId of rankRolesToRemove) {
             if (member.roles.cache.has(rId) && rId !== newRankRole.id) {
                 const oldRole = interaction.guild.roles.cache.get(rId);
                 if (oldRole) await member.roles.remove(oldRole);
             }
        }

        // มอบยศแรงค์ใหม่ให้ผู้ใช้
        await member.roles.add(newRankRole);

        // อัปเดตข้อความกล่องเมนูเดิมแจ้งเตือนความสำเร็จ และลบเมนูย่อยออก
        await interaction.update({ 
            content: `✅ อัปเดตข้อมูลเสร็จสิ้น!\nคุณได้รับยศแรงค์ **${rankInfo.emoji} ${rankInfo.label}** สำหรับเกม **${gameInfo.label}** เรียบร้อยแล้วครับ`, 
            components: [] 
        });
    }
});

// ล็อกอินเข้าสู่ระบบ Discord
client.login(TOKEN);
