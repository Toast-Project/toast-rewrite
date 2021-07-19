import SlashCommand from "../../util/classes/SlashCommand";
import ToastClient from "../../util/classes/ToastClient";
import { CommandInteraction, MessageAttachment, Snowflake } from "discord.js";
import { getLevel, getLevelProgress } from "../../util/functions/leveling";

import { resolveImage, Canvas } from "canvas-constructor";
import { registerFont } from "canvas";
import { resolve } from "path";

export default class extends SlashCommand {
    public constructor(client: ToastClient) {
        super(client, {
            name: "level",
            description: "View your or the specified member's level.",
            category: "social",
            options: [
                {
                    "type": 6,
                    "name": "member",
                    "description": "Member",
                    "required": false
                },
            ]
        });
    }

    public async run(client: ToastClient, interaction: CommandInteraction) {
        let member: any = interaction.options[0]?.value;
        member = interaction.guild.members.cache.get(<Snowflake>member) || interaction.member;

        const { user, data: { xp = 0 } } = member;
        const avatar = await resolveImage(user.displayAvatarURL({ size: 2048, format: "jpg" }));

        const path = resolve(__dirname, "..", "..", "..", "src/util/assets/fonts/Inter.ttf");
        registerFont(path, { family: "Inter" });

        const username = user.username.length > 10 ? user.username.substring(0, 7) + "..." : user.username;
        const progress = getLevelProgress(xp);
        const level = getLevel(xp);

        const canvas = new Canvas(900, 300)
            .setColor("#23272A")
            .printRectangle(0, 0, 900, 320)
            .setColor("#ffffff")
            .printRectangle(0, 285, 900, 20)
            .setColor("#2da14e")
            .printRectangle(0, 285, progress * 900, 20)
            .fill()
            .setShadowOffsetY(5)
            .setShadowBlur(10)
            .setColor("rgba(22, 22, 22, 1)")
            .setShadowColor("rgba(22, 22, 22, 1)")
            .setShadowOffsetY(5)
            .setShadowBlur(5)
            .printCircle(450, 120, 99)
            .printCircularImage(avatar, 450, 120, 100)
            .setColor("#ffffff")
            .save()
            .setTextFont("23px Inter")
            .setTextSize(30)
            .setColor("#FFFFFF")
            .setTextAlign("center")
            .printText(`${username}#${user.discriminator}`, 450, 260)
            .setColor("#FFFFFF")
            .setTextSize(40)
            .setColor("#FFFFFF")
            .setTextAlign("left")
            .printText(`Level: ${level + 1}`, 20, 260)
            .setTextSize(40)
            .setTextAlign("right")
            .printText(`${Math.floor(Math.floor(progress * 10000) / 100)}%`, 877, 260);

        const attachment = new MessageAttachment(canvas.toBuffer(), "profile.jpg");

        await interaction.defer();
        return interaction.followUp({ files: [attachment] });
    }
}