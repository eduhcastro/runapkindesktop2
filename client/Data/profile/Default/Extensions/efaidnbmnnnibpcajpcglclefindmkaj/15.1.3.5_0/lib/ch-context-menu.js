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
var communicate,acom_analytics,utilities,started,startup=new Promise((function(e,t){"use strict";started=e})),startupComplete=!1;function registerActions(e){"use strict";var t,n=function(){return communicate.getModule("acro-web2pdf")},o=function(){return communicate.getModule("acro-gstate")},a=["*://*/*.pdf"],i=["http://*/*","https://*/*"],c=["all"],r=function(e){var t,n=e.splice();for(t=0;t<e.length;t+=1)n.push(e[t]+"?*")}(["*://*/*.ai","*://*/*.bmp","*://*/*.doc","*://*/*.docx","*://*/*.gif","*://*/*.indd","*://*/*.jpeg","*://*/*.jpg","*://*/*.odf","*://*/*.odg","*://*/*.odp","*://*/*.ods","*://*/*.odt","*://*/*.png","*://*/*.ppt","*://*/*.pptx","*://*/*.pptx","*://*/*.ps","*://*/*.psd","*://*/*.pub","*://*/*.rtf","*://*/*.stw","*://*/*.sxd","*://*/*.sxc","*://*/*.sxi","*://*/*.sxw","*://*/*.text","*://*/*.tif","*://*/*.tiff","*://*/*.txt","*://*/*.xls","*://*/*.xlsx"].concat(a));function l(e){return utilities&&utilities.isChromeOnlyMessage(e)&&utilities.isEdge()&&(e+="Edge"),utilities&&utilities.getTranslation?utilities.getTranslation(e):chrome.i18n.getMessage(e)}function s(e){return(e.title||l("web2pdfUntitledFileName")).replace(/[<>?:|\*"\/\\'&\.]/g,"")}function d(e,t){if(!e&&!t)return!1;try{const n=e.pageUrl||t.url,o=new URL(n);if(o.protocol&&["http:","https:"].includes(o.protocol))return!0}catch(e){console.error(e)}return!1}startupComplete||(startupComplete=!0,startup.then((function(t){chrome.runtime.getPlatformInfo((function(e){var t;SETTINGS.OS=e.os,SETTINGS.CHROME_VERSION=0,SETTINGS.EXTENSION_VERSION=0;try{(t=navigator.userAgent.match(/Chrome\/([0-9]+)/))&&(SETTINGS.CHROME_VERSION=+t[1])}catch(e){}try{SETTINGS.EXTENSION_VERSION=chrome.runtime.getManifest().version}catch(e){}"mac"===e.os?acom_analytics.event(acom_analytics.e.OS_MAC_OP):"win"===e.os&&acom_analytics.event(acom_analytics.e.OS_WIN_OP)})),e?"update"===e.reason?t.event(t.e.EXTENSION_UPDATE):"install"===e.reason&&t.event(t.e.EXTENSION_INSTALLED):t.event(t.e.EXTENSION_STARTUP),chrome.browserAction.onClicked.addListener((function(e){communicate.echo(e)}));try{if(window.navigator.onLine){const e=localStorage.getItem("pdfViewer"),o=localStorage.getItem("killSwitch"),a=localStorage.getItem("cdnUrl");"false"===e&&"on"===o&&(n=a,new Promise((function(e,t){let o=new XMLHttpRequest;o.open("GET",n),o.timeout=5e3,o.onload=function(){if(4===o.readyState)return 200===this.status?e(o.response):t({statusText:o.statusText})},o.onerror=function(){return t({statusText:o.statusText})},o.ontimeout=()=>t({statusText:"Failed due to timeout"}),o.send()}))).then(e=>{-1===e.toString().indexOf("<meta name='killSwitch' content='off'/>")&&-1===e.toString().indexOf('<meta name="killSwitch" content="off"/>')||(localStorage.setItem("pdfViewer",!0),localStorage.setItem("killSwitch","off"),t.event(t.e.VIEWER_KILL_SWITCH_OFF_SUCCESS))}).catch(e=>{t.event(t.e.VIEWER_KILL_SWITCH_OFF_FAILED)})}}catch(e){t.event(t.e.VIEWER_KILL_SWITCH_OFF_FAILED)}var n})),!SETTINGS.IS_READER&&SETTINGS.USE_ACROBAT?(chrome.contextMenus.create({title:l("web2pdfConvertPageContextMenu"),contexts:["page"],onclick:function(e,t){d(e,t)&&(acom_analytics.event(acom_analytics.e.CONTEXT_MENU_CONVERT_PAGE),n().handleConversionRequest({tabId:t.id,caller:o().web2pdfCaller.MENU,action:o().web2pdfAction.CONVERT,context:o().web2pdfContext.PAGE,url:e.pageUrl||t.url,domtitle:s(t)}))},documentUrlPatterns:i,id:"convertPageContextMenu"}),chrome.contextMenus.create({title:l("web2pdfAppendPageContextMenu"),contexts:["page"],onclick:function(e,t){d(e,t)&&(acom_analytics.event(acom_analytics.e.CONTEXT_MENU_APPEND_PAGE),n().handleConversionRequest({tabId:t.id,caller:o().web2pdfCaller.MENU,action:o().web2pdfAction.APPEND,context:o().web2pdfContext.PAGE,url:e.pageUrl||t.url,domtitle:s(t)}))},documentUrlPatterns:i,id:"appendPageContextMenu"}),chrome.contextMenus.create({title:l("web2pdfConvertLinkContextMenu"),contexts:["link"],onclick:function(e,t){d(e,t)&&(acom_analytics.event(acom_analytics.e.CONTEXT_MENU_CONVERT_LINK),n().handleConversionRequest({tabId:t.id,caller:o().web2pdfCaller.MENU,action:o().web2pdfAction.CONVERT,context:o().web2pdfContext.LINK,url:e.linkUrl,domtitle:s(t)}))},documentUrlPatterns:i}),chrome.contextMenus.create({title:l("web2pdfAppendLinkContextMenu"),contexts:["link"],onclick:function(e,t){d(e,t)&&(acom_analytics.event(acom_analytics.e.CONTEXT_MENU_APPEND_LINK),n().handleConversionRequest({tabId:t.id,caller:o().web2pdfCaller.MENU,action:o().web2pdfAction.APPEND,context:o().web2pdfContext.LINK,url:e.linkUrl,domtitle:s(t)}))},documentUrlPatterns:i})):SETTINGS.IS_READER||("Adobe PDF",t=chrome.contextMenus.create({title:"Adobe PDF",contexts:c,id:"pdf-page"}),chrome.contextMenus.create({title:"Upload PDF to acrobat.com",contexts:c,parentId:t,id:"upload",documentUrlPatterns:a}),chrome.contextMenus.create({title:"Upload and export to Word/Excel/PowerPoint/Images",contexts:c,parentId:t,id:"export",documentUrlPatterns:a}),chrome.contextMenus.create({title:"Upload link to acrobat.com",contexts:["link"],parentId:t,id:"upload_link",targetUrlPatterns:r}),chrome.contextMenus.create({title:"Upload image to acrobat.com",contexts:["image"],parentId:t,id:"upload-image"}),chrome.contextMenus.create({title:"Create a Slideshow from a Flickr album",contexts:c,parentId:t,id:"flickr-slideshow",documentUrlPatterns:["*://www.flickr.com/*"]}),chrome.contextMenus.create({title:"Create a contact sheet from Flickr images",contexts:c,parentId:t,id:"flickr-contact-sheet",documentUrlPatterns:["*://www.flickr.com/*"]})))}SETTINGS=SETTINGS||{USE_ACROBAT:!0},chrome.runtime.getPlatformInfo((function(e){"use strict";SETTINGS.OS=e.os})),require(["communicate","util","upload","download-manager","analytics","acro-gstate","acro-actions","acro-web2pdf","session","convert-to-zip"],(function(e,t,n,o,a,i,c,r){"use strict";function l(n,o){var a=function(n){const o=t.isEdge(),a=SETTINGS.IS_ACROBAT&&!e.legacyShim(),i=SETTINGS.IS_BETA;return"normal"!==n||o?i?o?a?"https://helpx.adobe.com/acrobat/kb/acrobat-pro-chrome-extension-beta.html":"https://helpx.adobe.com/acrobat/kb/acrobat-pro-chrome-extension-beta.html":a?"https://helpx.adobe.com/acrobat/kb/acrobat-pro-chrome-extension-beta.html":"https://helpx.adobe.com/acrobat/kb/acrobat-pro-chrome-extension-beta.html":o?a?"https://helpx.adobe.com/acrobat/kb/acrobat-pro-edge-extension.html":"https://helpx.adobe.com/acrobat/kb/acrobat-reader-edge-extension.html":a?"https://acrobat.adobe.com/us/en/landing/acrobat-pro-chrome-extension.html":"https://acrobat.adobe.com/us/en/landing/acrobat-reader-chrome-extension.html":"https://www.adobe.com/go/chrome_ext_landing"}(o);"false"!==t.getCookie("fte")&&setTimeout(()=>t.createTab(a,(function(){if(t.setCookie("fte","false",3650),n.event(n.e.FTE_LAUNCH),SETTINGS.VIEWER_ENABLED&&(e.legacyShim()||!SETTINGS.IS_ACROBAT||SETTINGS.VIEWER_ENABLED_FOR_ACROBAT))if(t.isEdge()||"normal"===o)try{t.getCookie("pdfViewer")||(t.setCookie("fte","false"),t.setCookie("pdfViewer","true"),t.isEdge()?n.event(n.e.USE_ACROBAT_IN_EDGE_AUTO_ENABLED):n.event(n.e.USE_ACROBAT_IN_CHROME_AUTO_ENABLED))}catch(e){n.event(n.e.LOCAL_STORAGE_DISABLED)}else chrome.tabs.onUpdated.addListener((function e(o,a,i){"complete"==a.status&&(n.event(n.e.VIEWER_FTE_LAUNCH),chrome.tabs.sendMessage(o,{fte_op:"FTE",panel_op:"FTE",is_edge:t.isEdge()}),chrome.tabs.onUpdated.removeListener(e))}))})),2e3)}function s(e){return utilities&&utilities.isChromeOnlyMessage(e)&&utilities.isEdge()&&(e+="Edge"),utilities&&utilities.getTranslation?utilities.getTranslation(e):chrome.i18n.getMessage(e)}chrome.management.getSelf((function(e){!function(){try{0==localStorage.length&&""!=document.cookie&&document.cookie.split(/; */).map(e=>e.split("=")).filter(e=>e&&2==e.length).forEach(e=>localStorage.setItem(e[0],e[1]))}catch(e){}}(),function(){try{t.isEdge()&&localStorage.setItem("IsRunningInEdge",!0)}catch(e){}}(),a.s||a.init(e.version,e.installType),c.getVersion((function(n){n!==SETTINGS.READER_VER&&n!==SETTINGS.ERP_READER_VER||(SETTINGS.IS_READER=!0,SETTINGS.IS_ACROBAT=!1,n===SETTINGS.ERP_READER_VER&&(SETTINGS.IS_ERP_READER=!0),n===SETTINGS.ERP_READER_VER?chrome.browserAction.setTitle({title:s("web2pdfConvertButtonToolTipERPReader")}):chrome.browserAction.setTitle({title:s("web2pdfOpenButtonText")})),registerActions(),function(e){(0==e||1==e&&0==t.getNMHConnectionStatus()||e==SETTINGS.READER_VER||e==SETTINGS.ERP_READER_VER)&&chrome.contextMenus.removeAll()}(n),function(e){0!=e&&1!=e&&e!=SETTINGS.READER_VER&&e!=SETTINGS.ERP_READER_VER||chrome.browserAction.setTitle({title:""})}(n),started(a),l(a,e.installType)}))})),acom_analytics=a,communicate=e,utilities=t,SETTINGS.USE_ACROBAT||chrome.contextMenus.onClicked.addListener((function(e,t){var n={filename:t.title,tabId:t.id,menuItem:e.menuItemId,handleResult:"preview"};if("flickr-slideshow"===e.menuItemId||"flickr-contact-sheet"===e.menuItemId)return a.event(n,a.e.FLICKR_CONTEXT_CLICK),void communicate.deferMessage({panel_op:"flickr",tabId:t.id});"upload-image"===e.menuItemId&&(a.setOp("Image"),n.handleResult="image_preview",n.url=e.srcUrl),"upload_link"===e.menuItemId&&(a.setOp("Link"),n.url=e.linkUrl),"upload"===e.menuItemId&&(a.setOp("Link"),n.url=e.linkUrl),"pdf-page"===e.menuItemId&&(a.setOp("PdfPage"),n.url=e.pageUrl),n.filename.length>20&&(n.filename=n.filename.substring(0,19)),e.linkUrl?n.filename=e.linkUrl.split("/").splice(-1)[0].replace(/\?\S*/,""):e.srcUrl&&(n.url=e.srcUrl,n.filename=e.srcUrl.split("/").splice(-1)[0].replace(/\?\S*/,"")),"export"===e.menuItemId&&(n.handleResult="export"),o.proxy(o.do_upload(n))}))})),chrome.runtime.onInstalled.addListener(registerActions);