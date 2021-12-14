/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property laws,
* including trade secret and or copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
function dependOn(){"use strict";return[require("communicate")]}var def;require=function(e){"use strict";return e},def=window.define?window.define:function(e,t){"use strict";return t.apply(null,[{ajax:$.ajax.bind($)}])};var exports=acom_analytics={};def(dependOn(),(function(e){chrome.extension.onMessageExternal.addListener((function(t,s,r){"use strict";if(/^https:\/\/([a-zA-Z\d-]+\.){0,}(adobe|acrobat)\.com(:[0-9]*)?$/.test(s.origin))if("WebRequest"===t.type)if("detect_extension"===t.task)r({status:"success",result:"true"});else if("detect_desktop"===t.task)try{if(0!=e.version&&1!=e.version){r(e.version===SETTINGS.READER_VER||e.version===SETTINGS.ERP_READER_VER?{status:"success",result:"Reader"}:{status:"success",result:"Acrobat"})}else r({status:"success",result:"NoApp"})}catch(e){r({status:"error",code:"error"})}else r({status:"error",code:"invalid_task"});else r({status:"error",code:"invalid_type"})}))}));