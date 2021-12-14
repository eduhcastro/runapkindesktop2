"use strict";

(function () {
    

    var nodeList =  "";
    var urls = new Array();
    var hostnames = new Array();
    var currentUrl = window.location.href;
    var currentOrigin = window.location.origin;
    var hasWordTorrent = false;
    var searchEngine = null;
    var searchEnginesArray = ["yahoo", "google", "bing", "privatesearch", "yandex", "duckduckgo"];
    var torrentWords = ["torrent", "torrents", "torent", "torents", "torrrent", "torrrents", "torrant", "torrants", "torant", "torants", "торрент", "torrente", "急流", "strom", "激流", "përrua", "паток", "bujica", "порой", "stortvloed", "ryöppy", "χείμαρος", "özön", "straumur", "straume", "srautas", "potok", "поток", "торент", "bystrina", "потік", "מאַבל", "potik", "potok", "cheímaros"];
    
    var getHostNameFromSearchEngine = function (url) {
        var url = url;
        for (var i = 0; i < searchEnginesArray.length; i++) {
            if (url.includes(searchEnginesArray[i])) {
                return searchEnginesArray[i];
            }
        }
        return null;
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

    var getUrlFromYahooRedirectUrI = function (url) {
        var mySubString = url.substring(
            url.lastIndexOf("/RU=") + 4, 
            url.lastIndexOf("/RK=")
        );
        if (mySubString == "htt") {
            return (url);
        }
        return decodeURIComponent(mySubString);
    }

    var getSearchEngineListObserver = function (selectorElement, searchParameterString, searchProvider, selectorText) {
        if (document.getElementById("sts_frame_container")) {
            document.getElementById("sts_frame_container").remove();
        }

        setTimeout(() => {
            var nodeList = document.querySelectorAll(selectorElement);
            var urls = [];
            var hostnames = [];

            if (nodeList) {
                for (var i = 0; i < nodeList.length; i++) {
                    urls[i] = nodeList[i].href;
                    hostnames[i] = nodeList[i].href;
                }
                
                chrome.runtime.sendMessage({
                    what: "searchEngineObserver",
                    urls: urls,
                    hostnames: hostnames,
                    currentTabHostName: getHostNameFromSearchEngine(currentOrigin),
                    fromSearchEngine: true
                }, function (response) {
                    // 
                    if (response) {
                        searchEngine = searchProvider;
                        var getQuery = document.querySelector(selectorText).value;
                        
                        if (getQuery) {
                            hasWordTorrent = torrentWords.some(word => getQuery.toLowerCase().includes(word.toLowerCase()));
                        }
                        
                        
                        chrome.runtime.sendMessage({
                            what: "searchQuery",
                            hasWordTorrent: hasWordTorrent,
                            currentUrl: currentUrl,
                            searchQuery: getParameterByName(searchParameterString, currentUrl),
                            searchEngine: searchEngine,
                            urls: response.request,
                            hostnames: response.request,
                            currentTabHostName: getHostNameFromSearchEngine(currentOrigin)
                        });
                    }
                });
                return true;
            }
        }, 300);
    }

    const getSearchEngineList = (selectorElement, searchParameterString, searchProvider) => {
        if (document.getElementById("sts_frame_container")) {
            document.getElementById("sts_frame_container").remove();
        }

        if (selectorElement && searchParameterString && searchProvider) {
            var searchQuery = getParameterByName(searchParameterString, currentUrl);
            nodeList = document.querySelectorAll(selectorElement);
            searchEngine = searchProvider;
            for (var i = 0; i < nodeList.length; i++) {
                if (searchProvider == "Yahoo") {
                    urls[i] = getUrlFromYahooRedirectUrI(nodeList[i].href);
                    hostnames[i] = getUrlFromYahooRedirectUrI(nodeList[i].href);
                } else {
                    urls[i] = nodeList[i].href;
                    hostnames[i] = nodeList[i].href;
                }
            }

            

            if (searchQuery) {
                hasWordTorrent = torrentWords.some(word => searchQuery.toLowerCase().includes(word.toLowerCase()));
            }
            
        } else {
            hasWordTorrent = false;
            searchEngine = "";
        }

        

        chrome.runtime.sendMessage({
            what: "searchQuery",
            hasWordTorrent: hasWordTorrent,
            currentUrl: currentUrl,
            searchQuery: (searchEngine === "Yandex") ? getParameterByName("text", currentUrl) : getParameterByName("q", currentUrl),
            searchEngine: searchEngine,
            urls: urls,
            hostnames: hostnames,
            currentTabHostName: getHostNameFromSearchEngine(currentOrigin)
        });
    };

    document.addEventListener("DOMContentLoaded", function(event) {
        chrome.runtime.sendMessage({
            what: "pageLoaded"
        });

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

            if (request.what == "badgeClicked") {
                
                let findPopupFrame = document.querySelector('#sts_frame_container');
                if (findPopupFrame === null) {
                    sendResponse({ showPopup: true });
                } else {
                    findPopupFrame.parentNode.removeChild(findPopupFrame);
                    sendResponse({ showPopup: false });
                }
            }
            
            if (request.text == "searchEngineList") {
                switch (getHostNameFromSearchEngine(currentOrigin)) {
                    // GOOGLE SEARCH ENGINE
                    case "google":          
                        getSearchEngineList('.g div div a', "q", "Google");
                        sendResponse({ urls: urls, hostnames: hostnames, currentTabHostName: getHostNameFromSearchEngine(currentOrigin), fromSearchEngine: true, dom: document.all[0].outerHTML });
                    break;
                    // BING SEARCH ENGINE
                    case "bing":        
                        getSearchEngineList('.b_algo h2 a', "q", "Bing");
                        sendResponse({ urls: urls, hostnames: hostnames, currentTabHostName: getHostNameFromSearchEngine(currentOrigin), fromSearchEngine: true, dom: document.all[0].outerHTML });
                    break;
                    // YANDEX SEARCH ENGINE
                    case "yandex":
                        getSearchEngineList('.organic__title-wrapper>a', "text", "Yandex");
                        sendResponse({ urls: urls, hostnames: hostnames, currentTabHostName: getHostNameFromSearchEngine(currentOrigin), fromSearchEngine: true, dom: document.all[0].outerHTML });
                    break;
                    // YAHOO SEARCH ENGINE
                    case "yahoo":
                        getSearchEngineList('.searchCenterMiddle>li>div.algo>div.compTitle>h3.title>a', "p", "Yahoo");
                        sendResponse({ urls: urls, hostnames: hostnames, currentTabHostName: getHostNameFromSearchEngine(currentOrigin), fromSearchEngine: true, dom: document.all[0].outerHTML });
                    break;
                    // PRIVATESEARCH SEARCH ENGINE
                    case "privatesearch":   
                        // On page load get browser url
                        var target = document.querySelector("#app");
                        var config = {subtree: true, characterData: true, childList: true};
                        
                        var observer = new MutationObserver(function (mutations) {
                            if (mutations) {
                                for (var i = 0; mutations.length > i; i++) {
                                    
                                    if (mutations[i].type === "childList") {
                                        // 
                                        if ((mutations[i].target.className).indexOf("pages-nav") >= 0 || (mutations[i].target.className).indexOf("site-links-section") >= 0 || (mutations[i].target.className).indexOf("search-results") >= 0) {
                                            // 
                                            getSearchEngineListObserver("#mainline-search-results-view ul li a", "q", "Private Search", "#search-text");
                                        }
                                    }
                                } 
                            }
                        });
                        observer.observe(target, config);
                        getSearchEngineList("#mainline-search-results-view ul li a", "q", "Private Search", "#search-text");
                        sendResponse({ urls: urls, hostnames: hostnames, currentTabHostName: getHostNameFromSearchEngine(currentOrigin), fromSearchEngine: true, dom: document.all[0].outerHTML });
                    break;
                    // DUCKDUCKGO SEARCH ENGINE
                    case "duckduckgo":
                        var target = document.querySelector("body");
                        var config = {subtree: true, characterData: true, childList: true};
                        
                        var observer = new MutationObserver(function (mutations) {
                            if (mutations) {
                                for (var i = 0; mutations.length > i; i++) {
                                    if (mutations[i].type === "childList") {
                                        // 
                                        if ((mutations[i].target.className).indexOf("result--sep--hr") >= 0) {
                                            // 
                                            getSearchEngineListObserver(".results--main a.result__url.js-result-extras-url", "q", "Duckduckgo", "#search_form_input");
                                        }
                                    }
                                } 
                            }
                        });
                        observer.observe(target, config);
                        getSearchEngineList(".results--main a.result__url.js-result-extras-url", "q", "Duckduckgo", "#search_form_input");
                        sendResponse({ urls: urls, hostnames: hostnames, currentTabHostName: getHostNameFromSearchEngine(currentOrigin), fromSearchEngine: true, dom: document.all[0].outerHTML });
                    break;
                    default:            // OTHER PAGES
                        getSearchEngineList("", "", "");
                        sendResponse({ urls: [currentUrl], hostnames: [currentUrl], currentTabHostName: getHostNameFromSearchEngine(currentOrigin), fromSearchEngine: false, dom: document.all[0].outerHTML });
                }
                return true;
            }
            return true;
        });
    }, false);

    // on window loaded
    window.addEventListener("DOMContentLoaded", (event) => {
        // inject element to website
        if (location.host === "media.adaware.com") {
            let eleDiv = document.createElement("div");
            eleDiv.setAttribute("id", "myTorrentScannerExtension");
            document.body.appendChild(eleDiv);
        }
    });

})();