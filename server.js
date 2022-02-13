const express = require('express')
const app = express()

const mongoConfigs = require("./mongoConfigs");
const user = require("./controller/user.controller")
const userModel = require("./model/user.model")
const map = require("./controller/map.controller")
const trip = require("./controller/trip.controller")

const bodyparser = require('body-parser')

app.use(bodyparser.json()) //
app.use(bodyparser.urlencoded({extended:true})) //

const ejs = require('ejs')
app.set('view engine', 'ejs');

const path = require("path");
app.use("/public", express.static(path.join(__dirname,'public')));// Para poder usar o css
app.use('/images', express.static(path.join(__dirname,'public/images')));
app.use('/js', express.static(path.join(__dirname,'public/js')));
app.use('/icons', express.static(path.join(__dirname,'public/icons')));




const session = require("express-session");
const {v4:uuidv4} =require('uuid');
const Console = require("console");

// Configuração das sessões
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}))




// -------------------------- GET's ------------------------------

app.get('/', function(req, res) {
    //map.getChargingPosts(req, res)
    if (req.session.user) {
        res.redirect('dashboard');
    }
    else {
        map.getChargingPosts(req, res, function (postsResult){
            res.render('index', {title: "ShareBike", posts: postsResult});
        })
    }
});

app.get('/registo', function (req, res) {
    res.render('registo',{erros: []});
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/dashboard', function (req, res) {
    if (req.session.user) {
        map.getChargingPosts(req, res, function (postsResult){
            trip.getTripbyUser(req, res,function(err,result){
                console.log(result)
                console.log(req.session.user[0]._id)
                res.render('dashboard', {title: "Dashboard", posts: postsResult, user: req.session.user, aluguer: result});
            })
        })
    }
    else {
        res.redirect('/login');
    }
});

app.get('/map', function (req, res) {
    map.getChargingPosts(req, res, function (postsResult){
        res.render('map', {posts: postsResult});
    });
});

app.get('/iniciarViagem', function(req, res) {
    if (req.session.user[0].saldo >= 5 ) {
        res.render('startTrip')
    }
    else {
        var string = encodeURIComponent('insuficientCash');
        res.redirect('/dashboard?error=' + string);

    }
});

app.get('/terminarViagem', function(req, res) {
    res.render('finishTrip')
});



// -------------------------- POST's ------------------------------
app.post('/login', function (req, res) {
    user.login(req,function (result){
        if (result.length == 0){  // Se o resultado está vazio, não encontrou nenhum user
            console.log("não existe nenhum utilizador com este username")
            res.render('login',{falha:"Email fornecido não se encontra registado"})
        }
        else{
            //var user = req.session;
            req.session.user = result[0]  // passando para a varíavel de sessão as informações do user
            console.log("user na sessão: ", req.session.user)
            if (req.session.user.password == req.body.password) {
                req.session.user = result;

                res.redirect('/dashboard');

                console.log("Login com sucesso")
                //res.render('./porfile', {user:req.session.user}) // user neste caso é a variável passada para o ficheiro ejs
            }
            else{
                console.log("Password errada")
                res.render('login',{falha:"Email ou Password incorreto"})
            }
        }
    })
})

app.post('/registar', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirmation = req.body.passwordConfirmation;
    var birthdate = req.body.birthdate;
    var name = req.body.name;



    var erros = []

    if(user.ageCalc(birthdate) < 16){
        erros.push({texto: "Não tem idade para se registar"})
    }
    else{
        if((!birthdate || typeof birthdate == undefined || birthdate == null)  ) {
            erros.push({texto: "Data de nascimento inválida"})
        }
    }
    if(!name || typeof name == undefined || name == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!username || typeof username == undefined || username == null){
        erros.push({texto: "Email inválido"})
    }
    if(!password || typeof password == undefined || password == null){
        erros.push({texto: "Password inválida"})
    }
    if(passwordConfirmation != password){
        erros.push({texto: "Passwords não são iguais"})
    }

    userModel.getUser(function (result){
        if(result.length > 0){ // se o tamanho do array for 1, significa que encontrou um user com o mesmo username
            erros.push({texto: "Já existe um utilizador registado com este username"})
        }

        //console.log(result)
        if(erros.length > 0) {
            //console.log("Erro no registo: ")
            console.log(erros)
            //res.end();
            res.render('./registo', {erros: erros})

        }
        else {
            userModel.insertUser(name, username, password, birthdate)
            res.render('./login', );
        }

    }, req.body.username)  // segundo parametro da função getuser

})



app.get('/logout',(req,res) => {
    req.session.destroy(function (err){
        if (err){
            console.log(err);
            res.send('Error')
        }else{
            res.render('login',{title:'Login'})
        }
    })
})

app.post('/iniciarViagem/:bikeID',function(req,res){
     trip.startTrip(req,res)
    //console.log("Viagem iniciada " + req.params.bikeID);
    });

app.post('/terminarViagem/:bikeID',function(req,res){
    trip.finishTrip(req,res)
    //console.log("Viagem terminada " + req.params.bikeID);
});


app.post('/pagar/:tripID',function(req,res){
    trip.makePayment(req, res)
});


app.post('/reservar/:bikeID/:postID',function(req,res){
    if (req.session.user) {
        trip.insertReserve(req, res)
    }
    else {
        var string = encodeURIComponent('noLoggin');
        res.redirect('/dashboard?error=' + string);

    }

});


// Conexão
mongoConfigs.connect(function(err){
    if(!err){
        app.listen(3000,function(){
            console.log("Express web server listening on port 3000");

        });
    }
})