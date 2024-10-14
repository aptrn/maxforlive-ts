import { AbletonLive, ClipContext, Note, NotesDict } from "@aptrn/ableton-ts";

inlets = 1;
outlets = 1;
autowatch = 1;

let ableton: AbletonLive = new AbletonLive();

function getBPM() {
  let bpm = ableton.getBPM();
  post("BPM: " + bpm + "\n");
  outlet(0, bpm);
}

function getScale() {
  let scale = ableton.getScale();
  post("Scale: " + JSON.stringify(scale) + "\n");
  outlet(0, scale);
}

function getTimeSignature() {
  let timeSignature = ableton.getTimeDivision();
  post("Time Signature: " + timeSignature + "\n");
  outlet(0, timeSignature);
}

// .ts files with this at the end become a script usable in a [js] or [jsui] object
// If you are going to require your module instead of import it then you should comment
// these two lines out of this script
let module = {};
export = {};
