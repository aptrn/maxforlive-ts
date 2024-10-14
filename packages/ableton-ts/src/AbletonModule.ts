export { AbletonLive, Note, NotesDict, ClipContext };

type Note = {
  note_id: number;
  pitch: number;
  start_time: number;
  duration: number;
  velocity: number;
  mute: boolean;
  probability: number;
  velocity_deviation: number;
  release_velocity: number;
};

type NotesDict = {
  notes: Note[];
};

type ClipContext = {
  clip: {
    time_selection_start: number;
    time_selection_end: number;
    first_note_start: number;
    first_note_end: number;
    lowest_pitch: number;
    highest_pitch: number;
  };
  scale: {
    scale_mode: boolean;
    root_note: number;
    scale_interals: number[];
    scale_names: string[];
  };
  grid: {
    enabled: boolean;
    interval: number;
  };
};

/**
 * Class to interact with Ableton Live API via Live Object Model
 * https://docs.cycling74.com/max8/vignettes/live_object_model
 */
class AbletonLive {
  Live: LiveAPI; // Live Object Model
  context: ClipContext | undefined; // ClipContext provided in Midi Tools Generator and Transformator
  clipLength: number | undefined; //Length of the clip in bars using ClipContext

  /*
   * Creates an instance of AbletonLive class
   * Constructor
   * @param context - ClipContext provided in Midi Tools Generator and Transformator
   */
  constructor(context?: ClipContext) {
    function test(): void {
      console.log("test");
    }

    this.Live = new LiveAPI(test, "test");
    if (context) {
      this.context = context;
      this.clipLength = this.getClipLength();
    }
  }

  /**
   * Updates the context and clipLength.
   * This method should be called when context changes in Midi Tools Generator and Transformator.
   * @param context - ClipContext provided in Midi Tools Generator and Transformator
   * @returns
   */
  setContext(context: ClipContext): boolean {
    const lastClipLength = this.clipLength;
    this.context = context;
    this.clipLength = this.getClipLength();
    return this.clipLength != lastClipLength;
  }

  /**
   * Clears the context and clipLength.
   */
  clearContext(): void {
    this.context = undefined;
    this.clipLength = undefined;
  }

  /**
   * Gets the BPM of the current live set.
   * @returns BPM float.
   */
  getBPM(): number {
    this.Live.path = "live_set";
    return this.Live.get("tempo")[0];
  }

  /**
   * Sets the name of the currently selected clip.
   * Works in both arrangment and session view.
   * @param name New name for the currently selected clip.
   */
  setSelectedClipName(name: string): void {
    this.Live.path = "live_set view detail_clip";
    this.Live.set("name", name);
    this.Live.path = "";
  }

  /**
   * Gets the name of the currently selected clip.
   * @returns Name of the currently selected clip.
   */
  getSelectedClipName(): string {
    this.Live.path = "live_set view detail_clip";
    let name: string = this.Live.get("name");
    post("CONTEXT Get Name: " + name + "\n");
    if (name != "") {
      return String(name);
    } else {
      return "";
    }
  }

  /**
   * Gets the scale information of the current live set.
   * @returns Object containing scale information.
   */
  getScale(): {
    active: boolean;
    name: string;
    root: number;
    intervals: number[];
  } {
    this.Live.path = "live_set";
    let root_note: number = this.Live.get("root_note");
    let scale_mode: boolean = this.Live.get("scale_mode");
    let scale_name: string = this.Live.get("scale_name");
    let scale_intervals: number[] = this.Live.get("scale_intervals");

    return {
      active: scale_mode,
      name: scale_name,
      root: root_note,
      intervals: scale_intervals,
    };
  }

  /**
   * Gets the current time signature of the live set.
   * @returns An array containing the numerator and denominator of the current time signature.
   */
  getTimeDivision(): [number, number] {
    this.Live.path = "live_set";
    var numerator = this.Live.get("signature_numerator")[0];
    var denominator = this.Live.get("signature_denominator")[0];
    return [numerator, denominator];
  }

  /**
   * Calculates the length of the clip in bars using ClipContext.
   * If clipContext is not provided or doesn't exist in the class instance it returns undefined.
   * @param context - ClipContext provided in Midi Tools Generator and Transformator
   * @returns Length of the clip in bars using ClipContext
   */
  getClipLength(context?: ClipContext): number | undefined {
    let tempContext: ClipContext | undefined = this.context;
    if (context != undefined) tempContext = context;
    if (tempContext != undefined) {
      return (
        tempContext.clip.time_selection_end -
        tempContext.clip.time_selection_start
      );
    } else return undefined;
  }

  /**
   * Calculates the duration of a beat in milliseconds based on the current BPM and time signature.
   * @param numerator Numerator for time signature
   * @param denominator Demoninator for time signature
   * @param bpm BPM, if not provided it will get the bpm via getBPM()
   * @returns
   */
  getBeatDurationMs(
    numerator: number,
    denominator: number,
    bpm?: number
  ): number {
    if (bpm == undefined) bpm = this.getBPM();
    const quarterNoteDuration = 60000 / this.getBPM();
    const beatDuration = quarterNoteDuration * (4 / denominator);
    return beatDuration * numerator;
  }

  /**
   *
   * @param gridDenominators
   * @returns
   */
  findNumeratorAndDenominator(gridDenominators: number[]): [number, number] {
    if (this.context == undefined || this.clipLength == undefined)
      return [4, 4];
    else {
      let minNumerator = Infinity;
      let bestDenominatorIndex = -1;

      for (let i = 0; i < gridDenominators.length; i++) {
        const denominator = gridDenominators[i];
        const numerator = Math.round(this.clipLength / denominator);

        // Calculate the actual length that this numerator and denominator would represent
        const actualLength = numerator * denominator;

        // Check if this is the best option found so far
        if (actualLength >= this.clipLength && numerator < minNumerator) {
          minNumerator = numerator;
          bestDenominatorIndex = i;
        }
      }

      // If no valid denominator was found, return a default value
      if (bestDenominatorIndex === -1) {
        return [1, 0]; // You can adjust this to handle the case where no valid options are found
      }

      return [minNumerator, bestDenominatorIndex];
    }
  }
}
