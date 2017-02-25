var http = require('http');
var os = require('os');
var path = require('path');
var fs = require('fs');
let cheerio = require('cheerio')
var request = require('sync-request');
var Downloader = require('mt-files-downloader');
var downloader = new Downloader();

function goToPage(pageBody)
{
    for (var i = 0; i < pageBody('.entry-title a').get().length - 1; i++)
    {
        var getBook = request('GET', pageBody('.entry-title a').get(i).attribs.href);
        let bookPageBody = cheerio.load(getBook.getBody());
        if (bookPageBody('.download-links a').attr('href') != null)
        {
            var fileUrl = bookPageBody('.download-links a').attr('href');
            var filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            var fileSavePath = process.cwd() + "\\pdf\\" + filename;
            console.log('File will be downloaded from ' + fileUrl + ' to ' + fileSavePath);
            var dl = downloader.download(fileUrl, fileSavePath).start();
            require('./_handleEvents')(dl);
            require('./_printStats')(dl);
        }
    }
}

function downloadMultiplePages(type, startnoPage, noPage)
{
    for (var i = startnoPage; i <= noPage; i++)
    {
        var url = "http://www.allitebooks.com/" + type + "/page/" + i + "/";
        console.log(url);
        var getPage = request('GET', url);
        let pageBody = cheerio.load(getPage.getBody());
        goToPage(pageBody);
    }
}

function downloadFirstPage(type)
{
    var url = "http://www.allitebooks.com/" + type + "/";
    var getPage = request('GET', url);
    let pageBody = cheerio.load(getPage.getBody());
    goToPage(pageBody);
}
// downloadFirstPage("web-development");
// downloadMultiplePages("web-development", 1, 3);