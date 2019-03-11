(function () {
    var mappings = JSON.parse(localStorage["nl.sjmulder.urlrewrite.mappings"] || "[]");
    // mappings.push({
    //     "sourceUrl": "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js",
    //     "destinationUrl": "http://code.jquery.com/jquery-1.7.1.min.js"
    // });
    // mappings.push({
    //     "sourceUrl": "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js",
    //     "destinationUrl": "https://code.jquery.com/jquery-1.7.1.min.js"
    // });
    // {urls: ["*://www.evil.com/*"]},
    var sourceUrls = querySourceUrls(mappings);
    var urls = sourceUrls.map(function (item) {
        if (item.indexOf("?") !== -1) {
            return item;
        } else {
            if (item[item.length - 1] === "/") {
                return item + "*"
            } else if (item[item.length - 1] === "/*") {
                return item;
            } else {
                return item + "/*"
            }
        }
    });
    console.log("------------------------------");
    for (let i = 0; i < urls.length; i++) {
        console.log(`监测网址: ${urls[i]}`);
    }
    console.log("------------------------------");
    chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            console.log("==============================================")
            console.log(`收到监测网址: ${details.url}`);
            var ret = queryDestinationUrl(mappings, details.url);
            if (ret.b) {
                console.log(`重定向网址:  ${ret.url}`);
            }
            return {redirectUrl: ret.url};
        },
        {urls: urls},
        ["blocking"]);
})();

function querySourceUrls(mappings) {
    var sourceUrls = [];
    for (var i = 0; i < mappings.length; i++) {
        sourceUrls[i] = mappings[i].sourceUrl;
    }
    return sourceUrls;
}

function queryDestinationUrl(mappings, destinationUrl) {
    for (var i = 0; i < mappings.length; i++) {
        // 通配符匹配
        // http://www.baidu.com/*     =>  http://qq.com/*
        // http://www.baidu.com/?123  =>  http://qq.com/?123
        var itemSourceUrl = mappings[i].sourceUrl;
        var itemDestUrl = mappings[i].destinationUrl;

        let index = destinationUrl.indexOf(itemSourceUrl);
        if (index !== -1) {
            // 没找到url
            var dest = destinationUrl.replace(itemSourceUrl, itemDestUrl);
            return {
                b: true,
                url: dest,
            };

        }
    }
    return {
        b: false,
        url: destinationUrl,
    };
}
