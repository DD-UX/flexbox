// =================================================================
// Get all the packages ============================================
// =================================================================
var config = require('./config');
var publicUrl = config.publicUrl;

// Express
var express             = require('express');
var bodyParser          = require('body-parser');
var expressValidator    = require('express-validator');

// =================================================================
// Config ==========================================================
// =================================================================

// Server configurations
var port    = process.env.PORT || 1234;
var app     = express();

if ( process.env.NODE_ENV === 'development' ){
	app.use(require('connect-livereload')({
	    port: 35729,
	    ignore: ['.map']
	}));	
}


// app use
app.use(express.static(publicUrl));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());


// APP
//-----------------------------------
    // Root
    app
        .get('/', function(req, res){
            res.sendFile(publicUrl + 'index.html');
        });

    // Angular state load 404 error keeps the user within the circuit
    // Otherwise it just leads to the homepage
    app.get('*', function(req, res){
      res.sendFile(publicUrl + 'index.html', 404);
    });

// SERVER init
//-----------------------------------
app.listen(port, function() {
	console.log("Running the app in " + process.env.NODE_ENV + " mode");
    console.log('Server up and running!');		
});















