/** Prevent JSHint warning about functions called from HTML sites. */
/* exported confwizard4105_2019NextPage, startWizard4105_2019 */

var pageObj4105_2019;

function obj_init_wizard4105_2019() {
    //create parent json object
    pageObj4105_2019 = new senecPage(confwizard4105_2019Update);

    //add child object to parent object
    pageObj4105_2019.add_json_object("GRIDCONFIG");
    
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDETARGETTY", "");
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEFIXEDFAC", "");
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEUNDERFREQDROOP", "");
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEOVERFREQDROOP", "");
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEOVERFREQLIMIT", "");
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDECOSPHITIME", "");
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDERECOVERTIME", "");
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEURMSMAX10", "");
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDELVFRTDISABLE", "");

    pageObj4105_2019.singlePageRefresh();    
}

function confwizard4105_2019Init() {
    obj_init_wizard4105_2019();
    
    CosPhi4105_2019Update();
    LVFRT4105_2019Update();
}

function confwizard4105_2019NextPage() {
	if(checkWizard4105_2019Values())
	{
    	confwizardShowErrorLabel("lblWizard4105_2019CheckResult", lng.WIZARD_CHECK_FIELDS_ERROR);
	}
	else
	{
		sendwizard4105_2019Page();
		confwizardClose();		
	}
}

//Check input data for validity
function checkWizard4105_2019Values() {

    var state = 0;

    confwizardResetErrorFields();

    if($('#checkboxWizard4105_2019_cosphi').is(":checked") == true) 
    {
    	if(!isValidFloat($("#GRIDCONFIGVDEFIXEDFAC").val())) {
    		$("#GRIDCONFIGVDEFIXEDFAC").addClass("errorField");
            state = 1;
        }
    		
    	if(!((parseFloat($("#GRIDCONFIGVDEFIXEDFAC").val()) > -1 &&
    		        parseFloat($("#GRIDCONFIGVDEFIXEDFAC").val()) <= -0.9) ||
    		        (parseFloat($("#GRIDCONFIGVDEFIXEDFAC").val()) <= 1 &&
    		        parseFloat($("#GRIDCONFIGVDEFIXEDFAC").val()) >= 0.9)))
    			{
    				$("#GRIDCONFIGVDEFIXEDFAC").addClass("errorField");
    				state = 1;
    			}
	}
    
    if(!isValidFloat($("#GRIDCONFIGVDEOVERFREQLIMIT").val())) {
		$("#GRIDCONFIGVDEOVERFREQLIMIT").addClass("errorField");
        state = 1;
    }

    /* check all int */
	var aFields = ["GRIDCONFIGVDEOVERFREQDROOP", "GRIDCONFIGVDEUNDERFREQDROOP",
    	"GRIDCONFIGVDECOSPHITIME", "GRIDCONFIGVDERECOVERTIME", "GRIDCONFIGVDEURMSMAX10"];
    var sEl = "";
    for(var i = 0,l = aFields.length; i<l; i++) {
        sEl = "#" + aFields[i];
        if(!isValidDecimal($(sEl).val())) {
            $(sEl).addClass("errorField");
            state = 1;
        }
    }

	if(!($("#GRIDCONFIGVDEOVERFREQLIMIT").val() >= 50.2 &&
	        $("#GRIDCONFIGVDEOVERFREQLIMIT").val() <= 50.5))
		{
			$("#GRIDCONFIGVDEOVERFREQLIMIT").addClass("errorField");
			state = 1;
		}
	if(!($("#GRIDCONFIGVDEOVERFREQDROOP").val() >= 2 &&
	        $("#GRIDCONFIGVDEOVERFREQDROOP").val() <= 12))
		{
			$("#GRIDCONFIGVDEOVERFREQDROOP").addClass("errorField");
			state = 1;
		}
	if(!($("#GRIDCONFIGVDEUNDERFREQDROOP").val() >= 2 &&
	        $("#GRIDCONFIGVDEUNDERFREQDROOP").val() <= 12))
		{
			$("#GRIDCONFIGVDEUNDERFREQDROOP").addClass("errorField");
			state = 1;
		}
	if(!($("#GRIDCONFIGVDECOSPHITIME").val() >= 6 &&
	        $("#GRIDCONFIGVDECOSPHITIME").val() <= 60))
		{
			$("#GRIDCONFIGVDECOSPHITIME").addClass("errorField");
			state = 1;
		}
	if(!($("#GRIDCONFIGVDERECOVERTIME").val() >= 2 &&
	        $("#GRIDCONFIGVDERECOVERTIME").val() <= 60))
		{
			$("#GRIDCONFIGVDERECOVERTIME").addClass("errorField");
			state = 1;
		}
	if(!($("#GRIDCONFIGVDEURMSMAX10").val() >= 100 &&
	        $("#GRIDCONFIGVDEURMSMAX10").val() <= 115))
		{
			$("#GRIDCONFIGVDEURMSMAX10").addClass("errorField");
			state = 1;
		}
    return state; 
}

function sendwizard4105_2019Page() {
    //IMPORTANT: check connection to mcu
    $.ajax({
        type: "GET",
        url: "/",
        error: function() {
            alert(lng.WIZARD_NOTIFY_NO_CONN_TO_MCU);
        }
    });

    //only apply new values if power-station is activated
    pageObj4105_2019.reInitJSONObject();
    
    pageObj4105_2019.add_json_object("GRIDCONFIG");
    pageObj4105_2019.add_json_object("WIZARD");

    if($('#checkboxWizard4105_2019_cosphi').is(":checked") == true) {
        pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDETARGETTY", "u1_01");
    }
    else {
        pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDETARGETTY", "u1_00");
    }
    
    if($('#checkboxWizard4105_2019_lvfrt').is(":checked") == true) {
        pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDELVFRTDISABLE", "u8_00"); // Do not disable
    }
    else {
        pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDELVFRTDISABLE", "u8_01");
    }

    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEFIXEDFAC", "fl_" + pageObj.float2hex($('#GRIDCONFIGVDEFIXEDFAC').val()));
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEOVERFREQLIMIT", "fl_" + pageObj.float2hex($('#GRIDCONFIGVDEOVERFREQLIMIT').val()));
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEOVERFREQDROOP", pageObj.castVarValue("u1", $('#GRIDCONFIGVDEOVERFREQDROOP').val()));
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEUNDERFREQDROOP", pageObj.castVarValue("u1", $('#GRIDCONFIGVDEUNDERFREQDROOP').val()));
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDECOSPHITIME", pageObj.castVarValue("u1", $('#GRIDCONFIGVDECOSPHITIME').val()));
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDERECOVERTIME", pageObj.castVarValue("u1", $('#GRIDCONFIGVDERECOVERTIME').val()));
    pageObj4105_2019.add_property_to_object("GRIDCONFIG", "VDEURMSMAX10", pageObj.castVarValue("u1", $('#GRIDCONFIGVDEURMSMAX10').val()));

    pageObj4105_2019.add_property_to_object("WIZARD", "CONFIG_MODIFIED_BY_USER", "u8_01");

    pageObj4105_2019.singlePageRefresh();
}

function startWizard4105_2019() {
    $(document).trigger("page.unload");

    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: './wizard.4105.2019.html',
        success: function(html) {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizard4105_2019Init();
            console.log("wizard4105_2019 data has successfool loaded..");

            $('#modalWindow').modal('show');

            //check if senec is already configured
            if(parseInt($('#WIZARDCONFIG_LOADED').html()) <= 0) {
                alert(lng.WIZARD_GRID_ERROR_NEED_INITIAL_CONFIG);
                confwizardClose();
            }
        }
    });

    modal_input = 'modal_wizard4105_2019';
}

function confwizard4105_2019Update() {

    //update power-station-configs
    if (($("#GRIDCONFIGVDETARGETTY").html() * 1) == 0) {
        $('#checkboxWizard4105_2019_cosphi').attr("checked", false);
    }
    else {
        $('#checkboxWizard4105_2019_cosphi').attr("checked", true);
    }
    
    //show lvfrt enable only to test user or higher
    if (($("#GRIDCONFIGVDELVFRTDISABLE").html() * 1) == 0) {
        $('#checkboxWizard4105_2019_lvfrt').attr("checked", true);
    }
    else {
        $('#checkboxWizard4105_2019_lvfrt').attr("checked", false);
    }
        
    $('#btnWizard4105_2019_next').show();
}

function CosPhi4105_2019Update() {
	if($('#checkboxWizard4105_2019_cosphi').prop('checked')) {
        $('.CosPhiFix').show();
    }
    else
	{
        $('.CosPhiFix').hide();
	}
}

function LVFRT4105_2019Update() {
	if($('#checkboxWizard4105_2019_lvfrt').prop('checked')) {
        $('.LVFRT').show();
    }
    else
	{
        $('.LVFRT').hide();
	}	
}