var Client = require('ftp');
var fs = require('fs');
var client = new Client();
var mean = require('meanio');
var config = mean.loadConfig().ftp;


// var config = {
// 	host:"host",
// 	user:"user",
// 	password:"password"
// };

exports.getFileFromFtp = function(req,res,next){
var url = req.params.url;
url = url.replace(/%2f/g,'/');
var path = url.replace(/\//g,'.');
var filePath = config.prefixPath + path;
client.on('ready',function(){
	client.get(url,function(err,stream){
		if(err||!stream){
			res.status(404).end("fileDoesNotExist");
		}
		else{
			stream.once('close',function(){client.end()});
		    stream.pipe(fs.createWriteStream(filePath));
		    stream.on('finish',function(){
			var fileName = url.substring(url.lastIndexOf('/')+1,url.length);
			var result = fs.readFile(filePath,function(err,result){
				fs.unlink(filePath);
    			result=JSON.parse(JSON.stringify(result));
				var json = {
					"fileContent":result,
					"fileName":fileName
				}
				res.end(JSON.stringify(json));
			});
		});
		}

	});
});
client.connect(config);
}


