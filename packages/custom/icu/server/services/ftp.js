var Client = require('ftp');
var fs = require('fs');

var mean = require('meanio');
var config = mean.loadConfig().ftp;
var con = mean.loadConfig();
var exec = require('child_process').exec;

function decode(uri){
	return uri.replace(/\ /g,'\\ ').replace(/\'/g,'\\\'').replace(/\"/g,'\\\"').replace(/\(/g,'\\\(')
            	.replace(/\)/g,'\\\)').replace(/\#/g,'\\\#').replace(/\&/g,'\\\&').replace(/\`/g,'\\\`').replace(/\~/g,'\\\~')
            	.replace(/\,/g,'\\\,').replace(/\%/g,'\\\%').replace(/\$/g,'\\\$').replace(/\./g,'\\\.').replace(/\;/g,'\\\;')
            	.replace(/\:/g,'\\\:').replace(/\//g,'\\\/').replace(/\!/g,'\\\!').replace(/\_/g,'\\\_').replace(/\#/g,'\\\#');
}

function getFromFTPByURL(url,downloadAndDelete){

	return new Promise(function(fulfill,reject){
		var getClient = new Client();
		var path = url.replace(/\//g,'_');
		var filePath = "./files/00/00/00/"+path;
		getClient.on('ready',function(){
			getClient.get(url,function(err,stream){
				if(err||!stream){
					getClient.end();
					reject(err);
				}
			else{
				stream.once('close',function(){});
		    	stream.pipe(fs.createWriteStream(filePath));
		    	stream.on('finish',function(){
				var fileName = url.substring(url.lastIndexOf('/')+1,url.length);
				var result = fs.readFile(filePath,function(err,result){
					if(err){
						reject(err);
					}
					if(downloadAndDelete){
						try{
							if(fs.existsSync(filePath)){
          					fs.unlinkSync(filePath)
          				}
          				}catch(e){
          					console.log(e);
          				};
					}
					getClient.end();
					try{
						result=JSON.parse(JSON.stringify(result));
					}
					catch(e){
						reject(e);
					}
    				
					var json = {
						"fileContent":result,
						"fileName":fileName,
						"pathForView":filePath.substring(1,filePath.length)
					}
					
					fulfill(JSON.stringify(json));
				});
				});
			}
	});
});
getClient.on('error',function(err){
	console.log(err)
})

getClient.connect(config);

	});
};


function uploadToFTP(path,onlyPDF,pdfURL){
	return new Promise(function(fulfill,reject){
	var uploadClient = new Client();
	var ftpPath = path.substring(path.indexOf('files/'),path.length);
    var pdf = con.root + path.substring(path.lastIndexOf("/"), path.lastIndexOf(".")) + ".pdf";
	var pdfFTPPath = ftpPath.substring(ftpPath.indexOf('/'),ftpPath.lastIndexOf('.'));
	pdfFTPPath = 'preview'+pdfFTPPath+".pdf";
	var folder = ftpPath.substring(0,ftpPath.lastIndexOf('/'));
	var folderPreview = folder.replace('files','preview');


if(onlyPDF){
		uploadClient.on('ready',function(){
          // Make the convert from it's origin type to pdf
            path = decode(path);
          	exec('sudo lowriter --headless --convert-to pdf ' + path, function (err, stout, sterr){
          	if (err) {
          		uploadClient.end();
          		reject(err);
          	} else {
          		var pdfPath = stout.substring(stout.indexOf('->')+3,stout.lastIndexOf('.pdf')+4);
          		uploadClient.mkdir(folderPreview,true,function(){
          			var pdfDir = pdfURL.substring(0,pdfURL.lastIndexOf('\/'));
          			uploadClient.mkdir(pdfDir,true,function(){
          				          			uploadClient.put(pdf,pdfURL,function(err){
          				//fs.unlinkSync(pdf);
          				if(err){
          					uploadClient.end();
          					reject(err);
          				}
          				else{
          					pdfFilesPath ="./files/00/00/00/"+ pdf.substring(pdf.lastIndexOf('/')+1,pdf.length);
          					decodedPdf = decode(pdf);
          					decodedFilesPath = decode(pdfFilesPath);
          					exec('sudo mv ' + decodedPdf +  ' ' + decodedFilesPath , function (err, stout, sterr){
          						uploadClient.end();
                    			if (err) {
                        			reject(err);
                    			} else { 
          							fulfill(pdfFilesPath.substring(1,pdfFilesPath.length));
                    			}
                			});	
          				}
          			});

          			});

          	});
          	}
      		});
	});
}
else{
	uploadClient.on('ready',function(){
		uploadClient.mkdir(folder,true,function(){
			uploadClient.put(path,ftpPath,function(err){
          // Make the convert from it's origin type to pdf
 			path = decode(path);
          	exec('sudo lowriter --headless --convert-to pdf ' + path, function (err, stout, sterr){
          	if (err) {
          		uploadClient.end();
          		reject(err);
          	} else {
          		var pdfPath = stout.substring(stout.indexOf('->')+3,stout.lastIndexOf('.pdf')+4);
          		uploadClient.mkdir(folderPreview,true,function(){
          			uploadClient.put(pdf,pdfFTPPath,function(err){
          				try{
          					if(fs.existsSync(pdf)){
          						fs.unlinkSync(pdf);
          					}
          					
          				}catch(e){
          					console.log(e);
          				}
          				if(err){
          					uploadClient.end();
          					reject(err);
          				}
          				else{
          					uploadClient.end();
          					fulfill("ok");
          				}
          			});
          	});
          	}
      		});
			});
		});
	});
	uploadClient.on('error',function(err){
		console.log(err)
	})
}
try{
	uploadClient.connect(config);
}catch(err){
	console.log(err)
}
})}

//For old attachments
function uploadPDFOfFile (fileUrl,pdfURL){
	return new Promise(function(fulfill,reject){
		var getClient = new Client();
		var path = fileUrl.replace(/\//g,'_');
		var filePath = "./files/00/00/00/"+path;

		getClient.on('ready',function(){
			getClient.get(fileUrl,function(err,stream){
				if(err||!stream){
					getClient.end();
					reject(err);
				}
			else{
				stream.once('close',function(){});
		    	stream.pipe(fs.createWriteStream(filePath));
		    	stream.on('finish',function(){
		    		uploadToFTP(filePath,true,pdfURL).then(function(result){
		    			try{
		    				if(fs.existsSync(filePath)){
		    				fs.unlinkSync(filePath);
		    			}
		    			}catch(err){
		    				console.log(err);
		    			}
		    			fulfill(result);
		    		}).catch(function(err){
		    			reject(err);
		    		})
				});
			}
	});
});
getClient.on('error',function(err){
	console.log(err)
})
getClient.connect(config);

	});
}


exports.getFileFromFtp = function(req,res,next){
	var url=req.params.url,docType="docx";
	var downloadAndDelete=true;
	if(url.indexOf('&docType=')!=-1){
		downloadAndDelete=false;
		url = req.params.url.substring(0,req.params.url.lastIndexOf('&docType='));
		docType = req.params.url.substring(req.params.url.lastIndexOf('=')+1,req.params.url.length);
	}
	url = url.replace(/%2f/g,'/');
	
	getFromFTPByURL(url,downloadAndDelete).then(function(data){
	res.end(data);
}).catch(function(){
	if(url.startsWith('preview')){
		var realFilePath = url.replace("preview","files").replace('.pdf','.'+docType);

		uploadPDFOfFile(realFilePath,url).then(function(result){
			var json = {
						"pathForView":result
					}
			res.end(JSON.stringify(json));
		}).catch(function(err){
			res.status(500).end('error');

		});
	}
	else{
			res.status(404).end("fileDoesNotExist");
	}
});
}

function archiveFileFromFtp(url){
	return new Promise(function(fulfill,reject){
		var newUrl = url+".deleted";
		var archiveClient = new Client();
		archiveClient.on('ready',function(){
			archiveClient.rename(url,newUrl,function(err){
				archiveClient.end();
				if(err){
					reject(err);
				}
				else{
					fulfill("ok");
				}
			});
		});
		archiveClient.on('error',function(err){
			console.log(err)
		})
		archiveClient.connect(config);
	});
}


function deleteFileFromFtp(url){
	return new Promise(function(fulfill,reject){
		var deleteClient = new Client();
		deleteClient.on('ready',function(){
			deleteClient.delete(url,function(err){
				deleteClient.end();
				if(err){
					reject(err);
				}
				else{
					fulfill("ok");
				}
			});
		});
		deleteClient.on('error',function(err){
			console.log(err)
		})
		deleteClient.connect(config);
	});
}


exports.getFromFTPByURL=getFromFTPByURL;
exports.archiveFileFromFtp=archiveFileFromFtp;
exports.uploadToFTP=uploadToFTP;
exports.deleteFileFromFtp=deleteFileFromFtp;