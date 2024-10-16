import { ParametersUI } from "@aptrn/parameters-ts";

inlets = 1;
outlets = 1;
autowatch = 1;

type TestParameterType = {
  dial: number;
  slider: number;
  numbox: number;
  button: boolean;
  menu: number;
};

const defaultParams: TestParameterType = {
  dial: 0,
  slider: 0,
  numbox: 0,
  button: false,
  menu: 0,
};

let parameterUIs: ParametersUI<TestParameterType>[] = [];
let patcherNames: string[] = ["test", "test2"];

function init() {
  for (let patcherName in patcherNames) {
    parameterUIs[patcherName] = new ParametersUI<TestParameterType>(
      patcherNames[patcherName],
      defaultParams
    );
  }
}

function get() {
  let index: number = arguments[0];
  let paramValues = parameterUIs[index].getParams();
  post("Params: " + JSON.stringify(paramValues) + "\n");
}

function reset() {
  let index: number = arguments[0];
  parameterUIs[index].recallParams(defaultParams);
}

function randomize() {
  let index: number = arguments[0];
  let randomValues: TestParameterType = { ...defaultParams };
  randomValues.dial = Math.random() * 127;
  randomValues.slider = Math.random() * 127;
  randomValues.numbox = Math.random() * 127;
  randomValues.button = Math.random() > 0.5;
  randomValues.menu = Math.floor(Math.random() * 3);
  parameterUIs[index].recallParams(randomValues);
}

// .ts files with this at the end become a script usable in a [js] or [jsui] object
// If you are going to require your module instead of import it then you should comment
// these two lines out of this script
let module = {};
export = {};
