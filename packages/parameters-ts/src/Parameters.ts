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
  gui: Patcher
  parent: Patcher | undefined;
  id: string;
  iter: number;
  paramsD: Dict | undefined;
  paramsObj: Maxobj | undefined;
  recallD: Dict | undefined;
  recallObj: Maxobj | undefined;
  updateObj: Maxobj | undefined;

  /**
   * Constructor of the UI infrastructure. Checks if infrastructure exists, creates it if not found or broken. Once created recalls parameters with the params argument object.
   * @param patcherID ID of the subpatcher containing the UI.
   * @param newValues  Object of type ParamsType containing values to recall.
   * @param parent Optional parent patcher. If provided, the subpatcher will be searched for within the parent patcher instead of the main patcher.
   */
  constructor(patcherID: string, newValues: ParamsType, parentID?: string[]) {
    this.values = {} as ParamsType;
    for (var key in newValues) {
      if (Object.prototype.hasOwnProperty.call(newValues, key)) {
        (this.values as any)[key] = newValues[key];
      }
    }
    this.id = patcherID;
    this.iter = 0;
    if(parentID != undefined && parentID.length > 0){
      this.parent = patcher.getnamed(parentID[0]).subpatcher();
      if(parentID.length > 1){
        let g = this.parent;
        for(let i = 1; i < parentID.length; i++){
          g = g.getnamed(parentID[i]).subpatcher();
        }
        this.parent = g;
      }
      this.gui = this.parent.getnamed(this.id).subpatcher();
    }
    else{
      this.gui = patcher.getnamed(this.id).subpatcher();
    }
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
      //post("Cleaning infrastructure!" + "\n");
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
      //post("Infrastructure created!" + "\n");
    }
    else{
      //post("Infrastructure already exists!" + "\n");
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
    //post("Checking Parameters" + "\n");
    if (this.parametersExist() == false) {
      //post("Not all parameteres exist already!" + "\n");
      this.cleanParameters();
      //post("Creating parameters!" + "\n");
      if (newParams != undefined) {
        this.values = newParams;
      }

      this.iter = 0;

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
      //post("Finished creating parameters!" + "\n");
    } else {
      //post("Parameters already exist!" + "\n");
    }

    this.set(this.values);
    this.fetch();
  }

  /**
   * This function should clear all "pvar" objects and relative parameter infrastructure.
   * @returns {void}
   */
  cleanParameters(): void {
    //post("Cleaning parameters!" + "\n");

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
  fetch(): ParamsType {
    if (this.paramsD != undefined) {
      this.values = JSON.parse(this.paramsD.stringify());
      return this.values;
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
  set(newParams: ParamsType, update: boolean = true): void {
    if (this.recallD != undefined && this.recallObj != undefined) {
      this.values = newParams;
      this.recallD.clear();
      this.recallD.parse(JSON.stringify(this.values));
      if(update){
        this.recallObj.message("bang");
      }
    } else {
      throw new Error("You need to create infrastructure first");
    }
  }

  /**
   * This function sets a live parameter to the dial object.
   * @param dial Maxobj object, accepts only live.* objects (like live.dial, live.slider, live.numbox, live.text, live.menu etc.). This can also be a patcher object, in which case the parameter will be set to the named object.
   * @param name Parameter name.
   * @param min Minimum value.
   * @param max Maximum value.
   * @param defaultValue Default value.
   * @param enums Optional array of strings. This automatically sets parameter type to "enum".
   * @param isFloat Optional boolean. This automatically sets parameter type to "float" if true, integer otherwise.
   * @param parents Optional array of strings. This is used to set the parameter to a nested parameter.
   * @returns {void}
   */
  setLiveParameter(dial: Maxobj | Patcher, name: string, min: number, max: number, defaultValue: number, enums?: string[], isFloat: boolean = false, parents?: string[]): void{
    if(dial instanceof Patcher){
      let id = name;

      if(parents != undefined && parents.length > 0){
        let parent = patcher.getnamed(parents[0]).subpatcher();
        if(parents.length > 1){
          let g = parent;
          for(let i = 1; i < parents.length; i++){
            g = g.getnamed(parents[i]).subpatcher();
          }
          parent = g;
        }
        dial = dial.getnamed(id).subpatcher();
      }
    }
    
    if(name != undefined){
      dial.message("_parameter_shortname", name);
    }
    if(enums != undefined){
      dial.message("_parameter_type", 2);
      dial.message("_parameter_range", enums);  
    }else if (isFloat){
      dial.message("_parameter_type", 1);
      dial.message("_parameter_range", [min, max]);
    }else{
      dial.message("_parameter_type", 0);
      dial.message("_parameter_range", [min, max]);
    }
    if(defaultValue != undefined){
      dial.message("_parameter_initial", defaultValue);
    }
    return;
  }
} 
