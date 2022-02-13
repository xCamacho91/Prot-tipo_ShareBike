const mongoConfigs = require("../mongoConfigs");
const {ObjectID} = require("mongodb");



function insertTrip(id_utilizador, id_bicicleta, data_inicio, data_fim, callback){

    var db = mongoConfigs.getDB();
    db.collection('trips').insertOne({id_utilizador:id_utilizador,id_bicicleta:id_bicicleta, data_inicio: data_inicio, data_fim: data_fim, ativo:true },
        function(err,result){
            callback(result,err);
    });
}


function updateBikeState(id_bicicleta, state, callback) {
    var db = mongoConfigs.getDB();
    var ObjectID = require('mongodb').ObjectID;

    // docs.mongodb.com/drivers/node/fundamentals/crud/write-operations/embedded-arrays/
    const query = {"_id": ObjectID(id_bicicleta)} ;
    const updateDocument = {$set: {state : state}}

    db.collection('bikes').updateOne(query, updateDocument, function (result, err) {
        callback(result, err);
    });

}


function deleteBikeFromPost(id_bicicleta, callback) {
    var ObjectID = require('mongodb').ObjectID;
    var db = mongoConfigs.getDB();

    db.collection('chargePosts').updateMany({}, {$pull: {"bikes": {"_id": ObjectID(id_bicicleta)}}}, function (result) {
        callback(result);
    })

}


function finishTrip (id_bicicleta, data_fim, callback) {
   // var ObjectID = require('mongodb').ObjectID;
    var db = mongoConfigs.getDB();

    const query = {"id_bicicleta": id_bicicleta, "ativo" : true};
    const updateDocument = {$set: {ativo: false, data_fim: data_fim}}

    // https://stackoverflow.com/questions/53344249/how-to-get-object-id-of-updated-document-in-mongoose
    db.collection('trips').findOneAndUpdate(query, updateDocument, function (err, result) {  // vai fazer update apenas do primeira viagem que encontrar com o ID da bicicleta
        //console.log(result.value._id)                                                                                                     // updateMany iria atualizar outras viagens que tivessem a mesma bicicleta
        callback(err, result);

    });
}


function getTripByID(tripID,callback){
    var db = mongoConfigs.getDB();
    var ObjectID = require('mongodb').ObjectID

    //ObjectID.isValid(tripID)  // https://www.deviantdev.com/journal/check-objectid-is-valid
    db.collection('trips').find({"_id": ObjectID(tripID)}).toArray(function(err,result){
        // console.log(result)

        callback(err, result);
    });
}


function insertPrice (tripID, cost, callback){
    var db = mongoConfigs.getDB();

    const query = {"_id": tripID};
    const updateDocument = {$set: {pago: false, custo: cost}}

    db.collection('trips').findOneAndUpdate(query, updateDocument, function (err, result) {

        callback(err, result);
    });
}


function balanceUpdate (id_utilizador, newBalance, callback){ // atualiza o saldo na tabela USER
    var db = mongoConfigs.getDB();
    var ObjectID = require('mongodb').ObjectID

    const query = {"_id": ObjectID(id_utilizador)};
    const updateDocument = {$set: {saldo: newBalance}}

    db.collection('users').findOneAndUpdate(query, updateDocument, function (err, result) {  // vai fazer update apenas do primeira viagem que encontrar com o ID da bicicleta
        callback(err, result);
    });
}


function updatePaymentState (tripID, callback){         // muda o estado de pago: TRUE na tabela TRIPS
    var db = mongoConfigs.getDB();
    var ObjectID = require('mongodb').ObjectID

    const query = {"_id": ObjectID(tripID)};
    const updateDocument = {$set: {pago: 'true'}}

    db.collection('trips').findOneAndUpdate(query, updateDocument, function (err, result) {  // vai fazer update apenas do primeira viagem que encontrar com o ID da bicicleta
        callback(err, result);
    });
}


function getTripbyUser(userId, callback){
    var db = mongoConfigs.getDB();

    db.collection('trips').find({"id_utilizador": userId, "ativo":true}).toArray(function(err,result){
        callback(err, result);
    });
}




function insertReserve(id_utilizador, id_bicicleta, data_inicio, callback){

    var db = mongoConfigs.getDB();
    db.collection('reserves').insertOne({id_utilizador:id_utilizador,id_bicicleta:id_bicicleta, data_inicio: data_inicio, ativo:true },
        function(err,result){
            callback(result,err);
        });
}

module.exports = {
    insertTrip,
    updateBikeState,
    deleteBikeFromPost,
    finishTrip,
    getTripByID,
    insertPrice,
    balanceUpdate,
    updatePaymentState,
    getTripbyUser,
    insertReserve,


}