//const mongoose = require('mongoose');
//mongoose.connect('mongodb+srv://shareBike:thehorn@cluster0.ttg28.mongodb.net/shareBike?retryWrites=true&w=majority');


const mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var db;


module.exports = {
    connect: function (callback) {
        MongoClient.connect('mongodb+srv://G12:ER2122@engrequisitos.2rjhd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true },function (err, database) {
            console.log('Connected the database on port 27017');
            db = database.db('G12');
            callback(err);
    })},
    getDB:function(){
        return db;
    }
}