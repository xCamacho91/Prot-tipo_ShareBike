const user = require('../model/user.model');


function login (req, callback){
    user.getUser(callback, req.body.username);
}


function ageCalc(dateString){

    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;

}


module.exports = {
    login,
    ageCalc,
}