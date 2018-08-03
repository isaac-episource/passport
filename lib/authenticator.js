/**
 * Module dependencies.
 */
var SessionStrategy = require('./strategies/session');


/**
 * `Authenticator` constructor.
 *
 * @api public
 */
function Authenticator() {
  console.log("DEBUG PASSPORT AUTHENTICATOR INIT")
  this._key = 'passport';
  this._strategies = {};
  this._serializers = [];
  this._deserializers = [];
  this._infoTransformers = [];
  this._framework = null;
  this._userProperty = 'user';
  
  this.init();
}

/**
 * Initialize authenticator.
 *
 * @api protected
 */
Authenticator.prototype.init = function() {
  console.log("DEBUG PASSPORT AUTHENTICATOR INIT INIT 1")
  this.framework(require('./framework/connect')());
  console.log("DEBUG PASSPORT AUTHENTICATOR INIT INIT 2")
  this.use(new SessionStrategy());
};

/**
 * Utilize the given `strategy` with optional `name`, overridding the strategy's
 * default name.
 *
 * Examples:
 *
 *     passport.use(new TwitterStrategy(...));
 *
 *     passport.use('api', new http.BasicStrategy(...));
 *
 * @param {String|Strategy} name
 * @param {Strategy} strategy
 * @return {Authenticator} for chaining
 * @api public
 */
Authenticator.prototype.use = function(name, strategy) {
  console.log("DEBUG PASSPORT AUTHENTICATOR USE 1", name)
  console.log("DEBUG PASSPORT AUTHENTICATOR USE 2", strategy)
  if (!strategy) {
    console.log("DEBUG PASSPORT AUTHENTICATOR USE 3")
    strategy = name;
    name = strategy.name;
  }
  console.log("DEBUG PASSPORT AUTHENTICATOR USE 4")
  if (!name) { throw new Error('Authentication strategies must have a name'); }
  console.log("DEBUG PASSPORT AUTHENTICATOR USE 5")
  
  this._strategies[name] = strategy;
  console.log("DEBUG PASSPORT AUTHENTICATOR USE 6", this)
  return this;
};

/**
 * Un-utilize the `strategy` with given `name`.
 *
 * In typical applications, the necessary authentication strategies are static,
 * configured once and always available.  As such, there is often no need to
 * invoke this function.
 *
 * However, in certain situations, applications may need dynamically configure
 * and de-configure authentication strategies.  The `use()`/`unuse()`
 * combination satisfies these scenarios.
 *
 * Examples:
 *
 *     passport.unuse('legacy-api');
 *
 * @param {String} name
 * @return {Authenticator} for chaining
 * @api public
 */
Authenticator.prototype.unuse = function(name) {
  console.log("DEBUG PASSPORT AUTHENTICATOR UNUSE 1", name)
  delete this._strategies[name];
  console.log("DEBUG PASSPORT AUTHENTICATOR UNUSE 2")
  return this;
};

/**
 * Setup Passport to be used under framework.
 *
 * By default, Passport exposes middleware that operate using Connect-style
 * middleware using a `fn(req, res, next)` signature.  Other popular frameworks
 * have different expectations, and this function allows Passport to be adapted
 * to operate within such environments.
 *
 * If you are using a Connect-compatible framework, including Express, there is
 * no need to invoke this function.
 *
 * Examples:
 *
 *     passport.framework(require('hapi-passport')());
 *
 * @param {Object} name
 * @return {Authenticator} for chaining
 * @api public
 */
Authenticator.prototype.framework = function(fw) {
  console.log("DEBUG PASSPORT AUTHENTICATOR FRAMEWORK 1", fw)
  this._framework = fw;
  console.log("DEBUG PASSPORT AUTHENTICATOR FRAMEWORK 2", this)
  return this;
};

/**
 * Passport's primary initialization middleware.
 *
 * This middleware must be in use by the Connect/Express application for
 * Passport to operate.
 *
 * Options:
 *   - `userProperty`  Property to set on `req` upon login, defaults to _user_
 *
 * Examples:
 *
 *     app.use(passport.initialize());
 *
 *     app.use(passport.initialize({ userProperty: 'currentUser' }));
 *
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
Authenticator.prototype.initialize = function(options) {
  console.log("DEBUG PASSPORT AUTHENTICATOR INITIALIZE 1", options)
  options = options || {};
  this._userProperty = options.userProperty || 'user';
  console.log("DEBUG PASSPORT AUTHENTICATOR INITIALIZE 2")
  
  return this._framework.initialize(this, options);
};

/**
 * Middleware that will authenticate a request using the given `strategy` name,
 * with optional `options` and `callback`.
 *
 * Examples:
 *
 *     passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })(req, res);
 *
 *     passport.authenticate('local', function(err, user) {
 *       if (!user) { return res.redirect('/login'); }
 *       res.end('Authenticated!');
 *     })(req, res);
 *
 *     passport.authenticate('basic', { session: false })(req, res);
 *
 *     app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
 *       // request will be redirected to Twitter
 *     });
 *     app.get('/auth/twitter/callback', passport.authenticate('twitter'), function(req, res) {
 *       res.json(req.user);
 *     });
 *
 * @param {String} strategy
 * @param {Object} options
 * @param {Function} callback
 * @return {Function} middleware
 * @api public
 */
Authenticator.prototype.authenticate = function(strategy, options, callback) {
  console.log("DEBUG PASSPORT AUTHENTICATOR AUTHENTIAT 1", strategy)
  console.log("DEBUG PASSPORT AUTHENTICATOR AUTHENTIAT 2", optioms)
  console.log("DEBUG PASSPORT AUTHENTICATOR AUTHENTIAT 3", callback)
  return this._framework.authenticate(this, strategy, options, callback);
};

/**
 * Middleware that will authorize a third-party account using the given
 * `strategy` name, with optional `options`.
 *
 * If authorization is successful, the result provided by the strategy's verify
 * callback will be assigned to `req.account`.  The existing login session and
 * `req.user` will be unaffected.
 *
 * This function is particularly useful when connecting third-party accounts
 * to the local account of a user that is currently authenticated.
 *
 * Examples:
 *
 *    passport.authorize('twitter-authz', { failureRedirect: '/account' });
 *
 * @param {String} strategy
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
Authenticator.prototype.authorize = function(strategy, options, callback) {
  console.log("DEBUG PASSPORT AUTHENTICATOR AUTHORIZE 1", strategy)
  console.log("DEBUG PASSPORT AUTHENTICATOR AUTHORIZE 2", options)
  console.log("DEBUG PASSPORT AUTHENTICATOR AUTHORIZE 3", callback)
  options = options || {};
  console.log("DEBUG PASSPORT AUTHENTICATOR AUTHORIZE 4")
  options.assignProperty = 'account';
  
  console.log("DEBUG PASSPORT AUTHENTICATOR AUTHORIZE 5")
  var fn = this._framework.authorize || this._framework.authenticate;
  console.log("DEBUG PASSPORT AUTHENTICATOR AUTHORIZE 6")
  return fn(this, strategy, options, callback);
};

/**
 * Middleware that will restore login state from a session.
 *
 * Web applications typically use sessions to maintain login state between
 * requests.  For example, a user will authenticate by entering credentials into
 * a form which is submitted to the server.  If the credentials are valid, a
 * login session is established by setting a cookie containing a session
 * identifier in the user's web browser.  The web browser will send this cookie
 * in subsequent requests to the server, allowing a session to be maintained.
 *
 * If sessions are being utilized, and a login session has been established,
 * this middleware will populate `req.user` with the current user.
 *
 * Note that sessions are not strictly required for Passport to operate.
 * However, as a general rule, most web applications will make use of sessions.
 * An exception to this rule would be an API server, which expects each HTTP
 * request to provide credentials in an Authorization header.
 *
 * Examples:
 *
 *     app.use(connect.cookieParser());
 *     app.use(connect.session({ secret: 'keyboard cat' }));
 *     app.use(passport.initialize());
 *     app.use(passport.session());
 *
 * Options:
 *   - `pauseStream`      Pause the request stream before deserializing the user
 *                        object from the session.  Defaults to _false_.  Should
 *                        be set to true in cases where middleware consuming the
 *                        request body is configured after passport and the
 *                        deserializeUser method is asynchronous.
 *
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
Authenticator.prototype.session = function(options) {
  console.log("DEBUG PASSPORT AUTHENTICATOR SESSION")
  return this.authenticate('session', options);
};

/**
 * Registers a function used to serialize user objects into the session.
 *
 * Examples:
 *
 *     passport.serializeUser(function(user, done) {
 *       done(null, user.id);
 *     });
 *
 * @api public
 */
Authenticator.prototype.serializeUser = function(fn, req, done) {
  console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 1")
  if (typeof fn === 'function') {
    console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 2")
    return this._serializers.push(fn);
  }
  
  // private implementation that traverses the chain of serializers, attempting
  // to serialize a user
  console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 3")
  var user = fn;

  // For backwards compatibility
  console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 4")
  if (typeof req === 'function') {
    console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 5")
    done = req;
    req = undefined;
  }
  
  console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 6")
  var stack = this._serializers;
  console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 7")
  (function pass(i, err, obj) {
    console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 8")
    // serializers use 'pass' as an error to skip processing
    if ('pass' === err) {
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 9")
      err = undefined;
    }
    // an error or serialized object was obtained, done
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 10")
    if (err || obj || obj === 0) { return done(err, obj); }
    
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 11")
    var layer = stack[i];
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 12")
    if (!layer) {
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 13")
      return done(new Error('Failed to serialize user into session'));
    }
    
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 14")
    function serialized(e, o) {
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 15")
      pass(i + 1, e, o);
    }
    
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 16")
    try {
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 17")
      var arity = layer.length;
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 18")
      if (arity == 3) {
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 19")
        layer(req, user, serialized);
      } else {
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 20")
        layer(user, serialized);
      }
    } catch(e) {
      console.log("DEBUG PASSPORT AUTHENTICATOR SERIALIZE USER 21")
      return done(e);
    }
  })(0);
};

/**
 * Registers a function used to deserialize user objects out of the session.
 *
 * Examples:
 *
 *     passport.deserializeUser(function(id, done) {
 *       User.findById(id, function (err, user) {
 *         done(err, user);
 *       });
 *     });
 *
 * @api public
 */
Authenticator.prototype.deserializeUser = function(fn, req, done) {
  console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 1")
  if (typeof fn === 'function') {
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 2")
    return this._deserializers.push(fn);
  }
  
  // private implementation that traverses the chain of deserializers,
  // attempting to deserialize a user
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 3")
  var obj = fn;

  // For backwards compatibility
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 4")
  if (typeof req === 'function') {
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 5")
    done = req;
    req = undefined;
  }
  
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 6")
  var stack = this._deserializers;
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 7")
  (function pass(i, err, user) {
    // deserializers use 'pass' as an error to skip processing
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 8")
    if ('pass' === err) {
      console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 9")
      err = undefined;
    }
    // an error or deserialized user was obtained, done
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 10")
    if (err || user) { return done(err, user); }
    // a valid user existed when establishing the session, but that user has
    // since been removed
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 11")
    if (user === null || user === false) { return done(null, false); }
    
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 12")
    var layer = stack[i];
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 13")
    if (!layer) {
      console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 14")
      return done(new Error('Failed to deserialize user out of session'));
    }
    
    
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 15")
    function deserialized(e, u) {
      console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 16")
      pass(i + 1, e, u);
    }
    
    console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 17")
    try {
      console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 18")
      var arity = layer.length;
      console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 19")
      if (arity == 3) {
        console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 20")
        layer(req, obj, deserialized);
      } else {
        console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 21")
        layer(obj, deserialized);
      }
    } catch(e) {
      console.log("DEBUG PASSPORT AUTHENTICATOR DESERIALIZE USER 22")
      return done(e);
    }
  })(0);
};

/**
 * Registers a function used to transform auth info.
 *
 * In some circumstances authorization details are contained in authentication
 * credentials or loaded as part of verification.
 *
 * For example, when using bearer tokens for API authentication, the tokens may
 * encode (either directly or indirectly in a database), details such as scope
 * of access or the client to which the token was issued.
 *
 * Such authorization details should be enforced separately from authentication.
 * Because Passport deals only with the latter, this is the responsiblity of
 * middleware or routes further along the chain.  However, it is not optimal to
 * decode the same data or execute the same database query later.  To avoid
 * this, Passport accepts optional `info` along with the authenticated `user`
 * in a strategy's `success()` action.  This info is set at `req.authInfo`,
 * where said later middlware or routes can access it.
 *
 * Optionally, applications can register transforms to proccess this info,
 * which take effect prior to `req.authInfo` being set.  This is useful, for
 * example, when the info contains a client ID.  The transform can load the
 * client from the database and include the instance in the transformed info,
 * allowing the full set of client properties to be convieniently accessed.
 *
 * If no transforms are registered, `info` supplied by the strategy will be left
 * unmodified.
 *
 * Examples:
 *
 *     passport.transformAuthInfo(function(info, done) {
 *       Client.findById(info.clientID, function (err, client) {
 *         info.client = client;
 *         done(err, info);
 *       });
 *     });
 *
 * @api public
 */
Authenticator.prototype.transformAuthInfo = function(fn, req, done) {
  console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 1")
  if (typeof fn === 'function') {
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 2")
    return this._infoTransformers.push(fn);
  }
  
  // private implementation that traverses the chain of transformers,
  // attempting to transform auth info
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 3")
  var info = fn;

  // For backwards compatibility
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 4")
  if (typeof req === 'function') {
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 5")
    done = req;
    req = undefined;
  }
  
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 6")
  var stack = this._infoTransformers;
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 7")
  (function pass(i, err, tinfo) {
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 8")
    // transformers use 'pass' as an error to skip processing
    if ('pass' === err) {
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 9")
      err = undefined;
    }
    // an error or transformed info was obtained, done
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 10")
    if (err || tinfo) { return done(err, tinfo); }
    
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 11")
    var layer = stack[i];
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 12")
    if (!layer) {
      // if no transformers are registered (or they all pass), the default
      // behavior is to use the un-transformed info as-is
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 13")
      return done(null, info);
    }
    
    
    function transformed(e, t) {
      console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 14")
      pass(i + 1, e, t);
    }
    
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 15")
    try {
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 16")
      var arity = layer.length;
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 17")
      if (arity == 1) {
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 18")
        // sync
        var t = layer(info);
        transformed(null, t);
      } else if (arity == 3) {
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 19")
        layer(req, info, transformed);
      } else {
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 20")
        layer(info, transformed);
      }
    } catch(e) {
    console.log("DEBUG PASSPORT AUTHENTICATOR transform auth info 21")
      return done(e);
    }
  })(0);
};

/**
 * Return strategy with given `name`. 
 *
 * @param {String} name
 * @return {Strategy}
 * @api private
 */
Authenticator.prototype._strategy = function(name) {
    console.log("DEBUG PASSPORT AUTHENTICATOR _strategy 1")
  return this._strategies[name];
};


/**
 * Expose `Authenticator`.
 */
module.exports = Authenticator;
