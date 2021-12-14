(function () {

    // var webtorrentHealth = window.webtorrentHealth;
    var parseTorrent = window.parseTorrent;
    var utHostname = 'com.utorrent.native';
    var browserEnvironmentData = new systemUtil.browserEnvironmentData();
    var extensionURL = browserEnvironmentData.BrowserFamily == "Firefox" ? "moz-extension://" + (chrome.runtime.id).replace(/[{()}]/g, '') : "chrome-extension://" + chrome.runtime.id;
    var searchList = {};
    var countMagnets = 0;
    var openPopup = false;
    var fromPopUI = false;
    var currentUrl = "";
    var currentTabHostName = "";
    var resultorNoResult = false;
    var fromSearchEngine = false;
    var iconPaths = [
        {
            '19': 'img/browsericons/icon19-off.png',
            '38': 'img/browsericons/icon38-off.png'
        },
        {
            '19': 'img/browsericons/icon19.png',
            '38': 'img/browsericons/icon38.png'
        }
    ];

    var firstrun = false;

    chrome.storage.local.get({ 'firstRun': true }, function (fetched) {
        if (fetched.firstRun === true) {
            firstrun = true;
        } else {
            firstrun = false;
        }
    });

    var getHostName = function (url) {
        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
            return match[2];
        }
        else {
            return null;
        }
    }

    var getMagnetParamHash = function (url) {
        var magnetxt = getParameterByName("xt", url);
        magnetxt = magnetxt.split(":");
        magnetxt = magnetxt[magnetxt.length - 1];

        return magnetxt;
    }

    var getParamByNameFromMagnetLink = function (name, queryString) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(queryString);
        return results === null ? queryString : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    var domainFromUrl = function (url) {
        var result;
        var match;
        if (match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)) {
            result = match[1];
            if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
                result = match[1];
            }
        }
        return result.split('.')[0];
    }

    var mergeMagnetToUrl = function (magnets, tagNames, urls, infoHashList, infoHashTrackers, torrentFiles) {
        var r = {};
        r = urls.map(function (x, i) {
            return { "url": x, "magnets": magnets[i], "names": tagNames[i], "infoHashStatus": infoHashList[i], "infoHashTrackers": infoHashTrackers[i], "torrentFiles": torrentFiles[i] };
        });
        return r;
    }

    var validURL = function (str) {
        var pattern = new RegExp(/^https?:\/\//i);
        if (!pattern.test(str)) {
            return false;
        } else {
            return true;
        }
    }

    var getDomainName = function (url) {
        var m = url.toString().match(/^https?:\/\/[^/]+/);
        return m ? m[0] : null;
    }

    var getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    var checkUrlState = function (url) {
        return new Promise(function (resolve, reject) {

            var xhr = new XMLHttpRequest();

            xhr.addEventListener("readystatechange", function() {
                if(this.readyState === 4) {
                    resolve(xhr.status);
                }
            });

            xhr.open("GET", url);

            xhr.send();
        });
    }

    var getTorrentInfoHash = function (torrentUrl) {
        return new Promise(function (resolve, reject) {
            parseTorrent.remote(torrentUrl, function (err, parsedTorrent) {
                // 
                if (err) {
                    reject("");
                } else {
                    resolve({ infoHash: parsedTorrent.infoHash, url: torrentUrl, name: parsedTorrent.name, files: parsedTorrent.files, announce: parsedTorrent.announce, length: parsedTorrent.length });
                }
            });
        });
    }

    var getMagnetInfoHash = function (magnetUrl) {
        return new Promise(function (resolve, reject) {
            resolve(parseTorrent(magnetUrl));
        });
    }

    var findInfoHashFromUrl = function (url) {
        var arrayMagnets = [];
        var arrayTagNames = [];
        var torrentLists = [];
        var infoHashTrackers = [];
        var torrentFiles = [];

        var xhr = new XMLHttpRequest();
        try {
            xhr.open("GET", url, true);
            xhr.timeout = 5000;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status === 200) {
                        var countMagnets = 0;
                        var countTorrents = 0;
                        var resp = xhr.responseText;
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(resp, "text/html");
                        var links = xmlDoc.getElementsByTagName("a");
                        var torrentFileLink = "";
                        for (var i = 0; i < links.length; i++) {
                            if (links[i].href.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) !== null) {
                                if (countMagnets === 10) { break; }
                                arrayMagnets.push(links[i].href);
                                arrayTagNames.push(links[i].href);

                                getMagnetInfoHash(links[i].href).then(function (result) {
                                    torrentLists.push({ "magnetHash": result.infoHash });
                                    infoHashTrackers.push({ "infoHash": result.infoHash, "trackers": result.announce });
                                    torrentFiles.push({ "length": result.length, "files": result.files });
                                });

                                countMagnets++;
                            }
                            if (links[i].href.match(/\.(torrent)$/) !== null) {
                                if (links[i].href.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) === null) {
                                    var torrentName = (links[i].innerHTML).replace(/<[^>]*>/g, '').trim();
                                    if (torrentName == "") {
                                        torrentName = links[i].href;
                                    }
                                    if (countTorrents === 10) { break; }
                                    if (validURL(links[i]) === true) {
                                        torrentFileLink = links[i].href;
                                    } else {
                                        torrentFileLink = getDomainName(url) + (links[i].href).replace(extensionURL, "");
                                    }

                                    arrayMagnets.push(torrentFileLink);

                                    getTorrentInfoHash(torrentFileLink).then(function (result) {
                                        if (result) {
                                            torrentLists.push({ "magnetHash": result.infoHash });
                                            infoHashTrackers.push({ "infoHash": result.infoHash, "trackers": result.announce });
                                            arrayTagNames.push(result.name);
                                            torrentFiles.push({ "length": result.length, "files": result.files });
                                        }
                                        
                                    }).catch(function (err) {
                                        
                                    });
                                    countTorrents++;
                                }
                            }
                        }
                    } else {
                        
                    }
                }
            }
            xhr.ontimeout = function () {
                
            }
            xhr.send();
        } catch (e) {
            
            onErrorReceived.call(xhr);
        }

        return { arrayMagnets, arrayTagNames, torrentLists, infoHashTrackers, torrentFiles };
    }

    var findInfoHashInDom = function (dom) {
        var arrayMagnets = [];
        var arrayTagNames = [];
        var torrentLists = [];
        var infoHashTrackers = [];
        var torrentFiles = [];
        var countMagnets = 0;
        var countTorrents = 0;
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(dom, "text/html");
        var links = xmlDoc.getElementsByTagName("a");
        var torrentFileLink = "";
        for (var i = 0; i < links.length; i++) {
            if (links[i].href.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) !== null) {
                if (countMagnets === 10) { break; }
                arrayMagnets.push(links[i].href);
                arrayTagNames.push(links[i].href);

                getMagnetInfoHash(links[i].href).then(function (result) {
                    torrentLists.push({ "magnetHash": result.infoHash });
                    infoHashTrackers.push({ "infoHash": result.infoHash, "trackers": result.announce });
                    torrentFiles.push({ "length": result.length, "files": result.files });
                });

                countMagnets++;
            }
            if (links[i].href.match(/\.(torrent)$/) !== null) {
                if (links[i].href.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) === null) {
                    var torrentName = (links[i].innerHTML).replace(/<[^>]*>/g, '').trim();
                    if (torrentName == "") {
                        torrentName = links[i].href;
                    }
                    if (countTorrents === 10) { break; }
                    if (validURL(links[i]) === true) {
                        torrentFileLink = links[i].href;
                    } else {
                        torrentFileLink = getDomainName(url) + (links[i].href).replace(extensionURL, "");
                    }

                    arrayMagnets.push(torrentFileLink);

                    getTorrentInfoHash(torrentFileLink).then(function (result) {
                        if (result) {
                            torrentLists.push({ "magnetHash": result.infoHash });
                            infoHashTrackers.push({ "infoHash": result.infoHash, "trackers": result.announce });
                            arrayTagNames.push(result.name);
                            torrentFiles.push({ "length": result.length, "files": result.files });
                        }
                        
                    }).catch(function (err) {
                        
                    });
                    countTorrents++;
                }
            }
        }
        return { arrayMagnets, arrayTagNames, torrentLists, infoHashTrackers, torrentFiles };
    }

    // Filter in urls
    var filterUrls = function (urls, hostnames) {
        var newList = [];
        var magnetList = [];
        var tagList = [];
        var urlResult = "";
        var infoHashList = [];
        var infoHashTrackers = [];
        var torrentFiles = [];
        for (var i = 0; i < urls.length; i++) {
            urlResult = findInfoHashFromUrl(urls[i]);
            newList.push(hostnames[i]);
            magnetList.push(urlResult.arrayMagnets);
            tagList.push(urlResult.arrayTagNames);
            infoHashList.push(urlResult.torrentLists);
            infoHashTrackers.push(urlResult.infoHashTrackers);
            torrentFiles.push(urlResult.torrentFiles);
        }
        return mergeMagnetToUrl(magnetList, tagList, newList, infoHashList, infoHashTrackers, torrentFiles);
    }

    // Filter Dom itself
    var filterDom = function (dom, hostnames) {
        var newList = [];
        var magnetList = [];
        var tagList = [];
        var urlResult = "";
        var infoHashList = [];
        var infoHashTrackers = [];
        var torrentFiles = [];
        urlResult = findInfoHashInDom(dom);
        newList.push(hostnames[0]);
        magnetList.push(urlResult.arrayMagnets);
        tagList.push(urlResult.arrayTagNames);
        infoHashList.push(urlResult.torrentLists);
        infoHashTrackers.push(urlResult.infoHashTrackers);
        torrentFiles.push(urlResult.torrentFiles);
        return mergeMagnetToUrl(magnetList, tagList, newList, infoHashList, infoHashTrackers, torrentFiles);
    }

    var getSearchList = function (urls, hostnames, fromSearchEngine, dom) {
        if (fromSearchEngine === true) {
            return filterUrls(urls, hostnames);
        } else {
            return filterDom(dom, hostnames);
        }
    }

    // Count magnets and torrents
    var getCountMagnets = function (result) {
        var count = 0;
        for (var key in result) {
            if (result[key].torrentFiles && result[key].names !== undefined)
                count += (result[key].names).length;
        }
        return count;
    }

    var callbackError = function () {
        if (chrome.runtime.lastError) {
            
        }
    }

    // Set icon badge based on magnets count
    var setBadge = function (tabId, searchList) {
        setTimeout(function () {
            countMagnets = getCountMagnets(searchList);
            if (countMagnets === 0 || countMagnets === undefined || countMagnets === null) {
                chrome.browserAction.setIcon({ path: iconPaths[0], tabId: tabId }, callbackError);
                chrome.browserAction.setBadgeText({ text: "", tabId: tabId }, callbackError);
            } else {
                chrome.browserAction.setIcon({ path: iconPaths[1], tabId: tabId }, callbackError);
                chrome.browserAction.setBadgeBackgroundColor({ color: "#666", tabId: tabId }, callbackError);
                chrome.browserAction.setBadgeText({ text: (countMagnets).toString(), tabId: tabId }, callbackError);
            }
        }, 2500);
    }

    var validateInfoHashTrackers = function (data) {
        
        var arr = [];
        for (var i = 0; i < data.length; i++) {
            if ((data[i].infoHashTrackers).length > 0) {
                arr.push(data[i].infoHashTrackers);
            }
        }
        return arr;
    }

    var mergeArray = function (data) {
        var newArray = [].concat(...data);
        return newArray;
    }

    var checkValidTracker = function (tracker) {
        var words = ["udp://", "http://", "https://", "wss://"];
        return words.some(word => tracker.toLowerCase().includes(word.toLowerCase()));
    }

    var removeDuplicatedInfohashInArray = function (arr) {
        
        var seen = {};
        for (var i = 0; i < arr.length; i++) {
            var current = arr[i];
            if (current.infoHash !== undefined) {
                if (current.infoHash in seen) {
                    var seen_current = seen[current.infoHash];
                    if ((seen_current.trackers).length < (current.trackers).length) {
                        seen_current.trackers = (current.trackers).filter(Boolean);
                    }
                    // 
                    var new_seen_current_trackers = [];
                    for (var j = 0; j < (seen_current.trackers).length; j++) {
                        // 
                        if (checkValidTracker(seen_current.trackers[j]) === true) {
                            new_seen_current_trackers.push(seen_current.trackers[j]);
                        }
                    }
                    seen_current.trackers = new_seen_current_trackers;
                    // 
                } else {
                    var new_current_trackers = [];
                    for (var j = 0; j < (current.trackers).length; j++) {
                        // 
                        if (checkValidTracker(current.trackers[j]) === true) {
                            new_current_trackers.push(current.trackers[j]);
                        }
                    }
                    // 
                    // 
                    // 
                    current.trackers = new_current_trackers;
                    seen[current.infoHash] = current;
                }
            }
        }

        var newArr = [];
        for (var k in seen) {
            newArr.push(seen[k]);
        }
        return newArr;
    }

    var mergeTorrentHealth = function (arr, torrentHealth) {
        var currentArr = [];
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < torrentHealth.length; j++) {
                if (torrentHealth[j].infoHash === arr[i].infoHash) {
                    currentArr.push(torrentHealth[j]);
                }
            }
        }
        // 
        // 
        // 
        return currentArr;
    }

    // Socket IO 
    var socketIORequestResponse = function (data) {
        
        
        return new Promise(function (resolve, reject) {
            var licenseData = null;
            var licenseKey = null;
            var expired = true;
            chrome.storage.local.get({ 'licenseData': null }, function (result) {
                
                if (result.licenseData !== null) {
                    licenseData = result.licenseData;
                }

                var newData = removeDuplicatedInfohashInArray(mergeArray(data));

                
                
                if (licenseData != undefined && licenseData != null) {
                    
                    licenseKey = licenseData.license;

                    // var myDate = (licenseData.expireyDate).split("/");
                    // var expirationDate = new Date(myDate[1] + "," + myDate[0] + "," + myDate[2]).getTime();
                    // var todayDate = Date.now();
                    // if (expirationDate < todayDate) {
                    //     
                    // } else {
                    //     expired = false;
                    // }
                }

                // var socket = io('ws://10.45.0.81:8335', {transports: ['websocket']});
                var socket = io('ws://bsa.adaware.com', {transports: ['websocket']});
                
                var torrentData = [];
                // if (licenseKey != null && !expired) {
                if (licenseKey != null) {
                    
                    var newProData = {};
                    newProData.license = licenseData.license;
                    newProData.data = newData;
                    
                    socket.emit("torrentInfoRequestPro", JSON.stringify(newProData));
                } else {
                    
                    newData = newData.slice(0, 2);
                    
                    socket.emit("torrentInfoRequest", JSON.stringify(newData));
                }

                socket.on("torrentInfoResponse", (torrentResData) => {
                    let res = JSON.parse(torrentResData);
                    

                    torrentData.push(res);
                });

                socket.on("torrentInfoProResponse", (torrentResData) => {
                    let res = JSON.parse(torrentResData);
                    torrentData.push(res);
                });

                socket.on("torrentInfoError", (error) => {
                    
                    reject(error);
                });

                socket.on("connect_error", error => {
                    
                    reject(error);
                });

                socket.on('error', (error) => {
                    
                    reject(error);
                });

                socket.on("disconnect", () => {
                    
                    resolve(torrentData);
                    
                });
            });
        });
    }

    chrome.runtime.onMessage.addListener(function listener(request, sender, sendResponse) {
        switch (request.what) {
            case 'formatTorrents':
                // 
                // 
                chrome.runtime.sendNativeMessage(utHostname, { data: request.data }, function(message) {
                    
                });
                break;
            case 'searchEngineObserver':
                searchList = getSearchList(request.urls, request.hostnames, request.fromSearchEngine, request.dom);
                sendResponse({ request: request.urls, tabId: sender.tab.id });
                setBadge(sender.tab.id, searchList);
            case 'fromPopUI':
                fromPopUI = request.fromPopUI || false;
                _gaq.push(['_trackEvent', 'User Action', 'Top Bar Search', 'search']);
                // setTimeout(function () {
                //     countMagnets = getCountMagnets(searchList);
                //     if (countMagnets > 0) {
                //         telemetry.sendMetaEvent("ListDownload", { SearchEngine: request.searchEngine, QueryInput: "UI", NumberRelevantSites: countMagnets, NumberFlaggedTorrents: 0, HttpStatus: checkUrlState(currentUrl) });
                //         
                //     }
                // }, 1000);
                
                
                break;
            case 'getSearchListResult':
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                    // 
                    // var tabId = tabs[0].id;
                    var infoHashTrackers = validateInfoHashTrackers(searchList);

                    
                    

                    socketIORequestResponse(infoHashTrackers).then(function (data) {
                        
                        
                        for (var i = 0; searchList.length > i; i++) {
                            if ((searchList[i].infoHashTrackers).length > 0) {
                                var newArr = mergeTorrentHealth(searchList[i].infoHashTrackers, data);
                                searchList[i].torrentHealth = newArr;
                            }
                        }
                        // Check if Torrent scanner is pro version or not here
                        _gaq.push(['_trackEvent', 'UI is Open', 'User Action', 'ui-open']);
                        sendResponse({ result: searchList, currentUrl: tabs[0].url });
                    });
                });
                return true;
            case 'sendListDownloadEvent':
                // check URL status
                checkUrlState(request.url).then((status) => {
                    // Postback ListDownload event
                    // 
                    // 
                    // 
                    // 
                    // 
                    // 
                    // 
                    // 
                    // 
                    telemetry.sendMetaEvent("ListDownload", { SearchEngine: fromSearchEngine, host: request.hostname, SearchQuery: request.searchQuery, QueryInput: request.queryInput, NumberRelevantSites: request.total, NumberFlaggedTorrents: request.badTorrents, HttpStatus: status });
                });
                
                break;
            case 'searchQuery':
                
                
                fromSearchEngine = request.searchEngine;
                var popupUrl = chrome.extension.getURL("pro_popup.html") + '?tabId=' + sender.tab.id;
                currentUrl = request.currentUrl;
                setTimeout(function () {
                    countMagnets = getCountMagnets(searchList);

                    if (fromSearchEngine === false) {
                        openPopup = false;
                    } else {
                        if (request.hasWordTorrent === true) {
                            openPopup = true;
                        } else if (request.hasWordTorrent === false && countMagnets > 5) {
                            openPopup = true;
                        } else {
                            openPopup = false;
                        }
                    }

                    if (fromPopUI === true) {
                        fromPopUI = false;
                    } else {
                        if (request.searchEngine != "") {
                            if (countMagnets > 0) {
                                
                            }
                        }
                    }

                    if (countMagnets > 0) {
                        if (openPopup) {
                            setTimeout(function () {
                                chrome.tabs.executeScript(sender.tab.id, {
                                    file: "js/adaware/pro_popup_script.js"
                                }, () => {
                                    chrome.tabs.sendMessage(sender.tab.id, { url: chrome.extension.getURL("pro_popup.html") + '?tabId=' + sender.tab.id, tabId: sender.tab.id, searchList: searchList, firstrun: firstrun });
                                });
                                telemetry.sendMetaEvent("UIOpen", { AutoorUser: "Automatic", URL: sender.tab.url });
                            }, 1000);
                        } else {
                            chrome.tabs.sendMessage(sender.tab.id, { url: popupUrl, tabId: sender.tab.id, searchList: searchList, firstrun: firstrun });
                        }
                    } else {
                        if ((getHostName(request.currentUrl)) == "web.utorrent.com" && firstrun === true) {
                            chrome.storage.local.get({ 'licenseData': null }, function (result) {
                                

                                setTimeout(function () {
                                    chrome.tabs.executeScript(sender.tab.id, {
                                        file: "js/adaware/pro_popup_script.js"
                                    }, () => {
                                        // 
                                        if (result.licenseData == null && getParameterByName("l", request.currentUrl) !== null) {
                                            chrome.tabs.sendMessage(sender.tab.id, { url: chrome.extension.getURL("pro_popup.html") + '?tabId=' + sender.tab.id + '&openSection=setting', tabId: sender.tab.id, searchList: searchList, firstrun: firstrun });
                                        } else {
                                            chrome.tabs.sendMessage(sender.tab.id, { url: chrome.extension.getURL("pro_popup.html") + '?tabId=' + sender.tab.id + '&openSection=main', tabId: sender.tab.id, searchList: searchList, firstrun: firstrun });
                                        }
                                    });
                                }, 1000);
                            });
                        }
                    }

                    currentUrl = request.currentUrl;
                    currentTabHostName = request.currentTabHostName;
                    resultorNoResult = (countMagnets <= 0) ? false : true;

                }, 1000);
                break;
            case 'ActionType':
                    telemetry.sendMetaEvent("UIAction", { ActionType: request.name });
                break;
            case 'SetLanguage':
                chrome.storage.local.set({ 'lang': (request.language).replace("-", "_") });
                break;
            case 'badgeCounter':
                chrome.browserAction.setBadgeText({ text: (countMagnets).toString(), tabId: sender.tab.id }, callbackError);
                sendResponse({ numberMagnets:  countMagnets});
                break;
            case 'pageLoaded':
                chrome.tabs.sendMessage(sender.tab.id, { text: "searchEngineList" }, function (response) {
                    if (chrome.runtime.lastError) {
                        
                    }
                    if (typeof response !== 'undefined') {
                        
                        searchList = getSearchList(response.urls, response.hostnames, response.fromSearchEngine, response.dom);
                        setBadge(sender.tab.id, searchList);
                        if (response.fromSearchEngine === true) {
                            fromSearchEngine = true;
                        } else {
                            fromSearchEngine = false;
                        }
                    }
                });
                break;
            case 'activateLicense':
                activateLicenseKey(request.data.licenseKey).then(function (result) {
                    
                    if (result === true) {
                        sendResponse({request: true});
                    } else {
                        sendResponse({request: false});
                    }
                });
                return true;
            case 'revokeLicense':
                    
                    revokeLicenseKey();
                    sendResponse({request: true});
                break;
            case 'requestPermission':
                    if (request.name == "nativeMessaging") {
                        chrome.permissions.request({
                            permissions: ['nativeMessaging']
                        }, function(granted) {
                            if (granted) {
                                chrome.storage.local.set({openPanelCount: 4}, function () {});
                                chrome.runtime.reload();
                            }
                        });
                    }
                break;
            case 'hasPermissionNativeMessaging':
                    chrome.permissions.contains({
                        permissions: ['nativeMessaging']
                    }, function(result) {
                        if (result) {
                            // The extension has the permissions.
                            sendResponse({hasPermission: true});
                        } else {
                            sendResponse({hasPermission: false});
                        }
                    });
                break;
            case '_gaEvent':
                    _gaq.push(['_trackEvent', request.category, request.action, request.label]);
                break;
            default:
                
                break;
        }
        return true;
    });

    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        
        
        chrome.storage.local.get((tabId).toString(), function (results) {
            if (results[tabId] !== undefined) {
                chrome.storage.local.remove((tabId).toString());
            }
        });
    });

    // Browser badge clicked
    chrome.browserAction.onClicked.addListener(function (tabs) {
        
        // 

        // Send tracking when badge clicked on popup opened
        telemetry.sendMetaEvent("UIAction", { ActionType: "IconClick" });

        var popupUrl = chrome.extension.getURL("pro_popup.html") + '?tabId=' + tabs.id;

        chrome.tabs.sendMessage(tabs.id, {
            what: "badgeClicked"
        }, (data) => {
            
            if (data.showPopup === true) {
                chrome.tabs.sendMessage(tabs.id, { text: "searchEngineList" }, function (response) {
                    
                    telemetry.sendMetaEvent("UIOpen", { AutoorUser: "User", URL: tabs.url });
                    if (typeof response !== 'undefined') {
                        chrome.tabs.executeScript(tabs.id, {
                            file: "js/adaware/pro_popup_script.js"
                        }, function () {
                            if (chrome.runtime.lastError) {
                                
                                throw Error("Unable to inject script into tab " + tabs.id);
                            } else {
                                searchList = getSearchList(response.urls, response.hostnames, response.fromSearchEngine, response.dom);
                                setBadge(tabs.id, searchList);
                                setTimeout(function () {
                                    chrome.tabs.sendMessage(tabs.id, { url: popupUrl, tabId: tabs.id, searchList: searchList, firstrun: firstrun });
                                }, 1000);
                            }
                        });
                    }
                });
            }
        });
    });

})();