'use strict';

var showPanel = false;
var showPanelCount = 0;

var showPanelPermissionActivation = true;
var openPermissionPanelCounter = 0;
var showPanelPromotion = false;
var openPromotionPanelCounter = 0;
var showPanelSupport = false;
var openSupportPanelCounter = 0;
var browserLanguage = chrome.i18n.getUILanguage().split('-')[1];

if (browserLanguage === undefined) {
    browserLanguage = chrome.i18n.getUILanguage().split('-')[0].toLowerCase();
} else {
    browserLanguage = browserLanguage.toLowerCase()
}



/*  Get Browser Name and Version*/
const getBrowserNameAndVersion = () => {
    var ua = navigator.userAgent,
        tem,
        M = ua.match(/(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([0-9|\.]+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+([0-9|\.]+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Firefox') {
        tem = ua.match(/\b(PaleMoon)\/([0-9|\.]+)/);
        if (tem != null) return tem.slice(1).join(' ');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge|Edg)\/([0-9|\.]+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera').replace('Edg', 'Edge');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/([0-9|\.]+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
}

var BrowserFamily = getBrowserNameAndVersion().split(" ")[0];



chrome.storage.local.get(['showPanel'], function (fetched) {
    if (fetched.showPanel !== undefined) {
        var result = Math.abs(fetched.showPanel - Date.now()) / 1000;
        var days = Math.floor(result / 86400);
        var minutes = Math.floor(result / 60) % 60;
        // 
        
        if (days === 3) {
            showPanel = true;
            chrome.storage.local.get(['showPanelCount'], function (data) {
                if (data.showPanelCount !== undefined) {
                    chrome.storage.local.set({ 'showPanelCount': data.showPanelCount + 1 });
                } else {
                    chrome.storage.local.set({ 'showPanelCount': 0 });
                }
            });
        }
    } else {
        chrome.storage.local.set({ 'showPanel': Date.now() });
    }
});

// Check open permission panel
// Display 3 times only before a date
chrome.storage.local.get(['installDate'], function (data) {
    if (data.installDate !== undefined) {
        var result = Math.abs(data.installDate - Date.now()) / 1000;
        var days = Math.floor(result / 86400);
        var minutes = Math.floor(result / 60) % 60;
        // 
        
        // for open permission panel
        if (days < 5000) {
            chrome.storage.local.get(['openPanelCount'], function (data) {
                if (data.openPanelCount !== undefined) {
                    openPermissionPanelCounter = data.openPanelCount;
                    chrome.storage.local.set({openPanelCount: openPermissionPanelCounter + 1}, function () {});
                } else {
                    openPermissionPanelCounter = 1;
                    chrome.storage.local.set({openPanelCount: openPermissionPanelCounter}, function () {});
                }
            });
        } else {
            openPermissionPanelCounter = 4;
            chrome.storage.local.set({openPanelCount: openPermissionPanelCounter}, function () {});
        }
    }
});

// Check open promotion panel
// display 3 times only after 3 days
// then after 45 days, 3 times max
chrome.storage.local.get(['promotionDate'], function (data) {
    if (data.promotionDate !== undefined) {
        
        var result = Math.abs(data.promotionDate - Date.now()) / 1000;
        var days = Math.floor(result / 86400);
        var minutes = Math.floor(result / 60) % 60;
        

        if (days > 2 && days < 5) { // show in between day 2 to day 5
            showPanelPromotion = true;
            chrome.storage.local.get(['openPromotionPanelCount'], function (data) {
                if (data.openPromotionPanelCount !== undefined) {
                    openPromotionPanelCounter = data.openPromotionPanelCount;
                    chrome.storage.local.set({openPromotionPanelCount: openPromotionPanelCounter + 1}, function () {});
                } else {
                    openPromotionPanelCounter = 1;
                    chrome.storage.local.set({openPromotionPanelCount: openPromotionPanelCounter}, function () {});
                }
            });
        }

        if (days >= 45) { // show after 45 days
            showPanelPromotion = true;
            chrome.storage.local.get(['openPromotionPanelCount'], function (data) {
                chrome.storage.local.get(['openPromotionPanelCountSecondTime'], function (data2) {
                    if (data.openPromotionPanelCount !== undefined) {
                        if (data.openPromotionPanelCount > 3 && !data2.openPromotionPanelCountSecondTime) {
                            openPromotionPanelCounter = 0;
                            chrome.storage.local.set({openPromotionPanelCount: openPromotionPanelCounter}, function () {});
                            chrome.storage.local.set({openPromotionPanelCountSecondTime: true}, function () {});
                        } else {
                            openPromotionPanelCounter = data.openPromotionPanelCount;
                            chrome.storage.local.set({openPromotionPanelCount: openPromotionPanelCounter + 1}, function () {});
                        }
                    } else {
                        openPromotionPanelCounter = 1;
                        chrome.storage.local.set({openPromotionPanelCount: openPromotionPanelCounter}, function () {});
                    }
                });
            });
        }
    } else {
        chrome.storage.local.set({promotionDate: Date.now()}, function () {});
    }
});

// Check open support panel
// display 2 times after 14 days
chrome.storage.local.get(['supportDate'], function (data) {
    if (data.supportDate !== undefined) {
        
        var result = Math.abs(data.supportDate - Date.now()) / 1000;
        var days = Math.floor(result / 86400);
        var minutes = Math.floor(result / 60) % 60;

        // show panel only if browser langugage is set to FR, ES or UK
        if (browserLanguage == "de" || browserLanguage == "es" || browserLanguage == "fr" || browserLanguage == "nl") {
            if (days >= 14) { // show after 14 days
                showPanelSupport = true;
                chrome.storage.local.get(['openSupportPanelCount'], function (data3) {
                    if (data3.openSupportPanelCount !== undefined) {
                        openSupportPanelCounter = data3.openSupportPanelCount;
                        chrome.storage.local.set({openSupportPanelCount: openSupportPanelCounter + 1}, function () {});
                    } else {
                        openSupportPanelCounter = 1;
                        chrome.storage.local.set({openSupportPanelCount: openSupportPanelCounter}, function () {});
                    }
                });
            }   
        } else {
            showPanelSupport = false;
            openSupportPanelCounter = 4;
        }
        
    } else {
        chrome.storage.local.set({supportDate: Date.now()}, function () {});
    }
});



chrome.runtime.onMessage.addListener(function listener(request, sender, sendResponse) {
    if (request.url) {
        

        setTimeout(() => {
            var frameContainer = document.querySelectorAll('#sts_frame_container').length;

            if (frameContainer < 1) {
                var frame = document.createElement('div');
                frame.setAttribute("id", "sts_frame_container");
                frame.style.cssText = "all: unset; position: fixed; top: 5px; right: 10px; width: auto; height: auto; background-color: transparent; z-index: 99999999; border-radius: 4px;";
    
                var close = document.createElement('div');
                close.setAttribute('id', 'x-close');
                close.appendChild(document.createTextNode("✖"));
                close.style.cssText = 'all: unset; position: absolute; top: 8px; right: 20px; width: auto; height: auto; background-color: transparent; z-index: 9999999; color: #666666; cursor: pointer; font-size: 12px; font-weight: bold; font-family: InterUI, sans-serif;';
                frame.appendChild(close);
    
                var iframe = document.createElement('iframe');
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('id', 'tst_iframe');
                iframe.src = request.url;
                iframe.style.cssText = "width: 390px; max-width: 390px; height:680px;"
                frame.appendChild(iframe);
    
                close.addEventListener('click', function() {
                    var parentDiv = document.querySelector("#sts_frame_container");
                    var permissionPanelDiv = document.querySelector("#sts_permission_panel");
                    if (parentDiv) {
                        parentDiv.parentNode.removeChild(parentDiv);
                        // chrome.storage.local.set({[(request.tabId).toString()]: {'openTab': false}}, function() {});
                    }
                    if (permissionPanelDiv) {
                        permissionPanelDiv.remove();
                    }
                    var panelDiv = document.querySelector("#sts_panel");
                    if (panelDiv) {
                        panelDiv.parentNode.removeChild(panelDiv);
                    }
                    chrome.runtime.sendMessage({
                        what: 'ActionType',
                        name: 'CloseButton',
                        clicked: 'icon'
                    });
                });
    
                /* Panel Survey */
                if (showPanel) {
                    chrome.storage.local.get(['showPanelCount'], function (data) {
                        
                        if (data.showPanelCount == undefined || data.showPanelCount < 1) {
                            var panel = document.createElement("div");
                            panel.setAttribute("id", "sts_panel");
                            panel.style.cssText = "all: unset; position: fixed; top: 5px; right: 389px; width: auto; height: 634px; background-color: #fff; z-index: 99999996; border-radius: 1px; text-align: center; padding: 0; border: solid 1px #e6e6e6";
                            var p1 = document.createElement("div");
                            p1.setAttribute("id", "sts_panel_title");
                            p1.style.cssText = "all: unset; padding: 10px 0; font-size: 22px; display: block; margin: 70px 70px 20px;";
                            p1.appendChild(document.createTextNode("Make Web Pro Better!"));
                            var p2 = document.createElement("div");
                            p2.setAttribute("id", "sts_panel_sentence");
                            p2.style.cssText = "all: unset; padding: 10px 0; font-size: 16px; display: block;";
                            p2.appendChild(document.createTextNode("Take this short survey"));
                            var p3 = document.createElement("div");
                            p3.setAttribute("id", "sts_panel_sentence");
                            p3.style.cssText = "all: unset; padding: 10px 0; font-size: 16px; display: block;";
                            p3.appendChild(document.createTextNode("Chance to win $100 Amazon Gift card"));
                            var p4 = document.createElement("a");
                            p4.setAttribute("id", "sts_panel_sentence");
                            p4.style.cssText = "all: unset; font-size: 16px; display: block; cursor: pointer; color: #ffffff; width: 120px; height: auto; box-shadow: 0 1px 1px 0 rgba(0, 52, 87, 0.2); border: solid 1px #007fff; background: #0099ff; margin: 50px auto; padding: 10px 20px;";
                            p4.setAttribute("href", "https://www.surveymonkey.com/r/HKNWXTD");
                            p4.setAttribute("target", "_blank");
                            p4.appendChild(document.createTextNode("Start Survey"));
                            var panel_close = document.createElement('div');
                            panel_close.setAttribute('id', 'panel-close');
                            panel_close.appendChild(document.createTextNode("✖"));
                            panel_close.style.cssText = 'all: unset; position: absolute; top: 8px; right: 10px; width: auto; height: auto; background-color: transparent; z-index: 9999999; color: #666666; cursor: pointer; font-size: 12px; font-weight: bold; font-family: InterUI, sans-serif;';
                            panel.append(p1, p2, p3, p4, panel_close);
    
                            panel_close.addEventListener('click', function() {
                                var panelDiv = document.querySelector("#sts_panel");
                                if (panelDiv) {
                                    panelDiv.parentNode.removeChild(panelDiv);
                                }
                            });
                            document.body.appendChild(panel);
                        }
                    });
                }
                
                /* Panel Permission Messaging */
                chrome.runtime.sendMessage({
                    what: 'hasPermissionNativeMessaging'
                }, (data) => {
                    // 
                    if (data.hasPermission === false && BrowserFamily != "Edge") {
                        if (openPermissionPanelCounter < 2) {
                            var permissionPanel = document.createElement("div");
                            permissionPanel.setAttribute("id", "sts_permission_panel");
                            permissionPanel.style.cssText = "all: unset; position: fixed; top: 16px; right: 389px; width: 258px; height: 524px; background-color: #fff; z-index: 99999996; border-radius: 1px; text-align: center; padding: 45px 47px; border: solid 1px #e6e6e6";
                            var perImg = document.createElement("img");
                            perImg.setAttribute("id", "sts_permission_img");
                            perImg.setAttribute("src", "data:image/png;base64,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");
                            perImg.setAttribute('width', '102px');
                            perImg.style.cssText = "all: unset; display: block; text-align: center; margin: 0 auto;";
                            var pertitle = document.createElement("div");
                            pertitle.setAttribute("id", "sts_permission_title");
                            pertitle.appendChild(document.createTextNode("Would you like to open all search results with uTorrent?"));
                            pertitle.style.cssText = "all: unset; display: block; font-size: 22px; line-height: 25px; font-family: Arial, sans-serif; margin: 30px auto 25px; text-align: center; color: #000;";
                            var perPargh1 = document.createElement("p");
                            perPargh1.setAttribute("id", "sts_permission_prgh1");
                            perPargh1.appendChild(document.createTextNode("This extension can sync results with BitTorrent and/or uTorrent. If you want to activate this feature, please click on the button below, then on the Chrome message to activate the “Messaging Permission”"));
                            perPargh1.style.cssText = "all: unset; display: block; font-size: 12px; line-height: 20px; font-family: Arial, sans-serif; margin: 0 auto; text-align: center; color: #000;";
                            var perBtn = document.createElement("button");
                            perBtn.setAttribute("id", "sts_permission_btn");
                            perBtn.appendChild(document.createTextNode("Activate Messaging Permission"));
                            perBtn.style.cssText = "all: unset; border: 0 none; outline: none; display: inline-block; background: linear-gradient(180deg, #46B5FF 0%, #0099FF 100%); border-radius: 2px; padding-left: 24px; padding-right: 24px; margin: 55px auto 20px; height: 32px; min-width: 22px; text-align: center; font: bold 12px/32px Arial; letter - spacing: -0.3px; color: #FFFFFF; text-shadow: 0px 1px 0px #00497980; cursor: pointer;";
                            var perPargh2 = document.createElement("p");
                            perPargh2.setAttribute("id", "sts_permission_prgh2");
                            perPargh2.appendChild(document.createTextNode("You can always toggle this option on from the settings menu."));
                            perPargh2.style.cssText = "all: unset; display: block; font-size: 10px; line-height: 15px; font-family: Arial, sans-serif; margin: 0 auto 40px; text-align: center; color: #333;";
                            var perLink = document.createElement("a");
                            perLink.setAttribute("id", "sts_permission_link");
                            perLink.setAttribute("href", "javascript:void(0);");
                            perLink.appendChild(document.createTextNode("No thanks"));
                            perLink.style.cssText = "all: unset; display: block; font-size: 11px; line-height: 15px; font-family: Arial, sans-serif; margin: 0 auto; text-align: center; color: #000; text-decoration: underline; cursor: pointer;";
    
                            permissionPanel.append(perImg);
                            permissionPanel.append(pertitle);
                            permissionPanel.append(perPargh1);
                            permissionPanel.append(perBtn);
                            permissionPanel.append(perPargh2);
                            permissionPanel.append(perLink);
                            document.body.appendChild(permissionPanel);
    
                            
    
                            // add permission button clicked
                            document.querySelector('#sts_permission_btn').addEventListener('click', function() {
                                
    
                                chrome.runtime.sendMessage({
                                    what: 'requestPermission',
                                    name: 'nativeMessaging'
                                });
                            });
    
                            // no thanks button clicked
                            document.querySelector('#sts_permission_link').addEventListener('click', function () {
                                
    
                                if (sts_permission_panel) {
                                    sts_permission_panel.remove();
                                }
                            });
                        }
                    }
                });
                /* End Panel Permission */
    
                /* Panel Promotion */
                if (showPanelPromotion === true && openPromotionPanelCounter < 3) {
                    var promotionPanel = document.createElement("div");
                    promotionPanel.setAttribute("id", "sts_promotion_panel");
                    promotionPanel.style.cssText = "all: unset; position: fixed; top: 16px; right: 389px; height: 614px; width: 351px; background-color: #fff; z-index: 99999996; border-radius: 1px; text-align: center; padding: 0; border: solid 1px #e6e6e6";
                    var promotionPanelBg = document.createElement("div");
                    promotionPanelBg.style.cssText = "margin-top: 5px; display: block; width: 351px; height: 158px; background-repeat: no-repeat; background-image: url(" + chrome.extension.getURL("img/popup/top-bg.png") + ");";
                    var promotionTextInImage = document.createElement("div");
                    promotionTextInImage.appendChild(document.createTextNode("Torrent Scanner is now available with Pro features"));
                    promotionTextInImage.style.cssText = "color: white; font-size: 19px; line-height: 22px; padding: 92px 33px 0; text-align: left;";
                    promotionPanelBg.appendChild(promotionTextInImage);
                    var promotionText1 = document.createElement("div");
                    promotionText1.style.cssText = "font-size: 12px; line-height: 15px; text-align: left; padding: 30px 30px 8px;";
                    promotionText1.appendChild(document.createTextNode("If you are already a user of Torrent Scanner, nothing changes for you."));
                    var promotionText2 = document.createElement("div");
                    promotionText2.style.cssText = "font-size: 12px; line-height: 15px; text-align: left; padding: 8px 30px 8px;";
                    promotionText2.appendChild(document.createTextNode("If you want a better product, you can upgrade Torrent Scanner to the BitTorrent Web Pro."));
                    var promotionText3 = document.createElement("div");
                    promotionText3.style.cssText = "font-size: 12px; line-height: 15px; text-align: left; padding: 8px 30px 8px;";
                    promotionText3.appendChild(document.createTextNode("This version unlocks:"));
    
                    var greenCheck1 = document.createElement("img");
                    greenCheck1.setAttribute("src", chrome.extension.getURL("img/popup/green-check.svg"));
                    greenCheck1.style.cssText = "width: 23px; height: 17px; vertical-align: top; margin-right: 8px;";
                    var greenCheck2 = document.createElement("img");
                    greenCheck2.setAttribute("src", chrome.extension.getURL("img/popup/green-check.svg"));
                    greenCheck2.style.cssText = "width: 23px; height: 17px; vertical-align: top; margin-right: 8px;";
                    var greenCheck3 = document.createElement("img");
                    greenCheck3.setAttribute("src", chrome.extension.getURL("img/popup/green-check.svg"));
                    greenCheck3.style.cssText = "width: 23px; height: 17px; vertical-align: top; margin-right: 8px;";
    
                    var promoteCheck1 = document.createElement("div");
                    promoteCheck1.style.cssText = "font-size: 15px; line-height: 15px; font-weight: bold; text-align: left; padding: 15px 40px 8px";
                    promoteCheck1.appendChild(greenCheck1);
                    promoteCheck1.appendChild(document.createTextNode("Faster Results"));
    
                    var promoteCheck2 = document.createElement("div");
                    promoteCheck2.style.cssText = "font-size: 15px; line-height: 15px; font-weight: bold; text-align: left; padding: 8px 40px;";
                    promoteCheck2.appendChild(greenCheck2);
                    promoteCheck2.appendChild(document.createTextNode("Unlimited Search Results"));
    
                    var promoteCheck3 = document.createElement("div");
                    promoteCheck3.style.cssText = "font-size: 15px; line-height: 15px; font-weight: bold; text-align: left; padding: 8px 40px 30px;";
                    promoteCheck3.appendChild(greenCheck3);
                    promoteCheck3.appendChild(document.createTextNode("Detailed Torrent Info"));
    
                    var promotePriceContent = document.createElement("div");
                    var priceText = document.createElement("span");
                    priceText.style.cssText = "font-size: 16px; line-height: 22px; font-wwight: bold; font-style: italic; font-weight: bold;";
                    var priceNumber = document.createElement("span");
                    priceNumber.style.cssText = "font-size: 22px; line-height: 24px; font-weight: bold; padding: 0 4px;";
                    var priceYear = document.createElement("span");
                    priceYear.style.cssText = "font-size: 13px; line-height: 20px; font-style: itatic; font-weight: bold;";
                    priceText.appendChild(document.createTextNode("Only"));
                    priceNumber.appendChild(document.createTextNode("$19.95"));
                    priceYear.appendChild(document.createTextNode("/yr"));
    
                    var promoteButton = document.createElement("button");
                    promoteButton.setAttribute("id", "promoteButton");
                    promoteButton.appendChild(document.createTextNode("Upgrade to Pro"));
                    promoteButton.style.cssText = "width: 214px; height: 50px; background: transparent linear-gradient(180deg, #663399 0%, #531C8B 100%) 0% 0% no-repeat padding-box; border-radius: 2px; font: normal normal bold 20px/23px Arial; letter-spacing: -0.5px; color: #FFFFFF; text-shadow: 0px 1px 0px #00497980; text-align: center; border: 1px solid #531C8B; margin: 15px auto 20px; cursor: pointer;";
    
                    var closeLink = document.createElement("a");
                    closeLink.setAttribute("id", "sts_promotion_link");
                    closeLink.setAttribute("href", "javascript:void(0);");
                    closeLink.appendChild(document.createTextNode("No thanks"));
                    closeLink.style.cssText = "all: unset; display: block; font-size: 11px; line-height: 15px; font-family: Arial, sans-serif; margin: 0 auto; text-align: center; color: #000; text-decoration: underline; cursor: pointer;";
    
                    promotePriceContent.appendChild(priceText);
                    promotePriceContent.appendChild(priceNumber);
                    promotePriceContent.appendChild(priceYear);
                    promotionPanel.appendChild(promotionPanelBg);
                    promotionPanel.appendChild(promotionText1);
                    promotionPanel.appendChild(promotionText2);
                    promotionPanel.appendChild(promotionText3);
                    promotionPanel.appendChild(promoteCheck1);
                    promotionPanel.appendChild(promoteCheck2);
                    promotionPanel.appendChild(promoteCheck3);
                    promotionPanel.appendChild(promotePriceContent);
                    promotionPanel.appendChild(promoteButton);
                    promotionPanel.appendChild(closeLink);
                    
                    document.body.appendChild(promotionPanel);
    
                    document.querySelector('#promoteButton').addEventListener('click', function () {
                        chrome.storage.local.get({ 'b' : null }, function(data) {
                            
                            if (data.b == "bt") {
                                if (BrowserFamily == "Opera") {
                                    window.open("https://gateway.lavasoft.com/ext/buy/bittorrentpro/?mkey7=Opera", "_blank");
                                } else if (BrowserFamily == "Edge") {
                                    window.open("https://gateway.lavasoft.com/ext/buy/bittorrentpro/?mkey7=EDGE ", "_blank");
                                } else {
                                    window.open("https://gateway.lavasoft.com/ext/buy/bittorrentpro/", "_blank");
                                }
                            } else if (data.b == "ut") {
                                if (BrowserFamily == "Opera") {
                                    window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/?mkey7=Opera", "_blank");
                                } else if (BrowserFamily == "Edge") {
                                    window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/?mkey7=EDGE", "_blank");
                                } else {
                                    window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/", "_blank");
                                }
                            } else {
                                if (BrowserFamily == "Opera") {
                                    window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/?mkey7=Opera", "_blank");
                                } else if (BrowserFamily == "Edge") {
                                    window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/?mkey7=EDGE", "_blank");
                                } else {
                                    window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/", "_blank");
                                }
                            }
                        });
                    });
    
                    // no thanks button clicked
                    document.querySelector('#sts_promotion_link').addEventListener('click', function () {
                        
    
                        if (promotionPanel) {
                            promotionPanel.remove();
                        }
                    });

                    chrome.runtime.sendMessage({
                        what: '_gaEvent',
                        category: 'ProPromo',
                        action: 'Open',
                        label: 'promo-panel-open'
                    }, (data) => {});
                }
                /* End Panel Promotion */
    
                
                
                /* Support panel */
                if (showPanelSupport === true) {
                    if (openSupportPanelCounter < 2) {
                        var supportPanel = document.createElement("div");
                        supportPanel.setAttribute("class", "prem-panel");
                        supportPanel.style.cssText = "all: unset; position: fixed; top: 16px; right: 389px; height: 614px; width: 351px; background-color: #fff; z-index: 99999996; border-radius: 1px; text-align: center; padding: 0; border: solid 1px #e6e6e6";
    
    
                        var supportPanelTop = document.createElement("div");
                        supportPanelTop.setAttribute("class", "pm-top-panel");
                        supportPanelTop.style.cssText = "height: 295px; background: 0 0 no-repeat url(" +  chrome.extension.getURL("img/popup/support-header-img.png") + "); width:100%;";
    
    
                        var supportPanelContent = document.createElement("div");
                        supportPanelContent.setAttribute("class", "pm-content-panel");
                        supportPanelContent.style.cssText = "padding: 35px 40px; box-sizing: border-box; font: 17px/1.47 Arial, sans-serif;";
    
                        var supportPanelContentH2 = document.createElement("H2");
                        supportPanelContentH2.style.cssText = "margin: 0 0 19px; font: bold 24px/1.100 Arial,sans-serif;";
                        // supportPanelContentH2.appendChild(document.createTextNode("Need Support?"));
    
                        var supportPanelContentP = document.createElement("P");
                        // supportPanelContentP.appendChild(document.createTextNode("Need help downloading torrents? For additional assistance, you can reach us : +44 2033 842368"));
    
                        var supportPanelContentBtn = document.createElement("a");
                        supportPanelContentBtn.setAttribute("id", "");
                        supportPanelContentBtn.setAttribute("class", "btn-blue");
                        supportPanelContentBtn.style.cssText = "display: block; background: #0099FF; color: #fff; border-radius: 2px; text-align: center; font: bold 16px/42px Arial; letter-spacing: -0.4px; color: #FFFFFF; text-shadow: 0px 1px 0px #00497980; opacity: 1; height: 42px; width: 220px; text-align: center; margin: 30px auto 0; text-decoration: none;";
                        supportPanelContentBtn.setAttribute("href", "https://www.torrentscanner.co/support/tech-premium-support/");
                        supportPanelContentBtn.setAttribute("target", "_blank");
                        // supportPanelContentBtn.appendChild(document.createTextNode("CALL NOW"));
    
                        var closeLink = document.createElement("a");
                        closeLink.setAttribute("id", "sts_support_link");
                        closeLink.setAttribute("href", "javascript:void(0);");
                        // closeLink.appendChild(document.createTextNode("No thanks"));
                        closeLink.style.cssText = "all: unset; display: block; font-size: 11px; line-height: 15px; font-family: Arial, sans-serif; margin: 0 auto; text-align: center; color: #000; text-decoration: underline; cursor: pointer;";
    
                        if (browserLanguage == "fr") {
                            supportPanelContentH2.appendChild(document.createTextNode("Besoin d’assistance ?"));
                            supportPanelContentP.appendChild(document.createTextNode("Besoin d'aide pour utiliser cette extension ? Pour obtenir de l’assistance, contactez-nous au : +33 5 82 84 04 07"));
                            supportPanelContentBtn.appendChild(document.createTextNode("Appelez maintenant"));
                            closeLink.appendChild(document.createTextNode("Non merci"));
                        } else if (browserLanguage == "es") {
                            supportPanelContentH2.appendChild(document.createTextNode("¿Necesita ayuda?"));
                            supportPanelContentP.appendChild(document.createTextNode("¿Necesitas ayuda para usar esta extensión? Para ayuda adicional, puede contactarnos: +34 951 203 077"));
                            supportPanelContentBtn.appendChild(document.createTextNode("Llame ahora"));
                            closeLink.appendChild(document.createTextNode("no, gracias"));
                        } else if (browserLanguage == "de") {
                            supportPanelContentH2.appendChild(document.createTextNode("Benötigen Sie Unterstützung?"));
                            supportPanelContentP.appendChild(document.createTextNode("Benötigen Sie Hilfe bei der Verwendung dieser Erweiterung? Für weitere Unterstützung erreichen Sie uns unter: +49 692 991 7686"));
                            supportPanelContentBtn.appendChild(document.createTextNode("Jetzt anrufen"));
                            closeLink.appendChild(document.createTextNode("Nein Danke"));
                        } else if (browserLanguage == "nl") {
                            supportPanelContentH2.appendChild(document.createTextNode("Hulp nodig?"));
                            supportPanelContentP.appendChild(document.createTextNode("Hulp nodig bij het gebruik van deze extensie? Als je verder nog hulp nodig hebt, kun je ons bereiken op: +31 85 888 1207"));
                            supportPanelContentBtn.appendChild(document.createTextNode("Nu bellen"));
                            closeLink.appendChild(document.createTextNode("Nee, dank u wel"));
                        } else {
                            supportPanelContentH2.appendChild(document.createTextNode("Need Support?"));
                            supportPanelContentP.appendChild(document.createTextNode("Need help using this extension? For additional assistance, you can reach us : +0203 384 2368"));
                            supportPanelContentBtn.appendChild(document.createTextNode("CALL NOW"));
                            closeLink.appendChild(document.createTextNode("No thanks"));
                        }
    
                        supportPanelContent.append(supportPanelContentH2, supportPanelContentP, supportPanelContentBtn);
                        supportPanel.append(supportPanelTop, supportPanelContent, closeLink);
    
                        document.body.appendChild(supportPanel);
    
                        // no thanks button clicked
                        document.querySelector('#sts_support_link').addEventListener('click', function () {
                            
    
                            if (supportPanel) {
                                supportPanel.remove();
                                chrome.storage.local.set({openSupportPanelCount: 5}, function () {});
                            }
                        });

                        chrome.runtime.sendMessage({
                            what: '_gaEvent',
                            category: 'Tech Premium',
                            action: 'Open',
                            label: 'tech-premium-panel-open'
                        }, (data) => {});
                    }
                    
                }
                /* End Support Panel */
                document.body.appendChild(frame);
            }
        }, 1000);
    } 

    // if (!request.openTab) {
    //     var frameContainer = document.querySelector('#sts_frame_container');
    //     if (frameContainer) {
    //         frameContainer.parentNode.removeChild(frameContainer);
    //         chrome.storage.local.set({[(request.tabId).toString()]: {'openTab': false}}, function() {});
    //     }
    // }
    chrome.runtime.onMessage.removeListener(listener);
});