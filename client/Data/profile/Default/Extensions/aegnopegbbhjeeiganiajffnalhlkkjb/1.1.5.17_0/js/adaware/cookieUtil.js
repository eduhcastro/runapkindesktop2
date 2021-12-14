var cookieUtils = (function () {
    var getCookies = (domain, path, name) => {
        return new Promise((resolve, reject) => {
            let url = domain + path;
            try {
                chrome.cookies.get({
                    "url": url,
                    "name": name
                }, function (cookie) {
                    if (cookie == undefined || cookie == null) {

                    } else {
                        let jsondataCookie = JSON.parse(cookie.value);
                        let cookieData = [];
                        let data = {};
                        cookieData = jsondataCookie;
                        for (var key in cookieData) {
                            if (cookieData[key] != "") {
                                data[key] = cookieData[key];
                            }
                        }
                        resolve(data);
                    }
                });
            } catch (error) {
                
            }
        })
    }
    var setCookies = (domain, name, value, path, isSecure, isHttp, expiry) => {
        return new Promise((resolve, reject) => {
            var cookieDetails = {
                url: domain + path,
                name: name,
                value: value,
                path: path,
                secure: isSecure,
                httpOnly: isHttp,
                expirationDate: expiry
            };
            chrome.cookies.set(cookieDetails, function (cookie) {
                if (cookie) {
                    resolve(true);
                }
            });
        });
    }

    return {
        getCookies: getCookies,
        setCookies: setCookies
    }
})();