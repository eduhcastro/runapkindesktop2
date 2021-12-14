var config = (function () {
    configurationData = {
        "productId": "bs",
        "flowUrl": "https://flow.lavasoft.com/v1/event-stat?", // Event flow url
        "preProd": true,
        "isStaticExternalData": true, //if this is true than externalData(object below) is mandatory
        "externalData": {
            "PartnerID": "",
            "CampaignID": "",
            "sourceTraffic": "",
            "OfferID": "",
            "CLID": "",
            "extensionID": chrome.runtime.id
        }
    };
    return {
        configurationData: configurationData
    }
})();