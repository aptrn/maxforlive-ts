import { AbletonLive, ClipContext, Note, NotesDict } from "@aptrn/ableton-ts";
import { ParametersUI } from "@aptrn/parameters-ts";

inlets = 1;
outlets = 1;
autowatch = 1;

function bang() {
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

  post(JSON.stringify(ableton.context) + "\n");
}

function createParams() {
  let params = new ParametersUI("test", {
    test: 0,
    test2: 0,
    test3: 0,
  });
}

bang();

// .ts files with this at the end become a script usable in a [js] or [jsui] object
// If you are going to require your module instead of import it then you should comment
// these two lines out of this script
let module = {};
export = {};
