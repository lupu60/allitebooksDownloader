var http = require('http');
var os = require('os');
var path = require('path');
var fs = require('fs');
let cheerio = require('cheerio')
var request = require('sync-request');
var Downloader = require('mt-files-downloader');
var handleEvents = require('./_handleEvents');
var printStats = require('./_printStats');
var downloader = new Downloader();

var downloadManager = {
    downloadLocation: process.cwd(),
    subfolder: '/pdf/',
    registerDlEvents: function (dl) {
        handleEvents(dl);
        printStats(dl);
    },
    downloadBook: function (fileUrl) {
        var filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        var fileSavePath = downloadManager.downloadLocation + downloadManager.subfolder + filename;
        console.log('File will be downloaded from ' + fileUrl + ' to ' + fileSavePath);
        var dl = downloader.download(fileUrl, fileSavePath).start();
        this.registerDlEvents(dl);
    },
    writeTofile: function (fileurl) {
        fs.appendFileSync('allurls.txt', fileurl + "\n");
    },
    goToBook: function (pageBody) {
        for (var i = 0; i < pageBody('.entry-title a').get().length - 1; i++) {
            var getBook = request('GET', pageBody('.entry-title a').get(i).attribs.href);
            var bookPageBody = cheerio.load(getBook.getBody());
            if (bookPageBody('.download-links a').attr('href') != null) {
                this.downloadBook(bookPageBody('.download-links a').attr('href'));
                this.writeTofile(encodeURI(bookPageBody('.download-links a').attr('href')));
            }
        }
    },
    checkDowloadLocation: function (type) {
        if (!fs.existsSync(downloadManager.downloadLocation + type + "\\")) {
            fs.mkdirSync(downloadManager.downloadLocation + type + "\\");
        }
        downloadManager.subfolder = type + "\\";
    },
    downloadByTag: function (type, startnoPage, noPage) {
        this.checkDowloadLocation(type);
        for (var i = startnoPage; i <= noPage; i++) {
            var url = "http://www.allitebooks.com/page/" + i + "/?s=" + tag;
            console.log(url);
            var getPage = request('GET', url);
            goToBook(cheerio.load(getPage.getBody()));
        }
    },
    download: function (type, startnoPage, noPage) {
        this.checkDowloadLocation(type);
        for (var i = startnoPage; i <= noPage; i++) {
            var url = "http://www.allitebooks.com/" + type + "/page/" + i + "/";
            console.log(url);
            var getPage = request('GET', url);
            downloadManager.goToBook(cheerio.load(getPage.getBody()));
        }
    },
    downloadall: function (startnoPage, noPage) {
        for (var i = startnoPage; i <= noPage; i++) {
            var url = "http://www.allitebooks.com/page/" + i + "/";
            console.log(url);
            var getPage = request('GET', url);
            downloadManager.goToBook(cheerio.load(getPage.getBody()));
        }
    }
};
// downloadManager.downloadall(1, 691); //168
// ================================================================================
// downloadManager.download("web-development", 1, 168);
// downloadManager.download("programming", 1, 133);
// downloadManager.download("datebases", 1, 77);
// downloadManager.download("graphics-design", 1, 29);
// downloadManager.download("operating-systems", 1, 69);
// downloadManager.download("networking-cloud-computing", 1, 60);
// downloadManager.download("administration", 1, 23);
// downloadManager.download("certification", 1, 14);
// downloadManager.download("computers-technology", 1, 21);
// downloadManager.download("enterprise", 1, 18);
// downloadManager.download("game-programming", 1, 30);
// downloadManager.download("hardware", 1, 23);
// downloadManager.download("marketing-seo", 1, 6);
// downloadManager.download("software", 1, 34);
// ================================================================================
