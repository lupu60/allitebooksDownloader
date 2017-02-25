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
    downloadLocation: process.cwd()
    subfolder: null,
    registerDlEvents: function(dl)
    {
        handleEvents(dl);
        printStats(dl);
    },
    downloadBook: function(fileUrl)
    {
        let filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        let fileSavePath = downloadManager.downloadLocation + downloadManager.subfolder + filename
        console.log('File will be downloaded from ' + fileUrl + ' to ' + fileSavePath);
        let dl = downloader.download(fileUrl, fileSavePath).start();
        this.registerDlEvents(dl);
    },
    goToBook: function(pageBody)
    {
        for (var i = 0; i < pageBody('.entry-title a').get().length - 1; i++)
        {
            let getBook = request('GET', pageBody('.entry-title a').get(i).attribs.href);
            let bookPageBody = cheerio.load(getBook.getBody());
            if (bookPageBody('.download-links a').attr('href') != null)
            {
                downloadManager.downloadBook(bookPageBody('.download-links a').attr('href'));
            }
        }
    },
    checkDowloadLocation: function(type)
    {
        if (!fs.existsSync(downloadManager.downloadLocation + type + "\\"))
        {
            fs.mkdirSync(downloadManager.downloadLocation + type + "\\");
        }
        downloadManager.subfolder = type + "\\";
    },
    download: function(type, startnoPage, noPage)
    {
        this.checkDowloadLocation(type);
        for (var i = startnoPage; i <= noPage; i++)
        {
            let url = "http://www.allitebooks.com/" + type + "/page/" + i + "/";
            console.log(url);
            let getPage = request('GET', url);
            downloadManager.goToBook(cheerio.load(getPage.getBody()));
        }
    }
}
downloadManager.download("web-development", 21, 30);