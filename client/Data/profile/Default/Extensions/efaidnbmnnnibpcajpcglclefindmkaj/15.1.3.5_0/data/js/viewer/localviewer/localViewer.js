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
$((function(){"use strict";var e=function(e,o,n){var r={action:e,data:o};chrome.runtime?n?chrome.runtime.sendMessage(r,n):chrome.runtime.sendMessage(r):(console.error("chrome.runtime is undefined."),n&&n())};$(document).ready((function(){chrome.extension.isAllowedFileSchemeAccess((function(e){e?console.log("Schema allowed."):console.log("Schema not allowed.")})),chrome.permissions.contains({origins:["file://*"]},(function(e){chrome.runtime.lastError?console.log("Origin Error."):e?console.log("Origin allowed."):console.log("Origin Not allowed.")})),chrome.permissions.contains({permissions:["<all_urls>"],origins:["file://*"]},(function(e){chrome.runtime.lastError?console.log("Permission Error."):e?console.log("Permission allowed."):console.log("Permission Not allowed.")})),chrome.permissions.request({origins:["file://*"]},(function(e){e?console.log("Request Orign granted"):console.log("Request Orign not granted")})),chrome.permissions.request({permissions:["<all_urls>"],origins:["file://*"]},(function(e){e?console.log("Request Permission granted"):console.log("Request Permission not granted")})),chrome.permissions.contains({origins:["file://*"]},(function(e){if(chrome.runtime.lastError){var o="chrome://extensions/?id="+chrome.runtime.id;message.data.newTab?chrome.tabs.create({windowId:sender.tab.windowId,index:sender.tab.index+1,url:o,openerTabId:sender.tab.id}):chrome.tabs.update(sender.tab.id,{url:o})}else{if(e)return;{let e=document.createElement("button");e.innerText="Allow Extension to Access Local Files",e.addEventListener("click",(function(){chrome.permissions.request({origins:["file://*"]},(function(e){if(e){console.log("granted");const e=decodeURIComponent(params.get("pdfurl"));chrome.tabs.update(tabId,{url:getViewerURL(e)})}else console.log("not granted")}))})),$("#footer").append(e)}}}));var o=chrome.runtime.getManifest().icons[48];$("#chrome-logo-bg").css("background-image","url("+chrome.runtime.getURL(o)+")"),$("#chrome-link-to-extensions-page").attr("href","chrome://extensions/?id="+chrome.runtime.id),$("#chrome-link-to-extensions-page").click((function(o){o.preventDefault(),e("openExtensionsPageForFileAccess",{newTab:o.ctrlKey||o.metaKey||1===o.button||window!==top})}))}))}));