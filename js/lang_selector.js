/** Prevent JSHint warning about functions called from HTML sites. */
/* exported _check_for_german_languagefile, _lang_selector_onchange, _update_text_strings, _update_tooltips_strings */

// Loaded by default
var lastLangFile = './js/DE-de.js';

function createjsfile(filename)
{
  var fileref=document.createElement('script');
  fileref.setAttribute("type","text/javascript");
  fileref.setAttribute("src", filename);

  return fileref;
}

// Searches all loaded script files for the old filename and replaces it by the new js-file.
function replacejsfile(newfilename,oldfilename) 
{
  var allsuspects=document.getElementsByTagName("script");
  for (var i=allsuspects.length; i>=0; i--)
  {
   if (allsuspects[i] && allsuspects[i].getAttribute("src")!=null && allsuspects[i].getAttribute("src").indexOf(oldfilename)!=-1)
   {
    console.log("Replace " + oldfilename + " by " + newfilename);
    var newelement=createjsfile(newfilename);
    allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i]);
   }
  }
}

// Will change the language and save the current filename
function _selectLanguage(type)
{
  switch(type)
  {
    default:
    case 0:
        // language switch case
        replacejsfile('./js/DE-de.js',lastLangFile);
        lastLangFile = './js/DE-de.js';
        break;
    case 1:
        // language switch case
        replacejsfile('./js/EN-en.js',lastLangFile);
        lastLangFile = './js/EN-en.js';
        break;
    case 2:
        // language switch case
        replacejsfile('./js/IT-it.js',lastLangFile);
        lastLangFile = './js/IT-it.js';
        break;
  }
}

function _check_for_german_languagefile()
{
    return (lastLangFile == './js/DE-de.js');
}

// event handler for language selection
function _lang_selector_onchange(selection) 
{
  IndexPageObj.handleSelectUpdate("WIZARD", "GUI_LANG", IndexPageObj.castVarValue('u8', selection));
  IndexPageObj.singlePageRefresh();
  _selectLanguage(selection);
  window.location.reload();
}

// Update all strings depending on the current loaded language file
function _update_text_strings()
{
    //Get all object member names
    for(var propertyName in lng){
        $('#'+ propertyName).text(lng[propertyName]);
    }
}

//Update all strings depending on the current loaded language file
function _update_tooltips_strings()
{
    //Get all object member names
    for(var propertyName in tooltip){
        $('#'+ propertyName).attr('title',tooltip[propertyName]);
    }
}


