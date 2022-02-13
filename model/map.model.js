const mongoConfigs = require("../mongoConfigs");
const {ObjectID} = require("mongodb");

function getBikes(modelCallback){  //
    var db = mongoConfigs.getDB();
    db.collection('bikes').find().toArray(function(err,result){

        modelCallback(result);


       // console.log(result)

    });
}

function getBikeByID(bikeID,callback){
    var db = mongoConfigs.getDB();
    var ObjectID = require('mongodb').ObjectID
    ObjectID.isValid(bikeID)  // https://www.deviantdev.com/journal/check-objectid-is-valid
    db.collection('bikes').find({"_id": ObjectID(bikeID)}).toArray(function(err,result){
        callback(result);
        //console.log(result)
    });
}

function getChargingPosts(callback){  //
    var db = mongoConfigs.getDB();
    db.collection('chargePosts').find().toArray(function(err,result){

        callback(result);

    });
}

function getChargingPostByID(postID, callback){  //
    var db = mongoConfigs.getDB();
    var ObjectID = require('mongodb').ObjectID
    db.collection('chargePosts').find({"_id": ObjectID(postID)}).toArray(function(err,result){

        callback(result);

    });
}

function insertBikeInPost(bicicleta, postID, callback){
    var db = mongoConfigs.getDB();
    var ObjectID = require('mongodb').ObjectID;

    // docs.mongodb.com/drivers/node/fundamentals/crud/write-operations/embedded-arrays/
    const query = {"_id": ObjectID(postID)} ;
    const updateDocument = {$push: {bikes : bicicleta}}

    db.collection('chargePosts').updateOne(query, updateDocument, function (result, err) {
        callback(result, err);
    });
}


module.exports = {
    getBikes,
    getChargingPosts,
    getBikeByID,
    insertBikeInPost,
    getChargingPostByID,


}