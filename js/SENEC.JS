/** Prevent JSHint warning about functions called from HTML sites. */
/* exported setupTime, senecPage */

////////////////////////////////////////////////////////////////////////////
// Helpers
function hex2float(num) {
    var sign = (num & 0x80000000) ? -1 : 1;
    var exponent = ((num >> 23) & 0xff) - 127;
    var mantissa = ((num & 0x7fffff) + 0x800000).toString(2); // binary
    var float = 0;
    // Convert to float
    for (var i=0; i<mantissa.length; i+=1)
    {
        float += parseInt(mantissa[i])? Math.pow(2,exponent):0;
        exponent--;
    }
    return sign * float;
}

//Senec Request Class
function jsonRequest()
{
    this.create_json_object = function()
    {
        this.jsonReq = {}; // this is the correct empty JSON declaration
    };
    this.add_json_object = function(obj_name)
    {
        this.jsonReq[obj_name] = {};
    };
    this.add_property_to_object = function(obj_name, prop_name, prop_value)
    {
        this.jsonReq[obj_name][prop_name] = prop_value;
    };
    this.get_object = function()
    {
        return this.jsonReq;
    };
    this.get_json = function()
    {
        return JSON.stringify(this.jsonReq);
    };
}

var slowDownFactor = 3;  //on AJAX Error

//Senec Page Class

function senecPage(updatecallback)
{
    var JSONobj = new jsonRequest();
    var PageEventList = [];
    var PageFSMstate = 0;

    var self = this;
    this.interval = 0;
    this.page_timer = null;

    JSONobj.create_json_object();


    //public methods
    this.add_json_object = function(objname)
    {
        JSONobj.add_json_object(objname);
    };

    this.add_property_to_object = function(obj_name, prop_name, prop_value)
    {
        JSONobj.add_property_to_object(obj_name, prop_name, prop_value);
    };
    this.startPageRefresh = function(interval)
    {
        self.interval = interval;
        self.page_timer = window.setTimeout(_TimerCB, self.interval);
    };
    this.stopPageRefresh = function()
    {
        clearTimeout(self.page_timer);
    };
    this.singlePageRefresh = function()
    {
        _CallPageFSM(false);
    };

    this.get_json = function()
    {
        return JSONobj.get_json();
    };

    this.startFSM = function()
    {
        PageFSMstate = 0;
    };
    this.handleButtonClick = function(obj_name, prop_name)
    {
        PageEventList.push([obj_name, prop_name, "u8_01"]);
    };
    this.handleTextAreaUpdate = function(obj_name, prop_name, value)
    {
        PageEventList.push([obj_name, prop_name, value]);
    };
    this.handleTextAreaUpdateArray = function(obj_name, prop_name, value, index, length)
    {
        this.handleCheckBoxUpdateArray(obj_name,prop_name,value,index,length);
    };
    this.handleSelectUpdate = this.handleCheckBoxUpdate = function(obj_name, prop_name, value)
    {
        PageEventList.push([obj_name, prop_name, value]);
    };

    this.handleCheckBoxUpdateArray = function(obj_name, prop_name, value, index,length)
    {
        //var tag = "HandleCheckboxArray: "
        var arr;
        if (PageEventList.length == 0)
        {
            arr=[];
            arr = Array(length).fill("\"\"");
            //console.log(tag + "new Array")
        }
        else
        {
            found = false;
            for (i = 0; i < PageEventList.length; i++)
            {
                if(PageEventList[i][0] == obj_name && PageEventList[i][1] == prop_name)
                {
                    //console.log(tag + "PEL: "+PageEventList[i][2])
                    arr = (PageEventList[i][2].slice(1,-1)).split(',');
                    //console.log(tag + "ARR PEL: "+arr)
                    found = true;
                }
            }
            if(!found)
            {
                arr = Array(length).fill("\"\"");
            }
        }

        arr[index]="\""+value+"\"";
        //console.log(tag + "ARR " + arr)
        var t = "[" + arr.join(",")+"]";
        //console.log(tag + "t " + t)
        PageEventList.push([obj_name, prop_name, t]);
    };
    this.reInitJSONObject = function()
    {
        JSONobj.create_json_object();
        updatecallback = null;
    };


    //------------------------------------------------------------------------------
    //private methoden
    function _writeDataToTempl(obj, objName)
    {
        //alert($.type(obj));
        if (typeof(obj) === "string") {
            _getVarValue(obj); //where stored?
        } else
        {
            $.each(obj, function(key, value) {
                if ($.type(value) === "string") /*if($.type(value) === "array")*/ {

                    //alert(key+" "+value);
                    $("#" + objName + key).html(_getVarValue(value, key));
                    //write data to HTML FORM elements
                    $("#" + objName + key).val(_getVarValue(value, key));
                    // console.log("#" + objName + key+"value _"+_getVarValue(value));
                }
                else if ($.type(value) === "array") /*if($.type(value) === "array")*/ {
                    var tmp = "";
                    for (i = 0; i < value.length - 1; i++)
                    {
                        tmp += _getVarValue(value[i]) + " - ";
                        $("#" + objName + key + i).html(_getVarValue(value[i]));
                        $("#" + objName + key + i).val(_getVarValue(value[i]));
                        // console.log("#" + objName + key+ i+"value _"+_getVarValue(value[i]));
                    }
                    tmp += _getVarValue(value[value.length - 1]);

                    $("#" + objName + key + (value.length - 1)).html(_getVarValue(value[value.length - 1]));
                    $("#" + objName + key + (value.length - 1)).val(_getVarValue(value[value.length - 1]));
                    $("#" + objName + key).html(tmp);
                }
            });
        }
    }

    function _sendAjaxJsonRequest(url, jsonObject, async)
    {
        var grml = {};

        for(var k in jsonObject)
        {
            if(JSON.stringify(jsonObject[k]).length + JSON.stringify(grml).length < 600)
            {
                grml[k] = jsonObject[k];
            }
            else
            {
                $.ajax({
                    type: "POST",
                    async: async,
                    url: url,
                    data: JSON.stringify(grml),
                    dataType: "json",
                    success: _httpRequestCallback,
                    error: _handleErrorMessage
                });
                grml = {};
                grml[k]= jsonObject[k];
            }
        }
        if(!jQuery.isEmptyObject(grml))
        {
            $.ajax({
                    type: "POST",
                    async: async,
                    url: url,
                    data: JSON.stringify(grml),
                    dataType: "json",
                    success: _contextHelperSuccess(self), //_httpRequestCallback,
                    error: _contextHelperError(self) // _handleErrorMessage
                });
        }
    }

    function _contextHelperError(context) {
        return function(xhr, ajaxOptions, thrawnError) {
            clearTimeout(context.page_timer);
            if (context.interval)  //nicht bei SINGLE
                context.page_timer = window.setTimeout(_TimerCB, context.interval * slowDownFactor);
            _handleErrorMessage(xhr, ajaxOptions, thrawnError);
        };
    }

    function _contextHelperSuccess(context) {
        return function(data, textStatus, jqXHR) {
            clearTimeout(context.page_timer);
            if (context.interval)  //nicht bei SINGLE
                context.page_timer = window.setTimeout(_TimerCB, context.interval);
            _httpRequestCallback(data, textStatus, jqXHR);
        };
    }

    //--------------
    function _handleErrorMessage(xhr, ajaxOptions, thrawnError) {
        if (typeof console != 'undefined') {
            console.log(xhr.status + ": " + thrawnError);
        } else {
            alert(type + ": " + thrawnError);
        }
    }

    function _httpRequestCallback(data)
    {
        // Das empfangene Objekt wird wieder zum Objekt geparst
        var debughtml = "----------------------------------------<br>";
        var found_objects = "----------------------------------------<br>Gefundene Objekte :";
        var responseOBJ = $.parseJSON(JSON.stringify(data));

        //check if object exist
        if ($.type(responseOBJ) === "object") {
            debughtml += "respOK <br>";

            if (typeof(responseOBJ.PWR_UNIT) !== "undefined") {
                found_objects += "PWR_UNIT | ";
                _writeDataToTempl(responseOBJ.PWR_UNIT, "PWR_UNIT");
            }
            if (typeof(responseOBJ.PM1OBJ1) !== "undefined") {
                found_objects += "PM1OBJ1 | ";
                _writeDataToTempl(responseOBJ.PM1OBJ1, "PM1OBJ1");
            }
            if (typeof(responseOBJ.PM1OBJ2) !== "undefined") {
                found_objects += "PM1OBJ2 | ";
                _writeDataToTempl(responseOBJ.PM1OBJ2, "PM1OBJ2");
            }
            if (typeof(responseOBJ.ENERGY) !== "undefined")
            {
                found_objects += "ENERGY | ";
                _writeDataToTempl(responseOBJ.ENERGY, "ENERGY");
            }
            if (typeof(responseOBJ.BAT1OBJ1) !== "undefined")
            {
                found_objects += "BAT1OBJ1 | ";
                _writeDataToTempl(responseOBJ.BAT1OBJ1, "BAT1OBJ1");
            }
            if (typeof(responseOBJ.BAT1OBJ2) !== "undefined")
            {
                found_objects += "BAT1OBJ2 | ";
                _writeDataToTempl(responseOBJ.BAT1OBJ2, "BAT1OBJ2");
            }
            if (typeof(responseOBJ.BAT1OBJ3) !== "undefined")
            {
                found_objects += "BAT1OBJ3 | ";
                _writeDataToTempl(responseOBJ.BAT1OBJ3, "BAT1OBJ3");
            }
            if (typeof(responseOBJ.WIZARD) !== "undefined") {
                found_objects += "WIZARD | ";
                _writeDataToTempl(responseOBJ.WIZARD, "WIZARD");
            }
            //control-object for econamic-grid
            if (typeof(responseOBJ.EG_CONTROL) !== "undefined") {
                found_objects += "EG_CONTROL | ";
                _writeDataToTempl(responseOBJ.EG_CONTROL, "EG_CONTROL");
            }
            if (typeof(responseOBJ.RTC) !== "undefined")
            {
                found_objects += "RTC | ";
                _writeDataToTempl(responseOBJ.RTC, "RTC");
            }
            if (typeof(responseOBJ.LOG) !== "undefined")
            {
                found_objects += "LOG | ";
                _writeDataToTempl(responseOBJ.LOG, "LOG");
            }
            if (typeof(responseOBJ.STATISTIC) !== "undefined")
            {
                found_objects += "STATISTIC | ";
                _writeDataToTempl(responseOBJ.STATISTIC, "STATISTIC");
            }
            if (typeof(responseOBJ.SYS_UPDATE) !== "undefined")
            {
                found_objects += "SYS_UPDATE | ";
                _writeDataToTempl(responseOBJ.SYS_UPDATE, "SYS_UPDATE");
            }
            if (typeof(responseOBJ.PM1) !== "undefined")
            {
                found_objects += "PM1 | ";
                _writeDataToTempl(responseOBJ.PM1, "PM1");
            }
            if (typeof(responseOBJ.PV1) !== "undefined")
            {
                found_objects += "PV1 | ";
                _writeDataToTempl(responseOBJ.PV1, "PV1");
            }
            if (typeof(responseOBJ.BAT1) !== "undefined")
            {
                found_objects += "BAT1 | ";
                _writeDataToTempl(responseOBJ.BAT1, "BAT1");
            }
            if (typeof(responseOBJ.TEMPMEASURE) !== "undefined")
            {
                found_objects += "TEMPMEASURE | ";
                _writeDataToTempl(responseOBJ.TEMPMEASURE, "TEMPMEASURE");
            }
            if (typeof(responseOBJ.FACTORY) !== "undefined")
            {
                found_objects += "FACTORY | ";
                _writeDataToTempl(responseOBJ.FACTORY, "FACTORY");
            }
            if (typeof(responseOBJ.DEBUG) !== "undefined")
            {
                found_objects += "DEBUG | ";
                _writeDataToTempl(responseOBJ.DEBUG, "DEBUG");
            }
            if (typeof(responseOBJ.FEATURES) !== "undefined")
            {
                found_objects += "FEATURES | ";
                _writeDataToTempl(responseOBJ.FEATURES, "FEATURES");
            }
            if (typeof(responseOBJ.BMS) !== "undefined")
            {
                found_objects += "BMS | ";
                _writeDataToTempl(responseOBJ.BMS, "BMS");
            }
            if (typeof(responseOBJ.SOCKETS) !== "undefined")
            {
                found_objects += "SOCKETS | ";
                _writeDataToTempl(responseOBJ.SOCKETS, "SOCKETS");
            }
            if (typeof(responseOBJ.GRIDCONFIG) !== "undefined")
            {
                found_objects += "GRIDCONFIG | ";
                _writeDataToTempl(responseOBJ.GRIDCONFIG, "GRIDCONFIG");
            }
            if (typeof(responseOBJ.CASC) !== "undefined")
            {
                found_objects += "CASC | ";
                _writeDataToTempl(responseOBJ.CASC, "CASC");
            }
            if (typeof(responseOBJ.WALLBOX) !== "undefined")
            {
                found_objects += "WALLBOX | ";
                _writeDataToTempl(responseOBJ.WALLBOX, "WALLBOX");
            }
            if (typeof(responseOBJ.CONNX50) !== "undefined")
            {
                found_objects += "CONNX50 | ";
                _writeDataToTempl(responseOBJ.CONNX50, "CONNX50");
            }
            if (typeof(responseOBJ.STECA) !== "undefined")
            {
                found_objects += "STECA | ";
                _writeDataToTempl(responseOBJ.STECA, "STECA");
            }
        }
        else
        {
            debughtml += "ERROR : " + responseOBJ + "<br>";
        }

        //console.log(debughtml + found_objects);
        if (updatecallback) {
            updatecallback();
        }

    }

    function _mergeEventBuffer()
    {
        if (PageEventList.length != 0)
        {
            console.log("list merged");
        }
        for (i = 0; i < PageEventList.length; i++)
        {
            JSONobj.add_property_to_object(PageEventList[i][0], PageEventList[i][1], PageEventList[i][2]);
        }
    }

    function _deleteEventBuffer()
    {
        if (PageEventList.length != 0)
        {
            console.log("event detected");
        }
        for (i = 0; i < PageEventList.length; i++)
        {
            JSONobj.add_property_to_object(PageEventList[i][0], PageEventList[i][1], "");
        }
        PageEventList = [];
        console.log("page events buffer löschen");
    }

    function _TimerCB()
    {
        _CallPageFSM(true);
    }
    function _CallPageFSM(async_request)
    {
        if (PageEventList.length != 0) {
            _mergeEventBuffer();
            _sendAjaxJsonRequest("/lala.cgi", JSONobj.get_object(), async_request);
            _deleteEventBuffer();
        } else
        {
            _sendAjaxJsonRequest("/lala.cgi", JSONobj.get_object(), async_request);
        }
    }

    function _getVarValue(data, key)
    {
        var tmp = data.split('_');
        var value = tmp[1];
        switch (tmp[0])
        {
            case 'fl':
                tmp[1] = "0x" + tmp[1];
                value = hex2float(tmp[1]);
                value = Math.round(value * 100) / 100;
                break;
            case 'u8':
                //alert("u8");
                value = _hex2dec(value);
                if (value < 10)
                {
                    value = "0" + value;
                }
                break;
            case 'u1':
                //alert("u1");
                value = _hex2dec(value);
                if (value < 10)
                {
                    value = "0" + value;
                }
                break;
            case 'u3':
                value = _hex2dec(value);
                break;
            case 'u6':
                value = _hex2dec(value);
                break;
            case 'i1':
                value = parseInt(value, 16);

                if(!isNaN(value)) {
                    if (value < 10) {
                        value = "0" + value;
                    }
                    if ((value & 0x8000) > 0) {
                        value = value - 0x10000;
                    }
                }
                else  {
                    value = NaN;
                }
                break;
            case 'i3':
                value = parseInt(value, 16);
                if(!isNaN(value))
                {
                    if (value < 10) {
                        value = "0" + value;
                    }

                    if ((Math.abs(value & 0x80000000)) > 0) {
                        value = value - 0x100000000;
                    }
                }
                else  {
                    value = NaN;
                }

                break;
            case 'i8':
                value = parseInt(value, 16);
                if (value < 10) {
                    value = "0" + value;
                }
                if ((value & 0x80) > 0) {
                    value = value - 0x100;
                }
                break;
            case 'ch':
                //alert("ch");
                break;
            case 'st':
                //alert("st");
                break;
            case 'er':
                console.log("error: " + data);
                break;
            default:
                console.log("error: unknown variable type of " + key + ": " + data);
                break;
        }

        return value;
    }

    function _hex2dec(num)
    {
        return parseInt(num, 16);
    }

    this.float2hex = function(input)
    {
        var floatString = ("" + input).replace (/NaN/gi, "6.805646932770577e+38").replace (/inf/gi, "3.402823669209385e+38");
        if (isNaN (floatString)) return null;

        var abs_float = Math.abs (parseFloat (floatString));
        var exponent = Math.floor (Math.log (abs_float) / Math.log (2));
        var mantissa = abs_float / Math.pow (2, exponent);

        if (exponent <= -127) {
            mantissa /= Math.pow (2, -127 - exponent + 1);
            exponent += (-127 - exponent);
        }

        var s = (floatString == abs_float) ? 0 : 1;
        var e = exponent;
        var f = (exponent == -127) ? mantissa * 8388608: 0x7FFFFF & (mantissa * 8388608);

        var sint32 = ((s << 31) | ((e + 127) << 23) | f);
        var hexString = ((sint32 < 0) ? 0xFFFFFFFF + sint32 + 1 : sint32).toString (16).toUpperCase ();

        return "00000000".substring (hexString.length) + hexString;
    };

    this.dec2hex = function(i)
    {
        var result = "0000";
        i = i * 1;
        result = i.toString(16);

        return result.toUpperCase();
    };
    this.dec2hexZp = function(i) //konvertiert dec to hex mit "zero padding"
    {
        var result = "0000";
        i = i * 1;
        result = i.toString(16);
        result = result.toUpperCase();
        if (result.length < 8)
        {
            var c = 0;
            for (c = 0; c < 9 - result.length; c++)
            {
                result = "0" + result;
            }
        }
        return result;
    };

    this.num2do = function(num) {
        var d = num % 256;
        for (var i = 3; i > 0; i--) {
            num = Math.floor(num / 256);
            d = d + '.' + num % 256;
        }
        return d;
    };

    this.dot2hex = function(ip) {
        // alert(ip);
        ip.toString();
        var d = ip.split('.');
        return   (((((((+d[3]) * 256) + (+d[2])) * 256) + (+d[1])) * 256) + (+d[0])).toString(16).toUpperCase();
    };
    this.dot2dec = function(ip) {
        // alert(ip);
        ip.toString();
        var d = ip.split('.');

        if (d.length != 4) {
            return 0;
        }

        return   (((((((+d[3]) * 256) + (+d[2])) * 256) + (+d[1])) * 256) + (+d[0]));//.toString(16).toUpperCase();
    };


    this.castVarValue = function(varType, data) {
        //TODO: implement exception handling for var-casting !!!
        // application should abort execution if a important config-value is malformed

        var value = data * 1;
        var hexVal = "";
        var hexLen = 0;
        // console.log("cast to var type " + varType);
        // console.log(data); //DEBUG

        switch (varType)
        {
            case 'fl':
                //alert("float");
                value = 'fl_' + (self.float2hex(value) || "00000000").toUpperCase();
                break;
            case 'u8':
                //alert("u8");
                if (value < 16) {
                    value = "0" + value.toString(16);
                }
                else
                {
                    value = value.toString(16);
                }
                value = "u8_" + value.toString(16).toUpperCase();
                break;
            case 'u1':

                if (value >= 0 && value <= 15) {
                    value = "000" + value.toString(16).toUpperCase();
                }

                else if (value >= 16 && value <= 255) {
                    value = "00" + value.toString(16).toUpperCase();
                }
                else if (value >= 256 && value <= 4095) {
                    value = "0" + value.toString(16).toUpperCase();
                }
                else if (value >= 4096 && value <= 65535) {
                    value = value.toString(16).toUpperCase();
                }
                value = "u1_" + value.toUpperCase();

                break;
            case 'u3':
                if (value >= 0 && value <= 15) {
                    value = "0000000" + value.toString(16).toUpperCase();
                }

                else if (value >= 16 && value <= 255) {
                    value = "000000" + value.toString(16).toUpperCase();
                }
                else if (value >= 256 && value <= 4095) {
                    value = "00000" + value.toString(16).toUpperCase();
                }
                else if (value >= 4096 && value <= 65535) {
                    value = "0000" + value.toString(16).toUpperCase();
                }

                else if (value >= 65536 && value <= 1048575) {
                    value = "000" + value.toString(16).toUpperCase();
                }
                else if (value >= 1048576 && value <= 16777215) {
                    value = "00" + value.toString(16).toUpperCase();
                }
                else if (value >= 16777216 && value <= 268435455) {
                    value = "0" + value.toString(16).toUpperCase();
                }
                else if (value >= 268435455 && value <= 4294967295) {
                    value = value.toString(16).toUpperCase();
                }
                value = "u3_" + value;
                console.log(value);

                break;
            case 'i8':
                //check if value is really an int-number
                value = parseInt(value);
                if(!isNaN(value)) {
                    hexVal = ((value < 0)? (0xFF + value + 1) : value).toString(16).toUpperCase();

                    //fill with leading zeros
                    hexLen = 2 - hexVal.length;
                    hexVal = (new Array(hexLen + 1).join("0")) + hexVal;

                    value = "i8_" + hexVal;
                }
                else value = NaN;

                break;
            case 'i1':
                //check if value is really an int-number
                value = parseInt(value);
                if(!isNaN(value)) {
                    hexVal = ((value < 0)? (0xFFFF + value + 1) : value).toString(16).toUpperCase();

                    //fill with leading zeros
                    hexLen = 4 - hexVal.length;
                    hexVal = (new Array(hexLen + 1).join("0")) + hexVal;

                    value = "i1_" + hexVal;
                }
                else value = NaN;

                break;
            case 'i3':
                //check if value is really an int-number
                value = parseInt(value);
                if(!isNaN(value)) {
                    hexVal = ((value < 0)? (0xFFFFFFFF + value + 1) : value).toString(16).toUpperCase();

                    //fill with leading zeros
                    hexLen = 8 - hexVal.length;
                    hexVal = (new Array(hexLen + 1).join("0")) + hexVal;

                    value = "i3_" + hexVal;
                }
                else value = NaN;
                break;
            case 'ch':
                //alert("ch");
                break;
            case 'st':
                value = 'st_'.concat(data);
                break;
            case 'er':
                console.log("er" + value);
                break;
            default:
                console.log("ERR: unknown var type..." + varType);
        }
        return value;
    }
    ;

    return this;

}

function setupTime(hours, minutes, day, month, year, pageObj)
{

    var date = new Date(year,month-1,day,hours,minutes,0);

    console.log(day + " " + month + " " + year + " " + hours + " " + minutes);
    console.log(date.getDate() + " " + date.getMonth() + " " + date.getFullYear() + " " + date.getHours() + " " + date.getMinutes() + "..." + date.getTimezoneOffset());
    var webtime = Date.UTC(year,month-1,day,hours,minutes,0)/1000;
    console.log(webtime);

    pageObj.handleTextAreaUpdate("RTC", "WEB_TIME", pageObj.castVarValue('u3', webtime));
}

// Make functions available for to unit tests.
if(typeof module !== "undefined")
{
    module.exports = { hex2float };
}
