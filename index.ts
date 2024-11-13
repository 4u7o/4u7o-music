import { _4u7oClient, BaseModule, config, logger } from "4u7o";
import { DirectLinkPlugin } from "@distube/direct-link";
import { FilePlugin } from "@distube/file";
import SoundCloudPlugin from "@distube/soundcloud";
import SpotifyPlugin from "@distube/spotify";
import { YouTubePlugin } from "@distube/youtube";
import { YtDlpPlugin } from "@distube/yt-dlp";
import DisTube from "distube";
import fs from "node:fs";
import { distubeEventLoader } from "./events/distube";
class MusicModule extends BaseModule {
  public override name = "MusicModule";
  public override dirName = __dirname;

  protected override onLoad(client: _4u7oClient): void {
    this.loadCommands(client);
    client.distube = new DisTube(client, {
      plugins: [
        new YouTubePlugin({
          cookies: JSON.parse(fs.readFileSync(this.dirName + "/" + "_ytb-cookies.json", "utf-8")),
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
}

export default new MusicModule();
