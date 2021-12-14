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
$((function(){"use strict";function n(n,t){const i={main_op:"analytics",analytics:[[n,t]]};util.messageToMain(i)}function t(){var n={content_op:"dismiss",main_op:"relay_to_content",fteUI:!0};util.messageToMain(n)}$(document).on("click","#pdfOwnershipPromptCancel",(function(){n(acom_analytics.e.VIEWER_FTE_NOT_NOW),t()})),$(document).on("click","#pdfOwnershipPromptOk",(function(){n(acom_analytics.e.VIEWER_FTE_SET_DEFAULT),function(n){if(!n)return void console.log("Error: No value specified");util.setCookie("pdfViewer",n)}(!0),t()})),$((function(){util.translateElements(".translate")}))}));