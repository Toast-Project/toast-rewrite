import Dao from "./Dao";

export default class GuildDao extends Dao {
    constructor(db) {
        super(db, "guilds");
    }

    setCurrencySymbol(id, symbol) {
        return this.update(id, { ["economy.symbol"]: symbol });
    }

    setXpMultiplier(id, xpMultiplier) {
        return this.update(id, { ["leveling.xpMultiplier"]: xpMultiplier });
    }

    setModule(id, module, bool) {
        return this.update(id, { [`modules.${module}`]: bool })
    }

    setModRole(id, roleId) {
        return this.update(id, { ["roles.mod"]: roleId })
    }

    toggleCommand(id, command, bool) {
        return this.update(id, { [`commands.${command}.disabled`]: bool })
    }

    setPermissionLevel(id, command, number) {
        return this.update(id, { [`commands.${command}.permissionLevel`]: number })
    }

    setMuteRole(id, roleId) {
        return this.update(id, { ["roles.mute"]: roleId })
    }

    addCommandChannel(id, channelId) {
        return this.push(id, ["channels.command"], channelId)
    }

    removeCommandChannel(id, channelId) {
        return this.pull(id, ["channels.command"], channelId)
    }

    disableCommandChannels(id) {
        return this.update(id, { ["channels.command"]: null })
    }

    setSuggestionChannel(id, channelId) {
        return this.update(id, { ["roles.suggestion"]: channelId })
    }

    setAdminRole(id, roleId) {
        return this.update(id, { ["roles.admin"]: roleId })
    }

    setPrefix(id, prefix) {
        return this.update(id, { prefix });
    }

    setCooldown(id, field, value) {
        return this.update(id, { [`economy.${field}Cooldown`]: value });
    }

    setDailyReward(id, value) {
        return this.update(id, { ["economy.dailyReward"]: value })
    }

    setPremium(id, premium) {
        return this.update(id, { premium });
    }

    setLogChannel(id, channelId) {
        return this.update(id, { ["channels.log"]: channelId })
    }
}