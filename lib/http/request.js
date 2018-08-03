/**
 * Module dependencies.
 */
//var http = require('http')
//  , req = http.IncomingMessage.prototype;


var req = exports = module.exports = {};

/**
 * Intiate a login session for `user`.
 *
 * Options:
 *   - `session`  Save login state in session, defaults to _true_
 *
 * Examples:
 *
 *     req.logIn(user, { session: false });
 *
 *     req.logIn(user, function(err) {
 *       if (err) { throw err; }
 *       // session saved
 *     });
 *
 * @param {User} user
 * @param {Object} options
 * @param {Function} done
 * @api public
 */
req.login =
req.logIn = function(user, options, done) {
  console.log("DEBUG PASSPORT REQUEST LOGIN 1")
  console.log("DEBUG PASSPORT REQUEST LOGIN 1.1", user)
  console.log("DEBUG PASSPORT REQUEST LOGIN 1.2", options)
  console.log("DEBUG PASSPORT REQUEST LOGIN 1.3", done)
  if (typeof options == 'function') {
    done = options;
    options = {};
  }
  options = options || {};
  
  console.log("DEBUG PASSPORT REQUEST LOGIN 2")
  var property = 'user';
  console.log("DEBUG PASSPORT REQUEST LOGIN 3")
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || 'user';
  }
  console.log("DEBUG PASSPORT REQUEST LOGIN 4", property)
  var session = (options.session === undefined) ? true : options.session;
  console.log("DEBUG PASSPORT REQUEST LOGIN 5", session)
  
  this[property] = user;
  console.log("DEBUG PASSPORT REQUEST LOGIN 6", user)
  if (session) {
    console.log("DEBUG PASSPORT REQUEST LOGIN 7")
    if (!this._passport) { throw new Error('passport.initialize() middleware not in use'); }
    console.log("DEBUG PASSPORT REQUEST LOGIN 8")
    if (typeof done != 'function') { throw new Error('req#login requires a callback function'); }
    console.log("DEBUG PASSPORT REQUEST LOGIN 9")
    
    var self = this;
    console.log("DEBUG PASSPORT REQUEST LOGIN 10")
    this._passport.instance.serializeUser(user, this, function(err, obj) {
      console.log("DEBUG PASSPORT REQUEST LOGIN 11")
      if (err) { self[property] = null; return done(err); }
      console.log("DEBUG PASSPORT REQUEST LOGIN 11")
      if (!self._passport.session) {
        self._passport.session = {};
      }
      console.log("DEBUG PASSPORT REQUEST LOGIN 12")
      self._passport.session.user = obj;
      if (!self.session) {
        self.session = {};
      }
      console.log("DEBUG PASSPORT REQUEST LOGIN 13")
      self.session[self._passport.instance._key] = self._passport.session;
      console.log("DEBUG PASSPORT REQUEST LOGIN 14")
      done();
    });
  } else {
    console.log("DEBUG PASSPORT REQUEST LOGIN 15")
    done && done();
  }
};

/**
 * Terminate an existing login session.
 *
 * @api public
 */
req.logout =
req.logOut = function() {
  var property = 'user';
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || 'user';
  }
  
  this[property] = null;
  if (this._passport && this._passport.session) {
    delete this._passport.session.user;
  }
};

/**
 * Test if request is authenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isAuthenticated = function() {
  console.log("DEBUG PASSPORT REQUEST ISAUTHENTICATED 1")
  var property = 'user';
  console.log("DEBUG PASSPORT REQUEST ISAUTHENTICATED 2")
  if (this._passport && this._passport.instance) {
    console.log("DEBUG PASSPORT REQUEST ISAUTHENTICATED 3")
    property = this._passport.instance._userProperty || 'user';
  }
  console.log("DEBUG PASSPORT REQUEST ISAUTHENTICATED 4", this[property])
  
  return (this[property]) ? true : false;
};

/**
 * Test if request is unauthenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isUnauthenticated = function() {
  console.log("DEBUG PASSPORT REQUEST ISunAUTHENTICATED 1")
  return !this.isAuthenticated();
};
