import Dao from "./Dao";

export default class GuildDao extends Dao {
    constructor(db) {
        super(db, "guilds");
    }

    setCurrencySymbol(id: string, symbol: string) {
        return this.update(id, { ["economy.symbol"]: symbol });
    }

    setXpMultiplier(id: string, xpMultiplier: number) {
        return this.update(id, { ["leveling.xpMultiplier"]: xpMultiplier });
    }

    setModule(id: string, module: string, bool: boolean) {
        return this.update(id, { [`modules.${module}`]: bool })
    }

    setModRole(id: string, roleId: string) {
        return this.update(id, { ["roles.mod"]: roleId })
    }

    toggleCommand(id: string, command: string, bool: boolean) {
        return this.update(id, { [`commands.${command}.disabled`]: bool })
    }

    setPermissionLevel(id: string, command: string, number: number) {
        return this.update(id, { [`commands.${command}.permissionLevel`]: number })
    }

    setMuteRole(id: string, roleId: string) {
        return this.update(id, { ["roles.mute"]: roleId })
    }

    addCommandChannel(id: string, channelId: string) {
        return this.push(id, ["channels.command"], channelId)
    }

    removeCommandChannel(id: string, channelId: string) {
        return this.pull(id, ["channels.command"], channelId)
    }

    disableCommandChannels(id: string) {
        return this.update(id, { ["channels.command"]: null })
    }

    setSuggestionChannel(id: string, channelId: string) {
        return this.update(id, { ["roles.suggestion"]: channelId })
    }

    setAdminRole(id: string, roleId: string) {
        return this.update(id, { ["roles.admin"]: roleId })
    }

    setPrefix(id: string, prefix: string) {
        return this.update(id, { prefix });
    }

    setCooldown(id: string, field: string, value: number) {
        return this.update(id, { [`economy.${field}Cooldown`]: value });
    }

    setDailyReward(id: string, value: number) {
        return this.update(id, { ["economy.dailyReward"]: value })
    }

    setPremium(id: string, premium: boolean) {
        return this.update(id, { premium });
    }

    setLogChannel(id: string, channelId: string) {
        return this.update(id, { ["channels.log"]: channelId })
    }
}