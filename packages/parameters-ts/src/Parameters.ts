export { ParametersUI };

/**
 * Type derived from ParamsType that contains a boolean for each parameter.
 * Used to check if a parameter exists in the patch according to the ParamsType.
 */
type containsParam<ParamsType> = {
  [K in keyof ParamsType as `has_${K & string}`]: boolean;
} & {
  [key: `has_${string}`]: boolean;
};

/**
 * Class to interact with patcher parameters UI.
 */
class ParametersUI<ParamsType> {
  values: ParamsType;
  gui: Patcher;
  id: string;
  uniqueId: string;
  iter: number;
  paramsD: Dict | undefined;
  paramsObj: Maxobj | undefined;
  recallD: Dict | undefined;
  recallObj: Maxobj | undefined;
  updateObj: Maxobj | undefined;

  /**
   * Generates a random 8-character string of uppercase letters and numbers
   * @returns {string} Random 8-character string
   */
  private generateRandomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result + '_';
  }

  /**
   * Constructor of the UI infrastructure. Checks if infrastructure exists, creates it if not found or broken.
   * Once created recalls parameters with the params argument object.
   * @param localpatcher The patcher containing the UI elements
   * @param patcherID ID string used for naming the infrastructure elements
   * @param newValues Object of type ParamsType containing values to recall
   * @param unique If true, adds special characters to dict names to ensure uniqueness
   * @param maxforlive If true with unique=true, uses "---" prefix, otherwise uses random string
   */
  constructor(localpatcher: Patcher, patcherID: string, newValues: ParamsType, unique: boolean = false) {
    this.values = {} as ParamsType;
    for (const key in newValues) {
      if (Object.prototype.hasOwnProperty.call(newValues, key)) {
        (this.values as any)[key] = newValues[key];
      }
    }
    this.gui = localpatcher;
    this.id = patcherID;
    this.iter = 0;

    if (this.gui == undefined) {
      throw new Error("Invalid patcher provided, aborting!");
    }

    // Try to get existing uniqueId from infrastructure
    let existingPrefix = this.getExistingUniquePrefix();

    // If we found an existing prefix, use it, otherwise generate new one if unique is true
    this.uniqueId = existingPrefix !== null ?
      existingPrefix + patcherID :
      (unique ? this.generateRandomId() + patcherID : patcherID);

    this.createInfrastructure();
    this.createParameters();
  }

  /**
   * Attempts to find existing unique prefix from dict objects in the patcher
   * @returns {string | null} The existing prefix if found, null otherwise
   */
  private getExistingUniquePrefix(): string | null {
    if (this.gui.count > 0) {
      let obj = this.gui.firstobject;
      while (obj.nextobject != null) {
        if (obj.maxclass == "dict") {
          if (obj.varname == "recall") {
            const fullName = obj.getattr("name") as string;
            const recallSuffix = this.id + "_recall";
            if (fullName && fullName.indexOf(recallSuffix) === fullName.length - recallSuffix.length) {
              const prefix = fullName.slice(0, -recallSuffix.length);
              return prefix || null;
            }
          }
          if (obj.varname == "params") {
            const fullName = obj.getattr("name") as string;
            if (fullName && fullName.indexOf(this.id) === fullName.length - this.id.length) {
              const prefix = fullName.slice(0, -this.id.length);
              return prefix || null;
            }
          }
        }
        obj = obj.nextobject;
      }
    }
    return null;
  }

  /**
   * This function checks if the infrastructure exists ("id" Dict, "id_recall" Dict and "update" Send objects).
   * @returns {boolean} True if infrastructure exists, false otherwise
   */
  infrastructureExists(): boolean {
    let hasRecall = false;
    let hasParams = false;
    let hasUpdate = false;
    let hasPrependUpdate = false;

    if (this.gui.count >= 3) {
      let obj = this.gui.firstobject;
      while (obj.nextobject != null) {
        let objectClass = obj.maxclass;
        if (objectClass == "dict") {
          if (obj.varname == "recall") {
            hasRecall = true;
            this.recallObj = obj;
            this.recallD = new Dict(this.uniqueId + "_recall"); //used to write parameters values
          }
          if (obj.varname == "params") {
            hasParams = true;
            this.paramsObj = obj;
            this.paramsD = new Dict(this.uniqueId); //used to get parameters values
          }
        } else if (objectClass == "s" || objectClass == "send") {
          if (obj.varname == "update") {
            hasUpdate = true;
            this.updateObj = obj;
          }
        } else if (objectClass == "prepend") {
          if (obj.varname == "prependUpdate") {
            hasPrependUpdate = true;
          }
        }
        obj = obj.nextobject;
      }
    }
    return hasRecall && hasParams && hasUpdate && hasPrependUpdate;
  }

  /**
   * This function creates a "Dict" object named "id", a "Dict" object named "id_recall" and a Send object with target "update"
   * @returns {void}
   */
  createInfrastructure(): void {
    if (this.infrastructureExists() == false) {
      this.cleanInfrastructure();

      let idObj: Maxobj = this.gui.getnamed("id");
      idObj.message("set", this.uniqueId);

      this.recallObj = this.gui.newdefault(
        50,
        100,
        "dict",
        this.uniqueId + "_recall"
      );
      this.recallObj.varname = "recall";
      this.recallD = new Dict(this.uniqueId + "_recall");

      this.paramsObj = this.gui.newdefault(200, 700, "dict", this.uniqueId);
      this.paramsObj.varname = "params";
      this.paramsD = new Dict(this.uniqueId);

      let prependUpdate = this.gui.newdefault(50, 650, "prepend", this.id);
      prependUpdate.varname = "prependUpdate";

      this.updateObj = this.gui.newdefault(50, 700, "s", "update");
      this.updateObj.varname = "update";

      // Connect prependUpdate to updateObj
      this.gui.connect(prependUpdate, 0, this.updateObj, 0);
    }
  }

  /**
   * This function should clear "id" Dict, "id_recall" Dict and "update" Send objects.
   * @returns {void}
   */
  cleanInfrastructure(): void {
    if (this.gui.count > 0) {
      let obj = this.gui.firstobject;
      while (obj.nextobject != null) {
        let objectClass = obj.maxclass;
        if (objectClass == "dict") {
          if (obj.varname == "recall") {
            this.gui.remove(obj);
            this.recallObj = undefined;
            this.recallD = undefined;
          }
          if (obj.varname == "params") {
            this.gui.remove(obj);
            this.paramsObj = undefined;
            this.paramsD = undefined;
          }
        } else if (objectClass == "s" || objectClass == "send") {
          if (obj.varname == "update") {
            this.gui.remove(obj);
            this.updateObj = undefined;
          }
        } else if (objectClass == "prepend") {
          if (obj.varname == "prependUpdate") {
            this.gui.remove(obj);
          }
        }
        obj = obj.nextobject;
      }
    }
    return;
  }

  /**
   * Creates an Object of type containtsParam<ParamsType> with all properties set to false.
   * @returns Object of type containtsParam<ParamsType> used to check if parameters are existing.
   */
  createContainsParam(): containsParam<ParamsType> {
    const result = Object.create(null) as containsParam<ParamsType>;
    for (const key in this.values) {
      if (Object.prototype.hasOwnProperty.call(this.values, key)) {
        (result as any)['has_' + key] = false;
      }
    }
    return result;
  }

  /**
   * Sets a value in the hasParams object.
   * @param hasParams Object of type containtsParam<ParamsType> used to check if parameters are existing.
   * @param paramName Property name.
   * @param exists  Boolean value to set.
   */
  setParamExists<K extends keyof ParamsType>(
    hasParams: containsParam<ParamsType>,
    paramName: string,
    exists: boolean
  ): void {
    const key = 'has_' + paramName;
    (hasParams as any)[key] = exists;
  }

  /**
   * Gets a value in the hasParams object.
   * @param hasParams Object of type containtsParam<ParamsType> used to check if parameters are existing.
   * @param paramName Property name.
   * @returns Boolean value of the property.
   */
  getParamExists<K extends keyof ParamsType>(
    hasParams: containsParam<ParamsType>,
    paramName: string
  ): boolean {
    const key = 'has_' + paramName;
    return (hasParams as any)[key];
  }

  /**
   * Returns true if all properties in the hasParams object are set to true, false otherwise.
   * @param hasParams Object of type containtsParam<ParamType> used to check if parameters are existing.
   * @returns Boolean value, true if all parameters exist, false otherwise.
   */
  allParamsExist<ParamType>(
    hasParams: containsParam<ParamType>
  ): boolean {
    for (const key in hasParams) {
      if (Object.prototype.hasOwnProperty.call(hasParams, key)) {
        if (hasParams[key as keyof containsParam<ParamType>] === false) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * This function checks if parameters exist in the Patcher ("pvar", "dict.unpacks" and "prepend" objects).
   * @returns Return true if parameters exist, false otherwise
   */
  parametersExist(): boolean {
    let hasParams = this.createContainsParam();

    if (this.gui.count > 0) {
      let obj = this.gui.firstobject;
      while (obj.nextobject != null) {
        let objectClass = obj.maxclass;
        if (objectClass == "pvar") {
          let scriptingName = obj.varname.split("_pvar")[0];
          if (
            Object.prototype.hasOwnProperty.call(this.values, scriptingName)
          ) {
            let unpack = this.gui.getnamed(scriptingName + "_unpack");
            let prepend = this.gui.getnamed(scriptingName + "_prepend");
            let prependSet = this.gui.getnamed(scriptingName + "_prependSet");
            let tbl = this.gui.getnamed(scriptingName + "_tbl");

            let actuallyHasEverything =
              unpack != null &&
              prepend != null &&
              prependSet != null &&
              tbl != null;

            if (actuallyHasEverything == true)
              this.setParamExists(hasParams, scriptingName, true);
          }
        }
        obj = obj.nextobject;
      }
    }
    return this.allParamsExist(hasParams);
  }

  /**
   * This function creates, for each property in this.params object, a "pvar" object named as the proeperty and relative parameter infrastructure as "prepend"s and "dict.unpack"s to receive from "id_recall" Dict and send to "id" Dict.
   * Automatically recalls and then gets parameters values using recallParams() and getParams() functions.
   * @param newParams Optional new parameter values
   * @returns {void}
   */
  createParameters(newParams?: ParamsType): void {
    if (this.parametersExist() == false) {
      this.cleanParameters();
      if (newParams != undefined) {
        this.values = newParams;
      }

      this.iter = 0;

      let prependUpdate = this.gui.getnamed("prependUpdate");

      for (let k in this.values) {
        let unpack = this.gui.newdefault(
          50 + 150 * this.iter,
          100 + 100,
          "dict.unpack",
          k + ":"
        );
        unpack.varname = k + "_unpack";
        let pvar = this.gui.newdefault(
          50 + 150 * this.iter,
          100 + 200,
          "pvar",
          k
        );
        pvar.varname = k + "_pvar";
        let prepend = this.gui.newdefault(
          50 + 150 * this.iter,
          100 + 300,
          "prepend",
          k
        );
        prepend.varname = k + "_prepend";
        let prependSet = this.gui.newdefault(
          50 + 150 * this.iter,
          100 + 400,
          "prepend",
          "set"
        );
        prependSet.varname = k + "_prependSet";
        let tbl = this.gui.newdefault(
          50 + 150 * this.iter,
          100 + 500,
          "t",
          k,
          "l"
        );
        tbl.varname = k + "_tbl";

        this.gui.connect(this.recallObj, 0, unpack, 0);
        this.gui.connect(unpack, 0, pvar, 0);
        this.gui.connect(pvar, 0, prepend, 0);
        this.gui.connect(prepend, 0, prependSet, 0);
        this.gui.connect(prependSet, 0, tbl, 0);
        this.gui.connect(tbl, 1, this.paramsObj, 0);
        this.gui.connect(tbl, 0, prependUpdate, 0);

        this.iter++;
      }
    }

    this.set(this.values);
    this.fetch();
  }

  /**
   * This function should clear all "pvar" objects and relative parameter infrastructure.
   * @returns {void}
   */
  cleanParameters(): void {
    if (this.gui.count > 0) {
      let obj = this.gui.firstobject;
      while (obj.nextobject != null) {
        let scriptingName = "";
        let objectClass = obj.maxclass;
        if (objectClass == "pvar") {
          scriptingName = obj.varname.split("_pvar")[0];
          if (
            Object.prototype.hasOwnProperty.call(this.values, scriptingName)
          ) {
            let unpack = this.gui.getnamed(scriptingName + "_unpack");
            let prepend = this.gui.getnamed(scriptingName + "_prepend");
            let prependSet = this.gui.getnamed(scriptingName + "_prependSet");
            let tbl = this.gui.getnamed(scriptingName + "_tbl");
            let prependUpdate = this.gui.getnamed(scriptingName + "_prependUpdate");

            this.gui.remove(unpack);
            this.gui.remove(prepend);
            this.gui.remove(prependSet);
            this.gui.remove(tbl);
            this.gui.remove(prependUpdate);
          }
        }
        obj = obj.nextobject;

        let pvar = this.gui.getnamed(scriptingName + "_pvar");
        this.gui.remove(pvar);
      }
    }
  }

  /**
   * This function gets parameter values from the "id" Dict, sets this.params and returns it
   * @returns {ParamsType}
   */
  fetch(): ParamsType {
    if (this.paramsD != undefined) {
      this.values = JSON.parse(this.paramsD.stringify());
      return this.values;
    } else {
      throw new Error(
        this.uniqueId +
        " Dict cannot be found, you need to create infrastructure first"
      );
    }
  }

  /**
   * This function sets parameter values to the "id_recall" Dict, sets this.params and then clears the "id_recall" Dict.
   * @param newParams New parameter values
   * @returns {void}
   */
  set(newParams: ParamsType, update: boolean = true): void {
    let recallDict = this.gui.getnamed(this.uniqueId + "_recall") as any;
    if (this.recallD != undefined && this.recallObj != undefined) {
      this.values = newParams;
      this.recallD.clear();
      this.recallD.parse(JSON.stringify(this.values));
      if (update) {
        this.recallObj.message("bang");
      }
    } else {
      throw new Error("You need to create infrastructure first");
    }
  }

  /**
   * This function sets a live parameter to the dial object.
   * @param dial Maxobj object or Patcher that contains the parameter
   * @param name Parameter name
   * @param min Minimum value
   * @param max Maximum value
   * @param defaultValue Default value
   * @param enums Optional array of strings. This automatically sets parameter type to "enum"
   * @param isFloat Optional boolean. Sets parameter type to "float" if true, integer otherwise
   */
  setLiveParameter(
    dial: Maxobj | Patcher,
    name: string,
    min: number,
    max: number,
    defaultValue: number,
    mode: number = 0, // 0: int, 1: float, 2: enum
    enums?: string[],
  ): void {
    if (dial instanceof Patcher) {
      dial = dial.getnamed(name);
    }

    if (name != undefined) {
      dial.message("_parameter_shortname", name);
    }
    if(mode == 0){
      dial.message("_parameter_type", 0);
      dial.message("_parameter_range", [min, max]);
    } else if (mode == 1) {
      dial.message("_parameter_type", 1);
      dial.message("_parameter_range", [min, max]);
    } else if (mode == 2) {
      dial.message("_parameter_type", 2);
      dial.message("_parameter_range", enums);
    }

    if (defaultValue != undefined) {
      dial.message("_parameter_initial", defaultValue);
    }
  }
} 
