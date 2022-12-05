var ntickets = 0;
var tresolvidos = 0;

const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require('./models/user');
const Ticket = require('./models/ticket');
const Faq = require('./models/faq');
const msgRapida = require('./models/msgRapida');
const { render } = require('ejs');
const { randomInt } = require('crypto');
const { count } = require('console');

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut;

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;
const db = mongoose.connection;

const sessionMiddleware = session({ secret: "changeit", resave: false, saveUninitialized: false });

app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(passport.initialize());
app.use(passport.session());


const DBW4 = 'mongodb+srv://DBW4:W1TyDvKcJgbJdmgm@clusterdbw.1dbjr.mongodb.net/DBW4?authSource=admin&replicaSet=atlas-bek8xj-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true';
mongoose.connect(DBW4, { useNewUrlParser: true, useUnifiedTopology: true}) 
    .then((result) => server.listen(port, () => {
        console.log(`Application is running at: http://localhost:${port}`);
        console.log('Connected!');
    }))
    .catch((err) => console.log('Not Connected!'))

app.use(express.static(__dirname + '/public'));

app.set('view engine','ejs');

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

function contarTickets() {
    var query = Ticket.find({ estado: 'Aberto' });
        query.count(function (err, count) {
        if (err) console.log(err)
        else ntickets = count;
    });
}



app.get('/', (req,res) => {
    contarTickets();
    User.findOne()
    .then((result) => {
        res.render('index', { isAuthenticated: !!req.user, users: result, ntickets: ntickets});
    })
    .catch((err) =>{
        console.log(err);
    });
});


app.get('/tickets/', function (req,res) {
    contarTickets();
    Ticket.find()
    .then((result) => {
        User.find()
        .then((result1) => {
            res.render('tickets',{ isAuthenticated: !!req.user, tickets: result, users: result1, ntickets: ntickets});
        })
        
    })
    .catch((err)=>{
        console.log(err);
    })
});

app.get('/criartickets/', function (req,res) {
    contarTickets();
    User.find()
    .then((result) => {
        res.render('criartickets',{ isAuthenticated: !!req.user, users: result, ntickets: ntickets });
    })
    .catch((err)=> {
        console.log(err);
    });
});


app.get('/tickets/fechado', (req,res) => {
    contarTickets();
    Ticket.find({ estado: 'Fechado' })
    .then((result) => {
        User.find()
        .then((result2) => {
            res.render('tickets',{ isAuthenticated: !!req.user, tickets: result, users: result2, ntickets: ntickets});
        })
        
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/tickets/aberto', (req,res) => {
    contarTickets();
    Ticket.find({ estado: 'Aberto' })
    .then((result) => {
        User.find()
        .then((result2) => {
            res.render('tickets',{ isAuthenticated: !!req.user, tickets: result, users: result2, ntickets: ntickets});
        })
        
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/tickets/nome', (req,res) => {
    const id = req.params.id;
    contarTickets();
    Ticket.findby({ estado: 'Aberto' })
    .then(result => {
        res.render('tickets', { isAuthenticated: !!req.user, tickets: result, ntickets: ntickets });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.post("/tickets/delete/:id", (req,res) => {
    contarTickets();
    const id = req.params.id;
    Ticket.findByIdAndDelete(id)
    .then((result) => {
        User.find()
        .then((result1)=> {
            res.redirect('/tickets');
            res.render('tickets', { isAuthenticated: !!req.user, tickets: result, users: result1, ntickets: ntickets});
        })
    })
    .catch((err) =>{
        console.log(err);
    })
});



app.post("/tickets/edit/:id", (req,res)=>{
    const tickets = new Ticket(req.body);
    const id = req.params.id;
    tickets.save()
    .then((salvo) => {
        Ticket.find()
        .then((result) => {
            User.find()
            .then((result1) => {
                Ticket.findOneAndUpdate(id, { 
                    titulo: result.titulo, 
                    descricao: result.descricao,
                    email: result.email,
                    resposta: result.resposta, 
                    estado: result.estado, 
                    agente: result.agente })
                .then((result2) => {
                    Ticket.findByIdAndDelete(id)
                    .then((result3)=>{
                        res.redirect('/tickets');
                        res.render('tickets', { isAuthenticated: !!req.user, tickets: result, users: result1, ntickets: ntickets});
                    }) 
                })
            })
        })
    })
    .catch((err) =>{
        console.log(err);
    })
})


app.get('/login/', function (req,res) {
    res.sendFile(__dirname + "/html/login.html");
});

app.get('/registo', function (req,res) {
    res.sendFile(__dirname + "/html/registo.html");
});

app.get('/atendimento/', function (req,res) {
    res.sendFile(__dirname + "/html/atendimento.html");
});

app.get('/atendimento/transporte', function(req,res) {
    contarTickets();
    User.findOne()
    .then((result) => {
        msgRapida.find({ agente: result.nome })
        .then((result2) => {
            res.render('transporte', { 
                isAuthenticated: !!req.user, 
                users: result, 
                msgrapidas: result2, 
                ntickets: ntickets, 
                title: 'Transporte' });
        })
  
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/atendimento/bagagem', function (req,res) {
    contarTickets();
    User.findOne()
    .then((result) => {
        res.render('bagagem', { isAuthenticated: !!req.user, users: result, ntickets: ntickets, title: 'Bagagem' });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/atendimento/servicos', function (req,res) {
    contarTickets();
    User.findOne()
    .then((result) => {
        res.render('servicos', { isAuthenticated: !!req.user, users: result, ntickets: ntickets, title: 'Servicos' });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/atendimento/mobilidade_reduzida', function (req,res) {
    contarTickets();
    User.findOne()
    .then((result) => {
        res.render('mobilidade_reduzida', { isAuthenticated: !!req.user, users: result, ntickets: ntickets, title: 'Mobilidade Reduzida' });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/atendimento/voos', function (req,res) {
    contarTickets();
    User.findOne()
    .then((result) => {
        res.render('voos', { isAuthenticated: !!req.user, users: result, ntickets: ntickets, title: 'Voos' });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/atendimento/outros', function (req,res) {
    contarTickets();
    User.findOne()
    .then((result) => {
        res.render('outros', { isAuthenticated: !!req.user, users: result, ntickets: ntickets, title: 'Outros' });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/profile/:id', (req,res) => {
    contarTickets();
    const id = req.params.id;
    User.findById(id)
    .then((result) => {
        Ticket.find({ estado: 'Fechado' , agente: result.nome }).count()
        .then((result2) => {
            tresolvidos = result2;
            msgRapida.find( { agente: result.nome } )
            .then((result3) => {
                res.render('profile', { 
                    isAuthenticated: !!req.user, 
                    users: result, 
                    msgrapidas: result3, 
                    ntickets: ntickets, 
                    tresolvidos: tresolvidos
                });
            })
        })
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/faq/', function (req,res) {
    contarTickets();
    Faq.find()
    .then((result) =>{
        res.render('faq',{ isAuthenticated: !!req.user, faqs: result, ntickets: ntickets });
    })
    .catch((err)=>{
        console.log(err);
    })
});

app.get('/criarfaqs/', function (req,res) {
    contarTickets();
    Faq.find()
    .then((result) => {
        res.render('criarfaqs',{ isAuthenticated: !!req.user, faqs: result, ntickets: ntickets });
    })
    .catch((err)=> {
        console.log(err);
    });
});

app.get('/faq/aerobus', (req,res) => {
    contarTickets();
    Faq.find({ categoria: 'Aerobus' })
    .then(result => {
        res.render('faq', { isAuthenticated: !!req.user, faqs: result, ntickets: ntickets });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/faq/servicos', (req,res) => {
    contarTickets();
    Faq.find({ categoria: 'Serviços e Compras' })
    .then(result => {
        res.render('faq', { isAuthenticated: !!req.user, faqs: result, ntickets: ntickets });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/faq/bagagem', (req,res) => {
    contarTickets();
    Faq.find({ categoria: 'Bagagem' })
    .then(result => {
        res.render('faq', { isAuthenticated: !!req.user, faqs: result, ntickets: ntickets });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/faq/voos', (req,res) => {
    contarTickets();
    Faq.find({ categoria: 'Voos' })
    .then(result => {
        res.render('faq', { isAuthenticated: !!req.user, faqs: result, ntickets: ntickets });
    })
    .catch((err) =>{
        console.log(err);
    });
});

app.get('/faq/mobilidade_reduzida', (req,res) => {
    contarTickets();
    Faq.find({ categoria: 'Mobilidade Reduzida' })
    .then(result => {
        res.render('faq', { isAuthenticated: !!req.user, faqs: result, ntickets: ntickets });
    })
    .catch((err) =>{
        console.log(err);
    });
});


app.post("/faq/delete/:id", (req,res) => {
    contarTickets();
    const id = req.params.id;
    Faq.findByIdAndDelete(id)
    .then((result) => {
        res.redirect('/faq');
        res.render('faq', { isAuthenticated: !!req.user, faqs: result, ntickets: ntickets });
    })
    .catch((err) =>{
        console.log(err);
    })
});

app.post("/faq/edit/:id", (req,res)=>{
    const faqs = new Faq(req.body);
    const id = req.params.id;
    faqs.save()
    .then((salvo) => {
        Faq.find()
        .then((result) => {
            Faq.findOneAndUpdate(id, { 
                categoria: result.titulo, 
                pergunta: result.pergunta,
                resposta: result.resposta,
            })
            .then((result2) => {
                Faq.findByIdAndDelete(id)
                .then((result3)=>{
                    res.redirect('/faq');
                    res.render('faq', { isAuthenticated: !!req.user, tickets: result, ntickets: ntickets});
                }) 
            })
        })
    })
    .catch((err) =>{
        console.log(err);
    })
})

app.get('/add-faq', (req,res) => {
    const faq = new Faq({
        titulo: "ola",
        pergunta: "ola",
        resposta: "adeus",
        categoria: "Bagagem"
    });
    faq.save()
    .then((result) => {
        res.send(result)
    })
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
}));

app.post("/registo",function(req,res){
    const user = new User(req.body);
    user.save()
    .then((result) => {
        res.redirect('/login');
    })
    .catch((err) => {
        console.log(err);
    });
});

app.post("/logout", (req, res) => {
    console.log(`logout ${req.session.id}`);
    const socketId = req.session.socketId;
    if (socketId && io.of("/").sockets.get(socketId)) {
        console.log(`forcefully closing socket ${socketId}`);
        io.of("/").sockets.get(socketId).disconnect(true);
    }
    req.logout();
    res.cookie("connect.sid", "", { expires: new Date() });
    res.redirect("/");
});

app.post("/criartickets", (req,res)=>{
    const tickets = new Ticket(req.body);
    tickets.save()
    .then((result)=>{
        res.redirect('/tickets');
    })
    .catch((err) =>{
        console.log(err);
    })
})

app.post("/criarfaq", (req,res)=>{
    const faqs = new Faq(req.body);
    faqs.save()
    .then((result)=>{
        res.redirect('/faq');
    })
    .catch((err) =>{
        console.log(err);
    })
})

app.post("/respostas", (req,res)=>{
    const id = req.params.id;
    const msgRapidas = new msgRapida(req.body);
    msgRapidas.save()
    .then((resultado)=>{
        res.redirect('/');
    })
    .catch((err) =>{
        console.log(err);
    })
})


app.post("/msg/delete/:id", (req,res) => {
    contarTickets();
    const id = req.params.id;
    User.findById(id)
    .then((result) => {
        Ticket.find({ estado: 'Fechado' , agente: result.nome }).count()
        .then((result2) => {
            tresolvidos = result2;
            msgRapida.findByIdAndDelete(id)
            .then((result3) => {
                res.render('profile', { 
                    isAuthenticated: !!req.user, 
                    users: result, 
                    msgrapidas: result3, 
                    ntickets: ntickets, 
                    tresolvidos: tresolvidos
                });
            })
        })
    })
    .catch((err) =>{
        console.log(err);
    })
});

app.use((req,res) => {
    res.status(404).render('404');
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    }
));

passport.serializeUser((user, cb) => {
    console.log(`serializeUser ${user.id}`);
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    console.log(`deserializeUser ${id}`);
    User.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

const io = require('socket.io')(server);

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
    next();
});

io.on('connect', (socket) => {
    userloggedout = randomID();
    console.log(`new connection ${socket.id}`);
    socket.on('whoami', (cb) => {
        cb(socket.request.user.username);
    });

    const session = socket.request.session;
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();


    //Chat
    socket.on("join", function(req,res){
        if (!!socket.request.user) {
            console.log(socket.request.user.username + " joined server");
            io.emit("update", "<b>" + socket.request.user.username + " juntou-se ao chat.</b>");
        }
        else {
            console.log(userloggedout +" joined server");
            io.emit("update", "<b>" + userloggedout + " juntou-se ao chat.</b>");
        }
    });


    socket.on('chat message',function(msg){ 
        if (!!socket.request.user) {
            console.log('message: '+ msg);
            var mensagem = { msg:msg, id:socket.request.user.username };
            io.emit('chat message', mensagem);   
        }
        else {
            console.log('message: '+ msg);
            var mensagem = { msg: msg, id: userloggedout };
            io.emit('chat message', mensagem);   
        }

             
    })
    
});

function randomID() {
    var id = 0;
    id = Math.floor(Math.random() * 151);
    return id;
}

