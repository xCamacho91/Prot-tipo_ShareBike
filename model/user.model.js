const mongoConfigs = require('../mongoConfigs');


function insertUser(name, username, password, birthdate, callback){
    var db = mongoConfigs.getDB();
    db.collection('users').insertOne({nome:name,email:username,password:password, birthdate: birthdate},function(err,result){

        callback(err,result);
    });
}


function getUser(callback, username){
    var db = mongoConfigs.getDB();
    db.collection('users').find({email:username}).toArray(function(err,result){

        callback(result);  // quando a função for chamada noutra função, o que colocar dentro do argumento, terá o valor de result (??)

    });
}

function getUsers(callback){
    var db = mongoConfigs.getDB();
    db.collection('users').find().toArray(function(err,result){

        callback(err,result);

    });
}




module.exports = {
    insertUser,
    getUser,
    getUsers,

}