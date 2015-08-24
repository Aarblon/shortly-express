var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();
var logged = false;
//logged = authenticator output

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
//a middleware to check if we have a session id
app.use(function(req, res, next) {
  logged = util.authenticator(req);
  next();
});

app.get('/',
  //perform some check on sessionid to see if exists
  //if it exists, render index
function(req, res) {
  console.log('req.body: ', req.body);
  console.log('session id: ', req.sessionID)
  console.log('logged: ', logged);
  if(logged) {
    res.render('index');
  } else {
    res.render('login');
  }
  //else render login page
  //where do we store the sessionids??
});

app.get('/create',
function(req, res) {
  res.render('index');
});

app.get('/links',
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var salt = salt;

  new User({ username: username }).fetch().then(function(found) {
    if (found) {
      res.send(201, "Username already exists, please choose another");
    } else {
      //user doesn't exist yet
      var hashed = util.hashPassword(password, salt);

      var user = new Users({
        username: username,
        password: hashed,
      });

      user.save().then(function(newUser) {
        console.log('The user we just saved: ', user);
        console.log('newUser inside first promise: ', newUser);
        Users.add(newUser);
        return newUser;
      })
      .then(function(newUser) {
        console.log('newUser inside second promise: ', newUser);
        res.end(201, 'user signed up');
        //log in the newly created user
        //req.session.loggedin
      })
    }
  })
})
/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/login', function(req, res) {
  console.log(req.body);
})
//input a website
//click
//our website will check if you're logged-in
//if not logged-in
//redirect to log-in splash page
  //will have option to either sign-in OR
  //sign-up
//once sign-in / sign-up complete
  //redirects to original task??
app.get('/signup', function(req, res) {
  res.render('signup');
})
//


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
