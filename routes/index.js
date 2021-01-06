var express = require('express');
var router = express.Router();

var journeyModel = require('../models/journey');
var userModel = require('../models/users');




/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('index');
});



/* GET Sign-in page */
router.post('/sign-in', async function(req, res, next) {
  var searchUsers = await userModel.find({
    email: req.body.emailFromFront,
    password: req.body.passwordFromFront
  })
  if(searchUsers[0]){
    req.session.user = {
      name: searchUsers[0].name,
      id: searchUsers[0]._id
    };
    res.redirect('/homepage')
  } else {
    res.redirect('/oops')
  }
  
});

/* GET Sign-up page */
router.post('/sign-up', async function(req, res, next) {

  var searchUser = await userModel.findOne({
    email: req.body.emailFromFront
  })

    if(!searchUser){
      var newUser = new userModel({
        name: req.body.nameFromFront,
        firstName: req.body.firstNameFromFront,
        email: req.body.emailFromFront,
        password: req.body.passwordFromFront
      })

      var newUserSave = await newUser.save();
console.log('11', newUserSave)
      req.session.user = {
        name: newUserSave.name,
        id: newUserSave._id
      }
      res.redirect('/homepage')
    } else {
      res.redirect('/oops2')
    }
 
});

/* --- homepage --- */
router.get('/homepage', function(req, res, next) {
  res.render('homepage');
});

/* --- les pages oops d'identification */
router.get('/oops', function(req, res, next) {
  res.render('oops', { title: 'Express' });
});

router.get('/oops2', function(req, res, next) {
  res.render('oops2', { title: 'Express' });
});

/*  --- Affiche les tickets dispo depuis la homepage ou oops train si il n'y a pas de tickets --- */
router.post('/tickets', async function(req, res, next) {
  var test = {departure:req.body.departureFromFront,arrival:req.body.arrivalFromFront,date:req.body.dateFromFront}
  console.log('3', test)
  var search = await journeyModel.find({departure:req.body.departureFromFront,arrival:req.body.arrivalFromFront,date:req.body.dateFromFront})
  console.log('4', search)
  var article = []
  for (var i=0 ; i<search.length ; i++) {
    article.push({departure:search[i].departure, arrival:search[i].arrival, date:req.body.dateFromFront, heure:search[i].departureTime, prix:search[i].price})
      }
   console.log('5',article)  
  
   if(article[0]) {
  res.render('tickets', { article:article, date:req.body.dateFromFront });
   }
  
 else {res.redirect('/oopstrain')}
});
router.get('/oopstrain', function(req, res, next) {
  res.render('oopstrain', { title: 'Express' });
});

/* --- Ajouter des billets à travels (panier) depuis la page tickets --- */
router.get('/travels', function(req, res, next) {

  if (!req.session.travels) {req.session.travels = []}

  var travelexiste = false;

  for ( var i=0 ; i<req.session.travels.length ; i++) {
    if (req.session.travels[i].departure == req.query.departure && req.session.travels[i].arrival == req.query.arrival && req.session.travels[i].date == req.query.date && req.session.travels[i].heure == req.query.heure && req.session.travels[i].prix == req.query.prix) {
      travelexiste = true
    } 
  }

  if (travelexiste == false) {
    req.session.travels.push({departure:req.query.departure, arrival:req.query.arrival, date:req.query.date, heure:req.query.heure, prix:req.query.prix})
  }
  res.render('travels', { travels:req.session.travels });
});


/*  --- Supprimer un billet de la page travels --- */
router.get('/delete-travels', function(req, res, next) {
  req.session.travels.splice(req.query.position,1)
  res.render('travels', {travels:req.session.travels});
});


/* --- voir mes last trips depuis la navbar ou ajouter depuis la page travel */
router.get('/lasttrips', async function(req, res, next) {

  if (!req.session.travels) {req.session.travels = []}

  if (req.query.add == "add") {

    var moi = await userModel.findById(req.session.user.id)

console.log('10b',moi )
      for( i=0 ; i<req.session.travels.length ; i++) {
                  moi.trips.push({journeydeparture:req.session.travels[i].departure,
                                  journeyarrival:req.session.travels[i].arrival,
                                  date:req.session.travels[i].date,
                                  departureTime:req.session.travels[i].heure,
                                  price:req.session.travels[i].prix
                  }
      )}
        
      console.log('10', moi.trips)
      req.session.travel=[]

      await moi.save();
}
  moi = await userModel.findById(req.session.user.id)
  console.log('10b', moi.trips)
  res.render('lasttrips', { user:moi });
});



/* --- deconnexion --- */
router.get('/logout', function(req, res, next) {
  console.log('2a',req.session.user)
  req.session.user = {}
  console.log('2b',req.session.user)
  res.render('index');
});














var city = ["Paris","Marseille","Nantes","Lyon","Rennes","Melun","Bordeaux","Lille"]
var date = ["2018-11-20","2018-11-21","2018-11-22","2018-11-23","2018-11-24"]


// Remplissage de la base de donnée, une fois suffit
router.get('/save', async function(req, res, next) {

  // How many journeys we want
  var count = 300

  // Save  ---------------------------------------------------
    for(var i = 0; i< count; i++){

    departureCity = city[Math.floor(Math.random() * Math.floor(city.length))]
    arrivalCity = city[Math.floor(Math.random() * Math.floor(city.length))]

    if(departureCity != arrivalCity){

      var newUser = new journeyModel ({
        departure: departureCity , 
        arrival: arrivalCity, 
        date: date[Math.floor(Math.random() * Math.floor(date.length))],
        departureTime:Math.floor(Math.random() * Math.floor(23)) + ":00",
        price: Math.floor(Math.random() * Math.floor(125)) + 25,
      });
       
       await newUser.save();

    }

  }
  res.render('index', { title: 'Express' });
});


// Cette route est juste une verification du Save.
// Vous pouvez choisir de la garder ou la supprimer.
router.get('/result', function(req, res, next) {

  // Permet de savoir combien de trajets il y a par ville en base
  for(i=0; i<city.length; i++){

    journeyModel.find( 
      { departure: city[i] } , //filtre
  
      function (err, journey) {

          console.log(`Nombre de trajets au départ de ${journey[0].departure} : `, journey.length);
      }
    )

  }


  res.render('index', { title: 'Express' });
});

module.exports = router;



router.get('/poppers', function(req, res, next) {
  res.render('poppers');
});


