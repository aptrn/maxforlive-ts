import { ParametersUI } from "@aptrn/parameters-ts";

inlets = 1;
outlets = 1;
autowatch = 1;

type MyParams = {
  dial: number;
  slider: number;
  numbox: number;
  button: boolean;
  menu: number;
};

let defaultParams: MyParams = {
  dial: 0,
  slider: 0,
  numbox: 0,
  button: false,
  menu: 0,
};

let parameters: ParametersUI<MyParams>;
let parameters2: ParametersUI<MyParams>;

function getParams() {
  let paramValues = parameters.getParams();
  post("Params: " + JSON.stringify(paramValues) + "\n");
}

function createParams() {
  parameters = new ParametersUI<MyParams>("test", defaultParams);
  parameters2 = new ParametersUI<MyParams>("test_2", defaultParams);
}

function randomizeParams() {
  let randomValues: MyParams = defaultParams;
  randomValues.dial = Math.random() * 127;
  randomValues.slider = Math.random() * 127;
  randomValues.numbox = Math.random() * 127;
  randomValues.button = Math.random() > 0.5;
  randomValues.menu = Math.floor(Math.random() * 3);
  parameters.recallParams(randomValues);
}

// .ts files with this at the end become a script usable in a [js] or [jsui] object
// If you are going to require your module instead of import it then you should comment
// these two lines out of this script
let module = {};
export = {};
