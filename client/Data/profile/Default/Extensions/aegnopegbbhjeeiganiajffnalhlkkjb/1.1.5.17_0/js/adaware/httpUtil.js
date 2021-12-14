var httpUtil = (function () {
    var httpRequestAsync = (method, url, data, onLoad, onError, onAbort, contentType, authorization) => {
        if (contentType === undefined) {
            contentType = 'application/x-www-form-urlencoded';
        }
        if (authorization === undefined) {
            authorization = '';
        }
        if (typeof onAbort !== 'function') {
            onAbort = onError;
        }
        var onResponseReceived = function () {
            this.onload = this.onerror = this.ontimeout = null;
            // xhr for local files gives status 0, but actually succeeds
            var status = this.status || 200;
            if (status < 200 || status >= 300) {
                return onError.call(this, status);
            }
            // never download anything else than plain text: discard if response
            // appears to be a HTML document: could happen when server serves
            // some kind of error page
            var text = this.responseText.trim();
            if (text.startsWith('<') && text.endsWith('>')) {
                return onError.call(this, status);
            }
            return onLoad.call(this, this.responseText, status);
        };
        var onErrorReceived = function () {
            this.onload = this.onerror = this.ontimeout = null;
            onError.call(this, status);
        };
        var onAbortReceived = function () {
            this.onload = this.onerror = this.ontimeout = null;
            onAbort.call(this, status);
        };
        var xhr = new XMLHttpRequest();
        try {
            xhr.open(method, url, true); // true for asynchronous 
            if (method === "POST") {
                xhr.setRequestHeader('Content-type', contentType);
            }
            if (method === "POST") {
                if (authorization !== undefined || authorization !== "") {
                    xhr.setRequestHeader('Authorization', authorization);
                }
            }
            xhr.timeout = 30000; // 30 seconds
            xhr.onload = onResponseReceived;
            xhr.onerror = onErrorReceived;
            xhr.ontimeout = onErrorReceived;
            xhr.onabort = onAbortReceived;
            xhr.send(data);
        } catch (e) {
            
            onErrorReceived.call(xhr);
        }
        return xhr;
    };
    var httpPostAsync = (postUrl, postdata, onLoad, onError, onAbort, contentType, authorization) => {
        return httpRequestAsync("POST", postUrl, postdata, onLoad, onError, onAbort, contentType, authorization);
    };

    var httpGetAsync = (url, onLoad, onError, contentType) => {
        return httpRequestAsync("GET", url, null,onLoad, onError, function () {}, contentType);
    };

    var fetchWebCompanionData = (successHandler, failHandler, url) => {
        httpUtil.httpGetAsync(url, successHandler, failHandler);
    }

    return {
        httpPostAsync: httpPostAsync,
        httpGetAsync: httpGetAsync,
        fetchWebCompanionData: fetchWebCompanionData
    }
})();