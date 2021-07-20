import ToastClient from "../util/classes/ToastClient";
import Event from "../util/classes/Event";
import { GuildMember, Interaction } from "discord.js";
import Command from "../util/classes/Command";
import checkSlashPermissions from "../util/functions/checkSlashPermissions";

export default class extends Event {
    public constructor(client: ToastClient) {
        super(client, { name: "interactionCreate", once: false })
    }

    public async run(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        interaction.guild.data = await this.client.db.guilds.get(interaction.guild.id) || {};

        const member = <GuildMember>interaction.member;

        await this.client.db.members.newMember(interaction.guild.id, interaction.user.id);
        member.data = await this.client.db.members.get(interaction.guild.id, member.user.id) || {};

        const command = this.client.commands.get(interaction.commandName);
        if (command) {
            const path = command.conf.path;

            const commandClass = require(path)["default"];
            const cmd: Command = new commandClass(this);

            const response = await checkSlashPermissions(this.client, interaction, command);

            if (cmd.disabled) return interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            if (response === 401) return interaction.reply({
                content: "Toast must be in this server in order to use slash commands.",
                ephemeral: true
            });
            if (response) return interaction.reply({
                content: `The minimum permission level required to run this command is: \`${response}\``,
                ephemeral: true
            });

            return cmd.run(this.client, interaction);
        }
    }
};
