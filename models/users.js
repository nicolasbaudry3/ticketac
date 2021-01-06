var mongoose = require('./connexion')


var tripsSchema =  mongoose.Schema({
    journeydeparture: String,
    journeyarrival: String,
    date:Date,
    departureTime: String,
    price: Number
})

var userSchema =  mongoose.Schema({
    name: String,
    firstName: String,
    email: String,
    password: String,
    trips: [tripsSchema]
})

var userModel = mongoose.model('users', userSchema)

module.exports = userModel;