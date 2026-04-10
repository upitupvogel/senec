/* exported startWizardBMZ, confwizardBMZClose */

var pageObjBMZ;
var lastModuleState = [1,1,1,1];

function confwizardBMZInit() {
    //create parent json object
    pageObjBMZ = new senecPage(BMZUpdate);

    //add child object to parent object
    pageObjBMZ.add_json_object("BMS");
    pageObjBMZ.add_json_object("STECA");
    //call wizardBMZ data
    pageObjBMZ.singlePageRefresh();

    pageObjBMZ = new senecPage(BMZUpdate);
    pageObjBMZ.add_json_object("BMS");
    pageObjBMZ.add_property_to_object("BMS", "MODULE_COUNT", "");
    pageObjBMZ.add_property_to_object("BMS", "SN", "");
    pageObjBMZ.add_property_to_object("BMS", "SOC", "");
    pageObjBMZ.add_property_to_object("BMS", "VOLTAGE", "");
    pageObjBMZ.add_property_to_object("BMS", "CURRENT", "");
    pageObjBMZ.add_property_to_object("BMS", "WIZARD_DCCONNECT", "");
    pageObjBMZ.add_property_to_object("BMS", "WIZARD_STATE", "");
    pageObjBMZ.add_property_to_object("BMS", "FW", "");
    pageObjBMZ.add_property_to_object("BMS", "STATUS", "");
    pageObjBMZ.add_property_to_object("BMS", "ERROR", "");

    pageObjBMZ.add_json_object("STECA");
    pageObjBMZ.add_property_to_object("STECA", "PVSS", "");

    pageObjBMZ.add_json_object("BAT1");
    pageObjBMZ.add_property_to_object("BAT1", "TYPE", "");
    pageObjBMZ.startPageRefresh(500);
}

function sendBMZCommand(command) {
    switch(command){
        case 'Confirm':
        {
            console.log("BMZ Confirm");
            pageObjBMZ.handleButtonClick("BMS", "WIZARD_CONFIRM");
            break;
        }
        case 'Start':
        {
            console.log("BMZ Start");
            pageObjBMZ.handleButtonClick("BMS", "WIZARD_START");
            break;
        }
        case 'Abort':
        {
            console.log("BMZ Abort");
            pageObjBMZ.handleButtonClick("BMS", "WIZARD_ABORT");
            break;
        }
        default:
            console.log("UnknownBMZCommand: " + command);
            break;
    }
}

function startWizardBMZ() {
    $(document).trigger("page.unload");

    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: './wizard.BMZ.html',
        success: function(html) {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizardBMZInit();
            console.log("wizardBMZ data has successfool loaded..");

            $('#modalWindow').modal('show');
        }
    });

    modal_input = 'modal_wizardBMZ';
}

function confwizardBMZClose() {
    $("#modalWindow").empty();
    $('#modalWindow').modal('hide');
    sendBMZCommand('Abort');
    pageObjBMZ.stopPageRefresh();
    pageObjBMZ.singlePageRefresh();
    if(htmlAsNumber($("#BMSMODULES_CONFIGURED")) == 0)
    {
        alert("Achtung: Sie müssen den Batterieassistenten erfolgreich abschließen, damit das System fehlerfrei funktioniert.");
        $("#bmzclosed").html(1);
    }

    navigate('lStatus');
}

function getDecodedStatus(module_id)
{
    has_status = false;
    var status_string ="Status Modul " + String.fromCharCode('A'.charCodeAt() + module_id) + ":\n";

    // Set Status
    for (d = 1; d < 32; d++)
    {
        if (htmlAsNumber("#BMSSTATUS" + module_id) & (1<<d))
        {
            status_string += bmz_status_enum[d];
            status_string +="\n";
            has_status = true;
        }
    }
    if (has_status)
    {
        status_string += "\n";
    }
    else
    {
        status_string += "OK\n\n";
    }

    status_string += "-OK um fortzufahren\n-Abbrechen um Assistent zu beenden";
    return status_string;
}

function BMZUpdate() {
    var hideConfirm = false;
    // Update BMS Module Status
    for (c = 0; c < 4; c++)
    {
        var status_string = lng.lBatterySerial;
        status_string += $("#BMSSN" + c).html();
        status_string += "<br>";
        status_string += lng.lBatteryFuelgauge;
        status_string += $("#BMSSOC" + c).html() +  " %";
        status_string += "<br>";
        status_string += lng.lWizardVoltage;
        status_string += $("#BMSVOLTAGE" + c).html() +  " V";
        status_string += "<br>";
        status_string += lng.lWizardCurrent;
        status_string += $("#BMSCURRENT" + c).html() +  " A";
        status_string += "<br>";
        status_string += lng.lBatteryVersion;
        status_string += $("#BMSFW" + c).html();
        status_string += "<br>";

        $("#BMZInfo" + c).html(status_string);

        if($("#BMSWIZARD_DCCONNECT").html() & (1<<c))
            $("#BMZInfo" + c).addClass('borderClass');
        else
            $("#BMZInfo" + c).removeClass('borderClass');

        if(c <= (htmlAsNumber("#BMSMODULE_COUNT") - 1))
        {
            $("#BMZInfo" + c).show();
        }
        else
        {
            $("#BMZInfo" + c).hide();
        }

        if($("#BMSWIZARD_STATE").html() < 1) // Not active
        {
            $("#BMZStart").text(lng.lStart);
            $("#BMZStart").prop("disabled",false);
            hideConfirm = true;
            $("#BMZClose").hide();
            $("#btnWizardBMZ_close").show();
        }
        else if(($("#BMSWIZARD_STATE").html() == 1) || // Reset modules
                 ($("#BMSWIZARD_STATE").html() == 2) || // Communication
                 ($("#BMSWIZARD_STATE").html() == 4)) // Charging
        {
            $("#BMZStart").text(lng.Restart);
            $("#BMZStart").prop("disabled",true);
            hideConfirm = true;
            $("#BMZClose").hide();
            $("#btnWizardBMZ_close").show();
        }
        else if($("#BMSWIZARD_STATE").html() == 5) // Wizard finished
        {
            $("#BMZStart").text(lng.Restart);
            hideConfirm = true;
            $("#btnWizardBMZ_close").hide(); // Hide "x" button to impress low iq scored people
            $("#BMZClose").show();
        }
        else
        {
            $("#BMZStart").text(lng.Restart);
            $("#BMZStart").prop("disabled",false);
            $("#BMZClose").hide();
            $("#btnWizardBMZ_close").show();
        }

        // Show confirm box when battery status has warnings/alarms
        if($("#BMSWIZARD_STATE").html() >= 3)
        {
            if((htmlAsNumber("#BMSSTATUS" + c) > 1) && (htmlAsNumber("#BMSSTATUS" + c) != lastModuleState[c]))
            {
                if(!confirm(getDecodedStatus(c)))
                { // User pressed chancel
                    confwizardBMZClose();
                }
                lastModuleState[c] = htmlAsNumber("#BMSSTATUS" + c);
            }
        }
    }

    if(htmlAsNumber("#BMSERROR") && $("#BMSWIZARD_STATE").html() >= 3)
    {
        $("#BMZStatus").html(BMZ_WizardState[7] + "<br>");
        hideConfirm = true;
    }
    else
    {
        //Check for Steca
        if((htmlAsNumber("#BAT1TYPE") == 4) && ($("#BMSWIZARD_STATE").html() == 4) && (htmlAsNumber("#STECAPVSS") < 4))
        {
            $("#BMZStatus").html(BMZ_WizardState[6] + "<br>");
        }
        else
        {
         $("#BMZStatus").html(BMZ_WizardState[htmlAsNumber("#BMSWIZARD_STATE")] + "<br>");
        }


        if($("#BMSWIZARD_STATE").html() == 3)
        {
            if($("#BMSWIZARD_DCCONNECT").html() & (1<<0))
                $("#BMZStatus").append("A ");
            if($("#BMSWIZARD_DCCONNECT").html() & (1<<1))
                $("#BMZStatus").append("B ");
            if($("#BMSWIZARD_DCCONNECT").html() & (1<<2))
                $("#BMZStatus").append("C ");
            if($("#BMSWIZARD_DCCONNECT").html() & (1<<3))
                $("#BMZStatus").append("D ");
        }
    }

    if(hideConfirm)
    {
        $("#Confirm").prop("disabled",true);
        $("#Confirm").hide();
    }
    else
    {
        $("#Confirm").prop("disabled",false);
        $("#Confirm").show();
    }
}
