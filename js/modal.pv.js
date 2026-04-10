/** Prevent JSHint warning about functions called from HTML sites. */
/* exported confwizardPvNextPage, startWizardPv */

var pageObjPv;
var invList = [];
var insMax = 0;

function confwizardPvInit() {
    //create parent json object
    pageObjPv = new senecPage(confwizardPvUpdate);

    //add child object to parent object
    pageObjPv.add_json_object("WIZARD");
    pageObjPv.add_property_to_object("WIZARD", "INSULATION_RESISTANCE", "");
    pageObjPv.add_property_to_object("WIZARD", "PV_CONFIG", "");
    pageObjPv.add_json_object("STECA");
    pageObjPv.add_property_to_object("STECA", "PV_CONFIG_POSSIBLE", "");
    pageObjPv.add_property_to_object("STECA", "PV_INPUTS", "");

    //call wizardPv data
    pageObjPv.singlePageRefresh();
    
    $('#WIZARDINSULATION_RESISTANCE').attr('title',"Max " + insMax + " Ohm/V");
}

function confwizardPvNextPage() {
    if(checkWizardPvValues())
    {
        confwizardShowErrorLabel("lblWizardPvCheckResult", lng.WIZARD_CHECK_FIELDS_ERROR);
    }
    else
    {
        sendwizardPvPage();
        confwizardPvClose();
    }
}

//Check input data for validity
function checkWizardPvValues() {
    if($('#WIZARDINSULATION_RESISTANCE').val() > insMax)
    {
        $('#lInsulationResistance').addClass("errorLabel");
        $('#WIZARDINSULATION_RESISTANCE').addClass("errorField");
        console.log("insulation value larger than allowed max value");
        return true;
    }

    return false;
}

function sendwizardPvPage() {
    //IMPORTANT: check connection to mcu
    $.ajax({
        type: "GET",
        url: "/",
        error: function() {
            alert(lng.WIZARD_NOTIFY_NO_CONN_TO_MCU);
        }
    });

    //only apply new values if power-station is activated
    pageObjPv.reInitJSONObject();
    
    pageObjPv.add_json_object("WIZARD");
	pageObjPv.add_property_to_object("WIZARD", "INSULATION_RESISTANCE", pageObjPv.castVarValue("i3", $('#WIZARDINSULATION_RESISTANCE').val()) );
	pageObjPv.add_property_to_object("WIZARD" , "PV_CONFIG", "[\"" + pageObjPv.castVarValue("u8", $("#selectPv0mode").val())+
									 "\",\"" + pageObjPv.castVarValue("u8", $("#selectPv1mode").val()) + "\",\"\",\"\"]");
	pageObjPv.add_property_to_object("WIZARD", "CONFIG_MODIFIED_BY_USER", "u8_01");

    pageObjPv.singlePageRefresh();

    console.log(pageObjPv.castVarValue("u8", $("#selectPv0mode").val()));
    console.log(pageObjPv.castVarValue("u8", $("#selectPv1mode").val()));
}

function startWizardPv() {
    $(document).trigger("page.unload");
    invListReq();
}

// request inverter list
function invListReq() {
    $.ajax({
        type: "POST",
        async: true,
        url: "/ctrl.cgi",
        data: JSON.stringify({"PV_INV_LIST":{},"PV_INV_INS_RES_MAX":{}}),
        dataType: "json",
        success: invListResp,
        timeout: 3000,
        error: invListReq
    });
}

function invListResp(data) {
    var respObj = $.parseJSON(JSON.stringify(data));
    var item;

    // check if response is an object
    if ($.type(respObj) !== "object") {
        console.log("Error: Parsing JSON response not possible.");
        return;
    }

    console.log("Parsing inverters...");

    // iterate through inverter list
    for(item in respObj["PV_INV_LIST"])
    {
        invList[item] = (item in inverterNames) ? inverterNames[item] : item;
        console.log("Found inverter: " + item + " (" + invList[item] +")");
    }

    // retrieve max insulation resistance
    for(item in invList)
    {
        console.log("item: " + item);
        if(item in respObj["PV_INV_INS_RES_MAX"])
        {
            var value = Senec.jsonValUnpack(respObj["PV_INV_INS_RES_MAX"][item]);
            if(value > insMax)
            {
                insMax = value;
            }
        }
    }

    console.log("max insulation resistance (Ohm/V): " + insMax);
    startWizardPvWindow();
}

function startWizardPvWindow() {
    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: './wizard.pv.html',
        success: function(html) {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizardPvInit();
            console.log("wizardPv data has successfool loaded..");

            $('#modalWindow').modal('show');

            //check if senec is already configured
            if(parseInt($('#WIZARDCONFIG_LOADED').html()) <= 0) {
                alert(lng.WIZARD_GRID_ERROR_NEED_INITIAL_CONFIG);
                confwizardClose();
            }
        }
    });
    modal_input = 'modal_wizardPv';
}

function confwizardPvClose() {
    $("#modalWindow").empty();
    $('#modalWindow').modal('hide');
    pageObjPv.stopPageRefresh();
    
    navigate('lSetup');
}

function confwizardPvUpdate() {
	
	fillPvSelect(0);
	fillPvSelect(1);
}

function fillPvSelect(pvIndex) {
	var inputBatteryExists = false;
	var inputPvExists = false;
	var inputParallelExists = false;
	
	$("#selectPv" + pvIndex + "mode").empty();
	
	for(var i = pvIndex; i < $("#STECAPV_INPUTS").html() * 3; i = i + 2)
		{
			switch(htmlAsNumber($("#STECAPV_CONFIG_POSSIBLE" + i)))
			{
			//PV
			case(1):
				inputPvExists = checkAllowance(pvIndex,i);
			break;
			//Parallel
			case(2):
				inputParallelExists = checkAllowance(pvIndex,i);
			break;
			//Battery
			case(4):
				inputBatteryExists = checkAllowance(pvIndex,i);
			break;
			}
		}

	// Append to select
	if(inputPvExists)
	{
		$("#selectPv" + pvIndex + "mode").append('<option value="01">PV</option>');
	}
	if(inputParallelExists)
	{
		$("#selectPv" + pvIndex + "mode").append('<option value="02">Parallel</option>');
	}
	if(inputBatteryExists)
	{
		$("#selectPv" + pvIndex + "mode").append('<option value="04">Battery</option>');
	}
	
	$("#selectPv" + pvIndex + "mode").val($("#WIZARDPV_CONFIG" + pvIndex).html());
}

function checkAllowance(pvIndex,configIndex) {
	if(pvIndex == 0)
	{
		return true;
	}
	
	if(htmlAsNumber($("#STECAPV_CONFIG_POSSIBLE" + (configIndex - 1))) == htmlAsNumber($("#WIZARDPV_CONFIG" + (pvIndex-1))))
	{
		return true;
	}

	return false;
}

