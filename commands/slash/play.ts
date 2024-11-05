import { CommandType, logger, SlashCommand } from "4u7o";
import {
  GuildMember,
  SlashCommandBuilder,
  type APIInteractionGuildMember,
  type GuildTextBasedChannel,
} from "discord.js";
import type DisTube from "distube";
export default new SlashCommand(
  {
    name: "play",
    type: CommandType.Slash,
    description: "Play a song",
    category: "music",
    aliases: ["p", "play"],
  },
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song")
    .setDescriptionLocalizations({
      vi: "Phát nhạc (Du túp, ~Spotify~, ~Soundcloud~)",
    })
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song you want to play")
        .setDescriptionLocalizations({
          vi: "Bài hát bạn muốn phát (Bot sẽ tìm kiếm trên Du túp)",
        })
        .setRequired(true),
    ),
  async (interaction, { distube }) => {
    const returnMap = new Map<string, string>();
    isMeetsCondition(returnMap, interaction.member, distube);
    if (returnMap.has("error")) {
      return await interaction.reply(returnMap.get("error")!);
    }

    const song = interaction.options.getString("song")!;
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel!;

    try {
      await interaction.deferReply();
      await distube!.play(channel, song, {
        textChannel: interaction.channel as GuildTextBasedChannel,
        member,
      });
      await interaction.deleteReply();
    } catch (error) {
      await interaction.editReply(`Can't play the song: Please contact the developer!`);
      logger.error(error, {
        label: "play",
        song,
        member: member.user.username,
        channel: channel.name,
        guild: channel.guild.name,
      });
    }
  },
  async (message, { distube }) => {
    const returnMap = new Map<string, string>();
    isMeetsCondition(returnMap, message.member, distube);

    if (returnMap.has("error")) {
      return await message.reply(returnMap.get("error")!);
    }

    const song = message.content!.split(" ").slice(1).join(" ");

    const member = message.member as GuildMember;
    const channel = member.voice.channel!;

    try {
      await distube!.play(channel, song, {
        textChannel: message.channel as GuildTextBasedChannel,
        member,
      });
    } catch (error) {
      await message.reply(`Can't play the song: Please contact the developer!`);
      logger.error(error, {
        label: "play",
        song,
        member: member.user.username,
        channel: channel.name,
        guild: channel.guild.name,
      });
    }
  },
);

function isMeetsCondition(
  returnMap: Map<string, string>,
  member: APIInteractionGuildMember | GuildMember | null,
  distube: DisTube | undefined,
): void {
  if (!distube) {
    returnMap.set("error", "DisTube is not loaded");
    return;
  }

  if (!member) {
    returnMap.set("error", "Member is not found");
    return;
  }

  if (!(member instanceof GuildMember)) {
    returnMap.set("error", "Member is not a GuildMember");
    return;
  }

  if (!member.voice.channel) {
    returnMap.set("error", "You must be in a voice channel");
    return;
  }
}
