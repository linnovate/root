var mongoose = require('mongoose');
var Serial = mongoose.model('Serial');
//var logger = require('../services/logger')

exports.incrementSeq = function(){
	return new Promise(function(fulfill,reject){
		Serial.findOneAndUpdate({_id:'serialSeq'},{$inc:{seq:1}},{returnNewDocument:true}).then(function(doc){
			fulfill(doc.seq);
		}).catch(function(err){
		   // logger.log('error', ' incrementSeq, %s', ' Serial.findOneAndUpdate', {error: err.stack});
		    reject(-1);
		});
	});_
}


exports.popFromAvailableSerials = function(){
	return new Promise(function(fulfill,reject){
		Serial.findOne({_id:'serialSeq'}).then(function(doc){

		if(doc.availableSerials && doc.availableSerials.length>0){

			var topSerial = doc.availableSerials[0];
			Serial.update({_id:'serialSeq'},{'availableSerials':doc.availableSerials.slice(1,doc.availableSerials.length)},{},function(err,numAffected){
				if(err){
					//	logger.log('error', '%s pushToAvailableSerials, %s', req.user.name, ' Serial.update', {error: err.stack});
		    		reject(-1);
				}
				else{
					fulfill(topSerial);
				}
			});	
		}
		else{
			reject(-1);
		}
	}).catch(function(err){
		//	logger.log('error', '%s popAvailableSerial, %s', req.user.name, ' Serial.findOneAndUpdate', {error: err.stack});
		    reject(-1);
	})
	});

}

exports.pushToAvailableSerials = function(serial){
	return new Promise(function(fulfill,reject){
		Serial.update({_id:'serialSeq'},{$addToSet:{availableSerials:serial}},{},function(err,numAffected){
			if(err){
			//	logger.log('error', '%s pushToAvailableSerials, %s', req.user.name, ' Serial.update', {error: err.stack});
		    	reject(-1);
			}
			else{
				fulfill('ok');
			}
		});
	});

}

