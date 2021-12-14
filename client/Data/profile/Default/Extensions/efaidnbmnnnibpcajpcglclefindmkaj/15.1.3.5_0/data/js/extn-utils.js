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
!function(){const n=window.location.ancestorOrigins?window.document.location.ancestorOrigins.length&&window.document.location.ancestorOrigins[0]:window.parent.location.origin;!function(){const o=function(){try{return localStorage,!1}catch(n){return!0}}(),t={main_op:"third-party-cookies",cookies_status:!o};chrome.runtime.sendMessage(t),window.parent.postMessage(!o,n)}()}();