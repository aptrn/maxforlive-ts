import { AbletonLive, ClipContext, Note, NotesDict } from "../src";

describe("test ableton live", () => {
  it("Should set the context and retrieve it", () => {
    let ableton = new AbletonLive();
    let clipContext: ClipContext = {
      clip: {
        time_selection_start: 0,
        time_selection_end: 100,
        first_note_start: 0,
        first_note_end: 100,
        lowest_pitch: 0,
        highest_pitch: 100,
      },
      scale: {
        scale_mode: false,
        root_note: 0,
        scale_interals: [],
        scale_names: [],
      },
      grid: {
        enabled: false,
        interval: 0,
      },
    };
    ableton.setContext(clipContext);
    expect(ableton.context).toBe(clipContext);
  });
});
