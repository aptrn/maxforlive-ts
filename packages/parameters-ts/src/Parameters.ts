export { ParametersUI };

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

  constructor(patcherID: string, params: ParamsType) {
    this.params = params;
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

  //THIS DOESNT WORK FOR SOME REASON

  //this.objList = [];
  //this.gui.apply(this.cleanParameters); //for every object in the patcher apply function createParameters
  //for (let i = 0; i < this.objList.length; i++) {
  //  post(this.objList[i]);
  //  this.gui.remove(this.objList[i]);
  //}

  /**
   * This function checks if the infrastructure exists ("id" Dict, "id_recall" Dict and "---update" Send objects).
   * @returns {boolean} True if infrastructure exists, false otherwise
   */
  infrastructureExists(): boolean {
    //TBI
    return false;
  }

  /**
   * This function creates a "Dict" object named "id", a "Dict" object named "id_recall" and a Send object with target "---update"
   * @returns {void}
   */
  createInfrastructure(): void {
    this.cleanInfrastructure();

    let idObj: Maxobj = this.gui.getnamed("id");
    idObj.message("set", this.id);

    this.recallObj = this.gui.newdefault(50, 100, "dict", this.id + "_recall"); //create a dict object instance called "thid.id_recall"
    this.recallObj.varname = "recall";
    this.recallD = new Dict(this.id + "_recall"); //used to write parameters values
    this.paramsObj = this.gui.newdefault(200, 700, "dict", this.id); //create a dict object instance called "thid.id"
    this.paramsObj.varname = "params";
    this.paramsD = new Dict(this.id); //used to get parameters values
    this.updateObj = this.gui.newdefault(50, 700, "s", "---update"); //create a dict object instance called "thid.id_update"
    this.updateObj.varname = "update";
  }

  /**
   * This function should clear "id" Dict, "id_recall" Dict and "---update" Send objects.
   * @returns {void}
   */
  cleanInfrastructure(): void {
    if (this.infrastructureExists() == true) {
    }
    //TBI
    return;
  }

  /**
   * This function checks if parameters exist in the Patcher ("pvar", "dict.unpacks" and "prepend" objects).
   * @returns Return true if parameters exist, false otherwise
   */
  parametersExist(): boolean {
    //TBI
    return false;
  }

  /**
   * This function creates, for each property in this.params object, a "pvar" object named as the proeperty and relative parameter infrastructure as "prepend"s and "dict.unpack"s to receive from "id_recall" Dict and send to "id" Dict.
   * Automatically recalls and then gets parameters values using recallParams() and getParams() functions.
   * @param newParams Optional new parameter values
   * @returns {void}
   */
  createParameters(newParams?: ParamsType): void {
    this.cleanParameters();

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
      let pvar = this.gui.newdefault(
        50 + 150 * this.iter,
        100 + 200,
        "pvar",
        k
      );
      let prepend = this.gui.newdefault(
        50 + 150 * this.iter,
        100 + 300,
        "prepend",
        k
      );
      let prependSet = this.gui.newdefault(
        50 + 150 * this.iter,
        100 + 400,
        "prepend",
        "set"
      );
      let tbl = this.gui.newdefault(
        50 + 150 * this.iter,
        100 + 500,
        "t",
        "b",
        "l"
      );
      this.gui.connect(this.recallObj, 0, unpack, 0);
      this.gui.connect(unpack, 0, pvar, 0);
      this.gui.connect(pvar, 0, prepend, 0);
      this.gui.connect(prepend, 0, prependSet, 0);
      this.gui.connect(prependSet, 0, tbl, 0);
      this.gui.connect(tbl, 1, this.paramsObj, 0);
      this.gui.connect(tbl, 0, this.updateObj, 0);

      this.iter++;
    }

    this.recallParams(this.params);
    this.getParams();
  }

  /**
   * This function should clear all "pvar" objects and relative parameter infrastructure.
   * @returns {void}
   */
  cleanParameters(): void {
    if (this.parametersExist() == true) {
    }
    //TBI
    //if (obj.varname != "" && obj.varname != undefined) {
    //post(obj.varname);
    //} else {
    //post(obj.maxclass);
    //this.objList.push(obj);
    //}
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
