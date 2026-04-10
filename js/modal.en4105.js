/** Prevent JSHint warning about functions called from HTML sites. */
/* exported confwizard4105NextPage, startWizard4105 */

var pageObj4105;

function obj_init_wizard4105() {
    //create parent json object
    pageObj4105 = new senecPage(confwizard4105Update);

    //add child object to parent object
    pageObj4105.add_json_object("WIZARD");
    
    pageObj4105.add_property_to_object("WIZARD", "CONFIG_LOADED", "");
    pageObj4105.add_property_to_object("WIZARD", "PWRCFG_USE_COS_PHI_CURVE", "");
    pageObj4105.add_property_to_object("WIZARD", "PWRCFG_COS_POINT1", "");
    pageObj4105.add_property_to_object("WIZARD", "PWRCFG_COS_POINT_2A", "");
    pageObj4105.add_property_to_object("WIZARD", "PWRCFG_COS_POINT_2B", "");
    pageObj4105.add_property_to_object("WIZARD", "PWRCFG_COS_POINT3", "");

    //call wizard4105 data
    pageObj4105.singlePageRefresh();    
}

function confwizard4105Init() {
    obj_init_wizard4105();
    
    CosPhi4105Update();
}

function confwizard4105NextPage() {
	if(checkWizard4105Values())
	{
    	confwizardShowErrorLabel("lblWizard4105CheckResult", lng.WIZARD_CHECK_FIELDS_ERROR);
	}
	else
	{
		sendwizard4105Page();
	    confwizard4105Close();		
	}
}

//Check input data for validity
function checkWizard4105Values() {

    var state = 0;

    confwizardResetErrorFields();

    //-0.95 - -0.99 || 1 - 0.95 
    if($('#checkboxWizard4105_cosphi').is(":checked") == true) {
    	var aFields = ["WIZARDPWRCFG_COS_POINT1", "WIZARDPWRCFG_COS_POINT_2A",
	    	"WIZARDPWRCFG_COS_POINT_2B", "WIZARDPWRCFG_COS_POINT3"];
	    var sEl = "";
	    for(var i = 0,l = aFields.length; i<l; i++) {
	        sEl = "#" + aFields[i];
	        if(!isValidFloat($(sEl).val())) {
	            $(sEl).addClass("errorField");
	            state = 1;
	        }
	    }
	    
		if(!((parseFloat($("#WIZARDPWRCFG_COS_POINT1").val()) > -1 &&
		        parseFloat($("#WIZARDPWRCFG_COS_POINT1").val()) <= -0.95) ||
		        (parseFloat($("#WIZARDPWRCFG_COS_POINT1").val()) <= 1 &&
		        parseFloat($("#WIZARDPWRCFG_COS_POINT1").val()) >= 0.95)))
			{
				$("#WIZARDPWRCFG_COS_POINT1").addClass("errorField");
				state = 1;
			}
		if(!((parseFloat($("#WIZARDPWRCFG_COS_POINT_2A").val()) > -1 &&
		        parseFloat($("#WIZARDPWRCFG_COS_POINT_2A").val()) <= -0.9) ||
		        (parseFloat($("#WIZARDPWRCFG_COS_POINT_2A").val()) <= 1 &&
		        parseFloat($("#WIZARDPWRCFG_COS_POINT_2A").val()) >= 0.9)))
			{
				$("#WIZARDPWRCFG_COS_POINT_2A").addClass("errorField");
				state = 1;
			}
		if(!(parseFloat($("#WIZARDPWRCFG_COS_POINT_2B").val()) >= 20 &&
		        parseFloat($("#WIZARDPWRCFG_COS_POINT_2B").val()) <= 85))
			{
				$("#WIZARDPWRCFG_COS_POINT_2B").addClass("errorField");
				state = 1;
			}
		if(!((parseFloat($("#WIZARDPWRCFG_COS_POINT3").val()) > -1 &&
		        parseFloat($("#WIZARDPWRCFG_COS_POINT3").val()) <= -0.9) ||
		        (parseFloat($("#WIZARDPWRCFG_COS_POINT3").val()) <= 1 &&
		        parseFloat($("#WIZARDPWRCFG_COS_POINT3").val()) >= 0.9)))
			{
				$("#WIZARDPWRCFG_COS_POINT3").addClass("errorField");
				state = 1;
			}
    }
                 
    return state; 
}

function sendwizard4105Page() {
    //IMPORTANT: check connection to mcu
    $.ajax({
        type: "GET",
        url: "/",
        error: function() {
            alert(lng.WIZARD_NOTIFY_NO_CONN_TO_MCU);
        }
    });

    //only apply new values if power-station is activated
    pageObj4105.reInitJSONObject();
    
    pageObj4105.add_json_object("WIZARD");

    if($('#checkboxWizard4105_cosphi').is(":checked") == true) {
        pageObj4105.add_property_to_object("WIZARD", "PWRCFG_USE_COS_PHI_CURVE", "u8_01");
        pageObj4105.add_property_to_object("WIZARD", "PWRCFG_COS_POINT1", "fl_" + pageObj.float2hex($('#WIZARDPWRCFG_COS_POINT1').val()));
        pageObj4105.add_property_to_object("WIZARD", "PWRCFG_COS_POINT_2A", "fl_" + pageObj.float2hex($('#WIZARDPWRCFG_COS_POINT_2A').val()));
        pageObj4105.add_property_to_object("WIZARD", "PWRCFG_COS_POINT_2B", "fl_" + pageObj.float2hex($('#WIZARDPWRCFG_COS_POINT_2B').val()));
        pageObj4105.add_property_to_object("WIZARD", "PWRCFG_COS_POINT3", "fl_" + pageObj.float2hex($('#WIZARDPWRCFG_COS_POINT3').val()));
    }
    else {
        pageObj4105.add_property_to_object("WIZARD", "PWRCFG_USE_COS_PHI_CURVE", "u1_00");
    }

    pageObj4105.add_property_to_object("WIZARD", "CONFIG_MODIFIED_BY_USER", "u8_01");

    pageObj4105.singlePageRefresh();
}

function startWizard4105() {
    $(document).trigger("page.unload");

    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: './wizard.4105.html',
        success: function(html) {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizard4105Init();
            console.log("wizard4105 data has successfool loaded..");

            $('#modalWindow').modal('show');

            //check if senec is already configured
            if(parseInt($('#WIZARDCONFIG_LOADED').html()) <= 0) {
                alert(lng.WIZARD_EG_ERROR_NEED_INITIAL_CONFIG);
                confwizard4105Close();
            }
        }
    });

    modal_input = 'modal_wizard4105';
}

function confwizard4105Close() {
    $("#modalWindow").empty();
    $('#modalWindow').modal('hide');
    navigate('lSetup');
}

function confwizard4105Update() {

    //update power-station-configs
    if (($("#WIZARDPWRCFG_USE_COS_PHI_CURVE").html() * 1) == 1) {
        $('#checkboxWizard4105_cosphi').attr("checked", true);
    }
    else {
        $('#checkboxWizard4105_cosphi').attr("checked", false);
    }
    
    $('#btnWizard4105_next').show();
}

function CosPhi4105Update() {
	if($('#checkboxWizard4105_cosphi').prop('checked')) {
        $('.CosPhiRamp').show();
    }
    else
	{
        $('.CosPhiRamp').hide();
	}
}