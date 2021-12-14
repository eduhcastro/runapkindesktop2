'use strict';

let oneSecond = 1000;
let oneMinute = 60 * oneSecond;
let oneHour = 60 * oneMinute;
let oneDay = 24 * oneHour;
let lastPing;
let currentVersion = chrome.runtime.getManifest().version;
let browserEnvironment = new systemUtil.browserEnvironmentData();

let UNINSTALL_URL = "https://www.adaware.com/bs/uninstall.php?";

let storeUrl = "https://chrome.google.com/webstore/*";
if (browserEnvironment.BrowserFamily == "Chrome") {
    storeUrl = "https://chrome.google.com/webstore/*";
}

if (browserEnvironment.BrowserFamily == "Opera") {
    storeUrl = "https://addons.opera.com/*";
}



if (browserEnvironment.BrowserFamily == "Edge") {
    storeUrl = "https://microsoftedge.microsoft.com/addons/*";
}

const getUrlParameterFromString = (url, name) => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(url);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const sendDailyActivityData = (lastPingTime) => {
    let lastPingDate = new Date(lastPingTime);
    let currentPingDate = Date.now();
    let deltaMinutes = (currentPingDate - lastPingDate.getTime()) / oneMinute;
    
    let dailyActivityData = {
        LastCallbackDate: lastPingDate.toISOString()
    };

    // Check if License localstorage exists or not
    chrome.storage.local.get({ licenseData: null }, function (result) {
        // If local data exists
        if (result.licenseData !== null) {
            // Check if license key exists in local
            if (result.licenseData.license !== null && result.licenseData.license !== undefined) {
                dailyActivityData.Status = "Pro";
                
            }
        } else {
            dailyActivityData.Status = "Free";
            
        }
    });
    
    telemetry.sendDailyActivityEvent(dailyActivityData);
};

const onAllReady = () => {
    // Daily activity counter
    lastPing = Date.now();
    setInterval(() => {
        checkExpiryLicense();
        sendDailyActivityData(lastPing);
        lastPing = Date.now();
    }, oneDay);
};

const onVersionReady = (lastVersion) => {
    if (lastVersion !== currentVersion) {
        storageUtil.save("version", currentVersion);
    }
};

// Only launches when all chrome browser processes are closed and is not first install or update
const onStartupHandler = () => {
    storageUtil.load("startupTime", Date.now(), (fetched) => {
        
        if (Date.now() - fetched.startupTime > oneDay) { // if last startup time is greater than 24 hours
            sendDailyActivityData(fetched.startupTime);
        }
        storageUtil.save("startupTime", Date.now());
    });
};

const onFirstInstallHandler = () => {
    let externalData = {
        "CampaignID": config.configurationData.externalData.CampaignID || "",
        "CLID": config.configurationData.externalData.CLID || "",
        "PartnerID": config.configurationData.externalData.PartnerID || "",
        "sourceTraffic": config.configurationData.externalData.sourceTraffic || "",
        'OfferID': config.configurationData.externalData.OfferID || ""
    };

    const getParametersFromStore = () => {
        

        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.query({ url: storeUrl }, (tabs) => {
                    if (tabs.length > 0) {
                        let url = tabs[0].url;

                        if ((url.split("?")).length > 1) {
                            externalData.PartnerID = getUrlParameterFromString(url, "partnerId") || config.configurationData.externalData.PartnerID;
                            externalData.CampaignID = getUrlParameterFromString(url, "utm_campaign");
                            externalData.CLID = getUrlParameterFromString(url, "clId");
                            externalData.OfferID = getUrlParameterFromString(url, "offerId");
                            externalData.sourceTraffic = getUrlParameterFromString(url, "sourceTraffic");

                            let b = getUrlParameterFromString(url, "b");
                            if (b == "bt") {
                                storageUtil.save("b", "bt");
                            } else if (b == "ut") {
                                storageUtil.save("b", "ut");
                            } else {
                                storageUtil.save("b", null);
                            }

                            let key = getUrlParameterFromString(url, "l");
                            activateLicenseKey(key).then(function (result) {
                                
                            });
                        } else {
                            storageUtil.save("b", null);
                        }
                        
                        resolve(externalData);
                    } else {
                        
                        resolve(externalData);
                    }
                });
            } catch (err) {
                
                resolve(externalData);
            }
        });
    };

    const redirectAfterInstalled = () => {
        chrome.tabs.query({ url: storeUrl }, (tabs) => { // if google tab exists
            if (tabs.length > 0) {
                var url = tabs[0].url;
                var urlQuery = url.slice(url.indexOf( '?' ));
                if (getUrlParameterFromString(url, "p") === "bt") {
                    if (browserEnvironment.BrowserFamily == "Opera") {
                        chrome.tabs.create({ url: "https://www.google.com/search?" + urlQuery.replace("?", "") });
                    } else {
                        chrome.tabs.create({ url: "https://www.google.com/search?" + urlQuery.replace("?", "") + "&client=opera&sourceid=opera&ie=UTF-8&oe=UTF-8" });
                    }
                } else {
                    if (getUrlParameterFromString(url, "p") === "btwebpro") {
                        checkIfBitTorrentWebPro().then((isInstalled) => {
                            if (isInstalled === true) {
                                chrome.tabs.create({ url: "https://web.utorrent.com/extension.html?success=1&" + urlQuery.replace("?", "") });
                            } else {
                                chrome.tabs.create({ url: "https://www.bittorrent.com/downloads/complete/" });
                            }
                        });
                    } else if (getUrlParameterFromString(url, "p") === "utwebpro") {
                        checkIfuTorrentWebPro().then((isInstalled) => {
                            if (isInstalled === true) {
                                chrome.tabs.create({ url: "https://web.utorrent.com/extension.html?success=1&" + urlQuery.replace("?", "") });
                            } else {
                                chrome.tabs.create({ url: "https://download-new.utorrent.com/endpoint/utweb/track/stable/os/win" });
                            }
                        });
                    }
                }
            }
        });
    };

    const checkIfBitTorrentWebPro = () => {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            var url = "http://127.0.0.1:38565/gui/index.html";
            try {
                xhr.open("GET", url, true);
                xhr.timeout = 5000;
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status === 200) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                }
                xhr.ontimeout = function () {
                    
                }
                xhr.send();
            } catch (e) {
                
                onErrorReceived.call(xhr);
                resolve(false);
            }
        });
    };

    const checkIfuTorrentWebPro = () => {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            var url = "http://127.0.0.1:19575/gui/index.html";
            try {
                xhr.open("GET", url, true);
                xhr.timeout = 5000;
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status === 200) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                }
                xhr.ontimeout = function () {
                    
                }
                xhr.send();
            } catch (e) {
                
                onErrorReceived.call(xhr);
                resolve(false);
            }
        });
    };

    const saveAndSendData = (externalData) => {
        
        trackingDataUtil.setExternalData(externalData);
        trackingDataUtil.saveExternalData();
        
        telemetry.sendCompleteInstallEvent();
        trackingDataUtil.setupUninstall(UNINSTALL_URL);
    };

    trackingDataUtil.setInstallDate().then(() => {
        
        trackingDataUtil.setInstallId().then(() => {
            
            getParametersFromStore().then(saveAndSendData);
            redirectAfterInstalled();
        });
    });
};

const onUpdatedHandler = (lastVersion) => {
    const saveAndSendData = () => {
        telemetry.sendCompleteUpdateEvent(lastVersion);
    }
    saveAndSendData();
};

const onExtensionLaunchHandler = (ev) => {
    
    let promiseList = [];
    promiseList.push(new Promise((resolve, reject) => {
        storageUtil.load("externalData", trackingDataUtil.getExternalData(), (fetched) => {
            trackingDataUtil.setExternalData(fetched.externalData);
            
            resolve("externalData");
        });
    }));

    Promise.all(promiseList).then((resolutionMessage) => {
        
        if (ev.reason === "install") {
            
            onFirstInstallHandler();
            sendSideloadEvent();
        } else if (ev.reason === "update") {
            
            onUpdatedHandler(ev.lastVersion);
            setTimeout(() => {
                chrome.runtime.reload();
            }, 6000);
        } else if (ev.reason === "startup") {
            onStartupHandler();
        } else {
            
        }
    });
};

const onFirstFetchReady = (fetched) => {
    onVersionReady(fetched.version);
    onAllReady();
};

telemetry.onExtensionLaunch(onExtensionLaunchHandler);

storageUtil.load("version", "0.0.0.0", onFirstFetchReady);

// Solution to send GA event for sideloading user
// onInstall we check if chrome store url exists or not
// and send event based on this
const sendSideloadEvent = () => {
    setSideloadStorage().then((data) => {
        let isStoreUrl = data;
        if (!isStoreUrl) {
            // send event to GA
            _gaq.push(['_trackEvent', 'Install', 'Sideload', 'Chrome']);
        } else {
            _gaq.push(['_trackEvent', 'Install', 'Manual', 'Chrome']);
        }
    });
}

// only for chrome
const setSideloadStorage = () => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ url: "https://chrome.google.com/*/aegnopegbbhjeeiganiajffnalhlkkjb*" }, (tabs) => {
            let hasStoreUrl = true;
            if (tabs.length > 0) {
                // url exists in tabs
                hasStoreUrl = true;
                chrome.storage.local.set({
                    'sideload': hasStoreUrl
                });
            } else {
                // url doesn't exists in tabs
                hasStoreUrl = false;
                chrome.storage.local.set({
                    'sideload': hasStoreUrl
                });
            }

            chrome.storage.local.get({
                'sideload': hasStoreUrl
            }, (data) => {
                resolve(data.sideload);
            });
        });
    });
}

// check if license key is expired every day
const checkExpiryLicense = () => {
    
    // check if key is in localstorage
    chrome.storage.local.get({ licenseData: null }, function (result) {
        

        if (result.licenseData !== null) {
            // Check if license key exists in local
            if (result.licenseData.license !== null && result.licenseData.license !== undefined) {
                

                let licenseKey = result.licenseData.license;
                
                // check if key is expired
                let xhr =  new XMLHttpRequest();
                xhr.open("GET", "https://bsa.adaware.com/api/v1/license/status?license=" + licenseKey);
                xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        if (this.status == 200) {
                            let blob = {};
                            blob = JSON.parse(this.responseText);
                            
                            // isActive is true and IsExpired is false, license is valid
                            // else license is not valid
                            if (blob.isActive === true && blob.isExpired === false) {
                                
                            } else {
                                
                                // if key is expired remove it from localstorage
                                chrome.storage.local.remove("licenseData");
                            }
                        } else {
                            
                        }
                    }
                });
                xhr.send();
            }
        } else {
            
            chrome.storage.local.remove("licenseData");
        }
        
    });
}