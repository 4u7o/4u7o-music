import { Colors, EmbedBuilder } from "discord.js";
import type { Song } from "distube";

const playEmbedTemplate = new EmbedBuilder()
  .setAuthor({
    name: `ɴᴏᴡ ᴘʟᴀʏɪɴɢ`,
  })
  .setColor(Colors.LuminousVividPink);

export const PlayBuilder = (song: Song) => {
  const embeds = playEmbedTemplate.setTitle(song.name || "Unknown").setFooter({
    text: `Requested by ${
      song.member?.nickname === null ? song.member.user.username : song.member!.nickname
    }`,
    iconURL: song.member!.user.displayAvatarURL(),
  });
  if (song.thumbnail) embeds.setThumbnail(song.thumbnail);
  if (song.url) embeds.setURL(song.url);

  return embeds;
};
