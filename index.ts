import { _4u7oClient, BaseModule, config, logger, type SlashCommand } from "4u7o";
import SoundCloudPlugin from "@distube/soundcloud";
import SpotifyPlugin from "@distube/spotify";
import { YouTubePlugin } from "@distube/youtube";
import DisTube from "distube";
import fs, { readdirSync } from "node:fs";
class MusicModule extends BaseModule {
  public override name = "MusicModule";

  protected override onLoad(client: _4u7oClient): void {
    client.distube = new DisTube(client, {
      plugins: [
        new YouTubePlugin({
          cookies: JSON.parse(fs.readFileSync(__dirname + "_ytb-cookies.json", "utf-8")),
        }),
        new SpotifyPlugin({
          api: { clientId: config.spotify.CLIENT_ID, clientSecret: config.spotify.CLIENT_SECRET },
        }),
        new SoundCloudPlugin(),
      ],
    });
    logger.info("DisTube has been loaded");
  }

  protected override onReload(): void {}

  protected override onUnload(): void {}

  private async loadCommands(client: _4u7oClient): Promise<void> {
    logger.info("Loading music commands");
    const files = readdirSync(__dirname + "/commands", { withFileTypes: true }).filter(
      (file) => file.isFile() && file.name.endsWith(".ts"),
    );

    for (const file of files) {
      try {
        const command = (await import(__dirname + "/commands/" + file.name))
          .default as SlashCommand;
        client.commands.set(command.info.name, command);
      } catch (error) {
        logger.error(`Failed to load command: ${file.name}`, error);
      }
    }
  }
}

export default new MusicModule();
