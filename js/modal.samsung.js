/* exported startWizardSamsung, confwizardSamsungClose */

var pageObjSamsung;
var lastWizardState = 0;
var lastEstimatedTime = 0;

function confwizardSamsungInit() {
    //create parent json object
    pageObjSamsung = new senecPage(SamsungUpdate);

    //add child object to parent object
    pageObjSamsung.add_json_object("BMS");
    pageObjSamsung.add_json_object("STECA");
    //call wizardSamsung data
    pageObjSamsung.singlePageRefresh();

    pageObjSamsung = new senecPage(SamsungUpdate);
    pageObjSamsung.add_json_object("BMS");
    pageObjSamsung.add_property_to_object("BMS", "MODULE_COUNT", "");
    pageObjSamsung.add_property_to_object("BMS", "SERIAL", "");
    pageObjSamsung.add_property_to_object("BMS", "SOC", "");
    pageObjSamsung.add_property_to_object("BMS", "VOLTAGE", "");
    pageObjSamsung.add_property_to_object("BMS", "CURRENT", "");
    pageObjSamsung.add_property_to_object("BMS", "WIZARD_DCCONNECT", "");
    pageObjSamsung.add_property_to_object("BMS", "WIZARD_STATE", "");
    pageObjSamsung.add_property_to_object("BMS", "WIZARD_CONFIRM", "");
    pageObjSamsung.add_property_to_object("BMS", "FW", "");
    pageObjSamsung.add_property_to_object("BMS", "STATUS", "");
    pageObjSamsung.add_property_to_object("BMS", "ERROR", "");

    pageObjSamsung.add_json_object("STECA");
    pageObjSamsung.add_property_to_object("STECA", "PVSS", "");

    pageObjSamsung.add_json_object("BAT1");
    pageObjSamsung.add_property_to_object("BAT1", "TYPE", "");
    setWizardContent();
    pageObjSamsung.startPageRefresh(500);
}

function setWizardContent()
{
    /*jshint multistr: true */

    // Step 1: Prompt user to plugin communication cable to internal CAN
    $("#SamsungWizardStart").html("<p>"+Samsung_Wizard["confirmInternalCan"]+"</p>\
                                  <br><br><img src=\"img/samsung_wizard0.png\"><br><br><p>"+Samsung_Wizard["clickConfirm"]+"</p>");

    // Step 2: Amuse user while scanning for battery modules
    $("#SamsungWizardScanning").html("<br><br><div id=\"small-loader\"></div><br><br><p>"+Samsung_Wizard["scanningModules"]+"<br>(~30s)</p>");

    // Step 3: Prompt user to confirm detected module count
    $("#SamsungWizardDetected").html("<p><b>"+Samsung_Wizard["detectedModuleCount"]+" <span id=\"SamsungWizardNumDetectedModules\"></span></b><br><br>"+
                                Samsung_Wizard["checkModuleCount"]+"</p><hr></hr><p>"+Samsung_Wizard["moduleCountIncorrect"]+"</p></div>"+
                                Samsung_Wizard["checkWiring"]+"<br><br><img src=\"img/samsung_wizard1.png\" style=\"height:230px;\"><br><br>"+
                                Samsung_Wizard["restartScanning"]);

    // Step 3a: No modules detected
    $("#SamsungWizardDetectedFailed").html("<p><b>"+Samsung_Wizard["noModulesDetected"]+"</b></p><br>"+
                                      Samsung_Wizard["checkWiring"]+"<br><br><img src=\"img/samsung_wizard1.png\" style=\"height:230px;\"><br><br>"+
                                      Samsung_Wizard["restartScanning"]);


    // Step 4: Prompt user to plugin communication cable to external CAN
    $("#SamsungWizardSwitchCan").html("<p>"+Samsung_Wizard["changeToExternalCan"]+"<br><br><img src=\"img/samsung_wizard2.png\"><br><br>"+
                                    Samsung_Wizard["waitForExternalCan"]+"</p>");

    // Step 6a: Prompt user to finish wizard
    $("#SamsungWizardDone").html("<p><b>"+Samsung_Wizard["wizardDone"]+"</b><br><br>"+Samsung_Wizard["finishWizard"]+"</p>");

    // Step 6b: Charging was not successful
    $("#SamsungWizardFailed").html("<p><b>"+Samsung_Wizard["chargingFailed"]+"</b><br><br>"+Samsung_Wizard["checkPowerPlugs"]+"</p>");
}

function sendSamsungCommand(command) {
    switch(command){
        case 'Confirm':
        {
            console.log("Samsung Confirm");
            pageObjSamsung.handleButtonClick("BMS", "WIZARD_CONFIRM");
            break;
        }
        case 'Start':
        {
            console.log("Samsung Start");
            pageObjSamsung.handleButtonClick("BMS", "WIZARD_START");
            break;
        }
        case 'Abort':
        {
            console.log("Samsung Abort");
            pageObjSamsung.handleButtonClick("BMS", "WIZARD_ABORT");
            break;
        }
        default:
            console.log("UnknownSamsungCommand: " + command);
            break;
    }
}

function startWizardSamsung() {
    $(document).trigger("page.unload");

    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=iso-8859-1",
        dataType: "html",
        url: './wizard.samsung.html',
        success: function(html) {
            $("#modalWindow").empty();
            $("#modalWindow").append(html);
            confwizardSamsungInit();
            console.log("wizardSamsung data has successfool loaded..");

            $('#modalWindow').modal('show');
        }
    });

    modal_input = 'modal_wizardSamsung';

    lastWizardState = 0;
    lastEstimatedTime = 60;

    $("#SamsungWizardScanning").hide();
    $("#SamsungWizardDetected").hide();
    $("#SamsungWizardSwitchCan").hide();
    $("#SamsungWizardCharging").hide();
    $("#SamsungWizardDone").hide();
    $("#SamsungWizardFailed").hide();
    $("#SamsungConfirm").prop("disabled",true);
    $("#SamsungConfirm").hide();
}

function confwizardSamsungClose() {
    $("#modalWindow").empty();
    $('#modalWindow').modal('hide');
    sendSamsungCommand('Abort');
    pageObjSamsung.stopPageRefresh();
    pageObjSamsung.singlePageRefresh();
    if(htmlAsNumber($("#BMSMODULES_CONFIGURED")) == 0)
    {
        alert(Samsung_Wizard["abortWizard"]);
        $("#samsungclosed").html(1);
    }

    navigate('lStatus');
    lastWizardState = 0;
}

function estimateRemainingChargingTime()
{
    const EQUALIZE_VOLTAGE_GRADIENT = 0.07;
    const EQUALIZE_VOLTAGE_OFFSET = 0.4;

    var min = 60.0;
    var max = 0.0;
    for (c = 0; c < htmlAsNumber("#BMSMODULE_COUNT"); c++)
    {
        var value = htmlAsNumber("#BMSVOLTAGE" + c);
        if(value < min)
        {
            min = value;
        }
        if(value > max)
        {
            max = value;
        }
    }

    var estimatedTime = (max - min + EQUALIZE_VOLTAGE_OFFSET) / EQUALIZE_VOLTAGE_GRADIENT;
    // round to 10min frames
    estimatedTime = (estimatedTime + 5) / 10;
    estimatedTime = estimatedTime.toFixed(0);
    estimatedTime = estimatedTime * 10;
    if((estimatedTime < 10) || (lastEstimatedTime < 10))
    {
        estimatedTime = 5;
    }

    lastEstimatedTime = estimatedTime;
    return estimatedTime;
}

function MonitorBmsValues()
{
    // Check Steca
    if((htmlAsNumber("#BAT1TYPE") == 4) && (htmlAsNumber("#STECAPVSS") < 4))
    {
        $("#SamsungWizardChargingInfo").html(Samsung_Wizard["waitForInverter"]+"<br>(~5min)");
    }
    // Check status "tray imbalance"
    else if((htmlAsNumber("#BMSSTATUS0") & (1 << 7)) ||
            (htmlAsNumber("#BMSSTATUS1") & (1 << 7)) ||
            (htmlAsNumber("#BMSSTATUS2") & (1 << 7)) ||
            (htmlAsNumber("#BMSSTATUS3") & (1 << 7)))
    {
        $("#SamsungWizardChargingInfo").html(Samsung_Wizard["equalCharging"]+"<br>(~"+estimateRemainingChargingTime()+"min)");
    }
    else
    {
        $("#SamsungWizardChargingInfo").html(Samsung_Wizard["testCharging"]+"<br>(~2min)");
    }

    $("#SamsungWizardChargingInfo").show();

    for (c = 0; c < 4; c++)
    {
        var status_string = $("#BMSSERIAL" + c).html();
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

        $("#SamsungInfo" + c).html(status_string);

        if(c <= (htmlAsNumber("#BMSMODULE_COUNT") - 1))
        {
            $("#SamsungInfo" + c).show();
        }
        else
        {
            $("#SamsungInfo" + c).hide();
        }
    }
}

function SamsungUpdate() {
  if(($("#BMSWIZARD_STATE").html() < 1) || ($("#BMSWIZARD_STATE").html() > 5))  // Not active or charging failed
  {
      if(lastWizardState == 4)
      {
          $("#SamsungWizardFailed").show();
          $("#SamsungStart").text(lng.Restart);
      }
      else
      {
          $("#SamsungStart").text(lng.lStart);
          $("#SamsungWizardFailed").hide();
      }
      $("#SamsungStart").prop("disabled",false);

      $("#btnWizardSamsung_close").show();
      $("#SamsungWizardStart").show();

      $("#SamsungWizardScanning").hide();
      $("#SamsungWizardDetected").hide();
      $("#SamsungWizardSwitchCan").hide();
      $("#SamsungWizardCharging").hide();
      $("#SamsungWizardDone").hide();
  }
  else
  {
      $("#SamsungWizardStart").hide();
      $("#SamsungWizardFailed").hide();
  }

  if(($("#BMSWIZARD_STATE").html() == 1) ||  // Start modules
     ($("#BMSWIZARD_STATE").html() == 2))    // Scanning modules
  {
      $("#SamsungWizardScanning").show();
      $("#SamsungStart").hide();
  }
  else
  {
      $("#SamsungWizardScanning").hide();
  }

  if(($("#BMSWIZARD_STATE").html() == 3) && ($("#BMSWIZARD_CONFIRM").val() == 0))  // Confirm module count
  {
      $("#SamsungStart").text(lng.Restart);
      $("#SamsungStart").prop("disabled",false);
      $("#SamsungStart").show();

      if($("#BMSWIZARD_DCCONNECT").html() > 0)
      {
          $("#SamsungWizardNumDetectedModules").html(htmlAsNumber("#BMSWIZARD_DCCONNECT"));
          $("#SamsungWizardDetectedFailed").hide();
          $("#SamsungWizardDetected").show();
          $("#SamsungConfirm").text(lng.Confirm);
          $("#SamsungConfirm").prop("disabled",false);
          $("#SamsungConfirm").show();
      }
      else
      {
          $("#SamsungWizardDetected").hide();
          $("#SamsungWizardDetectedFailed").show();
          $("#SamsungConfirm").prop("disabled",true);
          $("#SamsungConfirm").hide();
      }
  }
  else
  {
      $("#SamsungWizardDetected").hide();
      $("#SamsungWizardDetectedFailed").hide();
      $("#SamsungConfirm").prop("disabled",true);
      $("#SamsungConfirm").hide();
  }

  if(($("#BMSWIZARD_STATE").html() == 3) && ($("#BMSWIZARD_CONFIRM").val() == 1))  // Wait for external CAN
  {
      $("#SamsungWizardSwitchCan").show();
      $("#SamsungStart").hide();
  }
  else
  {
      $("#SamsungWizardSwitchCan").hide();
  }

  if(($("#BMSWIZARD_STATE").html() == 4))  // Charging
  {
      $("#SamsungStart").hide();
      $("#SamsungConfirm").prop("disabled",true);
      $("#SamsungConfirm").hide();
      $("#SamsungWizardCharging").show();
      MonitorBmsValues();
  }
  else
  {
      $("#SamsungWizardCharging").hide();
      $("#SamsungWizardChargingInfo").hide();
  }

  if(($("#BMSWIZARD_STATE").html() == 5))  // Finish wizard
  {
      $("#SamsungWizardDone").show();
      $("#SamsungClose").text(lng.BMZClose);
      $("#SamsungClose").show();
  }
  else
  {
      $("#SamsungWizardDone").hide();
      $("#SamsungClose").hide();
  }

  lastWizardState = $("#BMSWIZARD_STATE").html();
}
