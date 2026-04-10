/** Prevent JSHint warning about functions called from HTML sites. */
/* exported confwizardCEINextPage, startWizardCEI */

var pageObjCEI;

function obj_init_wizardCEI() {
    //create parent json object
    pageObjCEI = new senecPage(confwizardCEIUpdate);

    //add child object to parent object
    pageObjCEI.add_json_object("GRIDCONFIG");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_FREQ_MIN", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_FREQ_MAX", "");

    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_REC_TIME", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_RED_DROP", "");

    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_CPHI_LOIN", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_CPHI_LOUT", "");

    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_UP_TH", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_LO_TH", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_UP_CO", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_LO_CO", "");

    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_AC_DE", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_VOL_TH", "");

    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_COS_PHI_ENABLE", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_COS_PHI", "");

    pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT1", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2A", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2B", "");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT3", "");

    //call wizardCEI data
    pageObjCEI.singlePageRefresh();
}

function confwizardCEIInit() {
    obj_init_wizardCEI();

    CosPhiFixUpdate();
}

function confwizardCEINextPage() {
	if(checkWizardCEIValues())
	{
    	confwizardShowErrorLabel("lblWizardCEICheckResult", lng.GRIDCONFIG_CHECK_FIELDS_ERROR);
	}
	else
	{
		sendwizardCEIPage();
		confwizardClose();
	}
}

//Check input data for validity
function checkWizardCEIValues() {

    var state = 0;

    confwizardResetErrorFields();

    //check fields for empty-string and if a valid decimal number was entered
    //except CosPhi_Val since it can be negative
    var aFields = ["GRIDCONFIGCEI_FREQ_MIN", "GRIDCONFIGCEI_FREQ_MAX",
                   "GRIDCONFIGCEI_REC_TIME", "GRIDCONFIGCEI_RED_DROP",
                   "GRIDCONFIGCEI_CPHI_LOIN", "GRIDCONFIGCEI_CPHI_LOUT",
                   "GRIDCONFIGCEI_STAB_UP_TH", "GRIDCONFIGCEI_STAB_LO_TH",
                   "GRIDCONFIGCEI_STAB_UP_CO", "GRIDCONFIGCEI_STAB_LO_CO",
                   "GRIDCONFIGCEI_STAB_AC_DE", "GRIDCONFIGCEI_STAB_VOL_TH"];
    var sEl = "";
    for(var i = 0,l = aFields.length; i<l; i++) {
        sEl = "#" + aFields[i];
        if(!isValidDecimal($(sEl).val())) {
            $(sEl).addClass("errorField");
            state = 1;
        }
    }

    //Check each input range
    //49000 - 50000
    if($("#GRIDCONFIGCEI_FREQ_MIN").val() < 49000 ||
            $("#GRIDCONFIGCEI_FREQ_MIN").val() > 50000)
    	{
    		$("#GRIDCONFIGCEI_FREQ_MIN").addClass("errorField");
    		state = 1;
    	}
	//50000 - 51000
    if($("#GRIDCONFIGCEI_FREQ_MAX").val() < 50000 ||
            $("#GRIDCONFIGCEI_FREQ_MAX").val() > 51000)
    	{
    		$("#GRIDCONFIGCEI_FREQ_MAX").addClass("errorField");
    		state = 1;
    	}
	//0 - 900
    if($("#GRIDCONFIGCEI_REC_TIME").val() < 0 ||
            $("#GRIDCONFIGCEI_REC_TIME").val() > 900)
    	{
    		$("#GRIDCONFIGCEI_REC_TIME").addClass("errorField");
    		state = 1;
    	}
	//20 - 50
    if($("#GRIDCONFIGCEI_RED_DROP").val() < 20 ||
            $("#GRIDCONFIGCEI_RED_DROP").val() > 50)
    	{
    		$("#GRIDCONFIGCEI_RED_DROP").addClass("errorField");
    		state = 1;
    	}
	//100 - 110
    if($("#GRIDCONFIGCEI_CPHI_LOIN").val() < 100 ||
            $("#GRIDCONFIGCEI_CPHI_LOIN").val() > 110)
    	{
    		$("#GRIDCONFIGCEI_CPHI_LOIN").addClass("errorField");
    		state = 1;
    	}
    //90 - 100
    if($("#GRIDCONFIGCEI_CPHI_LOUT").val() < 90 ||
            $("#GRIDCONFIGCEI_CPHI_LOUT").val() > 100)
    	{
    		$("#GRIDCONFIGCEI_CPHI_LOUT").addClass("errorField");
    		state = 1;
    	}
    //50000 - 52000
    if($("#GRIDCONFIGCEI_STAB_UP_TH").val() < 50000 ||
            $("#GRIDCONFIGCEI_STAB_UP_TH").val() > 52000)
    	{
    		$("#GRIDCONFIGCEI_STAB_UP_TH").addClass("errorField");
    		state = 1;
    	}
    //47000 - 50000
    if($("#GRIDCONFIGCEI_STAB_LO_TH").val() < 47000 ||
            $("#GRIDCONFIGCEI_STAB_LO_TH").val() > 50000)
    	{
    		$("#GRIDCONFIGCEI_STAB_LO_TH").addClass("errorField");
    		state = 1;
    	}
    //50000 - 53000
    if($("#GRIDCONFIGCEI_STAB_UP_CO").val() < 50000 ||
            $("#GRIDCONFIGCEI_STAB_UP_CO").val() > 53000)
    	{
    		$("#GRIDCONFIGCEI_STAB_UP_CO").addClass("errorField");
    		state = 1;
    	}
    //46000 - 50000
    if($("#GRIDCONFIGCEI_STAB_LO_CO").val() < 46000 ||
            $("#GRIDCONFIGCEI_STAB_LO_CO").val() >= 50000)
    	{
    		$("#GRIDCONFIGCEI_STAB_LO_CO").addClass("errorField");
    		state = 1;
    	}
    //0 - 1000
    if($("#GRIDCONFIGCEI_STAB_AC_DE").val() < 0  ||
            $("#GRIDCONFIGCEI_STAB_AC_DE").val() > 1000)
    	{
    		$("#GRIDCONFIGCEI_STAB_AC_DE").addClass("errorField");
    		state = 1;
    	}
    //105 - 115
    if($("#GRIDCONFIGCEI_STAB_VOL_TH").val() < 105 ||
            $("#GRIDCONFIGCEI_STAB_VOL_TH").val() > 115)
    	{
    		$("#GRIDCONFIGCEI_STAB_VOL_TH").addClass("errorField");
    		state = 1;
    	}

    //-0.9 - -0.99 || 1 - 0.9
    if($('#checkboxWizardCEIfix_cosphi').is(":checked") == true) {
		if (!isValidFloat($("#GRIDCONFIGCEI_COS_PHI").val())){
			$("#GRIDCONFIGCEI_COS_PHI").addClass("errorField");
			state = 1;
		}
	    if(!((parseFloat($("#GRIDCONFIGCEI_COS_PHI").val()) > -1 &&
	            parseFloat($("#GRIDCONFIGCEI_COS_PHI").val()) <= -0.9) ||
	            (parseFloat($("#GRIDCONFIGCEI_COS_PHI").val()) <= 1 &&
	            parseFloat($("#GRIDCONFIGCEI_COS_PHI").val()) >= 0.9)))
	    	{
	    		$("#GRIDCONFIGCEI_COS_PHI").addClass("errorField");
	    		state = 1;
	    	}
    }
    else {
        aFields = ["GRIDCONFIGPWRCFG_COS_POINT1", "GRIDCONFIGPWRCFG_COS_POINT_2A",
	    	"GRIDCONFIGPWRCFG_COS_POINT_2B", "GRIDCONFIGPWRCFG_COS_POINT3"];
	    sEl = "";
	    for(var j = 0,len = aFields.length; j<len; j++) {
	        sEl = "#" + aFields[j];
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
        if(!(parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2B").val()) >= 0 &&
                parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2B").val()) <= 100))
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

function sendwizardCEIPage() {
    //IMPORTANT: check connection to mcu
    $.ajax({
        type: "GET",
        url: "/",
        error: function() {
            alert(lng.WIZARD_NOTIFY_NO_CONN_TO_MCU);
        }
    });

    //only apply new values if power-station is activated
    pageObjCEI.reInitJSONObject();

    pageObjCEI.add_json_object("GRIDCONFIG");
    pageObjCEI.add_json_object("WIZARD");
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_FREQ_MIN", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_FREQ_MIN').val()));
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_FREQ_MAX", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_FREQ_MAX').val()));

    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_REC_TIME", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_REC_TIME').val()));
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_RED_DROP", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_RED_DROP').val()));

    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_CPHI_LOIN", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_CPHI_LOIN').val()));
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_CPHI_LOUT", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_CPHI_LOUT').val()));

    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_UP_TH", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_STAB_UP_TH').val()));
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_LO_TH", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_STAB_LO_TH').val()));
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_UP_CO", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_STAB_UP_CO').val()));
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_LO_CO", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_STAB_LO_CO').val()));

    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_AC_DE", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_STAB_AC_DE').val()));
    pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_STAB_VOL_TH", pageObjCEI.castVarValue("u1", $('#GRIDCONFIGCEI_STAB_VOL_TH').val()));

    if($('#checkboxWizardCEIfix_cosphi').is(":checked") == true) {
        pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_COS_PHI_CURVE", "u8_00");
        pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_COS_PHI_ENABLE", "u1_01");
        pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_COS_PHI", "fl_" + pageObj.float2hex($('#GRIDCONFIGCEI_COS_PHI').val()));
    }
    else {
        pageObjCEI.add_property_to_object("GRIDCONFIG", "CEI_COS_PHI_ENABLE", "u1_00");
        pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_COS_PHI_CURVE", "u8_01");
        pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT1", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT1').val()));
        pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2A", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT_2A').val()));
        pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2B", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT_2B').val()));
        pageObjCEI.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT3", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT3').val()));
    }

    pageObjCEI.add_property_to_object("WIZARD", "CONFIG_MODIFIED_BY_USER", "u8_01");

    pageObjCEI.singlePageRefresh();
}

function startWizardCEI() {
    $(document).trigger("page.unload");

    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: './wizard.cei.html',
        success: function(html) {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizardCEIInit();
            console.log("wizardCEI data has successfool loaded..");

            $('#modalWindow').modal('show');

            //check if senec is already configured
            if(parseInt($('#WIZARDCONFIG_LOADED').html()) <= 0) {
                alert(lng.WIZARD_GRID_ERROR_NEED_INITIAL_CONFIG);
                confwizardClose();
            }
        }
    });

    modal_input = 'modal_wizardCEI';
}

function confwizardCEIUpdate() {

    //update power-station-configs
    if (parseInt($("#GRIDCONFIGCEI_COS_PHI_ENABLE").html()) == 1) {
        $('#checkboxWizardCEIfix_cosphi').attr("checked", true);
    }
    else {
        $('#checkboxWizardCEIfix_cosphi').attr("checked", false);
    }
}

function CosPhiFixUpdate() {
	if($('#checkboxWizardCEIfix_cosphi').prop('checked')) {
        $('#CosPhiFix').show();
        $('.CosPhiRamp').hide();
    }
    else
	{
        $('#CosPhiFix').hide();
        $('.CosPhiRamp').show();
	}
}
