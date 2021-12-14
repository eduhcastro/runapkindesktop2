var storageUtil = function () {
    var setStorage = function (key, value, callback) {
        var keyArray = {};
        return keyArray[key] = value, chrome.storage.local.set(keyArray, callback)
    };
    var getStorage = function (key, value, callback) {
        var keyArray = {};
        return keyArray[key] = value, chrome.storage.local.get(keyArray, function (value) {
            var keyArray = {};
            keyArray[key] = value[key], callback(keyArray)
        })
    };
    return {
        save: setStorage,
        load: getStorage
    }
}();