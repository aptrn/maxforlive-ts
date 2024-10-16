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
  params: ParamsType;
  gui: Patcher;
  id: string;
  iter: number = 0;
  paramsD: Dict | undefined;
  paramsObj: Maxobj | undefined;
  recallD: Dict | undefined;
  recallObj: Maxobj | undefined;
  updateObj: Maxobj | undefined;

  /**
   * Constructor of the UI infrastructure. Checks if infrastructure exists, creates it if not found or broken. Once created recalls parameters with the params argument object.
   * @param patcherID ID of the subpatcher containing the UI.
   * @param params  Object of type ParamsType containing values to recall.
   */
  constructor(patcherID: string, params: ParamsType) {
    this.params = { ...params };
    this.id = patcherID;
    this.gui = patcher.getnamed(this.id).subpatcher();
    if (this.gui == undefined) {
      throw new Error(
        "Subpatcher with ID = " + this.id + "  not found, aborting!"
      );
    }
    this.createInfrastructure();
    this.createParameters();
  }

  /**
   * This function checks if the infrastructure exists ("id" Dict, "id_recall" Dict and "---update" Send objects).
   * @returns {boolean} True if infrastructure exists, false otherwise
   */
  infrastructureExists(): boolean {
    let hasRecall = false;
    let hasParams = false;
    let hasUpdate = false;

    if (this.gui.count >= 3) {
      let obj = this.gui.firstobject;
      while (obj.nextobject != null) {
        let objectClass = obj.maxclass;
        if (objectClass == "dict") {
          if (obj.varname == "recall") {
            hasRecall = true;
            this.recallObj = obj;
            this.recallD = new Dict(this.id + "_recall"); //used to write parameters values
          }
          if (obj.varname == "params") {
            hasParams = true;
            this.paramsObj = obj;
            this.paramsD = new Dict(this.id); //used to get parameters values
          }
        } else if (objectClass == "s" || objectClass == "send") {
          if (obj.varname == "update") {
            hasUpdate = true;
            this.updateObj = obj;
          }
        }
        obj = obj.nextobject;
      }
    }
    return hasRecall && hasParams && hasUpdate;
  }

  /**
   * This function creates a "Dict" object named "id", a "Dict" object named "id_recall" and a Send object with target "---update"
   * @returns {void}
   */
  createInfrastructure(): void {
    if (this.infrastructureExists() == false) {
      this.cleanInfrastructure();

      let idObj: Maxobj = this.gui.getnamed("id");
      idObj.message("set", this.id);

      this.recallObj = this.gui.newdefault(
        50,
        100,
        "dict",
        this.id + "_recall"
      ); //create a dict object instance called "thid.id_recall"
      this.recallObj.varname = "recall";
      this.recallD = new Dict(this.id + "_recall"); //used to write parameters values
      this.paramsObj = this.gui.newdefault(200, 700, "dict", this.id); //create a dict object instance called "thid.id"
      this.paramsObj.varname = "params";
      this.paramsD = new Dict(this.id); //used to get parameters values
      this.updateObj = this.gui.newdefault(50, 700, "s", "---update"); //create a dict object instance called "thid.id_update"
      this.updateObj.varname = "update";
    }
  }

  /**
   * This function should clear "id" Dict, "id_recall" Dict and "---update" Send objects.
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
            this.paramsD = undefined; //used to get parameters values
          }
        } else if (objectClass == "s" || objectClass == "send") {
          if (obj.varname == "update") {
            this.gui.remove(obj);
            this.updateObj = undefined;
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
  private createContainsParam(): containsParam<ParamsType> {
    const result = {} as containsParam<ParamsType>;
    for (const key in this.params) {
      if (Object.prototype.hasOwnProperty.call(this.params, key)) {
        (result as any)[`has_${key}`] = false;
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
  private setParamExists<K extends keyof ParamsType>(
    hasParams: containsParam<ParamsType>,
    paramName: string,
    exists: boolean
  ): void {
    const key = `has_${paramName as string}`;
    (hasParams as any)[key] = exists;
  }

  /**
   * Gets a value in the hasParams object.
   * @param hasParams Object of type containtsParam<ParamsType> used to check if parameters are existing.
   * @param paramName Property name.
   * @returns Boolean value of the property.
   */
  private getParamExists<K extends keyof ParamsType>(
    hasParams: containsParam<ParamsType>,
    paramName: string
  ): boolean {
    const key = `has_${paramName as string}`;
    return (hasParams as any)[key];
  }

  /**
   * Returns true if all properties in the hasParams object are set to true, false otherwise.
   * @param hasParams Object of type containtsParam<ParamType> used to check if parameters are existing.
   * @returns Boolean value, true if all parameters exist, false otherwise.
   */
  private allParamsExist<ParamType>(
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
            Object.prototype.hasOwnProperty.call(this.params, scriptingName)
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
    post("Checking Parameters" + "\n");
    if (this.parametersExist() == false) {
      post("Not all parameteres exist already!" + "\n");
      this.cleanParameters();
      post("Creating parameters!" + "\n");
      if (newParams != undefined) {
        this.params = newParams;
      }

      this.iter = 0;

      for (let k in this.params) {
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
          "b",
          "l"
        );
        tbl.varname = k + "_tbl";
        this.gui.connect(this.recallObj, 0, unpack, 0);
        this.gui.connect(unpack, 0, pvar, 0);
        this.gui.connect(pvar, 0, prepend, 0);
        this.gui.connect(prepend, 0, prependSet, 0);
        this.gui.connect(prependSet, 0, tbl, 0);
        this.gui.connect(tbl, 1, this.paramsObj, 0);
        this.gui.connect(tbl, 0, this.updateObj, 0);

        this.iter++;
      }
      post("Finished creating parameters!" + "\n");
    } else {
      post("Parameters already exist!" + "\n");
    }

    this.recallParams(this.params);
    this.getParams();
  }

  /**
   * This function should clear all "pvar" objects and relative parameter infrastructure.
   * @returns {void}
   */
  cleanParameters(): void {
    post("Cleaning parameters!" + "\n");

    if (this.gui.count > 0) {
      let obj = this.gui.firstobject;
      while (obj.nextobject != null) {
        let scriptingName = "";
        let objectClass = obj.maxclass;
        if (objectClass == "pvar") {
          scriptingName = obj.varname.split("_pvar")[0];
          if (
            Object.prototype.hasOwnProperty.call(this.params, scriptingName)
          ) {
            let unpack = this.gui.getnamed(scriptingName + "_unpack");
            let prepend = this.gui.getnamed(scriptingName + "_prepend");
            let prependSet = this.gui.getnamed(scriptingName + "_prependSet");
            let tbl = this.gui.getnamed(scriptingName + "_tbl");

            this.gui.remove(unpack);
            this.gui.remove(prepend);
            this.gui.remove(prependSet);
            this.gui.remove(tbl);
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
  getParams(): ParamsType {
    if (this.paramsD != undefined) {
      this.params = JSON.parse(this.paramsD.stringify());
      return this.params;
    } else {
      throw new Error(
        this.id +
          " Dict cannot be found, you need to create infrastructure first"
      );
    }
  }

  /**
   * This function sets parameter values to the "id_recall" Dict, sets this.params and then clears the "id_recall" Dict.
   * @param newParams New parameter values
   * @returns {void}
   */
  recallParams(newParams: ParamsType): void {
    if (this.recallD != undefined && this.recallObj != undefined) {
      this.params = newParams;
      this.recallD.clear();
      this.recallD.parse(JSON.stringify(this.params));
      this.recallObj.message("bang");
    } else {
      throw new Error("You need to create infrastructure first");
    }
  }
}
