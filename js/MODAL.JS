/** Prevent JSHint warning about functions called from HTML sites. */
/* exported startWizard, confwizardNextPage, confwizardPrevPage, isValidFloat, send_login, showUserLevel, modal_getState, modal_setState, roundValue, login, logout, checkInstallerLogin, isInstallerUser, isLoggedIn, isProfessionalUser  */

//http://jsfiddle.net/sxGtM/3/ convert form data to JSON
var pageObj;
var modal_state;

var nTestSenecMeterResult = 0;
var nTestHeatpumpMeterResult = 0;
var nTestGenerationMeterResult = 0;

var installerauthenticated = false;
var installername;
var contractors;

const wizard_past_registration_page_numer = 4;
const wizard_last_page_number = 12;

function isValidDecimal(decimalstring) {
    var regEx = /^-?\d+$/;
    return decimalstring.match(regEx) != null;
}

function isValidFloat(floatstring) {
    var regEx = /^[-+]?[0-9]*\.?[0-9]+$/;
    return floatstring.match(regEx) != null;
}

function mySenecBaseURL() {
	if (htmlAsNumber("#WIZARDUSE_TESTSERVER") == 1) {
		return "mysenec-pg.senecops.com"; //"Playground"
	}
	return "mein-senec.de";
}

function isValidSenecNumber(senecstring) {
    // valid types:
    //SBPb30G2-00151-DE
    //SBPb30G2-02-00151-DE
    //DE-V2-01Li10-00001
    //SH5G100001
    //G2100001
    //DE-V2.1-01Li10-1234
    //DE-V2.1-01Li10-12345
    //DE-V3-H-01LI10-xxxxx
    //DE-V3-HD-01LI10-xxxxx
    //DE-V3-AC-01LI10-xxxxx
    var regExSB = /^\w{4}\d{2}[G]\d{1}[-]\d{5}[-]\w{2}$/;
    var regExSB_2 = /^\w{4}\d{2}[G]\d{1}[-]\d{2}[-]\d{5}[-]\w{2}$/;
    var regExDE = /^\w{2}[-][V]\d{1}[-]\d{2}\w{2}\d{2}[-]\d{5}$/;
    var regExSH = /^[S][H]\d+[G]\d{6}$/;
    var regExG2 = /^[G]\d{7}$/;
    var regExG21_4 = /^\w{2}[-][V]\d{1}[.]\d{1}[-]\d{2}\w{2}\d{2}[-]\d{4}$/;
    var regExG21_5 = /^\w{2}[-][V]\d{1}[.]\d{1}[-]\d{2}\w{2}\d{2}[-]\d{5}$/;
    var regExV3 = /^\w{2}[-][V]\d{1}[-]\w{1,2}[-]\d{2}\w{2}\d{2}[-]\d{5}$/;
    return (senecstring.match(regExSB) != null        ||
                senecstring.match(regExSB_2) != null  ||
                senecstring.match(regExDE) != null    ||
                senecstring.match(regExSH) != null    ||
                senecstring.match(regExG2) != null    ||
                senecstring.match(regExG21_4) != null ||
                senecstring.match(regExG21_5) != null ||
                senecstring.match(regExV3) != null);
}

function isValidEmail(email) {
    var sRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return sRegex.test(email);
}

function isValidIP(IPvalue) {
    errorString = "";

    var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    var ipArray = IPvalue.match(ipPattern);

    if (IPvalue == "255.255.255.255") {
        alert(IPvalue + lng.lNoValidIP);
        return false;
    }

    if (ipArray == null) {
        alert(IPvalue + lng.lNoValidIP);
        return false;
    }

    for (i = 0; i < 4; i++) {
        thisSegment = parseInt(ipArray[i]);

        if (thisSegment > 255) {
            alert(IPvalue + lng.lNoValidIP);
            return false;
        }
    }

    return true;
}

// Check whether value is in range {min...max}, including boundaries.
function isInRange(value, min, max)
{
    return value >= min && value <= max;
}

// Get HTML contents of first element in the set of matched elements
// and convert to integer. The jQuery object can be passed to make the
// function testable, it will overload the global object.
function htmlAsNumber(domObjectName, /* optional: */jQuery) {
    if(typeof jQuery == "undefined")
    {
        jQuery = $;
    }

    if(jQuery(domObjectName).length === 0 ||  isNaN(jQuery(domObjectName).html())) {
        return 0;
    }
    return parseFloat(jQuery(domObjectName).html());
}

function update_wizard_cb() {
    if (htmlAsNumber('#fullWizard')) {
        $('#WIZARDCONFIG_LOADED').html(0);
        userLevel = 6;
    }

    confwizardUpdate(); //IMPORTANT: update all values

    //check if initial wizard-config, and check for userlevel to filter wizard-pages
    var nConfigLoaded = ($('#WIZARDCONFIG_LOADED').html())*1;

    if(isSuperUser() == false) {
        if(nConfigLoaded != 1) { // initial configuration
            confwizardCurrentPage = 0;
            confwizardPageNumber = wizard_last_page_number;
            confwizardPagesShowed = 0;
            confwizardState = 0;
            $('#pnWizardCarouselPackageCheck').html(lng.lWizardPackageFirstRun);
        } else { // later configurations
            confwizardCurrentPage = wizard_past_registration_page_numer;
            confwizardPageNumber = wizard_last_page_number - 1;
            confwizardPagesShowed = 0;
            confwizardState = 0;
        }
    }
    else
    { //super-user configuration-mode
        confwizardCurrentPage = wizard_past_registration_page_numer;
        confwizardPageNumber = wizard_last_page_number - 1;
        confwizardPagesShowed = 0;
        confwizardState = 0;
    }

    $('#btnWizard_prev').hide();
}

function obj_init_wizard() {
    //create parent json object
    pageObj = new senecPage(update_wizard_cb);
    //add child object to parent object
    pageObj.add_json_object("WIZARD");
    pageObj.add_json_object("SYS_UPDATE"); //get system_info, especially senec.ies_internet_access_status
    pageObj.add_json_object("LOG"); //get login status of user
    pageObj.add_json_object("PWR_UNIT"); // Get PWR Unit data
    pageObj.add_json_object("GRIDCONFIG");
    pageObj.add_json_object("SOCKETS");
    pageObj.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_MAX_PWR_SKEW", "");
    pageObj.add_property_to_object("SOCKETS", "ENABLE", "");
    pageObj.singlePageRefresh();
}

var confwizardCurrentPage = 0;
var confwizardMode = 0;
var confwizardPagesShowed = 0;
var confwizardPageNumber = 0;
var confwizardMode = 0;
var confwizardState = 0;

/* All event handlers for checkboxes,dropdown and buttons are set here */
function confwizardInit(wizardMode) {
    confwizardMode = wizardMode;
    $('.carousel').carousel({
        interval: 0
    });

    $('#btnWizard_prev').hide();
    $('#btnWizard_close').hide();
    $('#WizardHeader').empty();

    if (wizardMode == 'edit')
    {
        $('#btnWizard_close').show();
        $('#btnWizard_next').hide();
        $('#confwizardStatus').text("Bitte warten...");
    }

// Describe event handler
    /* Enable entry-field for SENEC.meter serial number */
    $('#inputWizardSystemSetupSenecMeter').on('click', function() {
        if($('#inputWizardSystemSetupSenecMeter').prop('checked')) {
            $('#SenecMeter_Container').removeClass("d-hide").show();
        }
        else
        {
            $('#inputWizardSystemSetupSenecMeterSerial').val("0");
            nTestSenecMeterResult = 0;
            $("#inputWizardSenecMeterlTestResult").removeClass("successLabel errorLabel");
            $("#inputWizardSystemSetupSenecMeterSerial").removeClass("errorField");
            $("#inputWizardSystemSetupSenecMeterSerial").prop( "disabled", false );
            $('#SenecMeter_Container').addClass("d-hide").hide();
            // Reset Serial on MCU
            pageObj.reInitJSONObject();
            pageObj.add_json_object("WIZARD");
            pageObj.add_property_to_object("WIZARD", "SENEC_METER_SN", "u3_0");
            pageObj.singlePageRefresh();
            // Enable CheckButton
            $("#btnWizardSenecMeterStartTest").prop('disabled', false);
            $("#inputWizardSenecMeterlTestResult").html("Bitte Prüfung starten.");
        }
    });

    $('#inputWizardSystemSetupFeedInLimitOpt').on('change', function () {
	    switch(this.value){
	        default:
	        case "0":
	        {
	            $('#PowerRuleContainer').show();
	            $('#AbsolutePowerContainer').hide();
	            break;
	        }
	        case "1":
	        {
	            $('#PowerRuleContainer').hide();
	            $('#AbsolutePowerContainer').show();
	            break;
	        }
	    }
	    fillChargePrio($('#optWizardPU_Usage').val());
	});

    $('#inputWizardSystemSetupPowerRule').on('change', function () {
	    fillChargePrio($('#optWizardPU_Usage').val()); //do not do this in single wizards
	});
    $('#inputWizardSiteMaxFeedInPower').on('change', function () {
	    fillChargePrio($('#optWizardPU_Usage').val());
	});
    $('#inputWizardSiteMaxPVPower').on('change', function () {
	    fillChargePrio($('#optWizardPU_Usage').val());
	});

    /* Enable entry-field for Heatpump.meter serial number */
    $('#inputWizardSystemSetupHeatpumpMeter').on('click', function() {
        if($('#inputWizardSystemSetupHeatpumpMeter').prop('checked')) {
            $('#HeatpumpMeter_Container').removeClass("d-hide").show();
        }
        else
        {
            $('#inputWizardSystemSetupHeatpumpMeterSerial').val("0");
            nTestHeatpumpMeterResult = 0;
            $("#inputWizardHeatpumpMeterTestResult").removeClass("successLabel errorLabel");
            $("#inputWizardSystemSetupHeatpumpMeterSerial").removeClass("errorField");
            $("#inputWizardSystemSetupHeatpumpMeterSerial").prop( "disabled", false );
            $('#HeatpumpMeter_Container').addClass("d-hide").hide();
            // Reset Serial on MCU
            pageObj.reInitJSONObject();
            pageObj.add_json_object("WIZARD");
            pageObj.add_property_to_object("WIZARD", "HEATPUMP_METER_SN", "u3_0");
            pageObj.singlePageRefresh();
            // Enable CheckButton
            $("#btnWizardHeatpumpMeterStartTest").prop('disabled', false);
            $("#inputWizardHeatpumpMeterTestResult").html("Bitte Prüfung starten.");
        }
    });
    /* Enable entry-field for Generation.meter serial number */
    $('#inputWizardSystemSetupGenerationMeter').on('click', function() {
        if($('#inputWizardSystemSetupGenerationMeter').prop('checked')) {
            $('#GenerationMeter_Container').removeClass("d-hide").show();
        }
        else
        {
            $('#inputWizardSystemSetupGenerationMeterSerial').val("0");
            nTestGenerationMeterResult = 0;
            $("#inputWizardGenerationMeterlTestResult").removeClass("successLabel errorLabel");
            $("#inputWizardSystemSetupGenerationMeterSerial").removeClass("errorField");
            $("#inputWizardSystemSetupGenerationMeterSerial").prop( "disabled", false );
            $('#GenerationMeter_Container').addClass("d-hide").hide();
            // Reset Serial on MCU
            pageObj.reInitJSONObject();
            pageObj.add_json_object("WIZARD");
            pageObj.add_property_to_object("WIZARD", "GENERATION_METER_SN", "u3_0");
            pageObj.singlePageRefresh();
            // Enable CheckButton
            $("#btnWizardGenerationMeterStartTest").prop('disabled', false);
            $("#inputWizardGenerationMeterlTestResult").html("Bitte Prüfung starten.");
        }
    });

    $('#btnWizardSenecMeterStartTest').on('click', checkSenecMeterComm);
    $('#btnWizardHeatpumpMeterStartTest').on('click', checkHeatpumpMeterComm);
    $('#btnWizardGenerationMeterStartTest').on('click', checkGenerationMeterComm);

    /* We can measure Generation, production or neither but not both. */
    $('#inputWizardSystemSetupPowerMeterConsumer').on('click', function() {
      if ($('#inputWizardSystemSetupPowerMeterConsumer').prop('checked')) {
        $('#inputWizardSystemSetupPowerMeterProducer').prop('checked', false);
        $('#inputWizardSystemSetupPowerMeterNone').prop('checked', false);
      }
    });

    $('#inputWizardSystemSetupPowerMeterProducer').on('click', function() {
      if ($('#inputWizardSystemSetupPowerMeterProducer').prop('checked')) {
        $('#inputWizardSystemSetupPowerMeterConsumer').prop('checked', false);
        $('#inputWizardSystemSetupPowerMeterNone').prop('checked', false);
      }
    });

    $('#inputWizardSystemSetupPowerMeterNone').on('click', function() {
        if ($('#inputWizardSystemSetupPowerMeterNone').prop('checked')) {
          $('#inputWizardSystemSetupPowerMeterConsumer').prop('checked', false);
          $('#inputWizardSystemSetupPowerMeterProducer').prop('checked', false);
        }
      });

    /* Grid Connection. */
    $('#inputWizardSystemSetupGridConnectionSinglePhase').on('click', function() {
      if ($('#inputWizardSystemSetupGridConnectionSinglePhase').prop('checked')) {
        $('#inputWizardSystemSetupGridConnectionMultiPhase').prop('checked', false);
        $(".inputInverterPhaseSelection").addClass("d-hide").hide();
        $('#img_phase_selection').removeClass("d-hide").show();
        $('#img_phase_selection').removeClass("img_clip_icon_multiphase");
        $('#img_phase_selection').addClass("img_clip_icon_singlephase");
      }
    });

    $('#inputWizardSystemSetupGridConnectionMultiPhase').on('click', function() {
      if ($('#inputWizardSystemSetupGridConnectionMultiPhase').prop('checked')) {
        $('#inputWizardSystemSetupGridConnectionSinglePhase').prop('checked', false);
        $(".inputInverterPhaseSelection").removeClass("d-hide").show();
        $('#img_phase_selection').removeClass("d-hide").show();
        $('#img_phase_selection').removeClass("img_clip_icon_singlephase");
        $('#img_phase_selection').addClass("img_clip_icon_multiphase");
      } else {$(".inputInverterPhaseSelection").addClass("d-hide").hide();}
    });

    $('#checkboxWizardExternalPV').on('click', function() {
        if ($('#checkboxWizardExternalPV').prop('checked')) {
          $("#ExternalPVContainer").removeClass("d-hide").show();
          $("#inputWizardSystemSetupInvManufacturer").val(0x00);
        } else {$("#ExternalPVContainer").addClass("d-hide").hide();}
      });

    // set event handler for pv-inverter-count selection
    $("#optWizardPvInverterCount").on('change', function() {
        //get selected count and show pv-inverters ---------
        //first hide all pv-inverters
        for(var i=0;i < 6;i++) {
            $("#pnWizardPVInverter" + i + "Container").addClass("d-hide");
        }
        //show pv-inverters according to pv-inverter-count
        var nCount = parseInt($(this).val());

        for(var j=0;j < nCount;j++) {
            // display all pv-inverters from 1 to selected count
            $("#pnWizardPVInverter" + j + "Container").removeClass("d-hide").show();
        }
    });

    // set event handler for wallbox-count selection
    $("#optWizardWallboxCount").on('change', function() {
        //get selected count and show wollboxes ---------
        //first hide all wallboxes
        for(var i=0;i < 4;i++) {
            $("#pnWizardWallbox" + i + "Container").addClass("d-hide");
        }
        //show wallboxes according to wallbox-count
        var nCount = parseInt($(this).val());
        for(var j=0;j < nCount;j++) {
            // display all wallboxes from 1 to selected count
            $("#pnWizardWallbox" + j + "Container").removeClass("d-hide").show();
        }
    });

    //set event handler for pwr-unit-count selection
    $("#optWizardPwrUnitCount").on('change', function() {
        //get selected count and show pwr_units ---------
          var nCount = parseInt($(this).val());
        //first hide all pwr_units
        for(var i=0;i < 6;i++) {
            $("#pnWizardPWRUnit" + i + "Container").addClass("d-hide");
            // Show fields depening on selected number
            if (nCount-1 >= i) {
            $("#pnWizardPWRUnit" + i + "Container").removeClass("d-hide").show();
            }
            // Deactivate power units which are not shown
            if (nCount-1 < i) {
            $("#inputWizardSystemSetupPowerUnit" + i + "Model").val(0);
            }
        }
        if (nCount === 0) {
            $('#optWizardChargePrio').empty();
            $("#optWizardChargePrio").append('<option value="3">' + lng.lWizardChargePrio4 + '</option>');
            $('#optWizardChargePrio').val(3);
        }
    });

    /*jshint ignore:start*/
    //set event handler for pwr-unit model selection
    for(let x = 0; x < 6; x++)
    {
        $("#inputWizardSystemSetupPowerUnit" + x + "Model").on('change', function() {
            //get selected count and show pwr_units ---------
            var model = parseInt($(this).val());
            //first hide all pwr_units
            if (model == 1) //Only SHKW
            {
                $("#gui_pwr_unit_enfluri" + x + "_container").removeClass("d-hide").show();
            }
            else
            {
                $("#gui_pwr_unit_enfluri" + x + "_container").addClass("d-hide").hide();
            }
            }
        );
    }
    /*jshint ignore:end*/

    //set event handler for master/slave type selection
    $('#inputWizardMasterSlaveMode').on('change', function()
    {
        // Kaskadiert als Master
      if ($('#inputWizardMasterSlaveMode').val() == 1) {
        $(".for_master_only").show();
        $("#lbl_slave_address0").html(lng.lWIZARD_ADDR_1);
        $(".master_setup_only").show();
        $(".for_master_and_slave").show();
      }
        // Kaskadiert als Slave
      else if ($('#inputWizardMasterSlaveMode').val() == 2) {
        $("#lbl_slave_address0").html(lng.lWIZARD_ADDR_SLAVE);
        $(".for_master_only").hide();
        $(".master_setup_only").hide();
        $(".for_master_and_slave").show();
      }
      else {
          // Keine Kaskadierung
        $(".for_master_only").hide();
        $(".master_setup_only").show();
        $(".for_master_and_slave").hide();
      }
    });

    $("#inputWizwardSlaveCountSelect").on('change', function () {
        // Hide all
        for (c = 2; c <= 6; c++)
        {
               $(".slave" + c + "container").hide();
        }
        for (c = 2; c <= $("#inputWizwardSlaveCountSelect").val(); c++)
        {
               $(".slave" + c + "container").show();
        }
        // Show warning, if someone configures more than 4 slaves
        if ($("#inputWizwardSlaveCountSelect").val() > 4)
            $("#warningSlaveNum").removeClass("hidden").show();
        else
            $("#warningSlaveNum").hide();
    });

    //set event handler for check button on feature package page
    $("#btnWizardCheckCode").click(function(){
        var MCU_serial = "S" + $("#FACTORYDEVICE_ID").html();
        var user_name = $("#LOGUSERNAME").html();
        console.info("Request started with username: " + user_name);
        $.post("https://" + mySenecBaseURL() + "/anlagehub/addon/aktivierungscodePruefen",
            {aktivierungscode: $("#inputWizardPackageCode").val(),
            steuereinheitnummer: MCU_serial,
            aktivierungsbenutzer: user_name},
            function(data, status){
                console.log("Request-Status: "+ status);
                if (data.status == "OK")
                    {
                       // Display package name and validity
                       $("#lblWizardPackageInfo").html(data.paketName);

                       // Disable code field
                       $("#inputWizardPackageCode").prop('disabled', true);
                       $("#inputWizardPackageCode").removeClass("errorField");
                       // Display checkin button
                       $("#btnWizardConfirmCode").removeClass("d-hide").show();
                       // Disable check button
                       $("#btnWizardCheckCode").prop('disabled', true);
                    }
                else
                    {
                       alert(lng[data.status]);
                       $("#inputWizardPackageCode").addClass("errorField");
                    }
                $("#inputWizardPackageCheckResult").text(lng[data.valid]);
                //data.paketSchluessel
        });
    });

    //set event handler for confirm button on feature package page
    $("#btnWizardConfirmCode").click(function(){
        var MCU_serial = "S" + $("#FACTORYDEVICE_ID").html();
        var user_name = $("#LOGUSERNAME").html();
        console.info("Request started with username: " + user_name);
        $.post("https://" + mySenecBaseURL() + "/anlagehub/addon/aktivierungscodeEinloesen",
            {aktivierungscode: $("#inputWizardPackageCode").val(),
            steuereinheitnummer: MCU_serial,
            aktivierungsbenutzer: user_name},
            function(data, status){
                console.log("Request-Status: "+ status);
                if (data.status == "OK")
                    {
                    // Display package name and validity
                       $("#lblWizardPackageInfo").html(data.paketName);
                       $("#inputWizardPackageCheckResult").text(lng["confirmed"]);
                       alert("Sie haben den Code: " + $("#inputWizardPackageCode").val() + " erfolgreich eingelöst!");
                       IndexPageObj.handleButtonClick("WIZARD", "FEATURECODE_ENTERED");

                       // Disable Checkin button
                       $("#btnWizardConfirmCode").prop('disabled', true);
                    }
                else
                    {
                       alert(lng[data.status]);
                       $("#inputWizardPackageCode").addClass("errorField");
                       $("#inputWizardPackageCheckResult").text(lng[data.valid]);
                    }
        });
    });

    $("#inputWizardNetworkuseDHCP").on('change', function()
    {
       if($('#inputWizardNetworkuseDHCP').prop('checked') == true)
       {
           $(".no_dhcp").attr("disabled", true);
           $('#noDHCPcontainer').addClass("d-hide").hide();
       } else {
           $(".no_dhcp").attr("disabled", false);
           $('#noDHCPcontainer').removeClass("d-hide").show();
       }
    });

    $("#inputWizardSystemSetupuseRCR").on('change', function()
    {
       if($('#inputWizardSystemSetupuseRCR').prop('checked') == true)
       {
           $('#RCRcontainer').removeClass("d-hide").show();
       } else {
           $('#RCRcontainer').addClass("d-hide").hide();
       }
    });

    // Get data via JSON and update all values
    obj_init_wizard();

    //jump to selected first page
    $('.carousel').carousel(confwizardCurrentPage);

	//set urls to current setting
	document.getElementById('senecURLhref').setAttribute("href",'http://' + mySenecBaseURL());
	document.getElementById('senecURLdisplay').replaceWith('www.' + mySenecBaseURL());
	document.getElementById('fmWizardInstallationConfirmation').action = 'https://' + mySenecBaseURL() + '/sps/sps_public/G2P/wizard/app/controllers/senec_wizard_installation_confirmation.php';
}

/* Update values by JSON variables */
function confwizardUpdate() {
/* Page 1 */
    if (htmlAsNumber("#WIZARDSETUP_AGBS_ACCEPTED") == 1)
    {
        $('#inputWizardAGBsAccepted').attr("checked", true);
    }
    else
    {
        $('#inputWizardAGBsAccepted').attr("checked", false);
    }

/* Master Slave Page */
	// Update Select
	$('#inputWizardMasterSlaveMode').val(htmlAsNumber("#WIZARDMASTER_SLAVE_MODE"));

	// Handle number of slaves if configured as master
	if (htmlAsNumber("#WIZARDMASTER_SLAVE_MODE") == 1) {
		/* Count Valid Slaves */
		var slavecount = 0;
		for (var c = 0; c < 6; c++)
		{
		    if(($("#WIZARDMASTER_SLAVE_ADDRESSES" + c).val() * 1) != 0)
		            slavecount++;
	    }

		/* In italy we only allow 2 slaves */
		if(htmlAsNumber("#FACTORYCOUNTRY") == 1 && slavecount > 2)
		{
			$("#inputWizwardSlaveCountSelect").val(2);
		}
		else
		{
			$("#inputWizwardSlaveCountSelect").val(slavecount);
	    }
	}

	$('#inputWizardMasterSlaveMode').trigger('change');

	// Check if italy
	if(htmlAsNumber("#FACTORYCOUNTRY") == 1)
	{
		$('#inputWizardBufferPowerConfuseMaxPowerSkew').attr('checked', false);
		$('.ExcludeItaly').hide();
		$("#inputWizwardSlaveCountSelect").empty();
		$("#inputWizwardSlaveCountSelect").append('<option value="1">1</option><option value="2">2</option>');
	}

    // Hide unused slave address fields
	$("#inputWizwardSlaveCountSelect").trigger('change');

/* Grid Config Page */
    /* Initial configuration */
    if (htmlAsNumber("#WIZARDCONFIG_LOADED") == 0)
    {
        $('#inputWizardSystemSetupPowerMeterConsumer').prop('checked', false);
        $('#inputWizardSystemSetupPowerMeterProducer').prop('checked', false);
        $('#inputWizardSystemSetupPowerMeterNone').prop('checked', false);
    }
    else if (htmlAsNumber("#WIZARDDEVICE_PM_HOUSE_ENABLED") == 1) {
        /* Second power meter with address 2 measures consumers while address 3 measures producers. */
        $('#inputWizardSystemSetupPowerMeterConsumer').prop('checked', $('#WIZARDSETUP_PM_HOUSE_ADR').val() == 2);
        $('#inputWizardSystemSetupPowerMeterProducer').prop('checked', $('#WIZARDSETUP_PM_HOUSE_ADR').val() == 3);
        $('#inputWizardSystemSetupPowerMeterNone').prop('checked', false);
    }
    else
    {
        $('#inputWizardSystemSetupPowerMeterConsumer').prop('checked', false);
        $('#inputWizardSystemSetupPowerMeterProducer').prop('checked', false);
        $('#inputWizardSystemSetupPowerMeterNone').prop('checked', true);
    }

    // SENEC.meter
    $("#inputWizardSystemSetupSenecMeterSerial").val($("#WIZARDSENEC_METER_SN").html());
    // If Senec.meter is configured, just check it now
    if($('#inputWizardSystemSetupSenecMeterSerial').val() != "0")
    {
        $('#inputWizardSystemSetupSenecMeter').attr('checked', true);
        $('#SenecMeter_Container').removeClass("d-hide").show();
        checkSenecMeterComm();
    }
    else
    {
        $('#inputWizardSystemSetupSenecMeter').attr('checked', false);
    }
    // Heatpump.meter
    $("#inputWizardSystemSetupHeatpumpMeterSerial").val($("#WIZARDHEATPUMP_METER_SN").html());
    // If Heatpump.meter is configured, just check it now
    if($('#inputWizardSystemSetupHeatpumpMeterSerial').val() != "0")
    {
        $('#inputWizardSystemSetupHeatpumpMeter').attr('checked', true);
        $('#HeatpumpMeter_Container').removeClass("d-hide").show();
        checkHeatpumpMeterComm();
    }
    else
    {
        $('#inputWizardSystemSetupHeatpumpMeter').attr('checked', false);
    }
    // Generation.meter
    $("#inputWizardSystemSetupGenerationMeterSerial").val($("#WIZARDGENERATION_METER_SN").html());
    // If Generation.meter is configured, just check it now
    if($('#inputWizardSystemSetupGenerationMeterSerial').val() != "0")
    {
        $('#inputWizardSystemSetupGenerationMeter').attr('checked', true);
        $('#GenerationMeter_Container').removeClass("d-hide").show();
        checkGenerationMeterComm();
    }
    else
    {
        $('#inputWizardSystemSetupGenerationMeter').attr('checked', false);
    }

    if(htmlAsNumber('#WIZARDGRID_CONNECTION_TYPE') == 1) {
        $('#inputWizardSystemSetupGridConnectionSinglePhase').trigger('click');
    }
    else if (htmlAsNumber('#WIZARDGRID_CONNECTION_TYPE') == 2)
    {
        $('#inputWizardSystemSetupGridConnectionMultiPhase').trigger('click');
    }

    fillInverterPhaseSelection();

/* PV Config Page */

    $('#inputWizardSiteMaxPVPower').val(parseFloat($("#WIZARDPWRCFG_PEAK_PV_POWER").html()));
    $('#inputWizardSiteMaxFeedInPower').val(parseFloat($("#WIZARDSETUP_ABS_POWER").html()));
    $("#inputWizardSystemSetupFeedInLimitOpt").val(htmlAsNumber("#WIZARDSETUP_USE_ABS_POWER"));
    $('#inputWizardSystemSetupPowerRule').val(htmlAsNumber("#WIZARDSETUP_POWER_RULE"));
    $("#inputWizardSystemSetupFeedInLimitOpt").trigger('change');

    /* Decode inverter manufacturer and type. */
    var InverterEnum = htmlAsNumber("#WIZARDDEVICE_INVERTER_TYPE");

    $('#inputWizardSystemSetupInvManufacturer').val(InverterEnum >> 4); // Select Manufacturer
    fillInverterTypeList(InverterEnum >> 4); // Fill Models
    $("#inputWizardSystemSetupInverterType").val(InverterEnum & 0xF); // Select Model

    // IP or RS485?
    fillInverterTypeAdressLabel($("#inputWizardSystemSetupInverterType").val());

    //IMPORTANT: refresh number of selected pv-inverters
    var nCount = 0;
    for(var i=0; i < 6; i++) {
        // Update PV IP Fields
        $("#WIZARDDEVICE_INV_IP" + i).val(pageObj.num2do($("#WIZARDSETUP_PV_INV_IP" + i).html()));

        //first hide all pv-inverters
        $("#pnWizardPVInverter" + i + "Container").addClass("d-hide");

        // Show enabled PV_inverter units
        if(($("#WIZARDDEVICE_INV_ENABLED" + i).val() * 1) == 1) {
            // display all pv-inverters from 1 to selected count
            $("#pnWizardPVInverter" + i + "Container").removeClass("d-hide").show();
            nCount++;
        }
    }
    // Update number of inverter/units field
    $("#optWizardPvInverterCount").val(nCount);

    // Check if internal PV inverter is available
    if(htmlAsNumber("#isSteca"))
	{
    	if((InverterEnum == 0xA0) || (htmlAsNumber("#WIZARDCONFIG_LOADED") == 0))
		{
    		$('#checkboxWizardExternalPV').attr('checked', false);
		}
        else
        {
        	$('#checkboxWizardExternalPV').attr('checked', true);
    		$("#ExternalPVContainer").removeClass("d-hide").show();
        }
	}
    else
    {
    	$('#checkboxWizardExternalPV').attr('checked', true);
    	$('.steca').addClass("hide");
		$("#ExternalPVContainer").removeClass("d-hide").show();
    }

    /* Wallbox Config Page */
    //IMPORTANT: refresh number of selected wallboxes
    let Wallbox_nCount = 0;
    for(let wi=0; wi < 4; wi++) {
        //first hide all wallboxes
        $("#pnWizardWallbox" + wi + "Container").addClass("d-hide");

        // Show enabled wallboxes
        if(wi < ($("#WIZARDSETUP_NUMBER_WALLBOXES").val() * 1)) {
            // display all pv-inverters from 1 to selected count
            $("#pnWizardWallbox" + wi + "Container").removeClass("d-hide").show();
            Wallbox_nCount++;
        }
    }
    // Update number wallboxes
    $("#optWizardWallboxCount").val(Wallbox_nCount);
    // Show Current Limit by Grid
    $("#optWizardWallboxMaxTotalGrid").val($("#WIZARDSETUP_WALLBOX_MAX_TOTAL_CURRENT_BY_GRID").val() || 0);
    // Handle Wallbox Serials
    for(let wi=0; wi < Wallbox_nCount; wi++){
        let serial_string = $("#WIZARDSETUP_WALLBOX_SERIAL" + wi).val();
        $("#wizardWallboxSerial" + wi).val(serial_string.slice(6));
        $("#WIZARDSETUP_WALLBOX_TYPE" + wi).val(serial_string.slice(0, 6));
    }

/* PU Config Page */

    // Update Charge Prio for Power Unit
    $('#optWizardChargePrio').val(htmlAsNumber('#WIZARDCHARGE_PRIO'));

    PWR_UNIT_update_total_power();

    var PWR_UNIT_nCount = 0;
    for(var pu_id=0; pu_id < 6; pu_id++) {
        // Update PU Types
        $('#inputWizardSystemSetupPowerUnit' + pu_id + 'Model').val($('#PWR_UNITTYPE' + pu_id).html());
        $('#inputWizardSystemSetupPowerUnit' + pu_id + 'TempCount').val(htmlAsNumber('#PWR_UNITTEMP_COUNT' + pu_id));
        $('#inputWizardSystemSetupPowerUnit' + pu_id + 'Model').trigger('change');

        //first hide all PWR_units
        $("#pnWizardPWRUnit" + pu_id + "Container").addClass("d-hide");

        // Show enabled PWR Units
        if(htmlAsNumber("#PWR_UNITTYPE" + pu_id) >= 1) {
            // display all pv-inverters from 1 to selected count
            $("#pnWizardPWRUnit" + pu_id + "Container").removeClass("d-hide").show();
            PWR_UNIT_nCount++;
        }

        // Update enfluri checkboxes
        console.log($("#PWR_UNITENFLURI"+ pu_id).val());
        $("#gui_pwr_unit_enfluri"+ pu_id).val($("#PWR_UNITENFLURI"+ pu_id).val());
    }

    // Update preselected count
    $("#optWizardPwrUnitCount").val(PWR_UNIT_nCount);

    // Fill select depending on eg-configuration
    fillPUconnectionType(PWR_UNIT_nCount);

    // Display temp Max/Min fields if necessary
    showPUtempContainer();

/* Add. Config Page */
    if (htmlAsNumber("#GRIDCONFIGPWRCFG_USE_MAX_PWR_SKEW") == 1)
    {
        $('#inputWizardBufferPowerConfuseMaxPowerSkew').attr("checked", true);
    }
    else {
        $('#inputWizardBufferPowerConfuseMaxPowerSkew').attr("checked", false);
    }

    if (htmlAsNumber("#WIZARDSETUP_USE_RCR") == 1) {

        $('#inputWizardSystemSetupuseRCR').attr("checked", true);
        $('#RCRcontainer').removeClass("d-hide").show();
    }
    else {
        $('#inputWizardSystemSetupuseRCR').attr("checked", false);
    }

    if (htmlAsNumber("#WIZARDUSE_TESTSERVER") == 1) {

        $('#inputWizardUseSettingsUrl').attr("checked", true);
    }
    else {
        $('#inputWizardUseSettingsUrl').attr("checked", false);
    }

    $('#inputWizardSystemSetupBatteryManufacturer').val($('#WIZARDDEVICE_BATTERY_TYPE').html());
    $('#inputWizardSystemSetupPowerMeterType').val($('#WIZARDDEVICE_PM_TYPE').html());

    if (htmlAsNumber("#WIZARDNET_SENEC_USE_DHCP") == 1) {

        $('#inputWizardNetworkuseDHCP').attr("checked", true);
        $(".no_dhcp").attr("disabled", true);
    }
    else {
        $('#inputWizardNetworkuseDHCP').attr("checked", false);
        $('#noDHCPcontainer').removeClass("d-hide").show();
        $(".no_dhcp").attr("disabled", false);
    }

    $("#inputWizardNetworkstaticIP_Adr").val(pageObj.num2do($("#WIZARDNET_SENEC_STATIC_IP").html()));
    $("#inputWizardNetworkNetworkMask").val(pageObj.num2do($("#WIZARDNET_NETWORK_MASK").html()));
    $("#inputWizardNetworkGateWayIP").val(pageObj.num2do($("#WIZARDNET_GATEWAY_IP").html()));
    $("#inputWizardNetworkDNS_Server_IP").val(pageObj.num2do($("#WIZARDNET_DNS_SERVER_IP").html()));
    $("#inputWizardNetworkSenecServerIP").val(pageObj.num2do($("#WIZARDNET_SENEC_SERVER_IP").html()));

/* Initial Confirmation Page */
    // Check Lithium variable
    if (htmlAsNumber('#isLithium') == 1)
    {
      $('#chkWizardInstallerRegConfirmKnowledge').attr("checked", true);
      $('#chkWizardInstallerRegConfirmKnowledge').hide();
      $('#chkWizardInstallerRegConfirmAccuFull').attr("checked", true);
      $('#chkWizardInstallerRegConfirmAccuFull').hide();
      $('#chkWizardInstallerRegConfirmElectr').attr("checked", true);
      $('#chkWizardInstallerRegConfirmElectr').hide();
      $('#chkWizardInstallerRegConfirmDensity').attr("checked", true);
      $('#chkWizardInstallerRegConfirmDensity').hide();

      $('#lblWizardInstallerRegConfirmDensity').hide();
      $('#lblWizardInstallerRegConfirmElectr').hide();
      $('#lblWizardInstallerRegConfirmKnowledge').hide();
      $('#lblWizardInstallerRegConfirmAccuFull').hide();

      $('#lblConfirmAccuPole').html(lng.lConfirmAccuPole);
    }

/* Global */
    // Check if MCU2/NPU
    if(htmlAsNumber('#FACTORYSYS_TYPE') >= 9)
    {
        $('#DHCPcontainer').addClass("d-hide");
        $('#inputWizardNetworkuseDHCP').attr("checked", true);
    }
    /* BMZ */
    if(htmlAsNumber('#FACTORYSYS_TYPE') >= 15)
    {
        $('#lblWizardInstallerRegConfirmAccuPole').hide();
        $('#chkWizardInstallerRegConfirmAccuPole').attr("checked", true);
    }

    // Check Country Setting and Feature Allowance
    if(htmlAsNumber("#FACTORYCOUNTRY") != 0 || // Not Germany
       htmlAsNumber("#FEATURESCLOUDREADY") == 0)
    { // Feature not allowed
        $('.cloud-container').hide();
        $("#inputWizardSystemSetupSenecMeterSerial").val(0);
        $('#inputWizardSystemSetupHeatpumpMeterSerial').val(0);
        $("#inputWizardSystemSetupGenerationMeterSerial").val(0);
        $('#inputWizardSystemSetupSenecMeter').attr('checked', false);
        $('#inputWizardSystemSetupHeatpumpMeter').attr('checked', false);
        $('#inputWizardSystemSetupGenerationMeter').attr('checked', false);
    }

    // Check if germany
    if(htmlAsNumber("#FACTORYCOUNTRY") == 0)
    {
        $('#inputWizardSystemSetupGridConnectionMultiPhase').attr('checked', true);
        $('.PhaseSelectionContainer').hide();
        $(".inputInverterPhaseSelection").removeClass("d-hide").show();
    }

    $('#confwizardStatus').empty();
    $('#btnWizard_next').show();

}

function confwizardNextPage() {
    if (htmlAsNumber('#fullWizard')) {
        $('#WIZARDCONFIG_LOADED').html(0);
        userLevel = 6;
    }
    //Important: check for initial configuration, if not then dont show registration-confirmation-page !!!
    var nConfigLoaded = ($('#WIZARDCONFIG_LOADED').html())*1;

    if((nConfigLoaded != 0) || isSuperUser()){ // not initial config
            confwizardPageNumber = wizard_last_page_number - 1; //increase max pagenumber, to show extended settings
    }

    var currentCarouselPage = $('#pnWizardCarouselInner div.active'); //get current / active carousel to render view of next page

    //normal state
    if (confwizardCurrentPage < (confwizardPageNumber - 1)) {
        // checkWizardValues returns 1 when a page was configured correct
        if (checkWizardValues(confwizardCurrentPage) == 1) {
            //check for certain wizard pre-pages and set data for fields (preprocessing)
            switch(currentCarouselPage.attr("id")) {
                case "pnWizardCarouselEula":
                    //IMPORTANT: reset passwort fields, to avoid js-bugs
                    $("#txtWizardInstallerPassword").val("");
                    //Set "Next" Button to "Login"
                    $('#btnWizard_next').text(lng.Check);
                    confwizardCurrentPage++;
                    break;
                case "pnWizardCarouselInstallerData":
                	if(installerauthenticated)
            		{
                		if($('#btnWizard_next').text() == lng.Check)
            			{
                			$('#btnWizard_next').text(lng.Next);
            			}
                		else
            			{
                			confwizardCurrentPage++;
            			}
            		}
                	break;
                case "pnWizardCarouselConfigStandard":
                    // Check if configured as slave
                    if($("#inputWizardMasterSlaveMode").val() == 2)
                        {
                            // Dont show master pages
                            confwizardCurrentPage = confwizardCurrentPage + 4;
                            // Skip extended settingspage if not super user
                            if(isSuperUser() == false)
                        	{
                            	confwizardCurrentPage = confwizardCurrentPage + 1;
                        	}
                        }
                        else
                        {
                            // Check if any Enfluri Configuration was selected
                            if(($("#inputWizardSystemSetupPowerMeterConsumer").is(":checked") == true) ||
                               ($("#inputWizardSystemSetupPowerMeterProducer").is(":checked") == true))
                            {
                                // Skip PV page
                                confwizardCurrentPage = confwizardCurrentPage + 2;

                                if(htmlAsNumber("#FEATURESHEAT") == 0 &&
                                   htmlAsNumber("#FEATURESCAR") == 0)
                                {
                                    // Skip PU and wallbox page
                                    confwizardCurrentPage = confwizardCurrentPage + 2;
                                }
                                else if(htmlAsNumber("#FEATURESHEAT") == 1 &&
                                        htmlAsNumber("#FEATURESCAR") == 0){
                                    // Skip just the wallbox page
                                    confwizardCurrentPage++;
                                }
                            }
                            else
                            {
                                confwizardCurrentPage++;
                            }
                        }
                    break;
                case "pnWizardCarouselConfigSystem":
                    // Check for wallbox feature
                    if(htmlAsNumber("#FEATURESHEAT") == 0 &&
                       htmlAsNumber("#FEATURESCAR") == 0)
                    {
                        // Skip PU and wallbox page
                        confwizardCurrentPage = confwizardCurrentPage + 3;
                    }
                    else if(htmlAsNumber("#FEATURESHEAT") == 1 &&
                            htmlAsNumber("#FEATURESCAR") == 0){
                        // Skip just the wallbox page
                        confwizardCurrentPage = confwizardCurrentPage + 2;
                    }
                    else{
                        confwizardCurrentPage++;
                    }
                    break;
                case "pnWizardCarouselConfigWallbox":
                    if(htmlAsNumber("#FEATURESHEAT") == 0){
                        // Skip PU Page
                        confwizardCurrentPage = confwizardCurrentPage + 2;
                    }
                    else{
                        confwizardCurrentPage++;
                    }
                    break;
                default:
                    confwizardCurrentPage++;
                    break;
            }
            //Change next button on last page
            if (confwizardCurrentPage == (confwizardPageNumber - 1))
                    $('#btnWizard_next').text(lng.Check);

            $('.carousel').carousel(confwizardCurrentPage);

            confwizardResetErrorFields();
            confwizardPagesShowed++;

            $('#WizardHeader').empty();
            $('#WizardHeader').append('<h3>' + lng["lSetupConfigWizard"] + ' ' + (confwizardPagesShowed + 1) + '</h3>');
        }
        confwizardState = 0;
    } //last page of wizard reached
    else if (confwizardCurrentPage == (confwizardPageNumber - 1) && confwizardState == 0) {
        if(checkWizardValues(confwizardCurrentPage) == 1) {
            //confirm to save data
            $('#btnWizard_next').text(lng["Save"]);

            confwizardState = 1;
        }
    }
    else if ((confwizardCurrentPage == (confwizardPageNumber - 1)) && confwizardState == 1) {
        //send wizard data
        $('#btnWizard_prev').hide();
        sendwizardPage();
        $('#btnWizard_next').text(lng["Close"]);

        confwizardState = 2;
    }
    else if ((confwizardCurrentPage == (confwizardPageNumber - 1)) && confwizardState == 2) {
        //close wizard
        confwizardClose();
    }

    if (confwizardCurrentPage == 0) {
        $('#btnWizard_prev').hide();
    }
    else if(confwizardState < 1){
        $('#btnWizard_prev').show();
    }
    else {
        $('#btnWizard_prev').hide();
    }

    // Update Current Page
    currentCarouselPage = $('#pnWizardCarouselInner div.active');
    //check for certain wizard pages and set data for fields
    switch(currentCarouselPage.attr("id")) {
        case "pnWizardCarouselInstallerData":
            confwizardCheckInternetConnection();
            break;
        case "pnWizardCarouselConfigExtended":
            //if superuser then show more extended settings
            if(isSuperUser()) {
                $("#extended_su_container").removeClass("d-hide");
                $("#extended_su_container").show();
                $("#pnWizardNetworkSenecExtended").removeClass("d-hide");
                $("#pnWizardNetworkSenecExtended").show();
            }
            break;
        case "pnWizardCarouselRegistration":
            //set installer data fields
            $("#lblWizardInstallerEmail").val($("#txtWizardInstallerEmail").val());
            $("#lblWizardInstallerPassword").val($("#txtWizardInstallerPassword").val()); //save installer password
            $("#lblWizardInstallerContractor").val($("#inputWizardCONTRACTOR").val());

            //Display Name on last page
            $("#lblWizardInstallerName").html(installername);

            //set customer data fields
            $("#lblWizardCustomerName").val($("#txtWizardOwner_Name").val());
            $("#lblWizardCustomerSurname").val($("#txtWizardOwner_Surname").val());
            $("#lblWizardCustomerStreet").val($("#txtWizardOwner_Street").val());
            $("#lblWizardCustomerHouseNumber").val($("#txtWizardOwner_HouseNumber").val());
            $("#lblWizardCustomerPostalCode").val($("#txtWizardOwner_PostalCode").val());
            $("#lblWizardCustomerCity").val($("#txtWizardOwner_City").val());
            $("#lblWizardCustomerCountry").val($("#inputWizardOWNER_COUNTRY").val());
            $("#lblWizardCustomerEmail").val($("#txtWizardOwner_Email").val());
            $("#lblWizardCustomerPhoneNumber").val($("#txtWizardOwner_Phone").val());

            //set site data fieldslblWizardCustomerCountry
            $("#lblWizardSiteTimezone").val($("#inputWizardTimeZone").val());
            $("#lblWizardSiteStreet").val($("#txtWizardAkkuSiteGeo_Street").val());
            $("#lblWizardSiteHouseNumber").val($("#txtWizardAkkuSiteGeo_HouseNum").val());
            $("#lblWizardSitePostalCode").val($("#txtWizardAkkuSiteGeo_PostalCode").val());
            $("#lblWizardSiteCity").val($("#txtWizardAkkuSiteGeo_City").val());
            $("#lblWizardSiteCountry").val($("#inputWizardAKKU_SITE_GEO_COUNTRY").val());

            //save mcu (device) serial
            var sMCUSerialPrefix = "S";
            $("#lblWizardMCUSerial").val(sMCUSerialPrefix + $("#FACTORYDEVICE_ID").html());

            //fill recap table
            $("#lblWizardCustomerName_Check").html($("#txtWizardOwner_Name").val());
            $("#lblWizardCustomerSurname_Check").html(" " + $("#txtWizardOwner_Surname").val());
            $("#lblWizardCustomerStreet_Check").html($("#txtWizardOwner_Street").val());
            $("#lblWizardCustomerHouseNumber_Check").html(" " + $("#txtWizardOwner_HouseNumber").val());
            $("#lblWizardCustomerPostalCode_Check").html($("#txtWizardOwner_PostalCode").val());
            $("#lblWizardCustomerCity_Check").html(" " + $("#txtWizardOwner_City").val());
            $("#lblWizardCustomerCountry_Check").html(CountryCodeArray[$("#inputWizardOWNER_COUNTRY").val()]);
            $("#lblWizardCustomerEmail_Check").html($("#txtWizardOwner_Email").val());
            $("#lblWizardCustomerPhoneNumber_Check").html($("#txtWizardOwner_Phone").val());

            //set site data fieldslblWizardCustomerCountry
            $("#lblWizardSiteTimezone_Check").html(TimeZoneArray[$("#inputWizardTimeZone").val()]);
            $("#lblWizardSiteStreet_Check").html($("#txtWizardAkkuSiteGeo_Street").val());
            $("#lblWizardSiteHouseNumber_Check").html(" " + $("#txtWizardAkkuSiteGeo_HouseNum").val());
            $("#lblWizardSitePostalCode_Check").html($("#txtWizardAkkuSiteGeo_PostalCode").val());
            $("#lblWizardSiteCity_Check").html(" " + $("#txtWizardAkkuSiteGeo_City").val());
            $("#lblWizardSiteCountry_Check").html(CountryCodeArray[$("#inputWizardAKKU_SITE_GEO_COUNTRY").val()]);
        break;
    }
    $(".modal-body").scrollTop(0); //set scroll of config-frame-body to top
}


function confwizardPrevPage() {
    confwizardState = 0;
    if ((confwizardCurrentPage != 0) && (confwizardPagesShowed > -1)) {
        //jump back to last page
        var currentCarouselPage = $('#pnWizardCarouselInner div.active'); //get current / active carousel to render view of next page
            switch(currentCarouselPage.attr("id")) {
                case "pnWizardCarouselRegistration":
                        confwizardCurrentPage--;
                    break;
                case "pnWizardCarouselInstallerData":
                	installerauthenticated = false;
                	$('.parties_div').hide();
                    confwizardCurrentPage--;
                    break;
                case "pnWizardCarouselConfigPowerUnit":
                    confwizardCurrentPage--;
                    if(htmlAsNumber("#FEATURESCAR") == 1){
                        break; // Display WB page
                    }
                    confwizardCurrentPage--; // Skip WB page

                    if($("#inputWizardSystemSetupPowerMeterNone").is(":checked") == true)
            		{
                    	break; // Display PV page
            		}
                	confwizardCurrentPage--;

                    break;
                case "pnWizardCarouselConfigWallbox":
                    confwizardCurrentPage--;
                    // Check if any Enfluri Configuration was selected
                    if($("#inputWizardSystemSetupPowerMeterNone").is(":checked") == true)
            		{
                    	break; // Display PV
            		}
                	confwizardCurrentPage--; // Skip PV

                    break;
                case "pnWizardCarouselConfigExtended":
                	confwizardCurrentPage--;
                    if(htmlAsNumber("#FEATURESHEAT") == 1)
                    {
                    	break; // Display heat
                    }
                    confwizardCurrentPage--; // Skip Heat

                    if(htmlAsNumber("#FEATURESCAR") == 1)
                    {
                    	break; // Display PU
                    }
                    confwizardCurrentPage--; // Skip PU

                    if(($("#inputWizardSystemSetupPowerMeterNone").is(":checked") == true))
                    {
                    	break; // Display PV
                    }
                    confwizardCurrentPage--; // Skip PV

                    break;
                case "pnWizardCarouselPackageCheck":
                    // Check if configured as slave
                    if(($("#inputWizardMasterSlaveMode").val() == 2) && (isSuperUser() == false))
                    {
                        // Skip: Extended, PU, WB, PV
                    	confwizardCurrentPage = confwizardCurrentPage - 5;
                    }
                    else
                    {
                        confwizardCurrentPage--;
                    }
                    break;
                default:
                    confwizardCurrentPage--;
            }

        $('.carousel').carousel(confwizardCurrentPage);

        confwizardResetErrorFields();
        if(confwizardPagesShowed > 0) confwizardPagesShowed--;

        $('#WizardHeader').empty();
        $('#WizardHeader').append('<h3>' + lng["lSetupConfigWizard"] + ' ' + (confwizardPagesShowed + 1) + '</h3>');
        $('#btnWizard_prev').show();
    }
    if ((confwizardCurrentPage == 0) || (confwizardPagesShowed == 0)){
        $('#btnWizard_prev').hide();
    }
    $('#btnWizard_next').show();
    $('#btnWizard_next').text(lng["Next"]);
    $('#confwizardStatus').empty();
}

function sendwizardPage() {
    //IMPORTANT: check connection to mcu
    $.ajax({
        type: "GET",
        url: "/",
        error: function() {
            alert(lng['WIZARD_NOTIFY_NO_CONN_TO_MCU']);
        }
    });

    //check if initial wizard-config
    var nConfigLoaded = ($('#WIZARDCONFIG_LOADED').html())*1;

//--------------------1 seite-------------------------//
    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");

    if ($('#inputWizardAGBsAccepted').prop('checked') == true) {
        pageObj.add_property_to_object("WIZARD", "SETUP_AGBS_ACCEPTED", "u8_01");
    }
    else
    {
        pageObj.add_property_to_object("WIZARD", "SETUP_AGBS_ACCEPTED", "u8_00");
    }


    pageObj.singlePageRefresh();

//--------------------Erweiterte Konfiguration UND Konfiguration Netzanschluss-------------------------//
    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");
    pageObj.add_json_object("GRIDCONFIG");

    if ($('#inputWizardBufferPowerConfuseMaxPowerSkew').prop('checked') == true) {
        pageObj.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_MAX_PWR_SKEW", "u8_01");
    }
    else
    {
        pageObj.add_property_to_object("GRIDCONFIG", "PWRCFG_USE_MAX_PWR_SKEW", "u8_00");
    }

    if ($('#inputWizardSystemSetupuseRCR').prop('checked') == true) {
        pageObj.add_property_to_object("WIZARD", "SETUP_USE_RCR", "u8_01");
    }
    else
    {
        pageObj.add_property_to_object("WIZARD", "SETUP_USE_RCR", "u8_00");
    }

    var WIZARDSETUP_RCR_STEPS = '[';

    for (c = 0; c < 4; c++) {
        WIZARDSETUP_RCR_STEPS += '"';
        WIZARDSETUP_RCR_STEPS += pageObj.castVarValue('u1', $('#WIZARDSETUP_RCR_STEPS' + c).val());

        /* Add trailing commas if needed */
        if(c<3)
        {
            WIZARDSETUP_RCR_STEPS += '",';
        }
    }

    WIZARDSETUP_RCR_STEPS += '"]';

    pageObj.add_property_to_object("WIZARD", "SETUP_RCR_STEPS", WIZARDSETUP_RCR_STEPS);

    if ($('#inputWizardUseSettingsUrl').prop('checked') == true) {
        pageObj.add_property_to_object("WIZARD", "USE_TESTSERVER", "u8_01");
    }
    else
    {
        pageObj.add_property_to_object("WIZARD", "USE_TESTSERVER", "u8_00");
    }

    pageObj.add_property_to_object("WIZARD", "DEVICE_BATTERY_TYPE", pageObj.castVarValue("u8", $('#inputWizardSystemSetupBatteryManufacturer').val()));
    pageObj.add_property_to_object("WIZARD", "SETUP_USED_PHASE", pageObj.castVarValue("u8", $('#inputWizardSystemSetupXtenderPhase').val()));

    if ($('#inputWizardSystemSetupGridConnectionSinglePhase').prop('checked')) {
        pageObj.add_property_to_object("WIZARD", "GRID_CONNECTION_TYPE", "u8_01");
    }
    else if ($('#inputWizardSystemSetupGridConnectionMultiPhase').prop('checked')) {
        pageObj.add_property_to_object("WIZARD", "GRID_CONNECTION_TYPE", "u8_02");
    }

    pageObj.add_property_to_object("WIZARD", "SETUP_POWER_RULE", pageObj.castVarValue('u8', $('#inputWizardSystemSetupPowerRule').val()));
    pageObj.add_property_to_object("WIZARD", "SETUP_USE_ABS_POWER", pageObj.castVarValue('u8', $('#inputWizardSystemSetupFeedInLimitOpt').val()));
    pageObj.add_property_to_object("WIZARD", "PWRCFG_PEAK_PV_POWER", "fl_" + pageObj.float2hex($('#inputWizardSiteMaxPVPower').val()));
    if($('#inputWizardSystemSetupFeedInLimitOpt').val() == 1)
    {
        pageObj.add_property_to_object("WIZARD", "SETUP_ABS_POWER", pageObj.castVarValue('u3', $('#inputWizardSiteMaxFeedInPower').val()));
    }

    var WIZARDDEVICE_BATTERY_ENABLED = '[';
    // BattInverter Enable, depending on SystemPhase
    //L1 - L3
    if($("#inputWizardSystemSetupXtenderPhase").val() <= 3) {
    WIZARDDEVICE_BATTERY_ENABLED += '"u8_01","u8_00","u8_00';
    }
    if($("#inputWizardSystemSetupXtenderPhase").val() == 4) {
    WIZARDDEVICE_BATTERY_ENABLED += '"u8_01","u8_01","u8_01';
    }
    if($("#inputWizardSystemSetupXtenderPhase").val() == 5) {
    WIZARDDEVICE_BATTERY_ENABLED += '"u8_01","u8_01","u8_00';
    }
    if($("#inputWizardSystemSetupXtenderPhase").val() == 6) {
    WIZARDDEVICE_BATTERY_ENABLED += '"u8_01","u8_01","u8_00';
    }
    if($("#inputWizardSystemSetupXtenderPhase").val() == 7) {
    WIZARDDEVICE_BATTERY_ENABLED += '"u8_01","u8_01","u8_00';
    }

    WIZARDDEVICE_BATTERY_ENABLED += '"]';

    pageObj.add_property_to_object("WIZARD", "DEVICE_BATTERY_ENABLED", WIZARDDEVICE_BATTERY_ENABLED);

    pageObj.singlePageRefresh();

//--------------------Enfluri und PV-Inverter-------------------------//
    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");

    pageObj.add_property_to_object("WIZARD", "DEVICE_PM_TYPE", pageObj.castVarValue("u8", $("#inputWizardSystemSetupPowerMeterType").val()));

    /* Second power meter with address 2 measures consumers while address 3 measures producers. */
    if ($('#inputWizardSystemSetupPowerMeterConsumer').prop('checked')) {
        pageObj.add_property_to_object("WIZARD", "DEVICE_PM_HOUSE_ENABLED", "u8_01");
        $('#WIZARDSETUP_PM_HOUSE_ADR').val(2);
    }
    else if ($('#inputWizardSystemSetupPowerMeterProducer').prop('checked')) {
        pageObj.add_property_to_object("WIZARD", "DEVICE_PM_HOUSE_ENABLED", "u8_01");
        $('#WIZARDSETUP_PM_HOUSE_ADR').val(3);
    }
    else {
        pageObj.add_property_to_object("WIZARD", "DEVICE_PM_HOUSE_ENABLED", "u8_00");
        $('#WIZARDSETUP_PM_HOUSE_ADR').val(2);
    }

    pageObj.add_property_to_object("WIZARD", "SETUP_PM_HOUSE_ADR", pageObj.castVarValue("u8", $('#WIZARDSETUP_PM_HOUSE_ADR').val()));
    pageObj.add_property_to_object("WIZARD", "CONFIG_LOADED");


    var InverterEnum = 0x00;
    // Check if no Enfluri Configuration was selected
    if(!(($("#inputWizardSystemSetupPowerMeterConsumer").is(":checked") == true) ||
         ($("#inputWizardSystemSetupPowerMeterProducer").is(":checked") == true))){
           /* Determine PV inverter manufacturer and type. */
           InverterEnum = $('#inputWizardSystemSetupInvManufacturer').val() << 4;
           InverterEnum |= $('#inputWizardSystemSetupInverterType').val();
    }

    /* Check if no external pv inverter was configured */
    if ($('#checkboxWizardExternalPV').prop('checked') == false) {
    	InverterEnum = 0xA0;
    }

    pageObj.add_property_to_object("WIZARD", "DEVICE_INVERTER_TYPE", pageObj.castVarValue("u8", InverterEnum));

    var WIZARDDEVICE_INV_SLAVE_ADRESS_ARR = '[';
    var WIZARDDEVICE_INV_ENABLED = '[';

    for (c = 0; c < 6; c++) {
        WIZARDDEVICE_INV_SLAVE_ADRESS_ARR += '"';
        WIZARDDEVICE_INV_SLAVE_ADRESS_ARR += pageObj.castVarValue('u8', $('#WIZARDDEVICE_INV_SLAVE_ADRESS' + c).val());

        // 29.08.2014, THESE INPUTS FIELDS ARE NOT SHOWED
        if(($("#optWizardPvInverterCount").val() > c) &&
           ($('#inputWizardSystemSetupPowerMeterConsumer').prop('checked') == false) &&
           ($('#inputWizardSystemSetupPowerMeterProducer').prop('checked') == false) ) {
            WIZARDDEVICE_INV_ENABLED += '"u8_01';
        }
        else
        {
            WIZARDDEVICE_INV_ENABLED += '"u8_00';
        }
        /* Add trailing commas if needed */
        if(c<5)
        {
            WIZARDDEVICE_INV_ENABLED += '",';
            WIZARDDEVICE_INV_SLAVE_ADRESS_ARR += '",';
        }
    }

    WIZARDDEVICE_INV_ENABLED += '"]';
    WIZARDDEVICE_INV_SLAVE_ADRESS_ARR += '"]';

    pageObj.add_property_to_object("WIZARD", "DEVICE_INV_ENABLED", WIZARDDEVICE_INV_ENABLED);
    pageObj.add_property_to_object("WIZARD", "DEVICE_INV_SLAVE_ADRESS", WIZARDDEVICE_INV_SLAVE_ADRESS_ARR);

    pageObj.add_property_to_object("WIZARD", "SETUP_PV_INV_IP0", pageObj.castVarValue('u3', pageObj.dot2dec($("#WIZARDDEVICE_INV_IP0").val())));
    pageObj.add_property_to_object("WIZARD", "SETUP_PV_INV_IP1", pageObj.castVarValue('u3', pageObj.dot2dec($("#WIZARDDEVICE_INV_IP1").val())));
    pageObj.add_property_to_object("WIZARD", "SETUP_PV_INV_IP2", pageObj.castVarValue('u3', pageObj.dot2dec($("#WIZARDDEVICE_INV_IP2").val())));
    pageObj.add_property_to_object("WIZARD", "SETUP_PV_INV_IP3", pageObj.castVarValue('u3', pageObj.dot2dec($("#WIZARDDEVICE_INV_IP3").val())));
    pageObj.add_property_to_object("WIZARD", "SETUP_PV_INV_IP4", pageObj.castVarValue('u3', pageObj.dot2dec($("#WIZARDDEVICE_INV_IP4").val())));
    pageObj.add_property_to_object("WIZARD", "SETUP_PV_INV_IP5", pageObj.castVarValue('u3', pageObj.dot2dec($("#WIZARDDEVICE_INV_IP5").val())));
    pageObj.singlePageRefresh();

//--------------------Wallbox-------------------------//
    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");

    let wallbox_count = $("#optWizardWallboxCount").val();
    let WALLBOX_ENABLED = pageObj.castVarValue('u8', wallbox_count);
    let WALLBOX_MAXGRID = pageObj.castVarValue('fl', $("#optWizardWallboxMaxTotalGrid").val());

    let WIZARDDEVICE_WALLBOX_ADDRESS_ARR = '[';
    let WIZARD_WALLBOX_SERIAL0 = 'st_';
    let WIZARD_WALLBOX_SERIAL1 = 'st_';
    let WIZARD_WALLBOX_SERIAL2 = 'st_';
    let WIZARD_WALLBOX_SERIAL3 = 'st_';
    // intentionally fall trough

    if(wallbox_count >= 4) {
        WIZARD_WALLBOX_SERIAL3 = pageObj.castVarValue('st', $('#WIZARDSETUP_WALLBOX_TYPE3').val().concat($('#wizardWallboxSerial3').val()));
    }
    if(wallbox_count >= 3) {
        WIZARD_WALLBOX_SERIAL2 = pageObj.castVarValue('st', $('#WIZARDSETUP_WALLBOX_TYPE2').val().concat($('#wizardWallboxSerial2').val()));
    }
    if(wallbox_count >= 2) {
        WIZARD_WALLBOX_SERIAL1 = pageObj.castVarValue('st', $('#WIZARDSETUP_WALLBOX_TYPE1').val().concat($('#wizardWallboxSerial1').val()));
    }
    if(wallbox_count >= 1) {
        WIZARD_WALLBOX_SERIAL0 = pageObj.castVarValue('st', $('#WIZARDSETUP_WALLBOX_TYPE0').val().concat($('#wizardWallboxSerial0').val()));
    }

    for (let c = 0; c < 4; c++) {
        WIZARDDEVICE_WALLBOX_ADDRESS_ARR += '"';
        WIZARDDEVICE_WALLBOX_ADDRESS_ARR += pageObj.castVarValue('u8', (wallbox_count>c) ? $('#WIZARDSETUP_WALLBOX_IDS' + c).val() : 0);
        // Add trailing commas if needed
        if(c<3){
            WIZARDDEVICE_WALLBOX_ADDRESS_ARR += '",';
        }
    }

    WIZARDDEVICE_WALLBOX_ADDRESS_ARR += '"]';

    pageObj.add_property_to_object("WIZARD", "SETUP_NUMBER_WALLBOXES", WALLBOX_ENABLED);
    pageObj.add_property_to_object("WIZARD", "SETUP_WALLBOX_IDS", WIZARDDEVICE_WALLBOX_ADDRESS_ARR);
    pageObj.add_property_to_object("WIZARD", "SETUP_WALLBOX_SERIAL0", WIZARD_WALLBOX_SERIAL0);
    pageObj.add_property_to_object("WIZARD", "SETUP_WALLBOX_SERIAL1", WIZARD_WALLBOX_SERIAL1);
    pageObj.add_property_to_object("WIZARD", "SETUP_WALLBOX_SERIAL2", WIZARD_WALLBOX_SERIAL2);
    pageObj.add_property_to_object("WIZARD", "SETUP_WALLBOX_SERIAL3", WIZARD_WALLBOX_SERIAL3);
    pageObj.add_property_to_object("WIZARD", "SETUP_WALLBOX_MAX_TOTAL_CURRENT_BY_GRID", WALLBOX_MAXGRID);
    pageObj.singlePageRefresh();

//--------------------Power Unit Seite-------------------------//
    pageObj.reInitJSONObject();
    pageObj.add_json_object("PWR_UNIT");
    pageObj.add_json_object("WIZARD");

    // Build Array with Settings from Wizard page
    var PWR_UNIT_TYPE_ARR = '[';
    var PWR_UNIT_WATERVOL_ARR = '[';
    var PWR_UNIT_TEMPMIN_ARR = '[';
    var PWR_UNIT_TEMPMAX_ARR = '[';
    var PWR_UNIT_ADRESS_ARR = '[';
    var PWR_UNIT_CONNPWR_1_ARR = '[';
    var PWR_UNIT_CONNPWR_2_ARR = '[';
    var PWR_UNIT_CONNPWR_3_ARR = '[';
    var PWR_UNIT_TEMP_COUNT_ARR = '[';
    var PWR_UNIT_ENFLURI_ARR = '[';

    for (c = 0; c < 6; c++) {
        PWR_UNIT_TYPE_ARR         += '"' + pageObj.castVarValue('u8', $('#inputWizardSystemSetupPowerUnit' + c + 'Model').val());
        PWR_UNIT_WATERVOL_ARR     += '"' + pageObj.castVarValue('u1', $('#PWR_UNITWATERVOL'+ c).val());
        PWR_UNIT_TEMPMIN_ARR      += '"fl_' + pageObj.float2hex($('#PWR_UNITTEMPMIN'+ c).val());
        PWR_UNIT_TEMPMAX_ARR      += '"fl_' + pageObj.float2hex($('#PWR_UNITTEMPMAX'+ c).val());
        PWR_UNIT_ADRESS_ARR       += '"' + pageObj.castVarValue('u8', $('#PWR_UNITADRESS'+ c).val());
        PWR_UNIT_CONNPWR_1_ARR    += '"fl_' + pageObj.float2hex($('#PWR_UNITCONNPWR_1'+ c).val());
        PWR_UNIT_CONNPWR_2_ARR    += '"fl_' + pageObj.float2hex($('#PWR_UNITCONNPWR_2'+ c).val());
        PWR_UNIT_CONNPWR_3_ARR    += '"fl_' + pageObj.float2hex($('#PWR_UNITCONNPWR_3'+ c).val());
        PWR_UNIT_TEMP_COUNT_ARR   += '"' + pageObj.castVarValue('u1', $('#inputWizardSystemSetupPowerUnit' + c + 'TempCount').val());
    	PWR_UNIT_ENFLURI_ARR      += '"' + pageObj.castVarValue("u8", $('#gui_pwr_unit_enfluri' + c).val());


        /* Add trailing commas if needed */
        if(c<5)
        {
            PWR_UNIT_TYPE_ARR += '",';
            PWR_UNIT_WATERVOL_ARR += '",';
            PWR_UNIT_TEMPMIN_ARR += '",';
            PWR_UNIT_TEMPMAX_ARR += '",';
            PWR_UNIT_ADRESS_ARR += '",';
            PWR_UNIT_CONNPWR_1_ARR += '",';
            PWR_UNIT_CONNPWR_2_ARR += '",';
            PWR_UNIT_CONNPWR_3_ARR += '",';
            PWR_UNIT_TEMP_COUNT_ARR += '",';
            PWR_UNIT_ENFLURI_ARR += '",';
        }
    }

    PWR_UNIT_TYPE_ARR += '"]';
    PWR_UNIT_WATERVOL_ARR += '"]';
    PWR_UNIT_TEMPMIN_ARR += '"]';
    PWR_UNIT_TEMPMAX_ARR += '"]';
    PWR_UNIT_ADRESS_ARR += '"]';
    PWR_UNIT_CONNPWR_1_ARR += '"]';
    PWR_UNIT_CONNPWR_2_ARR += '"]';
    PWR_UNIT_CONNPWR_3_ARR += '"]';
    PWR_UNIT_TEMP_COUNT_ARR += '"]';
    PWR_UNIT_ENFLURI_ARR += '"]';
    // End of PWR_UNIT ARRAIES

    pageObj.add_property_to_object("PWR_UNIT", "TYPE", PWR_UNIT_TYPE_ARR);
    pageObj.add_property_to_object("PWR_UNIT", "WATERVOL", PWR_UNIT_WATERVOL_ARR);
    pageObj.add_property_to_object("PWR_UNIT", "TEMPMIN", PWR_UNIT_TEMPMIN_ARR);
    pageObj.add_property_to_object("PWR_UNIT", "TEMPMAX", PWR_UNIT_TEMPMAX_ARR);
    pageObj.add_property_to_object("PWR_UNIT", "ADRESS", PWR_UNIT_ADRESS_ARR);
    pageObj.add_property_to_object("PWR_UNIT", "CONNPWR_1", PWR_UNIT_CONNPWR_1_ARR);
    pageObj.add_property_to_object("PWR_UNIT", "CONNPWR_2", PWR_UNIT_CONNPWR_2_ARR);
    pageObj.add_property_to_object("PWR_UNIT", "CONNPWR_3", PWR_UNIT_CONNPWR_3_ARR);
    pageObj.add_property_to_object("PWR_UNIT", "TEMP_COUNT", PWR_UNIT_TEMP_COUNT_ARR);
    pageObj.add_property_to_object("PWR_UNIT", "ENFLURI", PWR_UNIT_ENFLURI_ARR);
    pageObj.add_property_to_object("WIZARD", "CHARGE_PRIO", pageObj.castVarValue('u8', $('#optWizardChargePrio').val()));
    pageObj.add_property_to_object("WIZARD", "HEAT_CONN_TYPE", pageObj.castVarValue('u8', $('#optWizardPU_Usage').val()));
    pageObj.singlePageRefresh();


//--------------------Konfiguration Kaskadierung Seite-------------------------//
    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");

    var masterSlaveMode = pageObj.castVarValue("u8", $('#inputWizardMasterSlaveMode').val());
    var masterSlaveAddresses = '[';

    if ($('#inputWizardMasterSlaveMode').val() == 1)
    {
      /* Save all addresses ... */
      for (var index = 0; index < 6; ++index)
      {
        masterSlaveAddresses += '"';
        masterSlaveAddresses += pageObj.castVarValue('u8', $('#WIZARDMASTER_SLAVE_ADDRESSES' + index).val());
        if (index < 5)
        {
          masterSlaveAddresses +='",';
        }
      }
    }
    else if ($('#inputWizardMasterSlaveMode').val() == 2)
    {
      /* Reset all addresses but the first ... */
      masterSlaveAddresses += '"';
      masterSlaveAddresses += pageObj.castVarValue("u8", $('#WIZARDMASTER_SLAVE_ADDRESSES0').val());
      masterSlaveAddresses += '","u8_00","u8_00","u8_00","u8_00","u8_00';
    }
    else
    {
      /* Reset mode and all addresses ... */
      masterSlaveMode = "u8_00";
      masterSlaveAddresses += '"u8_00","u8_00","u8_00","u8_00","u8_00","u8_00';
    }

    masterSlaveAddresses += '"]';

    pageObj.add_property_to_object("WIZARD", "MASTER_SLAVE_MODE", masterSlaveMode);
    pageObj.add_property_to_object("WIZARD", "MASTER_SLAVE_ADDRESSES", masterSlaveAddresses);

    pageObj.singlePageRefresh();

//--------------------Konfiguration Netzwerk Seite-------------------------//
    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");

    if ($('#inputWizardNetworkuseDHCP').prop('checked')) {
      pageObj.add_property_to_object("WIZARD", "NET_SENEC_USE_DHCP", "u8_01");
    }
    else {
      pageObj.add_property_to_object("WIZARD", "NET_SENEC_USE_DHCP", "u8_00");
    }

    pageObj.add_property_to_object("WIZARD", "NET_SENEC_STATIC_IP", pageObj.castVarValue('u3', pageObj.dot2dec($("#inputWizardNetworkstaticIP_Adr").val())));
    pageObj.add_property_to_object("WIZARD", "NET_NETWORK_MASK", pageObj.castVarValue('u3', pageObj.dot2dec($("#inputWizardNetworkNetworkMask").val())));
    pageObj.add_property_to_object("WIZARD", "NET_GATEWAY_IP", pageObj.castVarValue('u3', pageObj.dot2dec($("#inputWizardNetworkGateWayIP").val())));
    pageObj.add_property_to_object("WIZARD", "NET_DNS_SERVER_IP", pageObj.castVarValue('u3', pageObj.dot2dec($("#inputWizardNetworkDNS_Server_IP").val())));

    pageObj.singlePageRefresh();

    // Trigger Settings Process
    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");
    pageObj.add_property_to_object("WIZARD", "CONFIG_MODIFIED_BY_USER", "u8_01"); //save data in FLASH
    pageObj.singlePageRefresh();

    if((nConfigLoaded != 1) && (isSuperUser() == false))
    {
        // Send data to Server
        $("#fmWizardInstallationConfirmation").submit();
    }

}

function startWizard(wizardMode) {
    $(document).trigger("page.unload");

    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: lng["wizard-file"],
        success: function(html)
        {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizardInit(wizardMode);
            console.log("wizard data has successful loaded..");
            $('#modalWindow').modal('show');
        }
    });

    modal_input = 'modal_wizard';
}

function confwizardClose() {
    $("#modalWindow").empty();
    $('#modalWindow').modal('hide');
    // Status page will open battery wizard if zero modules are configured
    if(htmlAsNumber($("#BMSMODULES_CONFIGURED")) == 0)
        navigate('lStatus');
    else
        navigate('lSetup');
}

function showUserLevel(userLevel) {

    $('#loginState_value').empty();

    switch (userLevel)
    {
        case 0:
            $('#loginState_value').append('<p class="userLevel">' + lng["OWNER"] + '</p>');
            break;
        case 1:
            $('#loginState_value').append('<p class="userLevel">' + lng.OWNER + '</p>');
            break;
        case 3:
            $('#loginState_value').append('<p class="userLevel">' + lng.INSTALLER + ' <button class="btn btn-mini" type="button" onclick="logout();">' + lng["Logout"] + '</button> </p>');
            break;
        case 4:
            $('#loginState_value').append('<p class="userLevel">' + lng.INSTALLER + ' <button class="btn btn-mini" type="button" onclick="logout();">' + lng["Logout"] + '</button> </p>');
            break;
        case 5:
            $('#loginState_value').append('<p class="userLevel">' + lng.INSTALLER + ' <button class="btn btn-mini" type="button" onclick="logout();">' + lng["Logout"] + '</button> </p>');
            break;
        case 6:
            $('#loginState_value').append('<p class="userLevel">' + lng.MANUFACTURER + ' <button class="btn btn-mini" type="button" onclick="logout();">' + lng["Logout"] + '</button></p>');
            break;
        case 7:
            $('#loginState_value').append('<p class="userLevel">' + lng.SUPERUSER + ' <button class="btn btn-mini" type="button" onclick="logout();">' + lng["Logout"] + '</button></p>');
            break;
        case 8:
            $('#loginState_value').append('<p class="userLevel">' + lng.TESTER + ' <button class="btn btn-mini" type="button" onclick="logout();">' + lng["Logout"] + '</button></p>');
            break;
        default:
            $('#userLevel').append('<p class="userLevel">' + lng.UNKNOWN + '</p>');
    }
}

function roundValue(value, dp) {
    var tmp = value;
    switch (dp)
    {
        case 0:
            tmp = Math.round(tmp);
            break;
        case 1:

            tmp = Math.round(tmp * 10);
            tmp = tmp / 10;
            break;
        case 2:
            tmp = Math.round(tmp * 100);
            tmp = tmp / 100;
            break;
        case 3:
            tmp = Math.round(tmp * 1000);
            tmp = tmp / 1000;
            break;
        default:

            tmp = Math.round(tmp * 10);
            tmp = tmp / 10;
    }

    return tmp;
}

// Check input data for validity
function checkWizardValues(pageNbr) {
    console.log("check wizard values: page  " + pageNbr);

    var state = 0;
    var errorMessage = "";

    var aFields;
    var sEl = "";

    confwizardResetErrorFields();
    var currentCarouselPage = $('#pnWizardCarouselInner div.active');
    switch(currentCarouselPage.attr("id")) {
        case "pnWizardCarouselEula": //Eula-page
            if ($('#inputWizardAGBsAccepted').prop('checked') == true) {
                state = 1;
            }
            else {
                state = 0;
                errorMessage = lng.ALERT_ERROR  + lng.WIZARD_ERROR_EULA;
                alert(errorMessage);
            }
            break;

        case "pnWizardCarouselInstallerData": //installer-data page
            state = 1;

			if (mySenecBaseURL().indexOf("mysenec-pg") > -1)
			{
		        if(["labor+installateur@senec-ies.com", "admin@senec.com", "support@senec.com", "installateur@senec-ies.com",
					"installateur@senec.com", "endkunde@senec.com"].indexOf($("#txtWizardInstallerEmail").val()) > -1 )
		        {
		            DebugFillWizard();
		        }
			}
			else
			{
		        if($("#txtWizardInstallerEmail").val() == "labor+installateur@senec-ies.com")
		        {
		            DebugFillWizard();
		        }
			}

            //check if browser-internet-connection is available
            if($("#lblWizardBrowserInternetAvailable").html() == 1) {
                // check contractor information only the first time
                if($('#btnWizard_next').text() == lng.Check){
                    checkInstallerLogin(true);
                }else{
                    checkInstallerLogin(false);
                }
                // Check if login was verified
                if(installerauthenticated === false)
                {
                    state = 0;
                    confwizardShowErrorLabel("lblWizardInstallerCheckResult", lng.WIZARD_CHECK_LOGIN_BUTTON);
                }
            }
            else
            {
                // Internet Check Failure
                state = 0;
                confwizardShowErrorLabel("lblWizardInstallerCheckResult", lng.WIZARD_EG_NO_INTERNET);
            }

            break;

        case "pnWizardCarouselCustomerData": //customer-data page
            state = 1;

            //check e-mail matching
            if($("#txtWizardOwner_Email").val().trim() != $("#txtWizardOwnerConfirmEmail").val().trim()) {
                $('#txtWizardOwner_Email').addClass("errorField");
                $('#txtWizardOwnerConfirmEmail').addClass("errorField");

                confwizardShowErrorLabel("lblWizardCustomerEmailCheckResult", lng.WIZARD_CHECK_EMAIL_FIELD_ERROR_NO_MATCH);

                state = 0;
            }
            //check if email has appropiate format
            if(isValidEmail($("#txtWizardOwner_Email").val().trim()) == false) {
                $('#txtWizardOwner_Email').addClass("errorField");

                confwizardShowErrorLabel("lblWizardCustomerEmailCheckResult", lng.WIZARD_CHECK_EMAIL_FIELD_ERROR_VALIDATION);

                state = 0;
            }
            //check other fields for empty-string
            aFields = ["txtWizardOwner_Name", "txtWizardOwner_Surname", "txtWizardOwner_Street", "txtWizardOwner_HouseNumber", "txtWizardOwner_PostalCode", "txtWizardOwner_City", "inputWizardOWNER_COUNTRY", "txtWizardOwner_Email"];
            for(var field = 0; field < aFields.length; field++) {
                sEl = "#" + aFields[field];
                if($(sEl).val().trim().length < 1) {
                    $(sEl).addClass("errorField");
                    state = 0;
                }
            }

            // Check max length
            aFields = ["txtWizardOwner_HouseNumber", "txtWizardOwner_PostalCode"];
            for(var j = 0; j < aFields.length; j++) {
                sEl = "#" + aFields[j];
                if($(sEl).val().trim().length > 5) {
                    $(sEl).addClass("errorField");
                    state = 0;
                }
            }

            //check e-mail matching of customer and installer email
            if($("#txtWizardInstallerEmail").val().trim() == $("#txtWizardOwner_Email").val().trim()) {
                confwizardShowErrorLabel("lblWizardCustomerEmailCheckResult", lng.WIZARD_CHECK_EMAIL_FIELD_ERROR_SAME_INSTALLER_CUSTOMER);

                state = 0;
            }

            if(state == 0) {
                confwizardShowErrorLabel("lblWizardCustomerCheckResult", lng.WIZARD_CHECK_FIELDS_ERROR);
            }

            break;

        case "pnWizardCarouselInstallationPlace": //installation-place
            state = 1;
            errorMessage = 0;

            //check if timezone is set
            if($("#inputWizardTimeZone").val() == "0") {
                $("#inputWizardTimeZone").addClass("errorField");
                state = 0;
                alert(lng.WIZARD_CHECK_TIMEZONE);
            }

            //check other fields for empty-string
            aFields = ["txtWizardAkkuSiteGeo_Street", "txtWizardAkkuSiteGeo_HouseNum", "txtWizardAkkuSiteGeo_PostalCode", "txtWizardAkkuSiteGeo_City", "inputWizardAKKU_SITE_GEO_COUNTRY"];
            for(var k = 0; k < aFields.length; k++) {
                sEl = "#" + aFields[k];
                if($(sEl).val().trim().length < 1) {
                    $(sEl).addClass("errorField");
                    state = 0;
                }
            }

            // Check max length
            aFields = ["txtWizardAkkuSiteGeo_HouseNum", "txtWizardAkkuSiteGeo_PostalCode"];
            for(var p = 0; p < aFields.length; p++) {
                sEl = "#" + aFields[p];
                if($(sEl).val().trim().length > 10) {
                    $(sEl).addClass("errorField");
                    state = 0;
                }
            }

            if(state == 0) {
                confwizardShowErrorLabel("lblWizardInstallationPlaceCheckResult", lng.WIZARD_CHECK_FIELDS_ERROR);
            }

            break;

        case "pnWizardMasterSlave": // Modbus page
            state = 1;
            // Check for daisy chaining config
            if (($('#inputWizardMasterSlaveMode').val() == 1) ||
                ($('#inputWizardMasterSlaveMode').val() == 2))
                {
                    // Check active addresses
                    outer_loop:
                    for (var index = 0; index < $("#inputWizwardSlaveCountSelect").val(); ++index)
                    {
                        var address = $('#WIZARDMASTER_SLAVE_ADDRESSES' + index).val();

                        if (address <= 0 || address >= 255 || !isValidDecimal(address)) {
                          state = 0;
                          alert(lng.lErrModbusAddr);
                          $('#WIZARDMASTER_SLAVE_ADDRESSES' + index).addClass('errorField');
                          $('#inputWizwardSlaveCountSelect').addClass('errorField');
                        }

                        if($('#inputWizardMasterSlaveMode').val() == 1)
                        {
                            // Find duplicates in Slave Adresses
                            for(var slave_id=0; slave_id < $("#inputWizwardSlaveCountSelect").val(); slave_id++)
                            {// Skip own value
                                        if (slave_id== index)
                                            continue;
                                        if($("#WIZARDMASTER_SLAVE_ADDRESSES" + index ).val() == $("#WIZARDMASTER_SLAVE_ADDRESSES" + slave_id ).val())
                                        {
                                            state = 0;
                                            $("#WIZARDMASTER_SLAVE_ADDRESSES" + index ).addClass("errorField");
                                            $("#WIZARDMASTER_SLAVE_ADDRESSES" + slave_id ).addClass("errorField");
                                            alert(lng.WIZARD_CHECK_RS485);
                                            break outer_loop;
                                        }
                            }
                        }
                    }
                    // Reset inactive addresses to zero
                    for (var id = 5; id >= $("#inputWizwardSlaveCountSelect").val(); --id)
                    {
                        $('#WIZARDMASTER_SLAVE_ADDRESSES' + id).val(0);
                    }
                }

            break;

        case "pnWizardCarouselConfigStandard": //standard-config page
            state = 1;
            errorMessage = 0;

            //check if battery state is given
            if($("#inputWizardSystemSetupXtenderPhase").val().trim() == "00")
            {
                errorMessage = lng.WIZARD_CHECK_BATTERY_NEED_PHASE;
                state = 0;
                alert(errorMessage);
            }

            /* Check if Senec Meter is checked and tested successfull */
            if (nTestSenecMeterResult != 1 && $("#inputWizardSystemSetupSenecMeter").prop('checked') == true) {
                $("#inputWizardSystemSetupSenecMeterSerial").addClass("errorField");
                confwizardEconamicGridShowErrorLabel("inputWizardSenecMeterlTestResult", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
                state = 0;
            }
            /* Check if Heatpump Meter is checked and tested successfull */
            if (nTestHeatpumpMeterResult != 1 && $("#inputWizardSystemSetupHeatpumpMeter").prop('checked') == true) {
                $("#inputWizardSystemSetupHeatpumpMeterSerial").addClass("errorField");
                confwizardEconamicGridShowErrorLabel("inputWizardHeatpumpMeterTestResult", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
                state = 0;
            }
            /* Check if Generation Meter is checked and tested successfull */
            if (nTestGenerationMeterResult != 1 && $("#inputWizardSystemSetupGenerationMeter").prop('checked') == true) {
                $("#inputWizardSystemSetupGenerationMeterSerial").addClass("errorField");
                confwizardEconamicGridShowErrorLabel("inputWizardGenerationMeterlTestResult", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
                state = 0;
            }

            // Force Installer to choose Single or Multi Phase Grid Connection
            if($("#inputWizardSystemSetupGridConnectionSinglePhase").prop('checked') == false &&
               $('#inputWizardSystemSetupGridConnectionMultiPhase').prop('checked') == false) {
                errorMessage = lng.WIZARD_CHECK_GRID_CONNECTION;
                state = 0;
                alert(errorMessage);
            }

            // Check EnFluRi Configuration
            if($("#inputWizardSystemSetupPowerMeterConsumer").prop('checked') == false &&
               $("#inputWizardSystemSetupPowerMeterProducer").prop('checked') == false &&
               $("#inputWizardSystemSetupPowerMeterNone").prop('checked') == false &&
               $('#inputWizardMasterSlaveMode').val() != 2) {
                errorMessage = lng.WIZARD_CHECK_ENFLURI;
                state = 0;
                alert(errorMessage);
            }

            //Fill Address Type for next page
            fillInverterTypeAdressLabel($("#inputWizardSystemSetupInverterType").val());

            break;

        case "pnWizardCarouselConfigSystem":  //config pv-inverters page
            state = 1;

            //Check if only decimals were entered
            if(!isValidDecimal($('#inputWizardSiteMaxPVPower').val()) || $('#inputWizardSiteMaxPVPower').val() == 0)
            {
                state = 0;
                alert(lng.WIZARD_CHECK_POS_DECIMAL + ": " + $('#inputWizardSiteMaxPVPower').val());
                $('#inputWizardSiteMaxPVPower').addClass("errorField");
            }

            if(parseInt($('#inputWizardSiteMaxPVPower').val()) < 100)
            {
                state = 0;
                alert(lng.WIZARD_CHECK_PV_POWER);
                $('#inputWizardSiteMaxPVPower').addClass("errorField");
            }

            if($('#inputWizardSystemSetupPowerRule').val() == 0)
            {
                if (($("#WIZARDPS_ENABLE").val() == 1) ||
                    ($("#SOCKETSENABLE0").html()*1 >= 1) ||
                    ($("#SOCKETSENABLE1").html()*1 >= 1))
                alert(lng.lAlertZeroExportSet);
            }

            // If absolute option is selected
            if(($('#inputWizardSystemSetupFeedInLimitOpt').val() * 1) == 1)
            {
                //Check if only decimals were entered
                if(!isValidDecimal($('#inputWizardSiteMaxFeedInPower').val()))
                {
                    state = 0;
                    alert(lng.WIZARD_CHECK_POS_DECIMAL + ": " + $('#inputWizardSiteMaxFeedInPower').val());
                    $('#inputWizardSiteMaxFeedInPower').addClass("errorField");
                }
                //Check if value is less or equal max pv power
                if(parseInt($('#inputWizardSiteMaxFeedInPower').val()) > parseInt($('#inputWizardSiteMaxPVPower').val()))
                {
                    state = 0;
                    alert(lng.lErrAbsoluteFeedInPower);
                    $('#inputWizardSiteMaxFeedInPower').addClass("errorField");
                }
            }

            //IMPORTANT: if no second power meter is enabled, then there must be at least one PV inverter
            var bAtLeastOneInverter = false;
            // Check if we have to check IP Adress labels for duplicates
            var inverterType = $("#inputWizardSystemSetupInvManufacturer").val() + $("#inputWizardSystemSetupInverterType").val();
            var bhasIPAddress = false;
            if (inverterType == "61")
                bhasIPAddress = true;

            // Check if a valid type was selected
                if($("#inputWizardSystemSetupInvManufacturer").val() != "0" &&
                   $("#inputWizardSystemSetupInverterType").val() != "0" &&
                   $("#optWizardPvInverterCount").val() > 0)
                {
                    bAtLeastOneInverter = true;
                }

            if($("#inputWizardSystemSetupPowerMeterConsumer").is(":checked") == false &&
               $("#inputWizardSystemSetupPowerMeterProducer").is(":checked") == false) {
                outer_loop:
                for(var inv_id=0;inv_id < $("#optWizardPvInverterCount").val();inv_id++)
                {
                    if(!isValidIP($("#WIZARDDEVICE_INV_IP"+inv_id).val()))
                    {
                        $("#WIZARDDEVICE_INV_IP" + inv_id ).addClass("errorField");
                        state = 0;
                    }
                    // Check decimal format and address range 1-255
                    if(!isValidDecimal($("#WIZARDDEVICE_INV_SLAVE_ADRESS"+inv_id).val()) ||
                       $("#WIZARDDEVICE_INV_SLAVE_ADRESS"+inv_id).val() <= 0 ||
                       $("#WIZARDDEVICE_INV_SLAVE_ADRESS"+inv_id).val() > 255)
                    {
                        $("#WIZARDDEVICE_INV_SLAVE_ADRESS" + inv_id ).addClass("errorField");
                        state = 0;
                    }

                    if (!bhasIPAddress)
                    {
                        // Find duplicates in RS485
                        for(var rs485_id=0;rs485_id < $("#optWizardPvInverterCount").val();rs485_id++)
                        {// Skip own value OR skip when i is bigger than Inverter Count
                            if ( rs485_id == inv_id)
                                    continue;
                            if($("#WIZARDDEVICE_INV_SLAVE_ADRESS" + inv_id ).val() == $("#WIZARDDEVICE_INV_SLAVE_ADRESS" + k ).val())
                            {
                                state = 0;
                                $("#WIZARDDEVICE_INV_SLAVE_ADRESS" + inv_id ).addClass("errorField");
                                $("#WIZARDDEVICE_INV_SLAVE_ADRESS" + rs485_id ).addClass("errorField");
                                alert(lng.WIZARD_CHECK_RS485);
                                break outer_loop;
                            }
                        }
                    }
                    else
                    {
                        // Find duplicates in IP
                        for(var ip_id=0;ip_id < $("#optWizardPvInverterCount").val();ip_id++)
                        {// Skip own value
                            if ( ip_id == inv_id)
                                    continue;
                            if($("#WIZARDDEVICE_INV_IP" + inv_id ).val() == $("#WIZARDDEVICE_INV_IP" + ip_id ).val())
                            {
                                state = 0;
                                $("#WIZARDDEVICE_INV_IP" + inv_id ).addClass("errorField");
                                $("#WIZARDDEVICE_INV_IP" + ip_id ).addClass("errorField");
                                alert(lng.WIZARD_CHECK_RS485);
                                break outer_loop;
                            }
                        }
                    }
                }
                if((bAtLeastOneInverter == false) &&
                    ($('#checkboxWizardExternalPV').prop('checked'))) {
                    state = 0;
                    $("#optWizardPvInverterCount").addClass("errorField");
                    alert(lng.WIZARD_INVERTERS_METER_HOUSE_CHECK);
                }
            }

            break;

        case "pnWizardCarouselConfigWallbox":  // config wallbox page
            state = 1;
            var max = $("#optWizardWallboxMaxTotalGrid").val();
            if (isNaN(max) || max < 0)
            {
                $("#optWizardWallboxMaxTotalGrid").addClass("errorField");
                state = 0;
            }
            outer_loop:
            for(var wb_id=0;wb_id < $("#optWizardWallboxCount").val();wb_id++)
            {
                // Check decimal format and address range 1-16
                if(!isValidDecimal($("#WIZARDSETUP_WALLBOX_IDS"+wb_id).val()) ||
                   $("#WIZARDSETUP_WALLBOX_IDS"+wb_id).val() <= 0 ||
                   $("#WIZARDSETUP_WALLBOX_IDS"+wb_id).val() > 16)
                {
                    $("#WIZARDSETUP_WALLBOX_IDS" + wb_id ).addClass("errorField");
                    state = 0;
                }
                // check length of serial number
                if($("#wizardWallboxSerial"+wb_id).val().length !== 5){
                    $("#wizardWallboxSerial"+wb_id).addClass("errorField");
                    state = 0;
                    alert(lng.WIZARD_CHECK_SERIAL);
                }
                // Find duplicates in RS485
                for(var prev_id=0; prev_id<wb_id; prev_id++)
                {
                    // Skip own value
                    if (prev_id == wb_id)
                    {
                        continue;
                    }
                    if($("#WIZARDSETUP_WALLBOX_IDS" + wb_id ).val() == $("#WIZARDSETUP_WALLBOX_IDS" + prev_id ).val())
                    {
                        state = 0;
                        $("#WIZARDSETUP_WALLBOX_IDS" + wb_id ).addClass("errorField");
                        $("#WIZARDSETUP_WALLBOX_IDS" + prev_id ).addClass("errorField");
                        alert(lng.WIZARD_CHECK_RS485);
                        break outer_loop;
                    }
                    if($("#wizardWallboxSerial" + wb_id ).val() == $("#wizardWallboxSerial" + prev_id ).val() &&
                        $("#WIZARDSETUP_WALLBOX_TYPE" + wb_id ).val() == $("#WIZARDSETUP_WALLBOX_TYPE" + prev_id ).val())
                    {
                        state = 0;
                        $("#wizardWallboxSerial" + wb_id ).addClass("errorField");
                        $("#WIZARDSETUP_WALLBOX_TYPE" + wb_id ).addClass("errorField");
                        alert(lng.WIZARD_CHECK_SERIAL);
                        break outer_loop;
                    }
                }
            }
            break;

        case "pnWizardCarouselConfigPowerUnit":  // Power Unit Page
            state = 1;
            errorMessage = 0;
            var noSensors = false;

            // Check if any activated
            if ($("#optWizardPwrUnitCount").val() > 0)
            {
                // Check all activated
                outer_loop:
                for(var pu_id=0;pu_id < $("#optWizardPwrUnitCount").val();pu_id++)
                {
                  // Check Type
                  if ($("#inputWizardSystemSetupPowerUnit" + pu_id + "Model").val() == "00")
                  {
                      state = 0;
                      $("#inputWizardSystemSetupPowerUnit" + pu_id + "Model").addClass("errorField");
                  }

                  var any_pu_power = false;

                  for(var phase=1;phase <= 3;phase++)
                  {
                        // Check total power
                        if($("#PWR_UNITCONNPWR_" + phase + pu_id).val() < 0 || $("#PWR_UNITCONNPWR_" + phase + pu_id).val() > 2000 ) {
                          state = 0;
                          $("#PWR_UNITCONNPWR_" + phase + pu_id).addClass("errorField");
                          alert(errorMessage = lng.WIZARD_CHECK_PU_MAX_POWER);
                          break;
                        }

                        if($("#PWR_UNITCONNPWR_" + phase + pu_id).val() > 0)
                        {
                                any_pu_power = true;
                        }
                  }

                  if (any_pu_power == false)
                  {
                        state = 0;
                        $("#gui_pwr_unit_total" + pu_id).addClass("errorField");
                        alert(errorMessage = lng.WIZARD_CHECK_PU_TOTAL_POWER);
                        break;
                  }

                  // Check if any temp sensors are enabled
                  if($("#inputWizardSystemSetupPowerUnit" + pu_id + "TempCount").val() != 0)
                  {
                      // Check if min temp is < than max temp
                      if(!isValidDecimal($("#PWR_UNITTEMPMIN" + pu_id ).val()) ||
                             !isValidDecimal($("#PWR_UNITTEMPMAX" + pu_id ).val())) {
                        state = 0;
                        $("#PWR_UNITTEMPMIN" + pu_id ).addClass("errorField");
                        $("#PWR_UNITTEMPMAX" + pu_id ).addClass("errorField");
                        alert(lng.WIZARD_CHECK_POS_DECIMAL);
                        break;
                      }
                      // Check if min temp is < than max temp
                      if(parseInt($("#PWR_UNITTEMPMIN" + pu_id ).val()) >= parseInt($("#PWR_UNITTEMPMAX" + pu_id ).val()) )
                      {
                        state = 0;
                        $("#PWR_UNITTEMPMIN" + pu_id ).addClass("errorField");
                        $("#PWR_UNITTEMPMAX" + pu_id ).addClass("errorField");
                        alert(lng.WIZARD_CHECK_PU_MIN_TEMP);
                        break;
                      }

                          // Check if temperature is between lower und upper limit.
                          if(!isInRange(parseInt($('#PWR_UNITTEMPMIN' + pu_id).val()),
                                        $("#PWR_UNITTEMP_LIMIT_LOWER").val(),
                                        $("#PWR_UNITTEMP_LIMIT_UPPER").val()))
                          {
                              state = 0;
                              $("#PWR_UNITTEMPMIN" + pu_id).addClass("errorField");
                              alert(lng.WIZARD_CHECK_PU_TEMP_RANGE);
                              break;
                          }

                         if(!isInRange(parseInt($('#PWR_UNITTEMPMAX' + pu_id).val()), 0, 100))
                          {
                              state = 0;
                              $("#PWR_UNITTEMPMAX" + pu_id).addClass("errorField");
                              alert(lng.WIZARD_CHECK_PU_TEMP_RANGE);
                              break;
                          }

                  }
                  else
            	  {
                	  noSensors = true;
            	  }
                  // Check Modbus Adress
                  if($("#PWR_UNITADRESS" + pu_id ).val() < 1 || $("#PWR_UNITADRESS" + pu_id ).val() >= 245 ||
                     !isValidDecimal($("#PWR_UNITADRESS" + pu_id ).val())) {
                    state = 0;
                    $("#PWR_UNITADRESS" + pu_id ).addClass("errorField");
                    alert(lng.lErrModbusAddr);
                    break;
                  }
                  // Check if SHKW feature is needed
                  if(htmlAsNumber("#FEATURESSHKW") == 0 &&
                     ($("#inputWizardSystemSetupPowerUnit" + pu_id + "Model").val() == 1)) {
                    state = 0;
                    $("#inputWizardSystemSetupPowerUnit" + pu_id + "Model").addClass("errorField");
                    alert(lng.lNotActive);
                    break;
                  }
                  // Check if phase power is correct decimal
                  for(var phase_id=1; phase_id <= 3; phase_id++)
                  {
                    if(!isValidDecimal($("#PWR_UNITCONNPWR_" + phase_id + pu_id).val()))
                    {
                        state = 0;
                        $("#PWR_UNITCONNPWR_" + phase_id + pu_id).addClass("errorField");
                        alert(lng.WIZARD_CHECK_POS_DECIMAL + ": " + $("#PWR_UNITCONNPWR_" + phase_id + pu_id).val());
                        break outer_loop;
                    }
                  }
                  // Find duplicates in RS485
                  for(var m=0;m < $("#optWizardPwrUnitCount").val();m++)
                  {// Skip own value
                        if ( m == pu_id )
                                continue;
                        if($("#PWR_UNITADRESS" + pu_id ).val() == $("#PWR_UNITADRESS" + m ).val())
                        {
                                state = 0;
                                $("#PWR_UNITADRESS" + pu_id ).addClass("errorField");
                                $("#PWR_UNITADRESS" + m ).addClass("errorField");
                                alert(lng.WIZARD_CHECK_RS485);
                                break outer_loop;
                        }
                  }
                }

                // Check if Charge Prio was selected
                if($("#optWizardChargePrio :selected").text() == "")
                {
                    state = 0;
                    alert(lng.lErrChargePrioNotSelected);
                    $("#optWizardChargePrio").addClass("errorField");
                }

                // Warn user if he configured minimum heat control, but no temp sensors
                if(($("#optWizardPU_Usage").val() == 3) && noSensors == true)
            	{
                	alert(lng.lTempSensorWarning);
            	}
            }
            break;

        case "pnWizardCarouselConfigExtended":  //extended-config page
            state = 1;
            errorMessage = 0;

            // Check IP Settings
            if (!isValidIP($("#inputWizardNetworkstaticIP_Adr").val()))
            {
                $("#inputWizardNetworkstaticIP_Adr").addClass('errorField');
                state = 0;
                errorMessage = lng.WIZARD_CHECK_IP_ADDRESS;
            }

            if (!isValidIP($("#inputWizardNetworkNetworkMask").val()))
            {
                ("#inputWizardNetworkNetworkMask").addClass('errorField');
                state = 0;
                errorMessage = lng.WIZARD_CHECK_IP_ADDRESS;
            }

            if (!isValidIP($("#inputWizardNetworkGateWayIP").val()))
            {
                $("#inputWizardNetworkGateWayIP").addClass('errorField');
                state = 0;
                errorMessage = lng.WIZARD_CHECK_IP_ADDRESS;
            }

            if (!isValidIP($("#inputWizardNetworkDNS_Server_IP").val()))
            {
                $("#inputWizardNetworkDNS_Server_IP").addClass('errorField');
                state = 0;
                errorMessage = lng.WIZARD_CHECK_IP_ADDRESS;
            }

            // Check RCR settings
            for(var rcr_id=0; rcr_id < 4; rcr_id++)
            if(!isValidDecimal($("#WIZARDSETUP_RCR_STEPS" + rcr_id).val()) || $("#WIZARDSETUP_RCR_STEPS" + rcr_id).val() < 0 || $("#WIZARDSETUP_RCR_STEPS" + rcr_id).val() > 100)
            {
                    $("#WIZARDSETUP_RCR_STEPS" + rcr_id).addClass('errorField');
                    errorMessage = lng.WIZARD_CHECK_PERCENTAGE;
                    state = 0;
            }

            if (state == 0) {
                alert(errorMessage);
            }

            break;

        case "pnWizardCarouselRegistration": //registration confirmation page
            state = 1;
            errorMessage = 0;

            //validate all checkboxes
            aCheckboxes = ["chkWizardInstallerRegConfirmDensity", "chkWizardInstallerRegConfirmVDE", "chkWizardInstallerRegConfirmAccuPole", "chkWizardInstallerRegConfirmKnowledge", "chkWizardInstallerRegConfirmAccuFull", "chkWizardInstallerRegConfirmElectr", "chkWizardInstallerRegConfirmReadDocs" , "chkWizardInstallerRegConfirmAll"];
            for(var box=0,l=aCheckboxes.length;box<l;box++) {
                if($("#" + aCheckboxes[box]).is(":checked") == false){
                    $("#" + aCheckboxes[box]).parent().addClass("errorField");

                    state = 0;
                }
            }

            if(!isValidSenecNumber($("#lblWizardSenecSerial").val())) {
                $("#lblWizardSenecSerial").addClass("errorField");
                confwizardShowErrorLabel("lblWizardSenecSerialCheckResult", lng.WIZARD_CHECK_SENEC_SERIAL_FIELD_ERROR_VALIDATION);
                state = 0;
            }

            if(state == 0) confwizardShowErrorLabel("lblWizardConfirmationCheckResult", lng.WIZARD_CHECK_CONFIRMATION_ERROR_CHECK_ALL);

            break;
        default:
            state = 1;

            break;

    }
    return state;
}

function fillInverterTypeList(value) {
    // Display all fields and labels
    $("#inputWizardSystemSetupInverterType").empty();
    $("#inputWizardSystemSetupInverterType").removeClass("d-hide").show();
    $("#inputWizardSystemSetupInverterType_LBL").removeClass("d-hide").show();

    switch (value)
    {
        case 0:
        case "0":
            break;

        case "1": // Kostal
        case 1:
            $("#inputWizardSystemSetupInverterType").append('<option value="0">---</option><option value="1">Piko</option><option value="2">Piko MP</option>');
            $("#inputWizardSystemSetupInverterType").append('<option value="3">Piko IQ/Plenticore</option>');
            break;

        case "2": // Solar Invert
        case 2:
            $("#inputWizardSystemSetupInverterType").append('<option value="0">---</option><option value="2">SOL XXXX-XX</option><option value="1">2000TL</option>');
            break;

        case "3": // Delta -> Solivia and RPI have the same protocol
        case 3:
            $("#inputWizardSystemSetupInverterType").append('<option value="0">---</option><option value="1">Solivia/RPI</option>');
            break;

        case "4": // Fronius
        case 4:
            $("#inputWizardSystemSetupInverterType").append('<option value="0">---</option><option value="2">Symo</option><option value="1">IG Plus</option>');
            break;

        case "5": // SolarMax
        case 5:
            $("#inputWizardSystemSetupInverterType").addClass("d-hide").hide();
            $("#inputWizardSystemSetupInverterType_LBL").addClass("d-hide").hide();
            fillInverterTypeAdressLabel(0);
            break;

        case "6": // SMA
        case 6:
            $("#inputWizardSystemSetupInverterType").append('<option value="0">---</option><option value="1">Web-Connect Modul</option>');
            break;
        case "7": //SolarEdge
        case 7:
            $("#inputWizardSystemSetupInverterType").addClass("d-hide").hide();
            $("#inputWizardSystemSetupInverterType_LBL").addClass("d-hide").hide();
            fillInverterTypeAdressLabel(0);
        break;
        case "8": //Steca
        case 8:
            $("#inputWizardSystemSetupInverterType").addClass("d-hide").hide();
            $("#inputWizardSystemSetupInverterType_LBL").addClass("d-hide").hide();
            fillInverterTypeAdressLabel(0);
        break;
        case "9": //Solar Frontier
        case 9:
            $("#inputWizardSystemSetupInverterType").addClass("d-hide").hide();
            $("#inputWizardSystemSetupInverterType_LBL").addClass("d-hide").hide();
            fillInverterTypeAdressLabel(0);
        break;
        case "10": //Steca Hybrid
        case 10:
            $("#inputWizardSystemSetupInverterType").addClass("d-hide").hide();
            $("#inputWizardSystemSetupInverterType_LBL").addClass("d-hide").hide();
            fillInverterTypeAdressLabel(0);
        break;
    }
}

function fillInverterTypeAdressLabel(value) {
  var smaWebconnect = $("#inputWizardSystemSetupInvManufacturer").val()+value == "61";
  var kostalTcp = ($("#inputWizardSystemSetupInvManufacturer").val()+value == "13");
  var stecaHybrid = ($("#inputWizardSystemSetupInvManufacturer").val()+value == "100");

  // SMA + WebConnect Selected
  var counter;
  for(counter=0; counter < 6; counter++)
  {
    if(smaWebconnect)
    {
      $("#WIZARDDEVICE_INV_SLAVE_ADRESS"+counter).addClass("d-hide").hide();
      $("#WIZARDDEVICE_INV_IP"+counter).removeClass("d-hide").show();
      $('label[for=WIZARDDEVICE_INV_SLAVE_ADRESS'+counter+']').addClass("d-hide").hide();
      $('label[for=WIZARDDEVICE_INV_IP'+counter+']').removeClass("d-hide").show();
    }
    else if (kostalTcp)
    {
      $("#WIZARDDEVICE_INV_SLAVE_ADRESS"+counter).addClass("d-hide").show();
      $("#WIZARDDEVICE_INV_IP"+counter).removeClass("d-hide").show();
      $('label[for=WIZARDDEVICE_INV_SLAVE_ADRESS'+counter+']').addClass("d-hide").show();
      $('label[for=WIZARDDEVICE_INV_IP'+counter+']').removeClass("d-hide").show();
    }
    else if(stecaHybrid)
    {
      $("#WIZARDDEVICE_INV_SLAVE_ADRESS"+counter).addClass("d-hide").show();
      $("#WIZARDDEVICE_INV_IP"+counter).removeClass("d-hide").hide();
      $('label[for=WIZARDDEVICE_INV_SLAVE_ADRESS'+counter+']').addClass("d-hide").show();
      $('label[for=WIZARDDEVICE_INV_IP'+counter+']').removeClass("d-hide").hide();
    }
    else
    {
      $("#WIZARDDEVICE_INV_SLAVE_ADRESS"+counter).removeClass("d-hide").show();
      $("#WIZARDDEVICE_INV_IP"+counter).addClass("d-hide").hide();
      $('label[for=WIZARDDEVICE_INV_SLAVE_ADRESS'+counter+']').removeClass("d-hide").show();
      $('label[for=WIZARDDEVICE_INV_IP'+counter+']').addClass("d-hide").hide();
    }
  }
}

function fillInverterPhaseSelection() {
    // Display all fields and labels
    $("#inputWizardSystemSetupXtenderPhase").empty();

    // Get system type
    var system_type = htmlAsNumber('#FACTORYSYS_TYPE');
    switch (system_type)
    {
        case 0: // Home 8.0
        case 2: // SolarInvert 10.0
        case 3: // Home 4.0
        case 4: // Li Cube
        case 7: // Hombe 6.0
        case 8: // Home 10.0
        case 9: // Li V2
        case 11: // Home 10.0 V2
        case 12: // LG OEM
        case 15://BMZ
        case 16://BMZ serial
        case 17://Steca serial
        case 18://Steca serial
        case 19://Steca serial
            $("#inputWizardSystemSetupXtenderPhase").append('<option value="01">L1</option><option value="02">L2</option><option value="03">L3</option>');
            break;

        case 1: // Business V1
        case 6: // Lithium Business
        case 10: // Business V2
        case 14: // LG Business
            $("#inputWizardSystemSetupXtenderPhase").append('<option value="04">L1-L2-L3</option>');
            break;

        case 5: // 15.0 Lithium - 2 inverter
        case 13: // LG Business - 2 inverter
            $("#inputWizardSystemSetupXtenderPhase").append('<option value="05">L1-L2</option><option value="06">L2-L3</option><option value="07">L1-L3</option>');
            break;
        default:
            // This should not happen
            break;
    }

    // Update from settings
    $('#inputWizardSystemSetupXtenderPhase').val($('#WIZARDSETUP_USED_PHASE').html());
}

function login(username, password) {
    IndexPageObj.handleTextAreaUpdate("LOG", "USERNAME", "st_" + username);
    IndexPageObj.handleTextAreaUpdate("LOG", "PASSWORD", "st_" + password);
    IndexPageObj.handleButtonClick("LOG", "LOG_IN_BUTT");
}

function send_login()
{
    $('input').removeClass('errorField');
    $('#LoginStatus').css('color', 'black');
    if ($('#iusername').val().length != 0 & $('#ipassword').val() != 0)
    {
        login($('#iusername').val(), $('#ipassword').val());
        $('#LoginStatus').text(lng.CHECK_INTERNET_RESULT_CHECK);

        CheckLoginTimer =  setTimeout( function() {
            $('#iusername').addClass("errorField");
            $('#ipassword').addClass("errorField");
            $('#LoginStatus').css('color', 'var(--error-color)');
            $('#LoginStatus').text(lng.CHECK_INTERNET_RESULT_NONE);
            $('#iusername').val('');
            $('#ipassword').val('');
        }, 3500);
        return;
    }
    $('#LoginStatus').text(lng.WIZARD_CHECK_FIELDS_ERROR);
    $('#LoginStatus').css('color', 'var(--error-color)');
    $('#iusername').addClass("errorField");
    $('#ipassword').addClass("errorField");
}

function logout() {
    IndexPageObj.handleButtonClick("LOG", "LOG_OUT_BUTT");
}

function modal_setState(state) {
    modal_state = state;
}

function modal_getState() {
    return modal_state;
}

//  =======================================================
//check internet-connection of Senec-IES MCU-Board and check internet-connection of browser
//and then show on wizard page "internet-connection"(page 2)
function confwizardCheckInternetConnection() {

    //IMPORTANT workaround: use html-img-tag for Cross-Domain requests, currently there is no way to get error status of iframe
    //its possible to use a timeout to check if the mein-senec.de website is loaded but its ugly and more unsafe than the img-workaround
    $('#objCheckBrowserInternetConnection').attr("src", "/"); //IMPORTANT: reset img-source to a no-image pointer on server for each check
    $("#lblWizardClientInternetConnection").text(lng.CHECK_INTERNET_RESULT_CHECK);
/*
    $('#objCheckBrowserInternetConnection').on("error", function() {
        //server is NOT reachable
        $("#lblWizardClientInternetConnection").text(lng.CHECK_INTERNET_RESULT_NONE);
        $("#lblWizardClientInternetConnection").addClass('wizard-check-internet-connection-negative');
        $("#lblWizardClientInternetConnection").removeClass('wizard-check-internet-connection-positive');
        $("#lblWizardBrowserInternetAvailable").text(0);
    });

    $('#objCheckBrowserInternetConnection').on("load", function() {
        //server is reachable
        $("#lblWizardClientInternetConnection").text(lng.CHECK_INTERNET_RESULT_OK);
        $("#lblWizardClientInternetConnection").addClass('wizard-check-internet-connection-positive');
        $("#lblWizardClientInternetConnection").removeClass('wizard-check-internet-connection-negative');
        $("#lblWizardBrowserInternetAvailable").text(1);
    });
    //VERY IMPORTANT: this logo must be availbale at the senec-monitoring server to check internet access
    //also check another website like google to check gerneral internet access
    $('#objCheckBrowserInternetConnection').attr("src", "https://mein-senec.de/sps/sps_public/G2P/wizard/data/x.png");
	//.png is not available on playground
*/

	//cheap reachability check using available POST function
	setTimeout(function () {
		checkInstallerLoginAjax('online','check', function(){
				//server is reachable    //result is "authenticated: false" but code 200
				$("#lblWizardClientInternetConnection").text(lng.CHECK_INTERNET_RESULT_OK);
				$("#lblWizardClientInternetConnection").addClass('wizard-check-internet-connection-positive');
				$("#lblWizardClientInternetConnection").removeClass('wizard-check-internet-connection-negative');
				$("#lblWizardBrowserInternetAvailable").text(1);
		    }, function(){
				//server is NOT reachable
				$("#lblWizardClientInternetConnection").text(lng.CHECK_INTERNET_RESULT_NONE);
				$("#lblWizardClientInternetConnection").addClass('wizard-check-internet-connection-negative');
				$("#lblWizardClientInternetConnection").removeClass('wizard-check-internet-connection-positive');
				$("#lblWizardBrowserInternetAvailable").text(0);
		    });
	}, 1); //make call async.
}

//get all form-fields for a page and remove the "errorField" class
function confwizardResetErrorFields() {
    $('input').removeClass('errorField');
    $('label').removeClass('errorLabel');
    $('label').removeClass('errorField');
    $('select').removeClass('errorField');
    $('.wizard-check-result').hide();
}

function confwizardShowErrorLabel(sElementId, sMessage) {
    $("#" + sElementId).show();
    $("#" + sElementId).addClass("errorLabel");
    $("#" + sElementId).text(sMessage);
}

function fetch_customer_data() {
    // Here we copy the customer data into the installation place text fields
    $("#txtWizardAkkuSiteGeo_Street").val($("#txtWizardOwner_Street").val());
    $("#txtWizardAkkuSiteGeo_HouseNum").val($("#txtWizardOwner_HouseNumber").val());
    $("#txtWizardAkkuSiteGeo_PostalCode").val($("#txtWizardOwner_PostalCode").val());
    $("#txtWizardAkkuSiteGeo_City").val($("#txtWizardOwner_City").val());
    $("#inputWizardAKKU_SITE_GEO_COUNTRY").val($("#inputWizardOWNER_COUNTRY").val());
    fillTimeZoneSelect($("#inputWizardOWNER_COUNTRY").val());
}

function checkSenecMeterComm() {
    //get test results from MCU ----------------------------------
    //first tell MCU to perform test and then get results
    nTestSenecMeterResult = 0;

    // Disable SerialNumber Field
    $("#inputWizardSystemSetupSenecMeterSerial").prop( "disabled", true );
    $("#btnWizardSenecMeterStartTest").prop('disabled', true);

    $("#inputWizardSenecMeterlTestResult").html(lng.WIZARD_EG_TEST_INSTALLATION_PENDING);
    $("#inputWizardSenecMeterlTestResult").removeClass("successLabel errorLabel");

    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");
    pageObj.add_property_to_object("WIZARD", "TEST_SENEC_METER", "u8_01");
    pageObj.add_property_to_object("WIZARD", "SENEC_METER_SN", pageObj.castVarValue('u3', $("#inputWizardSystemSetupSenecMeterSerial").val()));
    pageObj.singlePageRefresh();

    //poll and get econamic-grid test results ---------------------------------------
    const nTimerInterval = 2000, nTimerCycles = 5;
    var nSenecMeterResultCounter = 0;

    var nSenecMeterTestResultTimer = setInterval( function() {
        nSenecMeterResultCounter++;
        console.log("poll for senec-meter test-results");

        pageObj.reInitJSONObject();
        pageObj.add_json_object("WIZARD");
        pageObj.add_property_to_object("WIZARD", "TEST_SENEC_METER", "");
        pageObj.singlePageRefresh();

        nTestSenecMeterResult = parseInt($("#WIZARDTEST_SENEC_METER").val());

        if(nTestSenecMeterResult == 1) {
            clearInterval(nSenecMeterTestResultTimer);
            confwizardEconamicGridShowSuccessLabel("inputWizardSenecMeterlTestResult", lng.WIZARD_EG_TEST_INSTALLATION_POWERMETER_COM_OK);
            $("#inputWizardSystemSetupSenecMeterSerial").removeClass("errorField");
        }

        if(nSenecMeterResultCounter > nTimerCycles) {
            clearInterval(nSenecMeterTestResultTimer);
            // Enable Serialnumber field to allow editing and how error label
            $("#inputWizardSystemSetupSenecMeterSerial").prop( "disabled", false );
            confwizardEconamicGridShowErrorLabel("inputWizardSenecMeterlTestResult", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
            // Reset Serial on MCU
            pageObj.reInitJSONObject();
            pageObj.add_json_object("WIZARD");
            pageObj.add_property_to_object("WIZARD", "SENEC_METER_SN", "u3_0");
            pageObj.singlePageRefresh();
            // Enable CheckButton
            $("#btnWizardSenecMeterStartTest").prop('disabled', false);
        }
    }, nTimerInterval);
}

function checkHeatpumpMeterComm() {
    //get test results from MCU ----------------------------------
    //first tell MCU to perform test and then get results
    nTestHeatpumpMeterResult = 0;

    // Disable SerialNumber Field
    $("#inputWizardSystemSetupHeatpumpMeterSerial").prop( "disabled", true );
    $("#btnWizardHeatpumpMeterStartTest").prop('disabled', true);

    $("#inputWizardHeatpumpMeterTestResult").html(lng.WIZARD_EG_TEST_INSTALLATION_PENDING);
    $("#inputWizardHeatpumpMeterTestResult").removeClass("successLabel errorLabel");

    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");
    pageObj.add_property_to_object("WIZARD", "TEST_HEATPUMP_METER", "u8_01");
    pageObj.add_property_to_object("WIZARD", "HEATPUMP_METER_SN", pageObj.castVarValue('u3', $("#inputWizardSystemSetupHeatpumpMeterSerial").val()));
    pageObj.singlePageRefresh();

    //poll and get econamic-grid test results ---------------------------------------
    const nTimerInterval = 2000, nTimerCycles = 5;
    var nHeatpumpMeterResultCounter = 0;

    var nHeatpumpMeterTestResultTimer = setInterval( function() {
        nHeatpumpMeterResultCounter++;
        console.log("poll for Heatpump-meter test-results");

        pageObj.reInitJSONObject();
        pageObj.add_json_object("WIZARD");
        pageObj.add_property_to_object("WIZARD", "TEST_HEATPUMP_METER", "");
        pageObj.singlePageRefresh();

        nTestHeatpumpMeterResult = parseInt($("#WIZARDTEST_HEATPUMP_METER").val());

        if(nTestHeatpumpMeterResult == 1) {
            clearInterval(nHeatpumpMeterTestResultTimer);
            confwizardEconamicGridShowSuccessLabel("inputWizardHeatpumpMeterTestResult", lng.WIZARD_EG_TEST_INSTALLATION_POWERMETER_COM_OK);
            $("#inputWizardSystemSetupHeatpumpMeterSerial").removeClass("errorField");
        }

        if(nHeatpumpMeterResultCounter > nTimerCycles) {
            clearInterval(nHeatpumpMeterTestResultTimer);
            // Enable Serialnumber field to allow editing and how error label
            $("#inputWizardSystemSetupHeatpumpMeterSerial").prop( "disabled", false );
            confwizardEconamicGridShowErrorLabel("inputWizardHeatpumpMeterTestResult", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
            // Reset Serial on MCU
            pageObj.reInitJSONObject();
            pageObj.add_json_object("WIZARD");
            pageObj.add_property_to_object("WIZARD", "HEATPUMP_METER_SN", "u3_0");
            pageObj.singlePageRefresh();
            // Enable CheckButton
            $("#btnWizardHeatpumpMeterStartTest").prop('disabled', false);
        }
    }, nTimerInterval);
}

function checkGenerationMeterComm() {
    //get test results from MCU ----------------------------------
    //first tell MCU to perform test and then get results
    nTestGenerationMeterResult = 0;

    // Disable SerialNumber Field
    $("#inputWizardSystemSetupGenerationMeterSerial").prop( "disabled", true );
    $("#btnWizardGenerationMeterStartTest").prop('disabled', true);

    $("#inputWizardGenerationMeterlTestResult").html(lng.WIZARD_EG_TEST_INSTALLATION_PENDING);
    $("#inputWizardGenerationMeterlTestResult").removeClass("successLabel errorLabel");

    pageObj.reInitJSONObject();
    pageObj.add_json_object("WIZARD");
    pageObj.add_property_to_object("WIZARD", "TEST_GENERATION_METER", "u8_01");
    pageObj.add_property_to_object("WIZARD", "GENERATION_METER_SN", pageObj.castVarValue('u3', $("#inputWizardSystemSetupGenerationMeterSerial").val()));
    pageObj.singlePageRefresh();

    //poll and get econamic-grid test results ---------------------------------------
    const nTimerInterval = 2000, nTimerCycles = 5;
    var nGenerationMeterResultCounter = 0;

    var nGenerationMeterTestResultTimer = setInterval( function() {
        nGenerationMeterResultCounter++;
        console.log("poll for Generation-meter test-results");

        pageObj.reInitJSONObject();
        pageObj.add_json_object("WIZARD");
        pageObj.add_property_to_object("WIZARD", "TEST_GENERATION_METER", "");
        pageObj.singlePageRefresh();

        nTestGenerationMeterResult = parseInt($("#WIZARDTEST_GENERATION_METER").val());

        if(nTestGenerationMeterResult == 1) {
            clearInterval(nGenerationMeterTestResultTimer);
            confwizardEconamicGridShowSuccessLabel("inputWizardGenerationMeterlTestResult", lng.WIZARD_EG_TEST_INSTALLATION_POWERMETER_COM_OK);
            $("#inputWizardSystemSetupGenerationMeterSerial").removeClass("errorField");
        }

        if(nGenerationMeterResultCounter > nTimerCycles) {
            clearInterval(nGenerationMeterTestResultTimer);
            // Enable Serialnumber field to allow editing and how error label
            $("#inputWizardSystemSetupGenerationMeterSerial").prop( "disabled", false );
            confwizardEconamicGridShowErrorLabel("inputWizardGenerationMeterlTestResult", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
            // Reset Serial on MCU
            pageObj.reInitJSONObject();
            pageObj.add_json_object("WIZARD");
            pageObj.add_property_to_object("WIZARD", "GENERATION_METER_SN", "u3_0");
            pageObj.singlePageRefresh();
            // Enable CheckButton
            $("#btnWizardGenerationMeterStartTest").prop('disabled', false);
        }
    }, nTimerInterval);
}

function PWR_UNIT_update_total_power() {
    for (c = 0; c < 6; c++)
  {
        $('#gui_pwr_unit_total'+c).val(
          parseInt($('#PWR_UNITCONNPWR_1'+c).val()) +
          parseInt($('#PWR_UNITCONNPWR_2'+c).val()) +
          parseInt($('#PWR_UNITCONNPWR_3'+c).val()) );
  }
}

function fillTimeZoneSelect(country) {
    $('#inputWizardTimeZone').prop('disabled', false);
    switch (country)
    {
        case "de":
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="Europe/Berlin">' + TimeZoneArray["Europe/Berlin"] + '</option>');
            break;
        case "it":
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="Europe/Rome">' + TimeZoneArray["Europe/Rome"] + '</option>');
            break;
        case "at":
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="Europe/Vienna">' + TimeZoneArray["Europe/Vienna"] + '</option>');
            break;
        case "ch":
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="Europe/Zurich">' + TimeZoneArray["Europe/Zurich"] + '</option>');
            break;
        case "fr":
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="Europe/Paris">' + TimeZoneArray["Europe/Paris"] + '</option>');
            break;
        case "be":
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="Europe/Brussels">' + TimeZoneArray["Europe/Brussels"] + '</option>');
            break;
        case "nl":
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="Europe/Amsterdam">' + TimeZoneArray["Europe/Amsterdam"] + '</option>');
            break;
        case "au":
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="Australia/Perth">' + TimeZoneArray["Australia/Perth"] + '</option>');
            $("#inputWizardTimeZone").append('<option value="Australia/Darwin">' + TimeZoneArray["Australia/Darwin"] + '</option>');
            $("#inputWizardTimeZone").append('<option value="Australia/Adelaide">' + TimeZoneArray["Australia/Adelaide"] + '</option>');
            $("#inputWizardTimeZone").append('<option value="Australia/Brisbane">' + TimeZoneArray["Australia/Brisbane"] + '</option>');
            $("#inputWizardTimeZone").append('<option value="Australia/Sydney">' + TimeZoneArray["Australia/Sydney"] + '</option>');
            $("#inputWizardTimeZone").append('<option value="Australia/Hobart">' + TimeZoneArray["Australia/Hobart"] + '</option>');
            $("#inputWizardTimeZone").append('<option value="Australia/Melbourne">' + TimeZoneArray["Australia/Melbourne"] + '</option>');
            break;
        case "gb":
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="Europe/London">' + TimeZoneArray["Europe/London"] + '</option>');
            break;
        default:
            $('#inputWizardTimeZone').empty();
            $("#inputWizardTimeZone").append('<option value="0">---</option>');
            break;
    }
}

// If the first name is 'IamLazy', this function will fill the wizard
function DebugFillWizard() {
    $("#txtWizardOwner_Name").val("Max");
    $("#txtWizardOwner_Surname").val("Mustermann");
    $("#txtWizardOwner_Street").val("Wittenbergerstr.");
    $("#txtWizardOwner_HouseNumber").val("15");
    $("#txtWizardOwner_PostalCode").val("04129");
    $("#txtWizardOwner_City").val("Leipzig");
    $("#inputWizardOWNER_COUNTRY").val("de");
    $("#txtWizardOwner_Email").val("labor+endkunde@senec-ies.com");
    $("#txtWizardOwnerConfirmEmail").val("labor+endkunde@senec-ies.com");
    $("#txtWizardOwner_Phone").val("0049-123456");

    fetch_customer_data();

    fillTimeZoneSelect("de");

    $('#inputWizardSystemSetupGridConnectionMultiPhase').attr("checked", true);
    $(".inputInverterPhaseSelection").removeClass("d-hide").show();
    $('#img_phase_selection').removeClass("d-hide").show();
    $('#img_phase_selection').removeClass("img_clip_icon_singlephase");
    $('#img_phase_selection').addClass("img_clip_icon_multiphase");

    $('#chkWizardInstallerRegConfirmKnowledge').attr("checked", true);
    $('#chkWizardInstallerRegConfirmAccuFull').attr("checked", true);
    $('#chkWizardInstallerRegConfirmElectr').attr("checked", true);
    $('#chkWizardInstallerRegConfirmDensity').attr("checked", true);
    $('#chkWizardInstallerRegConfirmVDE').attr("checked", true);
    $('#chkWizardInstallerRegConfirmAccuPole').attr("checked", true);
    $('#chkWizardInstallerRegConfirmReadDocs').attr("checked", true);
    $('#chkWizardInstallerRegConfirmAll').attr("checked", true);
}

//Check installer login
function checkInstallerLogin(checkContractor){
    let installer_email = $("#txtWizardInstallerEmail").val();
    let installer_password = $("#txtWizardInstallerPassword").val();

	checkInstallerLoginAjax(installer_email, installer_password, function(data){
            console.log("Request success.");
            installerauthenticated = data.authenticated;
            if (installerauthenticated)
            {
                installername = data.vorname + " " + data.nachname;
                if(data.vertragspartner === undefined){
                    contractors = [];
                }
                else{
                    contractors = data.vertragspartner;
                }
                let options =  '<option value=""><strong>-</strong></option>';
                // loop through company names and create options
                $(contractors).each(function(index, value){
                    options += '<option value="' + value.id + '">' + value.firmenname + '</option>';
                });
                //replace the selection's html with the new option
                if(checkContractor)
                {
                    $('.parties_select').html(options);
                }
                // show success message
                $("#lblWizardInstallerCheckResult").show();
                $("#lblWizardInstallerCheckResult").removeClass("errorLabel");
                $("#lblWizardInstallerCheckResult").addClass("okLabel");
                // only show options if applicable
                if(contractors.length > 0){
                    $('.parties_div').removeClass("hidden").show();
                    $("#lblWizardInstallerCheckResult").text(lng.WIZARD_CHECK_LOGIN_SUCCESS + lng.WIZARD_CHECK_LOGIN_CONTRACTOR);
                }else{
                    $("#lblWizardInstallerCheckResult").text(lng.WIZARD_CHECK_LOGIN_SUCCESS);
                }
            }
            else{
                $('#txtWizardInstallerEmail').addClass("errorField");
                $('#txtWizardInstallerPassword').addClass("errorField");
                confwizardShowErrorLabel("lblWizardInstallerCheckResult", lng.WIZARD_CHECK_LOGIN_ERROR);
            }
        }, function(){
            console.log("Request error.");
            installerauthenticated = false;
        });
}

function checkInstallerLoginAjax(installer_email, installer_password, successHandler, errorHandler) {
    $.ajax({
        url: 'https://' + mySenecBaseURL() + "/anlagehub/auth/getInstallateurDetails",
        type: "POST",
        dataType: "json", // expected format for response
        contentType: "application/json", // send as JSON
        data: JSON.stringify({login: installer_email, password: installer_password}),
        accepts:{json: "application/json"},
        success: successHandler,
        error: errorHandler,
        async: false
    });
}

function fillPUconnectionType(configured_PUs){
    // if EG is active, just select option
    if(htmlAsNumber("#EG_CONTROLACTIVE") == 1)
    {
        $('#optWizardPU_Usage').val(htmlAsNumber('#WIZARDHEAT_CONN_TYPE'));
        fillChargePrio($('#optWizardPU_Usage').val());
        return;
    } else
    {
        $('#optWizardPU_Usage').empty();
        $("#optWizardPU_Usage").append('<option value="2">' + lng.lWizardPVOnly + '</option>');
        $("#optWizardPU_Usage").append('<option value="3">' + lng.lWizardMinTempOnly + '</option>');
        // If no EG is available, but a non-EG configuration was selected, just update the select
        if (htmlAsNumber('#WIZARDHEAT_CONN_TYPE') == 2)
        {
            $('#optWizardPU_Usage').val(htmlAsNumber('#WIZARDHEAT_CONN_TYPE'));
        }
        else if (htmlAsNumber('#WIZARDHEAT_CONN_TYPE') == 3)
        {
            $('#optWizardPU_Usage').val(htmlAsNumber('#WIZARDHEAT_CONN_TYPE'));
        }
        else
        {
            // Warn user, he must select
            $('#optWizardPU_Usage').val(2);
            if(configured_PUs)
            {
                alert(lng.lWizardPUConnectionError);
            }
        }
    }

    // Fill Charge Priority Select
    fillChargePrio($('#optWizardPU_Usage').val());
}

function showPUtempContainer(){
    // Show only activated devices
    for (c = 0; c < 6; c++) {
        // Check if SolarInvert
        if($('#inputWizardSystemSetupPowerUnit' + c + 'Model').val() == 1)
        {
            $('.PUtempContainer' + c).show();
            $('#inputWizardSystemSetupPowerUnit' + c + 'TempCount').val(2);
            $('#inputWizardSystemSetupPowerUnit' + c + 'TempCount').prop('disabled', 'disabled');
        }
        else
        {
            $('#inputWizardSystemSetupPowerUnit' + c + 'TempCount').prop('disabled', false);
        }

        // Check if activated
        if(($('#inputWizardSystemSetupPowerUnit' + c + 'TempCount').val()) > 0)
        {
            $('.PUtempContainer' + c).show();
        }
        else
        {
            $('.PUtempContainer' + c).hide();
        }
    }
}

function fillChargePrio(connection_type){
    switch(connection_type){
        default:
        case "0":
        case "2":
        {
            $('#optWizardChargePrio').empty();
            // Check the power rule setting
            if( $('#inputWizardSystemSetupFeedInLimitOpt').val() == 0 && (
			   $('#inputWizardSystemSetupPowerRule').val() == 0 ||
                           $('#inputWizardSystemSetupPowerRule').val() == 100) ||
                $('#inputWizardSystemSetupFeedInLimitOpt').val() == 1 && (
                           $('#inputWizardSiteMaxFeedInPower').val() == 0 ||
                           $('#inputWizardSiteMaxFeedInPower').val() >= $('#inputWizardSiteMaxPVPower').val()))
            {
                $("#optWizardChargePrio").append('<option value="0">' + lng.lWizardChargePrio1_NoExport + '</option>');
                $("#optWizardChargePrio").append('<option value="1">' + lng.lWizardChargePrio2_NoExport + '</option>');
            }
            else
            {
                $("#optWizardChargePrio").append('<option value="0">' + lng.lWizardChargePrio1 + '</option>');
                $("#optWizardChargePrio").append('<option value="1">' + lng.lWizardChargePrio2 + '</option>');
                $("#optWizardChargePrio").append('<option value="2">' + lng.lWizardChargePrio3 + '</option>');
            }
            // Update Charge Prio for Power Unit
            $('#optWizardChargePrio').val(htmlAsNumber('#WIZARDCHARGE_PRIO'));
            break;
        }
        case "1":
        case "3":
        {
            $('#optWizardChargePrio').empty();
            $("#optWizardChargePrio").append('<option value="3">' + lng.lWizardChargePrio4 + '</option>');
            $('#optWizardChargePrio').val(3);
            break;
        }
    }

}

function isSuperUser()
{
	if(userLevel == 7 || userLevel == 8)
	{
		return true;
	}
	return false;
}

function isLoggedIn()
{
	if((userLevel == 3) || (userLevel == 4) || (userLevel == 5) || (userLevel == 6) || (userLevel == 7) || (userLevel == 8))
	{
		return true;
	}

	return false;
}

function isInstallerUser()
{
	if ((userLevel == 3) || (userLevel == 4) || (userLevel == 5))
	{
		return true;
	}

	return false;
}

function isProfessionalUser()
{
	if (userLevel == 6 || userLevel == 7 || userLevel == 8)
	{
		return true;
	}

	return false;
}

// Make functions available for to unit tests.
if(typeof module !== "undefined")
{
    module.exports = { isValidDecimal,  fillChargePrio, htmlAsNumber};
}
