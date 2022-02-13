const map = require("../model/map.model")

function getBikes(req, res, controllerCallBack) {
    map.getBikes(controllerCallBack)

}



function getChargingPosts(req, res, callback) {
    map.getChargingPosts(function(postsResult){
       // res.render('map', {posts: postsResult})
      //  console.log(postsResult.bikes[0].model)
        callback(postsResult)
         })
}


module.exports = {
    getBikes,
    getChargingPosts,

}