/** Prevent JSHint warning about functions called from HTML sites. */
/* exported confwizardAUNextPage, startWizardAU, localGridCodeUpdate */

var pageObjAU;

function obj_init_wizardAU() {
    //create parent json object
    pageObjAU = new senecPage(confwizardAUUpdate);

    //add child object to parent object
    pageObjAU.add_json_object("GRIDCONFIG");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_RESP_MODE", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_SOFT_RAMP_EN", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_P_RAMP_CH", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_P_RAMP_DI", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_GRID_CODE", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_TARGET_TY", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_FIXED_FAC", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT1", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2A", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2B", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT3", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VRR_MAX", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VRR_MIN", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VVAR_PERCENTAGE", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VVAR_P_MAX", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VVAR_P_MIN", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VWC_VOLTAGE", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VWD_VOLTAGE", "");
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VVAR_VOLTAGE", "");
    

    //call wizardAU data
    pageObjAU.singlePageRefresh();
}

function confwizardAUInit() {
    obj_init_wizardAU();
}

function confwizardAUNextPage() {
	if(checkWizardAUValues()) {
    	confwizardShowErrorLabel("lblWizardAUCheckResult", lng.WIZARD_CHECK_FIELDS_ERROR);
	} else {
	sendwizardAUPage();
	confwizardClose();
	}
}

//Check input data for validity
function checkWizardAUValues() {

    var state = 0;
    var aFields,sEl,i,l;

    confwizardResetErrorFields();

    // Only check gradient WGRA+ if Steca
    if(htmlAsNumber("#isSteca"))
	{
		if (!isValidFloat($("#GRIDCONFIGAU_P_RAMP_CH").val())) {
			$("#GRIDCONFIGAU_P_RAMP_CH").addClass("errorField");
			state = 1;
		}
	    if($("#GRIDCONFIGAU_P_RAMP_CH").val() < 5.0 ||
	            $("#GRIDCONFIGAU_P_RAMP_CH").val() > 100.0)
    	{
    		$("#GRIDCONFIGAU_P_RAMP_CH").addClass("errorField");
    		state = 1;
    	}
	}
    else
	{
	    // Only check if enabled
		if($('#checkboxWizardAUSoftRampUp').is(":checked") == true ||
	       $('#checkboxWizardAURampChangesInSource').is(":checked") == true){
			if (!isValidFloat($("#GRIDCONFIGAU_P_RAMP_CH").val())) {
				$("#GRIDCONFIGAU_P_RAMP_CH").addClass("errorField");
				state = 1;
			}
		    if($("#GRIDCONFIGAU_P_RAMP_CH").val() < 5.0 ||
		            $("#GRIDCONFIGAU_P_RAMP_CH").val() > 100.0)
	    	{
	    		$("#GRIDCONFIGAU_P_RAMP_CH").addClass("errorField");
	    		state = 1;
	    	}
		}
	    // Only check if enabled
		if($('#checkboxWizardAURampChangesInSource').is(":checked") == true){
			if (!isValidFloat($("#GRIDCONFIGAU_P_RAMP_DI").val())) {
				$("#GRIDCONFIGAU_P_RAMP_DI").addClass("errorField");
				state = 1;
			}
		    if($("#GRIDCONFIGAU_P_RAMP_DI").val() < 5.0 ||
		            $("#GRIDCONFIGAU_P_RAMP_DI").val() > 100.0)
	    	{
	    		$("#GRIDCONFIGAU_P_RAMP_DI").addClass("errorField");
	    		state = 1;
	    	}
		}
	}

    // Only check if enabled
	if($("#inputWizardAUTargetType").val() == 1) {
		if (!isValidFloat($("#GRIDCONFIGAU_FIXED_FAC").val())) {
			$("#GRIDCONFIGAU_FIXED_FAC").addClass("errorField");
			state = 1;
		}
	    //-0.80 - -0.99 || 1 - 0.80
		if(!((parseFloat($("#GRIDCONFIGAU_FIXED_FAC").val()) > -1 &&
		        parseFloat($("#GRIDCONFIGAU_FIXED_FAC").val()) <= -0.80) ||
		        (parseFloat($("#GRIDCONFIGAU_FIXED_FAC").val()) <= 1 &&
		        parseFloat($("#GRIDCONFIGAU_FIXED_FAC").val()) >= 0.80)))
			{
				$("#GRIDCONFIGAU_FIXED_FAC").addClass("errorField");
				state = 1;
			}
	}
	//CosPhi Ramp
	if($("#inputWizardAUTargetType").val() == 2) {
	    aFields = ["GRIDCONFIGPWRCFG_COS_POINT1", "GRIDCONFIGPWRCFG_COS_POINT_2A",
	    	"GRIDCONFIGPWRCFG_COS_POINT_2B", "GRIDCONFIGPWRCFG_COS_POINT3"];
	    sEl = "";
	    for(i = 0,l = aFields.length; i<l; i++) {
	        sEl = "#" + aFields[i];
	        if(!isValidFloat($(sEl).val())) {
	            $(sEl).addClass("errorField");
	            state = 1;
	        }
	    }

		if(!((parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT1").val()) > -1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT1").val()) <= -0.80) ||
		        (parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT1").val()) <= 1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT1").val()) >= 0.80)))
			{
				$("#GRIDCONFIGPWRCFG_COS_POINT1").addClass("errorField");
				state = 1;
			}
		if(!((parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2A").val()) > -1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2A").val()) <= -0.80) ||
		        (parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2A").val()) <= 1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT_2A").val()) >= 0.80)))
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
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT3").val()) <= -0.80) ||
		        (parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT3").val()) <= 1 &&
		        parseFloat($("#GRIDCONFIGPWRCFG_COS_POINT3").val()) >= 0.80)))
			{
				$("#GRIDCONFIGPWRCFG_COS_POINT3").addClass("errorField");
				state = 1;
			}
	}
	
    if(htmlAsNumber("#isSteca") && $('#checkboxWizardAUresponsemode_0').is(":checked") == true)
	{
    	aFields = ["GRIDCONFIGAU_VWC_VOLTAGE0", "GRIDCONFIGAU_VWC_VOLTAGE1",
	    	"GRIDCONFIGAU_VWC_VOLTAGE2", "GRIDCONFIGAU_VWC_VOLTAGE3"];
    	sEl = "";
	    for(i = 0,l = aFields.length; i < l; i++) {
	        sEl = "#" + aFields[i];
	        if(!isValidDecimal($(sEl).val())) {
	            $(sEl).addClass("errorField");
	            state = 1;
	        }
	    }
	    //Check min/max values
	    for(i = 0; i < 4; i++) {
		    if($("#GRIDCONFIGAU_VWC_VOLTAGE" + i).val() < htmlAsNumber("#GRIDCONFIGAU_VRR_MIN" + i) ||
		    		$("#GRIDCONFIGAU_VWC_VOLTAGE" + i).val() > htmlAsNumber("#GRIDCONFIGAU_VRR_MAX" + i))
	    	{
				$("#GRIDCONFIGAU_VWC_VOLTAGE" + i).addClass("errorField");
				state = 1;
	    	}
	    }
	}
    
    if(htmlAsNumber("#isSteca") && $('#checkboxWizardAUresponsemode_1').is(":checked") == true)
	{
	    aFields = ["GRIDCONFIGAU_VWD_VOLTAGE0", "GRIDCONFIGAU_VWD_VOLTAGE1",
	    	"GRIDCONFIGAU_VWD_VOLTAGE2", "GRIDCONFIGAU_VWD_VOLTAGE3"];
	    sEl = "";
	    for(i = 0,l = aFields.length; i < l; i++) {
	        sEl = "#" + aFields[i];
	        if(!isValidDecimal($(sEl).val())) {
	            $(sEl).addClass("errorField");
	            state = 1;
	        }
	    }
	    //Check min/max values
	    for(i = 0; i < 4; i++) {
		    if($("#GRIDCONFIGAU_VWD_VOLTAGE" + i).val() < htmlAsNumber("#GRIDCONFIGAU_VRR_MIN" + i) ||
		    		$("#GRIDCONFIGAU_VWD_VOLTAGE" + i).val() > htmlAsNumber("#GRIDCONFIGAU_VRR_MAX" + i))
	    	{
				$("#GRIDCONFIGAU_VWD_VOLTAGE" + i).addClass("errorField");
				state = 1;
	    	}
	    }
	}
	
    if(htmlAsNumber("#isSteca") && $('#checkboxWizardAUresponsemode_4').is(":checked") == true)
	{
    	aFields = ["GRIDCONFIGAU_VVAR_VOLTAGE0", "GRIDCONFIGAU_VVAR_VOLTAGE1",
	    	"GRIDCONFIGAU_VVAR_VOLTAGE2", "GRIDCONFIGAU_VVAR_VOLTAGE3",
	    	"GRIDCONFIGAU_VVAR_PERCENTAGE0", "GRIDCONFIGAU_VVAR_PERCENTAGE3"];
    	sEl = "";
	    for(i = 0,l = aFields.length; i < l; i++) {
	        sEl = "#" + aFields[i];
	        if(!isValidDecimal($(sEl).val())) {
	            $(sEl).addClass("errorField");
	            state = 1;
	        }
	    }
	    //Check min/max values
	    for(i = 0; i < 4; i++) {
		    if($("#GRIDCONFIGAU_VVAR_VOLTAGE" + i).val() < htmlAsNumber("#GRIDCONFIGAU_VRR_MIN" + i) ||
		    		$("#GRIDCONFIGAU_VVAR_VOLTAGE" + i).val() > htmlAsNumber("#GRIDCONFIGAU_VRR_MAX" + i))
	    	{
				$("#GRIDCONFIGAU_VVAR_VOLTAGE" + i).addClass("errorField");
				state = 1;
	    	}
		    if($("#GRIDCONFIGAU_VVAR_PERCENTAGE" + i).val() < htmlAsNumber("#GRIDCONFIGAU_VVAR_P_MIN" + i) ||
		    		$("#GRIDCONFIGAU_VVAR_PERCENTAGE" + i).val() > htmlAsNumber("#GRIDCONFIGAU_VVAR_P_MAX" + i))
	    	{
				$("#GRIDCONFIGAU_VVAR_PERCENTAGE" + i).addClass("errorField");
				state = 1;
	    	}
	    }
	}

    return state;
}

function sendwizardAUPage() {
    //IMPORTANT: check connection to mcu
    $.ajax({
        type: "GET",
        url: "/",
        error: function() {
            alert(lng.WIZARD_NOTIFY_NO_CONN_TO_MCU);
        }
    });

    //only apply new values if power-station is activated
    pageObjAU.reInitJSONObject();

    pageObjAU.add_json_object("GRIDCONFIG");
    pageObjAU.add_json_object("WIZARD");

    softRampValue = $('#checkboxWizardAUSoftRampUp').is(":checked") ? "01" : "00";
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_SOFT_RAMP_EN", "u8_" + softRampValue);

    //Only send if enabled
	if($('#checkboxWizardAUSoftRampUp').is(":checked") == true ||
       $('#checkboxWizardAURampChangesInSource').is(":checked") == true){
		pageObjAU.add_property_to_object("GRIDCONFIG", "AU_P_RAMP_CH", "fl_" + pageObjAU.float2hex($('#GRIDCONFIGAU_P_RAMP_CH').val()));
    }
    //Only send if enabled
	if($('#checkboxWizardAURampChangesInSource').is(":checked") == true){
		pageObjAU.add_property_to_object("GRIDCONFIG", "AU_P_RAMP_DI", "fl_" + pageObjAU.float2hex($('#GRIDCONFIGAU_P_RAMP_DI').val()));
	}

    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_GRID_CODE", pageObjAU.castVarValue("u1", $('#inputWizardAULocalGridCode').val()));

	pageObjAU.add_property_to_object("GRIDCONFIG", "AU_TARGET_TY", pageObjAU.castVarValue("u1", $('#inputWizardAUTargetType').val()));
    //Only send if enabled
    if($("#inputWizardAUTargetType").val() == 1){
		pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_COS_PHI_CURVE", "u8_00");
		pageObjAU.add_property_to_object("GRIDCONFIG", "AU_FIXED_FAC", "fl_" + pageObjAU.float2hex($('#GRIDCONFIGAU_FIXED_FAC').val()));
    }
    //Only send if enabled
	if($("#inputWizardAUTargetType").val() == 2){
		pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_COS_PHI_CURVE", "u8_01");
		pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT1", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT1').val()));
		pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2A", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT_2A').val()));
		pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT_2B", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT_2B').val()));
		pageObjAU.add_property_to_object("GRIDCONFIG", "PWRCFG_COS_POINT3", "fl_" + pageObj.float2hex($('#GRIDCONFIGPWRCFG_COS_POINT3').val()));
	}

    var response_mode = 0x0000;
    for (d = 0; d < 5; d++)
    {
	    if($('#checkboxWizardAUresponsemode_' + d).is(":checked") == true) {
	    	response_mode |= (1<<d);
	    }
    }
    if($('#checkboxWizardAURampChangesInSource').is(":checked") == true) {
        response_mode |= RESPONSE_MODES_CHANGES_IN_SOURCE;
    }
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_RESP_MODE", pageObj.castVarValue("u1", response_mode));
    
    // Build array
    var AU_VWC_ARRAY = '[';
    var AU_VWD_ARRAY = '[';
    var AU_VVAR_ARRAY = '[';
    var AU_VVAR_P_ARRAY = '[';

    for (c = 0; c < 4; c++) {
    	AU_VWC_ARRAY += '"';
    	AU_VWD_ARRAY += '"';
    	AU_VVAR_ARRAY += '"';
    	AU_VVAR_P_ARRAY += '"';
    	AU_VWC_ARRAY += pageObjAU.castVarValue('u1', $('#GRIDCONFIGAU_VWC_VOLTAGE' + c).val());
    	AU_VWD_ARRAY += pageObjAU.castVarValue('u1', $('#GRIDCONFIGAU_VWD_VOLTAGE' + c).val());
    	AU_VVAR_ARRAY += pageObjAU.castVarValue('u1', $('#GRIDCONFIGAU_VVAR_VOLTAGE' + c).val());
        AU_VVAR_P_ARRAY += pageObjAU.castVarValue('i8', $('#GRIDCONFIGAU_VVAR_PERCENTAGE' + c).val());

        /* Add trailing commas if needed */
        if(c<3)
        {
        	AU_VWC_ARRAY += '",';
        	AU_VWD_ARRAY += '",';
        	AU_VVAR_ARRAY += '",';
        	AU_VVAR_P_ARRAY += '",';
        }
    }

    AU_VWC_ARRAY += '"]';
    AU_VWD_ARRAY += '"]';
    AU_VVAR_ARRAY += '"]';
    AU_VVAR_P_ARRAY += '"]';

    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VWC_VOLTAGE", AU_VWC_ARRAY);
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VWD_VOLTAGE", AU_VWD_ARRAY);
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VVAR_VOLTAGE", AU_VVAR_ARRAY);
    pageObjAU.add_property_to_object("GRIDCONFIG", "AU_VVAR_PERCENTAGE", AU_VVAR_P_ARRAY);


    pageObjAU.add_property_to_object("WIZARD", "CONFIG_MODIFIED_BY_USER", "u8_01");

    pageObjAU.singlePageRefresh();
}

function startWizardAU() {
    $(document).trigger("page.unload");

    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: './wizard.au.html',
        success: function(html) {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizardAUInit();
            console.log("wizardAU data has successfool loaded..");

            $('#modalWindow').modal('show');

            //check if senec is already configured
            if(parseInt($('#WIZARDCONFIG_LOADED').html()) <= 0) {
                alert(lng.WIZARD_GRID_ERROR_NEED_INITIAL_CONFIG);
                confwizardClose();
            }
        }
    });

    modal_input = 'modal_wizardAU';
}

var UpdateMode = {
    INIT: 0,
    REFRESH: 1
};

const RESPONSE_MODES_CHANGES_IN_SOURCE = 0b11110000000;

function confwizardAUUpdate(mode = UpdateMode.INIT) {    
    //update responsemode checkboxes
	// VoltWattCharge
    if (parseInt($("#GRIDCONFIGAU_RESP_MODE").html()) & (1<<0)){
    	$('#checkboxWizardAUresponsemode_' + 0).attr("checked", true);
    }
    else {
        $('#checkboxWizardAUresponsemode_' + 0).attr("checked", false);
        $('#AUVoltWattChargeValues').hide();
    }
    // VoltWattDischarge
    if (parseInt($("#GRIDCONFIGAU_RESP_MODE").html()) & (1<<1)){
    	$('#checkboxWizardAUresponsemode_' + 1).attr("checked", true);
    }
    else {
        $('#checkboxWizardAUresponsemode_' + 1).attr("checked", false);
        $('#AUVoltWattDischargeValues').hide();
    }
    // FreqIncreaseMode
    if (parseInt($("#GRIDCONFIGAU_RESP_MODE").html()) & (1<<2)){
    	$('#checkboxWizardAUresponsemode_' + 2).attr("checked", true);
    }
    else {
        $('#checkboxWizardAUresponsemode_' + 2).attr("checked", false);
    }
    // FreqDecreaseMode
    if (parseInt($("#GRIDCONFIGAU_RESP_MODE").html()) & (1<<3)){
    	$('#checkboxWizardAUresponsemode_' + 3).attr("checked", true);
    }
    else {
        $('#checkboxWizardAUresponsemode_' + 3).attr("checked", false);
    }
    // VoltVarMode
    if (parseInt($("#GRIDCONFIGAU_RESP_MODE").html()) & (1<<4)){
    	$('#checkboxWizardAUresponsemode_' + 4).attr("checked", true);
    }
    else {
        $('#checkboxWizardAUresponsemode_' + 4).attr("checked", false);
    }

    if (parseInt($("#GRIDCONFIGAU_RESP_MODE").html()) & RESPONSE_MODES_CHANGES_IN_SOURCE) {
        $('#checkboxWizardAURampChangesInSource').attr("checked", true);
    }
    else {
        $('#checkboxWizardAURampChangesInSource').attr("checked", false);
    }

    if(htmlAsNumber("#GRIDCONFIGAU_SOFT_RAMP_EN")) {
        $('#checkboxWizardAUSoftRampUp').attr("checked", true);
    }
    else {
        $('#checkboxWizardAUSoftRampUp').attr("checked", false);
    }

    $("#inputWizardAUTargetType").val(parseInt($("#GRIDCONFIGAU_TARGET_TY").html()));
    
    // When selecting different grid code (REFRESH), do not update field itself.
    if(mode == UpdateMode.INIT)
    {
        $("#inputWizardAULocalGridCode").val(parseInt($("#GRIDCONFIGAU_GRID_CODE").html()));
    }
    // Do not show manual options for AS4777 defaults and grid operators.
    var showManualOptions = ($('#inputWizardAULocalGridCode').val() == 0);

    toggleManualParameters(showManualOptions);
    TargetTypeUpdate(showManualOptions);
    RampUpdate(showManualOptions);
    updateAuGridConfigTooltips();
    VoltVarUpdate(showManualOptions);
    VoltWattChargeUpdate(showManualOptions);
    VoltWattDischargeUpdate(showManualOptions); 

}

// Show or hide cos(phi) mode details.
function TargetTypeUpdate(showManualOptions = true) {
    if(!showManualOptions) {
        $('.CosPhiFix, .CosPhiRamp').hide();
        return;
    }

	if($("#inputWizardAUTargetType").val() == 1){
		$('.CosPhiFix').show();
		$('.CosPhiRamp').hide();
	}
	else if($("#inputWizardAUTargetType").val() == 2){
		$('.CosPhiRamp').show();
		$('.CosPhiFix').hide();
	}
	else{
		$('.CosPhiFix').hide();
        $('.CosPhiRamp').hide();
	}
}

// Show or hide power rate limit details.
function RampUpdate(showManualOptions = true) {
    if(!showManualOptions) {
        $('#gradientInc, #gradientDec').hide();
        return;
    }
	if($('#checkboxWizardAUSoftRampUp').is(":checked") == true ||
       $('#checkboxWizardAURampChangesInSource').is(":checked") == true){
		$("#gradientInc").show();
	}
	else{
		$("#gradientInc").hide();
	}
	if($('#checkboxWizardAURampChangesInSource').is(":checked") == true &&
			htmlAsNumber("#isSteca") == 0){
        $("#gradientDec").show();
	}
	else{
        $("#gradientDec").hide();
	}
}

function VoltVarUpdate(showManualOptions = true) {
    if(!showManualOptions) {
        $('#AUVoltVarModeValues, .CosPhi').hide();
        return;
    }
	if($('#checkboxWizardAUresponsemode_4').is(":checked") == true &&
			(htmlAsNumber("#isSteca"))){
        $("#AUVoltVarModeValues").show();
        $(".CosPhi ").hide();
	}
	else{
        $("#AUVoltVarModeValues").hide();
        $(".CosPhi ").show();
        TargetTypeUpdate();
	}
}

function VoltWattChargeUpdate(showManualOptions = true) {
    if(!showManualOptions) {
    	$("#AUVoltWattChargeValues").hide();
        return;
    }
	if($('#checkboxWizardAUresponsemode_0').is(":checked") == true &&
			(htmlAsNumber("#isSteca"))){
        $("#AUVoltWattChargeValues").show();
	}
	else{
        $("#AUVoltWattChargeValues").hide();
	}
}

function VoltWattDischargeUpdate(showManualOptions = true) {
    if(!showManualOptions) {
    	$("#AUVoltWattDischargeValues").hide();
        return;
    }
	if($('#checkboxWizardAUresponsemode_1').is(":checked") == true &&
			(htmlAsNumber("#isSteca"))){
        $("#AUVoltWattDischargeValues").show();
	}
	else{
        $("#AUVoltWattDischargeValues").hide();
	}
}

// Show or hide manual grid code parameters.
function toggleManualParameters(show) {
    if(!show) {
        $('.manual_parameters').hide();
        return;
    }
    $('.manual_parameters').show();
    
    if(htmlAsNumber("#isSteca"))
	{
    	$('#AUFreqIncMode').hide();
    	$('#AUFreqDecMode').hide();
    	$('#AUSoftRampUp').hide();
    	$('#AURampChangesInEnergy').hide();
	}
    else
    {
    	$("#AUVoltVarModeValues").hide();
    	$("#AUVoltWattChargeValues").hide();
    	$("#AUVoltWattDischargeValues").hide();
    }
}

function updateAuGridConfigTooltips()
{
	for(var i = 0; i<4; i++)
	{
	    $('#GRIDCONFIGAU_VWC_VOLTAGE' + i).attr('title',"Min: " + htmlAsNumber("#GRIDCONFIGAU_VRR_MIN" + i) + " Max: " + htmlAsNumber("#GRIDCONFIGAU_VRR_MAX" + i));
	    $('#GRIDCONFIGAU_VWD_VOLTAGE' + i).attr('title',"Min: " + htmlAsNumber("#GRIDCONFIGAU_VRR_MIN" + i) + " Max: " + htmlAsNumber("#GRIDCONFIGAU_VRR_MAX" + i));
	    $('#GRIDCONFIGAU_VVAR_VOLTAGE' + i).attr('title',"Min: " + htmlAsNumber("#GRIDCONFIGAU_VRR_MIN" + i) + " Max: " + htmlAsNumber("#GRIDCONFIGAU_VRR_MAX" + i));
	    $('#GRIDCONFIGAU_VVAR_PERCENTAGE' + i).attr('title',"Min: " + htmlAsNumber("#GRIDCONFIGAU_VVAR_P_MIN" + i) + " Max: " + htmlAsNumber("#GRIDCONFIGAU_VVAR_P_MAX" + i));
	} 
}
