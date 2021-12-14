'use strict';

(function () {
    var body = document.getElementById("table-body");
    var searchListResult = [];
    var language = "en";
    var counter = 0;
    var torrentCounter = 0;
    var numTorrentDisplay = 10;
    var magnetArray = [];
    var torrentHealth = [];
    var torrentFiles = [];
    var licenseActivated = false;
    var licenseExpirationDate = null;
    var torrentSize = "-";
    var torrentFile = "-";
    var videoFormats = ["mpg", "mpeg", "avi", "wmv", "mov", "rm", "ram", "swf", "flv", "ogg", "webm", "mp4", "mkv"];
    var musicFormats = ["mid", "midi", "wma", "aac", "wav", "mp3"];
    var fileFormatReg = /(?:\.([^.]+))?$/;
    var storePartnerId = "ut";
    let browserEnvironment = new systemUtil.browserEnvironmentData();

    chrome.storage.local.get({ 'lang' : 'en' }, function(data) {
        language = data.lang;
    });

    chrome.storage.local.get(['installDate'], function (data) {
        if (data.installDate !== undefined) {
            var result = Math.abs(data.installDate - Date.now()) / 1000;
            var days = Math.floor(result / 86400);
            var minutes = Math.floor(result / 60) % 60;
            var expiredDate = "08/21/2020";
            // 
            // if (days < 3) {
            //     numTorrentDisplay = 5;
            // }
            // 
            // 
            if (new Date().getTime() > new Date(expiredDate).getTime()) {
                numTorrentDisplay = 5;
            }
        }
    });

    chrome.storage.local.get({ 'licenseData': null }, function (data) {
        if (data.licenseData !== null) {
            
            licenseActivated = data.licenseData.isActive;
            licenseExpirationDate = data.licenseData.expiryDate;

            // 
            if (document.getElementsByClassName("sts-logo")) {
                for (var i = 0; i < document.getElementsByClassName("sts-logo").length; i++) {
                    if (data.licenseData.licenseType == "P030008") {
                        document.getElementById("proTitle").innerHTML = "BitTorrent Web Pro";
                        document.getElementsByClassName("sts-logo")[i].src = "img/pro/bittorrent-pro-logo.png";
                        document.getElementsByClassName("sts-logo")[i].style.height = "25px";
                        document.getElementsByClassName("sts-logo")[i].style.marginTop = "12px";
                    } else if (data.licenseData.licenseType == "P030007") {
                        document.getElementById("proTitle").innerHTML = "uTorrent Web Pro";
                        document.getElementsByClassName("sts-logo")[i].src = "img/pro/utorrent-web-pro-logo.png";
                        document.getElementsByClassName("sts-logo")[i].style.height = "25px";
                        document.getElementsByClassName("sts-logo")[i].style.marginTop = "12px";
                    } else {
                        document.getElementsByClassName("sts-logo")[i].src = "img/pro/torrent-pro-logo.png";
                    }
                }
            }
        }

        if (licenseActivated === false) {
            document.getElementById("upgrade-to-pro").style.display = "block";
        } else {
            document.getElementById("settings").style.display = "block";
            // document.getElementById("upgrade-to-pro").innerHTML = "Activated";
            document.getElementById("license-key").placeholder = "License Activated";
            document.getElementById("license-key").disabled = true;
            document.getElementById("activate-license-button").disabled = true;
        }
    });

    chrome.storage.local.get({ 'b' : null }, function(data) {
        
        if (data.b == "bt") {
            storePartnerId = "bt";
        } else {
            storePartnerId = "ut";
        }
    });

    var getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    var add3Dots = function (string, limit) {
        var dots = "...";
        // 
        if (string === undefined) {
            string = "Unknown";
        }
        if (string === null) {
            string = "-";
        }
        if (string.length > limit) {
            // you can also use substr instead of substring
            string = string.substring(0, limit) + dots;
        }
        
        return string;
    }

    var getParamByNameFromMagnetLink = function (name, queryString) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(queryString);
        return results === null ? queryString : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    var validatePixelTitle = function (str) {
        var title = str;
        if (title === undefined) {
            title = "";
        } else {
            title.toLowerCase();
        }
        var pixels = ["240p", "360p", "480p", "720p", "1080p", "2160p"];

        for (var i = 0; i < pixels.length; i++) {
            if (title.indexOf(pixels[i]) !== -1) {
                if (pixels[i] !== undefined) {
                    return pixels[i];
                }
            }
        }
        return "-";
    }

    var validateAudioLanguage = function (str) {
        var title = str;
        if (title === undefined) {
            title = "";
        } else {
            title.toLowerCase();
        }
        
        var regExp = /[^[\]]+(?=])/g;
        var lang = ["en", "english", "eng", "fr", "french", "it", "italian", "es", "spanish", "esp"];

        if (title.match(regExp) !== null && title.match(regExp) !== undefined) {
            
            var t = title.match(regExp);
            for (var i = 0; t.length > i; i++) {
                if (lang.indexOf(t[i]) > -1) {
                    return t[i];
                } else {
                    return "-";
                }
            }
        } else {
            return "-";
        }
    }

    var formatBytes = function (bytes, decimals) {
        if(bytes == 0 || bytes == undefined) return '0 Bytes';
        var k = 1024,
            dm = decimals <= 0 ? 0 : decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    var getFile = function (files) {
        // 
        var maxLength = 0;
        var file = {};
        if (files !== undefined) {
            files.map((obj) => {
                if (obj.length > maxLength) {
                    maxLength = obj.length;
                    file.length = obj.length;
                    file.name = obj.name;
                }
            });
        } else {
            file.length = 0;
            file.name = "-";
        }
        
        // 
        return file;
    }

    var formatTorrents = (torrents) => {
        // 
        let newTorrentArray = new Array();
        let countTorrents = 0;
        let expirydate = null;
        let proVersion = false;
        for (var index in torrents) {
            let title = null;
            let magnet = null;
            let torrentHealth = [];
            let website = null;
            title = torrents[index].names;
            website = torrents[index].url;
            if (torrents[index].infoHashTrackers !== undefined) {
                if (title.includes("magnet:?xt")) {
                    magnet = title;
                    title = null;
                }

                if (torrents[index].torrentHealth) {
                    torrentHealth = torrents[index].torrentHealth;
                }

                newTorrentArray.push({ infoHash: torrents[index].infoHashTrackers.infoHash, title: title, magnet: magnet, torrentHealth: torrentHealth, website: website });

                countTorrents++;
            }
        }

        if (licenseExpirationDate) {
            // Date format yyyy/mm/dd
            expirydate = new Date(licenseExpirationDate).toISOString().slice(0,10);
        }

        if (licenseActivated === true) {
            proVersion = true;
        }

        newTorrentArray.push({ pro: proVersion });
        newTorrentArray.push({ numbersTorrents: countTorrents });
        newTorrentArray.push({ licenseExpirationDate: expirydate });
        
        if (newTorrentArray.length > 0) {
            chrome.runtime.sendMessage({
                what: 'formatTorrents',
                data: newTorrentArray
            });
        }
    };

    // get good torrents
    var getGoodTorrents = (torrents) => {
        
        let goodTorrents = new Array();

        for (var index in torrents) {
            // 
            if (torrents[index].torrentHealth.status !== undefined) {
                if (torrents[index].torrentHealth.status === 1) {
                    goodTorrents.push(torrents[index]);
                }
            }
        }

        

        return goodTorrents;
    };

    // get bad torrents
    var getBadTorrents = (torrents) => {
        
        let badTorrents = new Array(); 

        for (var index in torrents) {
            if (torrents[index].torrentHealth.status !== undefined) {
                if (torrents[index].torrentHealth.status !== 1) {
                    badTorrents.push(torrents[index]);
                }
            }
        }

        

        return badTorrents;
    };

    // count bad torrents
    var countBadTorrents = (torrents) => {
        let count = 0; 

        for (var index in torrents) {
            if (torrents[index].torrentHealth.status !== undefined) {
                if (torrents[index].torrentHealth.status !== 1) {
                    count++;
                }
            }
        }

        

        return count;
    };

    chrome.runtime.sendMessage({
        what: 'getSearchListResult',
        tabId: getParameterByName("tabId", window.location.href)
    }, function (response) {
        setTimeout(function() {
            // Send event when popup is open
            // _gaq.push(['_trackEvent', 'UI is Open', 'User Action', 'ui-open']);
            
            searchListResult = response.result;
            

            var sortTorrentsArray = new Promise((resolve, reject) => {
                var newTorrentArray = [];
                for (var i = 0; searchListResult.length > i; i++) {
                    if (searchListResult[i].magnets !== undefined && searchListResult[i].torrentHealth !== undefined) {
                        if (Object.keys(searchListResult[i].magnets).length > 0) {
                            for (var j = 0, len = Object.keys(searchListResult[i].magnets).length; j < len; j++) {
                                
                                // 
                                let myTorrentHealth = searchListResult[i].torrentHealth[j];
                                if (myTorrentHealth === undefined) {
                                    myTorrentHealth = {infoHash: null, seeders: 0, leechers: 0, downloads: 0};
                                    counter--;
                                }
                                newTorrentArray.push({ infoHashStatus: searchListResult[i].infoHashStatus[j], infoHashTrackers: searchListResult[i].infoHashTrackers[j], magnets: searchListResult[i].magnets[j], names: searchListResult[i].names[j], torrentFiles: searchListResult[i].torrentFiles[j], url: searchListResult[i].url, torrentHealth: myTorrentHealth});

                                counter++;
                            }
                        }
                    }
                }
                // 
                newTorrentArray.sort((a, b) => parseFloat(b.torrentHealth.seeders) - parseFloat(a.torrentHealth.seeders));
                resolve(newTorrentArray);
            });

            sortTorrentsArray.then((torrents) => {
                formatTorrents(torrents);
                let goodTorrents = torrents;

                if (licenseActivated !== false) {
                    goodTorrents = getGoodTorrents(torrents);
                }
                
                for (let i = 0; i < goodTorrents.length; i++) {
                    // 
                    torrentHealth = goodTorrents[i].torrentHealth;
                    torrentFiles = goodTorrents[i].torrentFiles;
                    magnetArray = goodTorrents[i].magnets;

                    torrentCounter++;

                    if (torrentHealth !== undefined) {
                        if (Object.keys(magnetArray).length > 0) {
                            var relevantSite =  goodTorrents[i].url;

                            if (goodTorrents[i].names !== undefined) {
                                var ext = "-";
                                var imagType = "-";
                                if (torrentFiles !== undefined) {
                                    // 
                                    torrentSize = formatBytes(torrentFiles.length, 2);
                                    torrentFile = getFile(torrentFiles.files);
                                    ext = fileFormatReg.exec(torrentFile.name)[1];
                                }

                                if (videoFormats.includes(ext)) {
                                    imagType = '<img src="img/pro/tv.svg" class="tv-icon" />';
                                } else if (musicFormats.includes(ext)) {
                                    imagType = '<img src="img/pro/audio.svg" class="tv-icon" />';
                                } else {
                                    imagType = "-";
                                }

                                // var audio = validateAudioLanguage(getParamByNameFromMagnetLink("dn", searchListResult[i].names[j]));
                                // 
                                var audio = "-";
                                var virusName = "-";
                                if (torrentHealth !== undefined) {
                                    if (torrentHealth.languages !== undefined) {
                                        audio = ((torrentHealth.languages).length > 0) ? torrentHealth.languages[0] : "-";
                                    }

                                    if (torrentHealth.virusName !== undefined) {
                                        virusName = torrentHealth.virusName;
                                    }
                                }
                                
                                var pixel = validatePixelTitle(getParamByNameFromMagnetLink("dn", goodTorrents[i].names));
                                var row = document.createElement("div");
                                row.setAttribute("class", "t-row");
                                var torrent = document.createElement("div");
                                torrent.setAttribute("class", "t-torrent");

                                if (torrentCounter > numTorrentDisplay && licenseActivated === false) {
                                    var blurOut = document.createElement("div");
                                    blurOut.setAttribute("class", "torrentOvelay");
                                    torrent.appendChild(blurOut);
                                    torrent.setAttribute("id", "blurOut");
                                    row.setAttribute("class", "displayNone"); // removed the rest of the rows
                                }

                                var tname = document.createElement("div");
                                tname.setAttribute("class", "t-name-text");
                                var tlink = document.createElement("a");
                                tlink.setAttribute('class', 'torrent-link');
                                tlink.setAttribute('target', '_blank');
                                tlink.setAttribute("href", magnetArray);
                                
                                // track clicked event 
                                tlink.addEventListener("click", () => {
                                    
                                    chrome.runtime.sendMessage({
                                        what: 'ActionType',
                                        name: 'TorrentLink',
                                        clicked: 'link'
                                    });
                                });

                                var tnameSpan = document.createElement("span");
                                tnameSpan.setAttribute("class", "torrent-title");
                                tnameSpan.setAttribute("title", getParamByNameFromMagnetLink("dn", goodTorrents[i].names));
                                tnameSpan.appendChild(document.createTextNode(add3Dots(getParamByNameFromMagnetLink("dn", goodTorrents[i].names), 35)));
                                var overflow = document.createElement("div");
                                overflow.setAttribute("class", "overflow");
                                // var ttype = document.createElement("div");
                                // ttype.setAttribute("class", "t-type-icon");
                                // ttype.innerHTML = imagType;
                                // var ttypeImg = document.createElement("img");
                                // ttypeImg.setAttribute("class", "tv-icon");
                                // ttypeImg.setAttribute("src", "img/pro/tv.svg");
                                var tquality = document.createElement("div");
                                tquality.setAttribute("class", "t-quality-text");
                                tquality.appendChild(document.createTextNode(pixel));
                                // var tlang = document.createElement("div");
                                // tlang.setAttribute("class", "t-lang-text");
                                // tlang.appendChild(document.createTextNode(audio));
                                var tarrow = document.createElement("div");
                                tarrow.setAttribute("class", "t-arrow");
                                var tarrowImg = document.createElement("span");
                                tarrowImg.setAttribute("class", "arrow-down");

                                tname.appendChild(tnameSpan);
                                tlink.appendChild(tname);
                                // ttype.appendChild(ttypeImg);
                                document.getElementsByClassName("t-quality")[0].style.display = "inline-block";

                                if (licenseActivated === false) {
                                    document.getElementsByClassName("t-lang")[0].style.display = "inline-block";
                                    var tlang = document.createElement("div");
                                    tlang.setAttribute("class", "t-lang-text");
                                    tlang.appendChild(document.createTextNode(audio));
                                    if (torrentCounter <= numTorrentDisplay) {
                                        tarrow.appendChild(tarrowImg);
                                    }

                                    torrent.append(tlink, tquality, tlang, tarrow);
                                } else {
                                    document.getElementsByClassName("t-status")[0].style.display = "inline-block";
                                    tarrow.appendChild(tarrowImg);
                                    var tstatus = document.createElement("div");
                                    if (goodTorrents[i].torrentHealth.status === 1) {
                                        tstatus.setAttribute("class", "t-status-text " + "t-secure-icon");
                                    } else {
                                        tstatus.setAttribute("class", "t-status-text " + "t-insecure-icon");
                                    }

                                    torrent.append(tlink, tstatus, tquality, tarrow);
                                }
                                
                                row.appendChild(torrent);

                                var torrentInfo = document.createElement("div");
                                torrentInfo.setAttribute("class", "t-torrent-more");

                                // arrow on click
                                tarrowImg.addEventListener("click", (ev) => {
                                    for (var i = 0; i < ev.path[3].childNodes.length; i++) {
                                        if (ev.path[3].childNodes[i].className.indexOf("t-torrent-more") != -1) {
                                            
                                            ev.path[3].childNodes[i].classList.toggle("show-info");
                                        }
                                    }
                                    if (ev.target.className == "arrow-down") {
                                        ev.target.className = ev.target.className.replace("arrow-down", "arrow-up");

                                        // show banner
                                        // var getProPanelBanner = document.getElementsByClassName("proPanelBanner")[0];
                                        // if (getProPanelBanner == undefined && licenseActivated === false) {
                                        //     var proPanelBanner = document.createElement("div");
                                        //     proPanelBanner.setAttribute("class", "proPanelBanner");
                                        //     var proPanelPriceTag = document.createElement("div");
                                        //     proPanelPriceTag.setAttribute("class", "upgradeProPanelTitle proPanelPriceTag");
                                        //     var proPanelPriceButton = document.createElement("button");
                                        //     proPanelPriceTag.appendChild(document.createTextNode("Still only $19.95"));
                                        //     proPanelPriceButton.setAttribute("class", "upgrade-to-pro-button-1");
                                        //     proPanelPriceButton.setAttribute("id", "upgrade-to-pro");
                                        //     proPanelPriceButton.appendChild(document.createTextNode("Upgrade to Pro"));
    
                                        //     proPanelBanner.append(proPanelPriceTag, proPanelPriceButton);
    
                                        //     proPanelPriceButton.style.display = "inline-block";
    
                                        //     proPanelPriceButton.addEventListener("click", () => {
                                        //         document.getElementById("activate-pro").style.display = "block";
                                        //         document.getElementById("ext-wrapper").style.display="none";

                                        //         
                                        //         chrome.runtime.sendMessage({
                                        //             what: 'ActionType',
                                        //             name: 'UpgradetoProButton',
                                        //             clicked: 'button'
                                        //         });
                                        //     });
                                        //     body.appendChild(proPanelBanner);

                                        //     document.getElementsByClassName("proPanelPriceContent")[0].remove();
                                        // }   
                                        
                                    } else {
                                        ev.target.className = ev.target.className.replace("arrow-up", "arrow-down");
                                    }
                                });

                                var infoLeft = document.createElement("div");
                                infoLeft.setAttribute("class", "t-info-left");
                                var infoRight = document.createElement("div");
                                infoRight.setAttribute("class", "t-info-right");

                                var tsize = document.createElement("span");
                                tsize.setAttribute("class", "t-torrent-size");
                                tsize.appendChild(document.createTextNode(torrentSize));
                                var tseeds = document.createElement("span");
                                tseeds.setAttribute("class", "t-torrent-seeds");
                                var seedsImg = document.createElement("img");
                                seedsImg.setAttribute("src", "img/pro/seeds-icon.svg");
                                var tleaches = document.createElement("span");
                                tleaches.setAttribute("class", "t-torrent-leaches");
                                var leechesImg = document.createElement("img");
                                leechesImg.setAttribute("src", "img/pro/leach-icon.svg");

                                var lowAvailability = document.createElement("span");
                                lowAvailability.setAttribute("class", "t-low-availability");
                                lowAvailability.appendChild(document.createTextNode("Low availability"));
                                var sumAvailability = 0;

                                var tfilename = document.createElement("span");
                                tfilename.setAttribute("class", "t-torrent-filename");
                                var filenameImg = document.createElement("img");
                                filenameImg.setAttribute("src", "img/pro/torrent-icon.svg");
                                var tpath = document.createElement("span");
                                tpath.setAttribute("class", "t-torrent-path");
                                var pathImg = document.createElement("img");
                                pathImg.setAttribute("src", "img/pro/location-icon.svg");
                                var tbug = document.createElement("span");
                                tbug.setAttribute("class", "t-torrent-virus");
                                var bugImg = document.createElement("img");
                                bugImg.setAttribute("src", "img/pro/bug.svg");
                                var tlang = document.createElement("span");
                                tlang.setAttribute("class", "t-torrent-lang");
                                var langImg = document.createElement("img");
                                langImg.setAttribute("src", "img/pro/lang.svg");

                                tseeds.appendChild(seedsImg);
                                tleaches.appendChild(leechesImg);
                                if (torrentHealth) {
                                    tseeds.appendChild(document.createTextNode(" " + torrentHealth.seeders));
                                    tleaches.appendChild(document.createTextNode(" " + torrentHealth.leechers));
                                    sumAvailability = torrentHealth.seeders + torrentHealth.leechers;
                                } else {
                                    tseeds.appendChild(document.createTextNode(" 0"));
                                    tleaches.appendChild(document.createTextNode(" 0"));
                                }

                                if (sumAvailability <= 5) {
                                    infoLeft.append(tsize, lowAvailability);
                                } else {
                                    infoLeft.append(tsize, tseeds, tleaches);
                                }

                                tfilename.appendChild(filenameImg);
                                tfilename.appendChild(document.createTextNode(" " + add3Dots(torrentFile.name, 35)));
                                tfilename.setAttribute("title", torrentFile.name);
                                tpath.appendChild(pathImg);
                                tpath.appendChild(document.createTextNode(" " + add3Dots(((relevantSite).toString().replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")), 30)));
                                tpath.setAttribute("title", (relevantSite).toString().replace(/^(?:https?:\/\/)?(?:www\.)?/i, ""));
                                tbug.appendChild(bugImg);
                                tbug.appendChild(document.createTextNode(" " + add3Dots(virusName, 35)));
                                tlang.appendChild(langImg);
                                tlang.appendChild(document.createTextNode(" " + audio));

                                if (licenseActivated === false) {
                                    infoRight.append(tfilename, tpath, tbug);
                                } else {
                                    infoRight.append(tfilename, tpath, tbug, tlang);
                                }
                                
                                torrentInfo.append(infoLeft, infoRight);
                                if (licenseActivated === false) {
                                    if (torrentCounter <= numTorrentDisplay) {
                                        row.appendChild(torrentInfo);
                                    }
                                } else {
                                    row.appendChild(torrentInfo);
                                    document.getElementById("checked-sites").style.display = "block";
                                    document.getElementById("mal-count").innerHTML = countBadTorrents(torrents);
                                }

                                // if (torrentCounter > 0) {
                                //     // 
                                //     chrome.runtime.sendMessage({
                                //         what: 'badgeCounter',
                                //         found: torrentCounter
                                //     }, (count) => {
                                //         document.getElementById("numberScanned").textContent = count.numberMagnets;
                                //     });
                                // }

                                body.appendChild(row);

                            }
                        }
                    }
                }

                if (torrentCounter > 0) {
                    chrome.runtime.sendMessage({
                        what: 'badgeCounter',
                        found: torrentCounter
                    }, (count) => {
                        document.getElementById("numberScanned").textContent = count.numberMagnets;

                        // Postback ListDownload event
                        // 
                        // 
                        // 
                        // 
                        // 
                        // 

                        chrome.runtime.sendMessage({
                            what: 'sendListDownloadEvent',
                            url: response.currentUrl,
                            hostname: (new URL(response.currentUrl)).hostname,
                            searchQuery: getParameterByName("q", response.currentUrl),
                            queryInput: 'Browser',
                            total: count.numberMagnets,
                            badTorrents: countBadTorrents(torrents)
                        });
                    });
                }

                

                // add new panel
                if (licenseActivated === false) {
                    var upgradeProPanel = document.createElement("div");
                    upgradeProPanel.setAttribute("class", "upgradeProPanel");
                    var upgradeProPanelSentence1 = document.createElement("div");
                    upgradeProPanelSentence1.setAttribute("class", "upgradeProPanelTitle");
                    upgradeProPanelSentence1.appendChild(document.createTextNode("It takes time & skill to find real, safe torrents"));
                    var upgradeProPanelSentence2 = document.createElement("p");
                    upgradeProPanelSentence2.appendChild(document.createTextNode("Safe Torrent Scanner shows the 2 best torrents."));
                    var upgradeProPanelSentence3 = document.createElement("p");
                    upgradeProPanelSentence3.appendChild(document.createTextNode("Skips unsafe or questionable results."));
                    var upgradeProPanelSentence4 = document.createElement("div");
                    upgradeProPanelSentence4.setAttribute("class", "upgradeProPanelTitle");
                    upgradeProPanelSentence4.appendChild(document.createTextNode("1 of 40 million search results are real torrents"));
                    var upgradeProPanelSentence5 = document.createElement("div");
                    upgradeProPanelSentence5.setAttribute("class", "upgradeProPanelTitle upgradeProPanelSpecialTitle");
                    upgradeProPanelSentence5.setAttribute("id", "upgradeProPanelSpecialTitle");
                    upgradeProPanelSentence5.appendChild(document.createTextNode("or, Get New µTorrent Web Pro"));

                    var upgradeProPanelList = document.createElement("div");
                    upgradeProPanelList.setAttribute("class", "upgradeProPanelList");
                    var proPanelList1 = document.createElement("p");
                    proPanelList1.appendChild(document.createTextNode("→ All search engines"));
                    var proPanelList2 = document.createElement("p");
                    proPanelList2.appendChild(document.createTextNode("→ No malware, bad links"));
                    var proPanelList3 = document.createElement("p");
                    proPanelList3.appendChild(document.createTextNode("→ Custom filter all results"));
                    var proPanelList4 = document.createElement("p");
                    proPanelList4.appendChild(document.createTextNode("→ Premium support 24/7"));
                    upgradeProPanelList.append(proPanelList1, proPanelList2, proPanelList3, proPanelList4);

                    var proPanelPriceContent = document.createElement("div");
                    proPanelPriceContent.setAttribute("class", "proPanelPriceContent");
                    var proPanelPriceTag = document.createElement("div");
                    proPanelPriceTag.setAttribute("class", "upgradeProPanelTitle proPanelPriceTag");
                    var proPanelPriceButton = document.createElement("button");
                    proPanelPriceTag.appendChild(document.createTextNode("Still only $19.95"));
                    proPanelPriceButton.setAttribute("class", "upgrade-to-pro-button-2");
                    proPanelPriceButton.setAttribute("id", "upgrade-to-pro");
                    proPanelPriceButton.appendChild(document.createTextNode("Upgrade to Pro"));

                    proPanelPriceContent.append(proPanelPriceTag, proPanelPriceButton);

                    upgradeProPanel.append(upgradeProPanelSentence1, upgradeProPanelSentence2, upgradeProPanelSentence3, upgradeProPanelSentence4, upgradeProPanelSentence5, upgradeProPanelList, proPanelPriceContent);
                    // body.appendChild(upgradeProPanel);

                    proPanelPriceButton.style.display = "inline-block";

                    if (getParameterByName("openSection", window.location.href) == "setting") {
                        document.getElementById("activate-pro").style.display = "block";
                        document.getElementById("ext-wrapper").style.display = "none";
                    }

                    proPanelPriceButton.addEventListener("click", () => {
                        document.getElementById("activate-pro").style.display = "block";
                        document.getElementById("ext-wrapper").style.display = "none";

                        
                        chrome.runtime.sendMessage({
                            what: 'ActionType',
                            name: 'UpgradetoProButton',
                            clicked: 'button'
                        });
                    });

                    if (storePartnerId == "bt") {
                        document.getElementById("proTitle").innerHTML = "BitTorrent Web Pro";
                        document.getElementById("upgradeProPanelSpecialTitle").innerHTML = "or, Get New BitTorrent Web Pro";
                    } else {
                        document.getElementById("proTitle").innerHTML = "µTorrent Web Pro";
                        // document.getElementById("upgradeProPanelSpecialTitle").innerHTML = "or, Get New µTorrent Web Pro";
                    }
                }
                // end new panel
            });


            // if (counter <= 0) {
            //     var refreshButton = document.createElement("button");
            //     refreshButton.setAttribute("class", "refresh-button");
            //     refreshButton.setAttribute("id", "refresh");
            //     refreshButton.appendChild(document.createTextNode("Refresh"));
            //     body.append(refreshButton);

            //     refreshButton.addEventListener("click", () => {
            //         window.location.reload();
            //         
            //         chrome.runtime.sendMessage({
            //             what: 'ActionType',
            //             name: 'RefreshButton',
            //             clicked: 'button'
            //         });
            //     });
            // }   

            // if (licenseActivated === false) {
            //     document.getElementById("upgrade-to-pro").style.display = "block";
            // } else {
            //     document.getElementById("settings").style.display = "block";
            //     // document.getElementById("upgrade-to-pro").innerHTML = "Activated";
            //     document.getElementById("license-key").placeholder = "License Activated";
            //     document.getElementById("license-key").disabled = true;
            //     document.getElementById("activate-license-button").disabled = true;
            // }

            var search = document.getElementById('search');
            search.value = getParameterByName('q', response.currentUrl);

            document.getElementById("loading").style.display = "none";
            
        }, 1000);

        
    });

    document.addEventListener("DOMContentLoaded", function() {

        // setup localization onload
        chrome.storage.local.get({ 'lang' : 'en' }, function(data) {
            
            i18n.init({
                lng: data.lang,
                fallbackLng : 'en',
                resGetPath: '_locales/__lng__/messages.json'
            }, function(err, t) {
                $(".getranslate").i18n();
            });
        });

        // search query on search box
        var search = document.getElementById('search');
        var addTorrentWord = " torrent";
        search.addEventListener('keypress', (event) => {
            var keyName = event.key;
            if (search.value.indexOf(addTorrentWord) !== -1) {
                addTorrentWord = "";
            }
            if (event.key === "Enter") {
                // _gaq.push(['_trackEvent', 'User Action', 'Top Bar Search', 'search']);
                
                

                if (browserEnvironment.BrowserFamily == "Opera") {
                    window.open('https://www.google.com/search?q=' + search.value + addTorrentWord + "&client=opera&sourceid=opera&ie=UTF-8&oe=UTF-8", '_top');
                } else {
                    window.open('https://www.google.com/search?q=' + search.value + addTorrentWord, '_top');
                }
                
                chrome.runtime.sendMessage({
                    what: 'fromPopUI',
                    fromPopUI: true,
                    searchEngine: "google",
                    searchQuery: search.value
                });
            }
        });

        // seach query on click 
        var searchBtn = document.getElementsByClassName('search-btn')[0];
        searchBtn.addEventListener('click', () => {
            if (search.value.indexOf(addTorrentWord) !== -1) {
                addTorrentWord = "";
            }

            if (browserEnvironment.BrowserFamily == "Opera") {
                window.open('https://www.google.com/search?q=' + search.value + addTorrentWord + "&client=opera&sourceid=opera&ie=UTF-8&oe=UTF-8", '_top');
            } else {
                window.open('https://www.google.com/search?q=' + search.value + addTorrentWord, '_top');
            }
            
            chrome.runtime.sendMessage({
                what: 'fromPopUI',
                fromPopUI: true,
                searchEngine: "google",
                searchQuery: search.value
            });
        });

        document.getElementById("settings").addEventListener("click", (event) => {
            document.getElementById("activate-pro").style.display = "block";
            document.getElementById("ext-wrapper").style.display="none";
        });

        document.getElementById("upgrade-to-pro").addEventListener("click", (event) => {
            document.getElementById("activate-pro").style.display = "block";
            document.getElementById("ext-wrapper").style.display="none";

            
            chrome.runtime.sendMessage({
                what: 'ActionType',
                name: 'UpgradetoProButton',
                clicked: 'button'
            });
        });

        document.getElementById("back-from-pro").addEventListener("click", (event) => {
            document.getElementById("activate-pro").style.display = "none";
            document.getElementById("ext-wrapper").style.display="block";
        });

        document.getElementById("activate-license-button").addEventListener("click", (event) => {
            var licenseKey = document.getElementById("license-key").value;

            //set whole obj instead of license key only {status: "Active", isActive: true, expireyDate: "0523/2019", isExpired: true }
            // var licenseData = {status: "Active", isActive: true, expireyDate: "0523/2019", isExpired: true, license: licenseKey };
            // chrome.storage.local.set({licenseData: licenseData}, function() {});

            
            chrome.runtime.sendMessage({
                what: 'ActionType',
                name: 'ActivateButton',
                clicked: 'button'
            });
           
            chrome.runtime.sendMessage({what: "activateLicense", data: { licenseKey: licenseKey}}, function(response) {
                if (response.request) {
                    document.getElementById("license-key").value = "";
                    document.getElementById("license-key").placeholder = "License Activated";
                    document.getElementById("license-key").disabled = true;
                    document.getElementById("activate-license-button").disabled = true;

                    document.getElementById("upgrade-to-pro").style.display = "none";
                    document.getElementById("refresh").style.display = "block";
                    document.getElementById("refresh").addEventListener("click", function () {
                        
                        chrome.runtime.sendMessage({
                            what: 'ActionType',
                            name: 'RefreshButton',
                            clicked: 'button'
                        });
                        window.location.reload();
                    });

                    if (document.getElementsByClassName("upgradeProPanel")[0]) {
                        document.getElementsByClassName("upgradeProPanel")[0].remove();
                    }

                    if (document.getElementsByClassName("proPanelBanner")[0]) {
                        document.getElementsByClassName("proPanelBanner")[0].remove();
                    }
                    
                } else {
                    document.getElementById("license-key").value = "";
                    document.getElementById("license-key").placeholder = "Invalid License Key, try again";
                }
            });
        });

        // When purchase pro is clicked
        document.getElementById("purchase-pro").addEventListener("click", () => {
            
            // check if b isset in localstorage
            chrome.storage.local.get({ 'b' : null }, function(data) {
                
                if (data.b == "bt") {
                    if (browserEnvironment.BrowserFamily == "Opera") {
                        window.open("https://gateway.lavasoft.com/ext/buy/bittorrentpro/?mkey7=Opera", "_blank");
                    } else if (browserEnvironment.BrowserFamily == "Edge") {
                        window.open("https://gateway.lavasoft.com/ext/buy/bittorrentpro/?mkey7=EDGE ", "_blank");
                    } else {
                        window.open("https://gateway.lavasoft.com/ext/buy/bittorrentpro/", "_blank");
                    }
                } else if (data.b == "ut") {
                    if (browserEnvironment.BrowserFamily == "Opera") {
                        window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/?mkey7=Opera", "_blank");
                    } else if (browserEnvironment.BrowserFamily == "Edge") {
                        window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/?mkey7=EDGE", "_blank");
                    } else {
                        window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/", "_blank");
                    }
                } else {
                    if (browserEnvironment.BrowserFamily == "Opera") {
                        window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/?mkey7=Opera", "_blank");
                    } else if (browserEnvironment.BrowserFamily == "Edge") {
                        window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/?mkey7=EDGE", "_blank");
                    } else {
                        window.open("https://gateway.lavasoft.com/ext/buy/utorrentpro/", "_blank");
                    }
                }
            });

            
            chrome.runtime.sendMessage({
                what: 'ActionType',
                name: 'PurchaseLicenseButton',
                clicked: 'button'
            });
        });

        var getFeedback = function () {
            if (licenseActivated === true) {
                window.open("https://www.surveymonkey.com/r/MGSXQTF", "_blank");
            } else {
                window.open("https://www.surveymonkey.com/r/CP5JWBC", "_blank");
            }
        
            
            chrome.runtime.sendMessage({
                what: 'ActionType',
                name: 'FeedbackButton',
                clicked: 'button'
            });
        }

        // Feedback button is clicked
        document.getElementsByClassName("feedbackLink1")[0].addEventListener("click", (e) => {
            
            getFeedback();
        });

        document.getElementsByClassName("feedbackLink2")[0].addEventListener("click", (e) => {
            
            getFeedback();
        });

        chrome.permissions.contains({
            permissions: ['nativeMessaging']
        }, function(result) {
            if (result) {
                // The extension has the permissions.
                document.querySelector('#allow-native-messaging').style.display = "none";
            }
        });

        // Enable native messaging permission
        document.querySelector('#allow-native-messaging').addEventListener('click', function(event) {
            
            // Permissions must be requested from inside a user gesture, like a button's
            // click handler.
            chrome.permissions.request({
                permissions: ['nativeMessaging']
            }, function(granted) {
                if (granted) {
                    chrome.runtime.reload();
                }
            });
        });
    });
    
})();