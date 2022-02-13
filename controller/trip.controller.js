const trip = require("../model/trip.model")
const user = require("../model/user.model")
const map = require("../model/map.model")
const mongoConfigs = require("../mongoConfigs");

function getDateNow(){  // '0' e slice(-2) usados para colocar os zeros nas datas
    var today = new Date();
    var date = today.getFullYear() + '-' + ('0'+(today.getMonth()+1)) + '-' + ('0'+today.getDate()).slice(-2);
    var time = ('0'+today.getHours()).slice(-2) + ":" + ('0'+today.getMinutes()).slice(-2) + ":" + ('0'+today.getSeconds()).slice(-2);
    var dateTime = (date+' '+time)
    return dateTime
}


function startTrip (req, res, callback) {

        trip.insertTrip(req.session.user[0]._id, req.params.bikeID, getDateNow(), '', function () {   // COLOCAR AQUI O ID DO UTILIZADOR DA VARIÁVEL DE SESSÃO
            trip.updateBikeState(req.params.bikeID, 'Em utilização', function () {
                trip.deleteBikeFromPost(req.params.bikeID, function () {
                    res.redirect('/dashboard');
                })

            })
        })


}


function finishTrip(req, res){
    trip.finishTrip(req.params.bikeID, getDateNow(), function (err, finishTripResult){       // finishTripResult contem o ID da viagem atualizada
       var id_trip = finishTripResult.value._id

        trip.updateBikeState(req.params.bikeID, 'Em carregamento', function (){

            trip.getTripByID(id_trip, function (err, getTripByIDResult) {           // getTripByIDResult contem as informações todas da viagem

               // console.log('getTripByIDResult ' + getTripByIDResult[0].data_inicio)

                var inicio = new Date(getTripByIDResult[0].data_inicio)
                var fim = new Date(getTripByIDResult[0].data_fim)

                var tempo_viagem = fim.getTime() - inicio.getTime()
                    tempo_viagem = Math.floor(tempo_viagem / 60000); //converter de MS para min

                var custo = 0.10 * tempo_viagem


                trip.insertPrice(id_trip, custo, function (err, result){                // guarda o preço e coloca o estado do pagamento como false na base de dados

                    map.getBikeByID(req.params.bikeID, function (GetBikeByIDResult) {       //

                        map.insertBikeInPost(GetBikeByIDResult[0], '61ccafc4576b5ef6e73cb9a0', function (){


                            trip.getTripByID(id_trip, function (err, getTripByIDResult) {       // obtém novamente os dados da viagem para fazer render da página de pagamento
                                res.render('payment', {tripResult: getTripByIDResult})
                            })

                        })
                    })
                })
            })

        })

    })
}


function makePayment(req, res){

    if (req.session.user) {
        trip.getTripByID(req.params.tripID, function (err, getTripByIDResult) {         // para obter o custo da viagem
            var custo = getTripByIDResult[0].custo

            var saldoAtual = req.session.user[0].saldo
            var saldoAtualizado = saldoAtual - custo


            trip.balanceUpdate(req.session.user[0]._id, saldoAtualizado, function () {

                trip.updatePaymentState(req.params.tripID, function () {

                    user.getUser(function (getUserResult) {   // atualiza as informações do user na variável de sessão (para mostrar o novo saldo)

                        req.session.user[0].saldo = getUserResult[0].saldo
                        res.redirect('/dashboard');
                    }, req.session.user[0].email)

                })

            })
        })
    }
    else {
        res.redirect('/login');
    }
}



function getTripbyUser(req, res, callback){
    console.log(req.session.user[0]._id);
    trip.getTripbyUser(req.session.user[0]._id, callback);
}

function insertReserve(req,res){
    map.getChargingPostByID(req.params.postID, function (chargingPostByIDResult){
        var bicicletasDisponiveis = 0
        for (var i = 0; i < chargingPostByIDResult[0].bikes.length; i++) {  // conta bicicletas disponiveis
            if (chargingPostByIDResult[0].bikes[i].state == 'Em carregamento') {
                bicicletasDisponiveis++
            }
        }


        if (bicicletasDisponiveis > 2) {

            trip.insertReserve(req.session.user[0]._id, req.params.bikeID, getDateNow(), function (){
                trip.updateBikeState(req.params.bikeID, 'Reservada', function (){

                    map.getBikeByID(req.params.bikeID, function (GetBikeByIDResult) {       // obtem a bicicleta para inserir na proxima funçao

                        trip.deleteBikeFromPost(req.params.bikeID, function (){

                            map.insertBikeInPost(GetBikeByIDResult[0], req.params.postID, function (){
                                res.redirect('/dashboard')
                            })

                        })
                    })
                })
            })
        }
        else {
            var string = encodeURIComponent('insuficientBikes');
            res.redirect('/dashboard?error=' + string);
            //res.redirect('/dashboard')
        }

    })
}



module.exports = {
    startTrip,
    finishTrip,
    makePayment,
    getTripbyUser,
    insertReserve,
}