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
$((function(){"use strict";$(document).ready((function(){util.translateElements(".translate");var e,n,a=["0","0"];document.location.search.replace(/\?/,"").split("&").forEach((function(a){var t=a.split("=");"env"===t[0]?n=t[1]:"anl"===t[0]?e=t[1]:"os"===t[0]&&t[1]}));try{if(+(a=navigator.userAgent.match(/Chrome\/([0-9]+)/)||a)[1]<SETTINGS.SUPPORTED_VERSION)return $(".content").remove(),$("#bad-version").text(util.getTranslation("web2pdfBadVersion",[SETTINGS.SUPPORTED_VERSION])),void $("#bad-version").removeClass("hidden")}catch(e){}SETTINGS.TEST_MODE||SETTINGS.DEBUG_MODE||"prod"!==n&&!SETTINGS.USE_ACROBAT?"prod"!==n&&$("#environment").val(n):$(".choose-env").remove(),$(".analytics").prop("checked","true"===e),$("#web2pdfPrivacy").prop("href",util.getTranslation("LearnMoreURL"))})),$("#web2pdfSave").click((function(){if(!$("#web2pdfSave").hasClass("no_change")){var e,n=$("#environment").val(),a=$("#html2pdf").is(":checked"),t={main_op:"reset",environment:n,html2pdf:"local-dev"===n&&a,analytics_on:!!$(".analytics").prop("checked")};util.messageToMain(t),SETTINGS.USE_ACROBAT||(e="Success! Environment reset to "+n+".","local-dev"===n&&(e+=" Html2PDF set to "+a+"."),$("#message").text(e),$("#message").removeClass("hidden"))}})),$("#environment").change((function(){"local-dev"===$("#environment").val()?$(".html2pdfoption").removeClass("hidden"):$(".html2pdfoption").addClass("hidden"),$("#web2pdfSave").removeClass("no_change")})),$(".analytics").click((function(){$("#web2pdfSave").removeClass("no_change")})),util.addMainListener((function(e){"saved_analytics"===e.options_op&&$("#web2pdfSave").addClass("no_change")}))}));