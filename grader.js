#! /usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var HTMLFILE_DEFAULT_TEMP = "temp.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://avair.herokuapp.com";
var isUrlCheckInProgress = false;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertValidURL = function(url) {
        isUrlCheckInProgress = true;
	rest.get(url).on('complete',function(result) {
		if( result instanceof Error) {
			console.log("Url: %s is unreachable or incorrect.Exiting.",url);
			process.exit(1);
		}		

	 });
};	

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlPage = function(htmlPage) {
    return cheerio.load(htmlPage);
};


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var checkHtmlFromUrl = function(htmlpage, checksfile) {
    $ = cheerioHtmlPage(htmlPage);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkUrlPage = function(url) {
	var page;
	rest.get(url).on('complete', function(result,res) {
		if( result instanceof Error) {
			console.log("Url: %s is unreachable or incorrect.Exiting.",url);
			process.exit(1);
		}
		page = res.rawEncoded.toString();
		fs.writeFileSync(HTMLFILE_DEFAULT_TEMP,page,'utf8');

      		var checkJson = checkHtmlFile(HTMLFILE_DEFAULT_TEMP, program.checks);
		fs.exists(HTMLFILE_DEFAULT_TEMP,function(exist) {
			if(exist)
				fs.unlinkSync(HTMLFILE_DEFAULT_TEMP);
		} );
		console.log(JSON.stringify(checkJson,null,4));

	} );

}


if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-l, --url <url>', 'Url of target site')
	//.option('-l, --url <url>', 'Url of target site', clone(assertValidURL),URL_DEFAULT)
        .parse(process.argv);
	
    var checkJson;
    var htmlPage;
    if(program.url) {
     	//console.log("\nURL : " + program.url + "\n"); 
     	checkUrlPage(program.url);
    }
    else {
	//console.log("\nHtml File : " + program.file.toString() + "\n");
      	checkJson = checkHtmlFile(program.file, program.checks);
    	var outJson = JSON.stringify(checkJson, null, 4);
    	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
