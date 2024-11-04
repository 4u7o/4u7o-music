import type DisTube from "distube";
import { Events, Queue, Song } from "distube";
import { PlayBuilder } from "../embeds/play";

export const distubeEventLoader = (distube: DisTube) => {
  distube.on(Events.PLAY_SONG, (queue: Queue, song: Song) => {
    queue!.textChannel!.send({
      embeds: [PlayBuilder(song)],
    });
  });
};
