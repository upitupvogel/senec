/** Prevent JSHint warning about functions called from HTML sites. */
/* exported confwizard4105_2018NextPage, startWizard4105_2018 */

var pageObj4105_2018;

function obj_init_wizard4105_2018() {
    //create parent json object
    pageObj4105_2018 = new senecPage(confwizard4105_2018Update);

    //add child object to parent object
    pageObj4105_2018.add_json_object("GRIDCONFIG");
    
    pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_COS_PHI_CURVE", "");
    pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT1", "");
    pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2A", "");
    pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2B", "");
    pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT3", "");

    pageObj4105_2018.singlePageRefresh();    
}

function confwizard4105_2018Init() {
    obj_init_wizard4105_2018();
    
    CosPhi4105_2018Update();
}

function confwizard4105_2018NextPage() {
	if(checkWizard4105_2018Values())
	{
    	confwizardShowErrorLabel("lblWizard4105_2018CheckResult", lng.WIZARD_CHECK_FIELDS_ERROR);
	}
	else
	{
		sendwizard4105_2018Page();
	    confwizard4105_2018Close();		
	}
}

//Check input data for validity
function checkWizard4105_2018Values() {

    var state = 0;

    confwizardResetErrorFields();

    //-0.95 - -0.99 || 1 - 0.95 
    if($('#checkboxWizard4105_2018_cosphi').is(":checked") == true) {
    	var aFields = ["GRIDCONFIGPWRCFG_COS_POINT1", "GRIDCONFIGPWRCFG_COS_POINT_2A",
	    	"GRIDCONFIGPWRCFG_COS_POINT_2B", "GRIDCONFIGPWRCFG_COS_POINT3"];
	    var sEl = "";
	    for(var i = 0,l = aFields.length; i<l; i++) {
	        sEl = "#" + aFields[i];
	        if(!isValidFloat($(sEl).val())) {
	            $(sEl).addClass("errorField");
	            state = 1;
	        }
	    }
	    
		if(!((parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT1").val()) > -1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT1").val()) <= -0.9) ||
		        (parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT1").val()) <= 1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT1").val()) >= 0.9)))
			{
				$("#GRIDCONFIGPWRCFG_COS_POINT1").addClass("errorField");
				state = 1;
			}
		if(!((parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2A").val()) > -1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2A").val()) <= -0.9) ||
		        (parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2A").val()) <= 1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2A").val()) >= 0.9)))
			{
				$("#GRIDCONFIGPWRCFG_COS_POINT_2A").addClass("errorField");
				state = 1;
			}
		if(!(parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2B").val()) >= 20 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2B").val()) <= 85))
			{
				$("#GRIDCONFIGPWRCFG_COS_POINT_2B").addClass("errorField");
				state = 1;
			}
		if(!((parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT3").val()) > -1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT3").val()) <= -0.9) ||
		        (parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT3").val()) <= 1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT3").val()) >= 0.9)))
			{
				$("#GRIDCONFIGPWRCFG_COS_POINT3").addClass("errorField");
				state = 1;
			}
    }
                 
    return state; 
}

function sendwizard4105_2018Page() {
    //IMPORTANT: check connection to mcu
    $.ajax({
        type: "GET",
        url: "/",
        error: function() {
            alert(lng.WIZARD_NOTIFY_NO_CONN_TO_MCU);
        }
    });

    //only apply new values if power-station is activated
    pageObj4105_2018.reInitJSONObject();
    
    pageObj4105_2018.add_json_object("GRIDCONFIG");
    pageObj4105_2018.add_json_object("WIZARD");

    if($('#checkboxWizard4105_2018_cosphi').is(":checked") == true) {
        pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_COS_PHI_CURVE", "u8_01");
        pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT1", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT1').val()));
        pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2A", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT_2A').val()));
        pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2B", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT_2B').val()));
        pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT3", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT3').val()));
    }
    else {
        pageObj4105_2018.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_COS_PHI_CURVE", "u1_00");
    }

    pageObj4105_2018.add_property_to_object("WIZARD", "CONFIG_MODIFIED_BY_USER", "u8_01");

    pageObj4105_2018.singlePageRefresh();
}

function startWizard4105_2018() {
    $(document).trigger("page.unload");

    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: './wizard.4105.2018.html',
        success: function(html) {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizard4105_2018Init();
            console.log("wizard4105_2018 data has successfool loaded..");

            $('#modalWindow').modal('show');

            //check if senec is already configured
            if(parseInt($('#WIZARDCONFIG_LOADED').html()) <= 0) {
                alert(lng.WIZARD_GRID_ERROR_NEED_INITIAL_CONFIG);
                confwizard4105_2018Close();
            }
        }
    });

    modal_input = 'modal_wizard4105_2018';
}

function confwizard4105_2018Close() {
    $("#modalWindow").empty();
    $('#modalWindow').modal('hide');
    navigate('lSetup');
}

function confwizard4105_2018Update() {

    //update power-station-configs
    if (($("#GRIDCONFIGPWRCFG_USE_COS_PHI_CURVE").html() * 1) == 1) {
        $('#checkboxWizard4105_2018_cosphi').attr("checked", true);
    }
    else {
        $('#checkboxWizard4105_2018_cosphi').attr("checked", false);
    }
    
    $('#btnWizard4105_2018_next').show();
}

function CosPhi4105_2018Update() {
	if($('#checkboxWizard4105_2018_cosphi').prop('checked')) {
        $('.CosPhiRamp').show();
    }
    else
	{
        $('.CosPhiRamp').hide();
	}
}