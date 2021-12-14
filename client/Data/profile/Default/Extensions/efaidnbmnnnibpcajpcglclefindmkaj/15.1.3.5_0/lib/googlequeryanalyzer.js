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
function dependOn(){"use strict";return[require("communicate"),require("proxy"),require("analytics"),require("common"),require("util")]}var def;require=function(e){"use strict";return e},def=window.define?window.define:function(e,t){"use strict";return t.apply(null,[{ajax:$.ajax.bind($)}])};var exports=acom_analytics={};def(dependOn(),(function(e,t,r,n,o){"use strict";var i=null,s=null,c=["word-to-pdf","jpg-to-pdf","excel-to-pdf","ppt-to-pdf","pdf-to-word","pdf-to-ppt","pdf-to-excel","pdf-to-image","createpdf","compress-pdf"];for(s in i||(i=new function(){this.proxy=t.proxy.bind(this),this.LOG=n.LOG,this.isGoogleQuery=function(e){try{if(new URL(e.url).host.startsWith("www.google."))return!0}catch(e){return!1}return!1},this.getSearchQuery=function(e){try{const t=new URL(e.url).searchParams.get("q");if(t)return decodeURIComponent(t)}catch(e){return r.event(r.e.GOOGLE_URL_DECODE_ERROR),null}return null},this.mapQueryStringToAction=function(t,i){let s=chrome.i18n.getMessage("@@ui_locale"),c=o.getFrictionlessLocale(s);if(null==c)return;const u=chrome.runtime.getURL("data/data/"+s+"/searchterms.json");fetch(u).then(e=>{if(e.status>=200&&e.status<=299)return e.json();throw r.event(r.e.GOOGLE_SEARCHTERM_FETCH_ERROR),Error(r.e.GOOGLE_SEARCHTERM_FETCH_ERROR)}).then(r=>{const o=this.findAction(r,t);o&&(i.pdf_action=o,i.frictionless_uri=n.getFrictionlessUri(),i.env=n.getEnv(),i.panel_op="load-frictionless",i.frame_visibility="hidden",i.frictionless_workflow="search",i.locale=c,e.sendMessage(i))}).catch(e=>{console.error("googlequeryanalyzer::mapQueryStringToAction",e)})},this.findAction=function(e,t){const r=t.replace(/\s/g,"").toLowerCase();for(let t=0;t<c.length;++t){const n=c[t];let o=e[n]||[];for(let e=0;e<o.length;e++){const t=o[e];if(r.includes(t))return n}}return null}},e.registerModule("googlequeryanalyzer",i)),i)i.hasOwnProperty(s)&&("function"==typeof i[s]?exports[s]=i[s].bind(i):exports[s]=i[s]);return i}));