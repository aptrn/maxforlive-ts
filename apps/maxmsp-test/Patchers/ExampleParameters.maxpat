{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 6,
			"revision" : 5,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ -2385.0, 231.0, 1707.0, 928.0 ],
		"bglocked" : 0,
		"openinpresentation" : 0,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 8.0, 8.0 ],
		"gridsnaponopen" : 2,
		"objectsnaponopen" : 0,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"lefttoolbarpinned" : 0,
		"toptoolbarpinned" : 0,
		"righttoolbarpinned" : 0,
		"bottomtoolbarpinned" : 0,
		"toolbars_unpinned_last_save" : 0,
		"tallnewobj" : 0,
		"boxanimatetime" : 500,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 0.0,
		"description" : "",
		"digest" : "",
		"tags" : "",
		"style" : "default",
		"subpatcher_template" : "Max Audio Effect_template",
		"assistshowspatchername" : 0,
		"boxes" : [ 			{
				"box" : 				{
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-15",
					"lockeddragscroll" : 0,
					"lockedsize" : 0,
					"maxclass" : "bpatcher",
					"name" : "UI_alreadyCreated.maxpat",
					"numinlets" : 0,
					"numoutlets" : 0,
					"offset" : [ 0.0, 0.0 ],
					"patching_rect" : [ 544.0, 176.0, 400.0, 136.0 ],
					"varname" : "test_2",
					"viewvisibility" : 1
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-11",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 88.0, 488.0, 920.0, 20.0 ],
					"text" : "WARNING! At the moment clicking this more than once will duplicate the infrastructure. Please use it just once till this is properly implemented."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-24",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 888.0, 616.0, 728.0, 20.0 ],
					"text" : "Once you click the \"randomizeParams\" message, the script will generate random values and try to set em in the subpatcher."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-22",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 888.0, 640.0, 106.0, 22.0 ],
					"text" : "randomizeParams"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-12",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 136.0, 608.0, 368.0, 20.0 ],
					"text" : "If found, it will post current parameter values to the Max console."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-13",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 136.0, 584.0, 728.0, 20.0 ],
					"text" : "Once you click the \"getParams\" message, the script will try to fetch parameter values from the subpatcher."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-8",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 136.0, 632.0, 67.0, 22.0 ],
					"text" : "getParams"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-6",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 88.0, 464.0, 920.0, 20.0 ],
					"text" : "Creating parameters will also set values to the default passed to the function, in this example the defaultParams object."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-5",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 88.0, 440.0, 920.0, 20.0 ],
					"text" : "This will only work if the subpatcher contains an object with scripting name for each property of the MyParams type in typescript and an object with scripting name as \"id\"."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-4",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 88.0, 416.0, 544.0, 20.0 ],
					"text" : "Once you click the \"createParams\" message, the script will create the infrastructure for parameters."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 72.0, 160.0, 456.0, 20.0 ],
					"text" : "It  also contains an object with scripting name \"id\", needed for this system to work."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-10",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 72.0, 136.0, 432.0, 20.0 ],
					"text" : "It contains object with scripting name as in the MyParams type in typescript."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-9",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 72.0, 112.0, 288.0, 20.0 ],
					"text" : "This is a bpatcher with scripting name = \"test\"."
				}

			}
, 			{
				"box" : 				{
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-7",
					"lockeddragscroll" : 0,
					"lockedsize" : 0,
					"maxclass" : "bpatcher",
					"name" : "UI.maxpat",
					"numinlets" : 0,
					"numoutlets" : 0,
					"offset" : [ 0.0, 0.0 ],
					"patching_rect" : [ 72.0, 184.0, 400.0, 136.0 ],
					"varname" : "test",
					"viewvisibility" : 1
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-1",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 88.0, 728.0, 129.0, 22.0 ],
					"saved_object_attributes" : 					{
						"filename" : "ExampleParameters",
						"parameter_enable" : 0
					}
,
					"text" : "js ExampleParameters"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-2",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 88.0, 520.0, 83.0, 22.0 ],
					"text" : "createParams"
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-1", 0 ],
					"source" : [ "obj-2", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-1", 0 ],
					"source" : [ "obj-22", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-1", 0 ],
					"source" : [ "obj-8", 0 ]
				}

			}
 ],
		"parameters" : 		{
			"obj-15::obj-3" : [ "dial[2]", "dial", 0 ],
			"obj-15::obj-4" : [ "slider[2]", "slider", 0 ],
			"obj-15::obj-5" : [ "numbox[2]", "numbox", 0 ],
			"obj-15::obj-6" : [ "button[2]", "button", 0 ],
			"obj-15::obj-7" : [ "menu[2]", "menu", 0 ],
			"obj-7::obj-3" : [ "dial", "dial", 0 ],
			"obj-7::obj-4" : [ "slider", "slider", 0 ],
			"obj-7::obj-5" : [ "numbox", "numbox", 0 ],
			"obj-7::obj-6" : [ "button", "button", 0 ],
			"obj-7::obj-7" : [ "menu", "menu", 0 ],
			"parameterbanks" : 			{
				"0" : 				{
					"index" : 0,
					"name" : "",
					"parameters" : [ "-", "-", "-", "-", "-", "-", "-", "-" ]
				}

			}
,
			"parameter_overrides" : 			{
				"obj-15::obj-3" : 				{
					"parameter_longname" : "dial[2]"
				}
,
				"obj-15::obj-4" : 				{
					"parameter_longname" : "slider[2]"
				}
,
				"obj-15::obj-5" : 				{
					"parameter_longname" : "numbox[2]"
				}
,
				"obj-15::obj-6" : 				{
					"parameter_longname" : "button[2]"
				}
,
				"obj-15::obj-7" : 				{
					"parameter_longname" : "menu[2]"
				}
,
				"obj-7::obj-3" : 				{
					"parameter_longname" : "dial"
				}
,
				"obj-7::obj-4" : 				{
					"parameter_longname" : "slider"
				}
,
				"obj-7::obj-5" : 				{
					"parameter_longname" : "numbox"
				}
,
				"obj-7::obj-6" : 				{
					"parameter_longname" : "button"
				}
,
				"obj-7::obj-7" : 				{
					"parameter_longname" : "menu"
				}

			}
,
			"inherited_shortname" : 1
		}
,
		"dependency_cache" : [ 			{
				"name" : "ExampleParameters.js",
				"bootpath" : "~/Documents/Code/maxforlive-ts/apps/maxmsp-test/Code",
				"patcherrelativepath" : "../Code",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "UI.maxpat",
				"bootpath" : "~/Documents/Code/maxforlive-ts/apps/maxmsp-test/Patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "UI_alreadyCreated.maxpat",
				"bootpath" : "~/Documents/Code/maxforlive-ts/apps/maxmsp-test/Patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "params_index.js",
				"bootpath" : "~/Documents/Code/maxforlive-ts/apps/maxmsp-test/Code/lib/@aptrn-parameters-ts",
				"patcherrelativepath" : "../Code/lib/@aptrn-parameters-ts",
				"type" : "TEXT",
				"implicit" : 1
			}
 ],
		"autosave" : 0
	}

}
