import { _4u7oClient, BaseModule, config, logger, SlashCommand, CommandType } from "4u7o";
import { DirectLinkPlugin } from "@distube/direct-link";
import { FilePlugin } from "@distube/file";
import SoundCloudPlugin from "@distube/soundcloud";
import SpotifyPlugin from "@distube/spotify";
import { YouTubePlugin } from "@distube/youtube";
import { YtDlpPlugin } from "@distube/yt-dlp";
import { REST, Routes } from "discord.js";
import DisTube from "distube";
import fs, { readdirSync } from "node:fs";
import { distubeEventLoader } from "./events/distube";
class MusicModule extends BaseModule {
  public override name = "MusicModule";

  protected override onLoad(client: _4u7oClient): void {
    this.loadCommands(client);
    client.distube = new DisTube(client, {
      plugins: [
        new YouTubePlugin({
          cookies: JSON.parse(fs.readFileSync(__dirname + "/" + "_ytb-cookies.json", "utf-8")),
        }),
        new SpotifyPlugin({
          api: {
            clientId: config.spotify.CLIENT_ID,
            clientSecret: config.spotify.CLIENT_SECRET,
            topTracksCountry: "VN",
          },
        }),
        new SoundCloudPlugin(),
        new FilePlugin(),
        new DirectLinkPlugin(),
        new YtDlpPlugin(),
      ],
    });
    distubeEventLoader(client.distube);
    logger.info("DisTube has been loaded");
  }

  protected override onReload(): void {}

  protected override onUnload(): void {}

  private async loadCommands(client: _4u7oClient): Promise<void> {
    logger.info("Loading music commands");
    const folders = readdirSync(`${__dirname}/commands`, { withFileTypes: true }).filter((folder) =>
      folder.isDirectory(),
    );

    for (const folder of folders) {
      const files = readdirSync(`${__dirname}/commands/${folder.name}`, {
        withFileTypes: true,
      }).filter((file) => file.isFile() && file.name.endsWith(".ts"));

      const commandList = [];

      for (const file of files) {
        try {
          const command = (await import(`${__dirname}/commands/${folder.name}/${file.name}`))
            .default as SlashCommand;
          client.commands.set(`${command.info.name}_${command.info.type}`, command);
          commandList.push(command);
        } catch (error) {
          logger.error(`Failed to load command: ${file.name}`, error);
        }
      }

      if (folder.name == CommandType.Slash) {
        const rest = new REST().setToken(config.discord.TOKEN_ID);
        await rest.put(Routes.applicationCommands(config.discord.CLIENT_ID), {
          body: commandList.map((command) => command.builder.toJSON()),
        });
        logger.info("Deploy slash commands into servers sucessfully");
      }
    }
  }
}

export default new MusicModule();
