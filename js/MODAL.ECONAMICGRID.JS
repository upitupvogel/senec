var pageObjEconamicGrid;

/** Prevent JSHint warning about functions called from HTML sites. */
/* exported confwizardEconamicGridNextPage, startWizardEconamicGrid, confwizardEconamicGridUpdateState */

function obj_init_wizardEconamicGrid() {
    //create parent json object
    pageObjEconamicGrid = new senecPage(confwizardEconamicGridUpdate);

    //add child object to parent object
    pageObjEconamicGrid.add_json_object("EG_CONTROL");
    pageObjEconamicGrid.add_json_object("WIZARD");
    pageObj.add_property_to_object("WIZARD", "CONFIG_LOADED", "");

    //call wizardEconamicGrid data
    pageObjEconamicGrid.singlePageRefresh();
}
var nTestPowerMeterResult = 0;
var nTestEGSwitchResult = 0;

function confwizardEconamicGridInit(wizardEconamicGridMode) {
    $('.carousel').carousel({
        interval: 0
    });

    $('#btnWizardEconamicGrid_close').hide();
    if (wizardEconamicGridMode == 'edit')
    {
        $('#btnWizardEconamicGrid_close').show();
        $('#btnWizardEconamicGrid_next').hide();
        $('#confwizardEconamicGridStatus').text("Bitte warten...");
    }
    obj_init_wizardEconamicGrid();

    $("#btnWizardEconamicGridStartTest").on("click", confwizardEconamicGridTestInstallation);

    //jump to selected first page
    $('.carousel').carousel(0);
}

function confwizardEconamicGridNextPage() {
	if (checkWizardEconamicGridValues()) {
        confwizardClose();
    }

    $(".modal-body").scrollTop(0); //set scroll of config-frame-body to top
}

function startWizardEconamicGrid(wizardEconamicGridMode) {
    $(document).trigger("page.unload");

    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: './wizard.econamicgrid.html',
        success: function(html) {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizardEconamicGridInit(wizardEconamicGridMode);
            console.log("wizardEconamicGrid data has successfool loaded..");

            $('#modalWindow').modal('show');

            //check if senec is already configured
            if(parseInt($('#WIZARDCONFIG_LOADED').html()) <= 0) {
                alert(lng.WIZARD_EG_ERROR_NEED_INITIAL_CONFIG);
                confwizardClose();
            }
        }
    });

    modal_input = 'modal_wizardEconamicGrid';

}

var confwizardEconamicGridUpdateState = 0;

function confwizardEconamicGridUpdate() {
    $('#confwizardEconamicGridStatus').empty();
    $('#btnWizardEconamicGrid_next').show();

    // read EG Meter Serial from Config
    confwizardEconamicGridReadPowerMeterSerial();
    
}

function checkWizardEconamicGridValues() {
    var state = 0;

    confwizardEconamicGridResetErrorFields();
    var currentCarouselPage = $('#pnWizardEconamicGridCarouselInner div.active');
    console.log("check wizardEconamicGrid values: page  " + currentCarouselPage.attr("id"));
    switch(currentCarouselPage.attr("id")) {
        case "pnWizardEconamicGridCarouselPowerMeterData":
            state = 1;

            if (nTestPowerMeterResult != 1) {
                $("#inputWizardEconamicGridPowerMeterSerial").addClass("errorField");
                confwizardEconamicGridShowErrorLabel("inputWizardEconamicGridPowerMeterResult", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
                state = 0;
            }
            
            if (nTestEGSwitchResult != 1) {
                confwizardEconamicGridShowErrorLabel("inputWizardEconamicGridSwitchControlTest", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
                state = 0;
            }
            
            // Reset Results if page is refreshed
            nTestPowerMeterResult = 0;
            nTestEGSwitchResult = 0;
            
            break;
        default:
            state = 1;

            break;
    }
    return state;
}

//get all form-fields for a page and remove the "errorField" class
function confwizardEconamicGridResetErrorFields() {
    $('input').removeClass('errorField');
    $('label').removeClass('errorLabel');
    $('label').removeClass('errorField');
    $('.wizardEconamicGrid-check-result').hide();
}
function confwizardEconamicGridShowErrorLabel(sElementId, sMessage) {
    $("#" + sElementId).show();
    $("#" + sElementId).addClass("errorLabel");
    $("#" + sElementId).text(sMessage);
}
function confwizardEconamicGridShowSuccessLabel(sElementId, sMessage) {
    $("#" + sElementId).show();
    $("#" + sElementId).addClass("successLabel");
    $("#" + sElementId).text(sMessage);
}

function confwizardEconamicGridReadPowerMeterSerial() {
    // just ask MCU about serial of previously-setup power meter
    // if no power meter was configured, a zero is returned!
    pageObjEconamicGrid.reInitJSONObject();
    pageObjEconamicGrid.add_json_object("EG_CONTROL");
    pageObjEconamicGrid.add_property_to_object("EG_CONTROL", "POWER_METER_SERIAL", "");
    pageObjEconamicGrid.singlePageRefresh();
    $("#inputWizardEconamicGridPowerMeterSerial").val($("#EG_CONTROLPOWER_METER_SERIAL").val());
}

function confwizardEconamicGridTestInstallation() {
    //get test results from MCU ----------------------------------
    //first tell MCU to perform test and then get results
    nTestPowerMeterResult = 0;
    nTestEGSwitchResult = 0;
    
    // Disable SerialNumber Field
    $("#inputWizardEconamicGridPowerMeterSerial").prop( "disabled", true );

    $("#inputWizardEconamicGridPowerMeterResult").html(lng.WIZARD_EG_TEST_INSTALLATION_PENDING);
    $("#inputWizardEconamicGridPowerMeterResult").removeClass("successLabel errorLabel");
    $("#inputWizardEconamicGridSwitchControlTest").html(lng.WIZARD_EG_TEST_INSTALLATION_PENDING);
    $("#inputWizardEconamicGridSwitchControlTest").removeClass("successLabel errorLabel");

    pageObjEconamicGrid.reInitJSONObject();
    pageObjEconamicGrid.add_json_object("EG_CONTROL");
    pageObjEconamicGrid.add_property_to_object("EG_CONTROL", "TEST_EG_METER_TRIG", "u8_01");
    pageObjEconamicGrid.add_property_to_object("EG_CONTROL", "TEST_EG_SWITCH_TRIG", "u8_01");
    pageObjEconamicGrid.add_property_to_object("EG_CONTROL", "POWER_METER_SERIAL", pageObj.castVarValue('u3', $("#inputWizardEconamicGridPowerMeterSerial").val()));
    pageObjEconamicGrid.singlePageRefresh();

    //poll and get econamic-grid test results ---------------------------------------
    const nTimerInterval = 3000, nTimerCycles = 30;
    var nPowerMeterResultCounter = 0, nSwitchResultCounter = 0;

    var nPowerMeterTestResultTimer = setInterval( function() {
        nPowerMeterResultCounter++;
        console.log("poll for power-meter test-results");

        pageObjEconamicGrid.reInitJSONObject();
        pageObjEconamicGrid.add_json_object("EG_CONTROL");
        pageObjEconamicGrid.add_property_to_object("EG_CONTROL", "TEST_EG_METER_RES", "");
        pageObjEconamicGrid.singlePageRefresh();
        nTestPowerMeterResult = parseInt($("#EG_CONTROLTEST_EG_METER_RES").val());
        
        if(nTestPowerMeterResult == 1) {
            clearInterval(nPowerMeterTestResultTimer);
            confwizardEconamicGridShowSuccessLabel("inputWizardEconamicGridPowerMeterResult", lng.WIZARD_EG_TEST_INSTALLATION_POWERMETER_COM_OK);
            }
        
        if(nPowerMeterResultCounter > nTimerCycles) {
            clearInterval(nPowerMeterTestResultTimer);
            // Enable Serialnumber field to allow editing
            $("#inputWizardEconamicGridPowerMeterSerial").prop( "disabled", false );
            confwizardEconamicGridShowErrorLabel("inputWizardEconamicGridPowerMeterResult", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
            // Reset Serial on MCU
            pageObjEconamicGrid.reInitJSONObject();
            pageObjEconamicGrid.add_json_object("EG_CONTROL");
            pageObjEconamicGrid.add_property_to_object("EG_CONTROL", "POWER_METER_SERIAL", "u3_0");
            pageObjEconamicGrid.singlePageRefresh();
        }
    }, nTimerInterval);

    var nSwitchTestResultTimer = setInterval( function() {
        nSwitchResultCounter++;
        console.log("poll for switch test-results");

        pageObjEconamicGrid.reInitJSONObject();
        pageObjEconamicGrid.add_json_object("EG_CONTROL");
        pageObjEconamicGrid.add_property_to_object("EG_CONTROL", "TEST_EG_SWITCH_RES", "");
        pageObjEconamicGrid.singlePageRefresh();
        nTestEGSwitchResult = parseInt($("#EG_CONTROLTEST_EG_SWITCH_RES").val());

        if(nTestEGSwitchResult == 1) {
            clearInterval(nSwitchTestResultTimer);
            confwizardEconamicGridShowSuccessLabel("inputWizardEconamicGridSwitchControlTest", lng.WIZARD_EG_TEST_INSTALLATION_POWERMETER_COM_OK);
            }
        
        if(nSwitchResultCounter > nTimerCycles) {
            clearInterval(nSwitchTestResultTimer);
            confwizardEconamicGridShowErrorLabel("inputWizardEconamicGridSwitchControlTest", lng.WIZARD_EG_TEST_INSTALLATION_RESULT_ERROR);
        }
    }, nTimerInterval);
}
