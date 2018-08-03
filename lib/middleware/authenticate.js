/**
 * Module dependencies.
 */
var http = require('http')
  , IncomingMessageExt = require('../http/request')
  , AuthenticationError = require('../errors/authenticationerror');


/**
 * Authenticates requests.
 *
 * Applies the `name`ed strategy (or strategies) to the incoming request, in
 * order to authenticate the request.  If authentication is successful, the user
 * will be logged in and populated at `req.user` and a session will be
 * established by default.  If authentication fails, an unauthorized response
 * will be sent.
 *
 * Options:
 *   - `session`          Save login state in session, defaults to _true_
 *   - `successRedirect`  After successful login, redirect to given URL
 *   - `failureRedirect`  After failed login, redirect to given URL
 *   - `assignProperty`   Assign the object provided by the verify callback to given property
 *
 * An optional `callback` can be supplied to allow the application to overrride
 * the default manner in which authentication attempts are handled.  The
 * callback has the following signature, where `user` will be set to the
 * authenticated user on a successful authentication attempt, or `false`
 * otherwise.  An optional `info` argument will be passed, containing additional
 * details provided by the strategy's verify callback.
 *
 *     app.get('/protected', function(req, res, next) {
 *       passport.authenticate('local', function(err, user, info) {
 *         if (err) { return next(err) }
 *         if (!user) { return res.redirect('/signin') }
 *         res.redirect('/account');
 *       })(req, res, next);
 *     });
 *
 * Note that if a callback is supplied, it becomes the application's
 * responsibility to log-in the user, establish a session, and otherwise perform
 * the desired operations.
 *
 * Examples:
 *
 *     passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' });
 *
 *     passport.authenticate('basic', { session: false });
 *
 *     passport.authenticate('twitter');
 *
 * @param {String|Array} name
 * @param {Object} options
 * @param {Function} callback
 * @return {Function}
 * @api public
 */
module.exports = function authenticate(passport, name, options, callback) {
  console.log("DEBUG PASSPORT AUTH 1")
  console.log("DEBUG PASSPORT AUTH 1.1", passport)
  console.log("DEBUG PASSPORT AUTH 1.2", name)
  console.log("DEBUG PASSPORT AUTH 1.3", options)
  console.log("DEBUG PASSPORT AUTH 1.4", callback)
  if (typeof options == 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  console.log("DEBUG PASSPORT REQUEST LOGIN 2")
  
  var multi = true;
  console.log("DEBUG PASSPORT REQUEST LOGIN 3")
  
  // Cast `name` to an array, allowing authentication to pass through a chain of
  // strategies.  The first strategy to succeed, redirect, or error will halt
  // the chain.  Authentication failures will proceed through each strategy in
  // series, ultimately failing if all strategies fail.
  //
  // This is typically used on API endpoints to allow clients to authenticate
  // using their preferred choice of Basic, Digest, token-based schemes, etc.
  // It is not feasible to construct a chain of multiple strategies that involve
  // redirection (for example both Facebook and Twitter), since the first one to
  // redirect will halt the chain.
  if (!Array.isArray(name)) {
    name = [ name ];
    multi = false;
  }
  console.log("DEBUG PASSPORT AUTH 4", name)

  return function authenticate(req, res, next) {
    console.log("DEBUG PASSPORT AUTH 5.1", req)
    console.log("DEBUG PASSPORT AUTH 5.2", res)
    console.log("DEBUG PASSPORT AUTH 5.3", next)
    console.log("DEBUG PASSPORT AUTH 6")
    if (http.IncomingMessage.prototype.logIn
        && http.IncomingMessage.prototype.logIn !== IncomingMessageExt.logIn) {
      console.log("DEBUG PASSPORT AUTH 7")
      require('../framework/connect').__monkeypatchNode();
    }
    
    
    // accumulator for failures from each strategy in the chain
    console.log("DEBUG PASSPORT AUTH 8")
    var failures = [];
    
    function allFailed() {
      console.log("DEBUG PASSPORT AUTH 9")
      if (callback) {
        console.log("DEBUG PASSPORT AUTH 10")
        if (!multi) {
          console.log("DEBUG PASSPORT AUTH 11")
          return callback(null, false, failures[0].challenge, failures[0].status);
        } else {
          console.log("DEBUG PASSPORT AUTH 12")
          var challenges = failures.map(function(f) { return f.challenge; });
          console.log("DEBUG PASSPORT AUTH 13")
          var statuses = failures.map(function(f) { return f.status; });
          return callback(null, false, challenges, statuses);
        }
      }
      console.log("DEBUG PASSPORT AUTH 14")
      
      // Strategies are ordered by priority.  For the purpose of flashing a
      // message, the first failure will be displayed.
      console.log("DEBUG PASSPORT AUTH 15")
      var failure = failures[0] || {}
        , challenge = failure.challenge || {}
        , msg;
    
      console.log("DEBUG PASSPORT AUTH 16")
      if (options.failureFlash) {
        console.log("DEBUG PASSPORT AUTH 17")
        var flash = options.failureFlash;
        console.log("DEBUG PASSPORT AUTH 18")
        if (typeof flash == 'string') {
          console.log("DEBUG PASSPORT AUTH 19")
          flash = { type: 'error', message: flash };
        }
        console.log("DEBUG PASSPORT AUTH 20")
        flash.type = flash.type || 'error';
      
        console.log("DEBUG PASSPORT AUTH 21")
        var type = flash.type || challenge.type || 'error';
        console.log("DEBUG PASSPORT AUTH 22")
        msg = flash.message || challenge.message || challenge;
        console.log("DEBUG PASSPORT AUTH 23")
        if (typeof msg == 'string') {
          console.log("DEBUG PASSPORT AUTH 24")
          req.flash(type, msg);
        }
      }
      console.log("DEBUG PASSPORT AUTH 25")
      if (options.failureMessage) {
        console.log("DEBUG PASSPORT AUTH 26")
        msg = options.failureMessage;
        console.log("DEBUG PASSPORT AUTH 27", msg)
        if (typeof msg == 'boolean') {
          msg = challenge.message || challenge;
          console.log("DEBUG PASSPORT AUTH 28", msg)
        }
        if (typeof msg == 'string') {
          console.log("DEBUG PASSPORT AUTH 29")
          req.session.messages = req.session.messages || [];
          console.log("DEBUG PASSPORT AUTH 30")
          req.session.messages.push(msg);
        }
      }
      console.log("DEBUG PASSPORT AUTH 31")
      if (options.failureRedirect) {
        console.log("DEBUG PASSPORT AUTH 32")
        return res.redirect(options.failureRedirect);
      }
    
      // When failure handling is not delegated to the application, the default
      // is to respond with 401 Unauthorized.  Note that the WWW-Authenticate
      // header will be set according to the strategies in use (see
      // actions#fail).  If multiple strategies failed, each of their challenges
      // will be included in the response.
      console.log("DEBUG PASSPORT AUTH 33")
      var rchallenge = []
        , rstatus, status;
      
      console.log("DEBUG PASSPORT AUTH 34")
      for (var j = 0, len = failures.length; j < len; j++) {
        failure = failures[j];
        challenge = failure.challenge;
        status = failure.status;

        console.log("DEBUG PASSPORT AUTH FAILURES 1", failure)
        console.log("DEBUG PASSPORT AUTH FAILURES 2", challenge)
        console.log("DEBUG PASSPORT AUTH FAILURES 3", status)

        rstatus = rstatus || status;
        console.log("DEBUG PASSPORT AUTH FAILURES 4", rstatus)
        if (typeof challenge == 'string') {
          console.log("DEBUG PASSPORT AUTH FAILURES 5")
          rchallenge.push(challenge);
        }
      }
    
      res.statusCode = rstatus || 401;
      console.log("DEBUG PASSPORT AUTH AUTH 35", res.statusCode)
      if (res.statusCode == 401 && rchallenge.length) {
        console.log("DEBUG PASSPORT AUTH AUTH 36")
        res.setHeader('WWW-Authenticate', rchallenge);
      }
      console.log("DEBUG PASSPORT AUTH AUTH 36")
      if (options.failWithError) {
        console.log("DEBUG PASSPORT AUTH AUTH 37")
        return next(new AuthenticationError(http.STATUS_CODES[res.statusCode], rstatus));
      }
      console.log("DEBUG PASSPORT AUTH AUTH 38")
      res.end(http.STATUS_CODES[res.statusCode]);
      console.log("DEBUG PASSPORT AUTH AUTH 39")
    }
    
    (function attempt(i) {
      console.log("DEBUG PASSPORT AUTH AUTH 40")
      var layer = name[i];
      console.log("DEBUG PASSPORT AUTH AUTH 41")
      // If no more strategies exist in the chain, authentication has failed.
      if (!layer) { return allFailed(); }
      console.log("DEBUG PASSPORT AUTH AUTH 42")
    
      // Get the strategy, which will be used as prototype from which to create
      // a new instance.  Action functions will then be bound to the strategy
      // within the context of the HTTP request/response pair.
      var prototype = passport._strategy(layer);
      console.log("DEBUG PASSPORT AUTH AUTH 43")
      if (!prototype) { return next(new Error('Unknown authentication strategy "' + layer + '"')); }
      console.log("DEBUG PASSPORT AUTH AUTH 44")
    
      var strategy = Object.create(prototype);
      console.log("DEBUG PASSPORT AUTH AUTH 45")
      
      
      // ----- BEGIN STRATEGY AUGMENTATION -----
      // Augment the new strategy instance with action functions.  These action
      // functions are bound via closure the the request/response pair.  The end
      // goal of the strategy is to invoke *one* of these action methods, in
      // order to indicate successful or failed authentication, redirect to a
      // third-party identity provider, etc.
      
      /**
       * Authenticate `user`, with optional `info`.
       *
       * Strategies should call this function to successfully authenticate a
       * user.  `user` should be an object supplied by the application after it
       * has been given an opportunity to verify credentials.  `info` is an
       * optional argument containing additional user information.  This is
       * useful for third-party authentication strategies to pass profile
       * details.
       *
       * @param {Object} user
       * @param {Object} info
       * @api public
       */
      strategy.success = function(user, info) {
        console.log("DEBUG PASSPORT AUTH SUCCESS 1")
        if (callback) {
          console.log("DEBUG PASSPORT AUTH SUCCESS 2")
          return callback(null, user, info);
        }
      
        console.log("DEBUG PASSPORT AUTH SUCCESS 3")
        info = info || {};
        var msg;
        console.log("DEBUG PASSPORT AUTH SUCCESS 4")
      
        if (options.successFlash) {
          console.log("DEBUG PASSPORT AUTH SUCCESS 5")
          var flash = options.successFlash;
          console.log("DEBUG PASSPORT AUTH SUCCESS 6", flash)
          if (typeof flash == 'string') {
            console.log("DEBUG PASSPORT AUTH SUCCESS 7")
            flash = { type: 'success', message: flash };
          }
          console.log("DEBUG PASSPORT AUTH SUCCESS 8")
          flash.type = flash.type || 'success';
        
          console.log("DEBUG PASSPORT AUTH SUCCESS 9")
          var type = flash.type || info.type || 'success';
          console.log("DEBUG PASSPORT AUTH SUCCESS 10")
          msg = flash.message || info.message || info;
          console.log("DEBUG PASSPORT AUTH SUCCESS 11")
          if (typeof msg == 'string') {
            console.log("DEBUG PASSPORT AUTH SUCCESS 12")
            req.flash(type, msg);
          }
        }
        console.log("DEBUG PASSPORT AUTH SUCCESS 13")
        if (options.successMessage) {
          console.log("DEBUG PASSPORT AUTH SUCCESS 14")
          msg = options.successMessage;
          console.log("DEBUG PASSPORT AUTH SUCCESS 15", msg)
          if (typeof msg == 'boolean') {
            msg = info.message || info;
            console.log("DEBUG PASSPORT AUTH SUCCESS 16", msg)
          }
          console.log("DEBUG PASSPORT AUTH SUCCESS 17")
          if (typeof msg == 'string') {
            req.session.messages = req.session.messages || [];
            req.session.messages.push(msg);
            console.log("DEBUG PASSPORT AUTH SUCCESS 18", req.session.messages)
          }
          console.log("DEBUG PASSPORT AUTH SUCCESS 19")
        }
        console.log("DEBUG PASSPORT AUTH SUCCESS 20")
        if (options.assignProperty) {
          console.log("DEBUG PASSPORT AUTH SUCCESS 21")
          req[options.assignProperty] = user;
          console.log("DEBUG PASSPORT AUTH SUCCESS 22")
          return next();
        }
      
        console.log("DEBUG PASSPORT AUTH SUCCESS 23")
        req.logIn(user, options, function(err) {
          console.log("DEBUG PASSPORT AUTH SUCCESS 24")
          if (err) { return next(err); }
          console.log("DEBUG PASSPORT AUTH SUCCESS 25")
          
          function complete() {
            console.log("DEBUG PASSPORT AUTH SUCCESS 26")
            if (options.successReturnToOrRedirect) {
              console.log("DEBUG PASSPORT AUTH SUCCESS 27")
              var url = options.successReturnToOrRedirect;
              console.log("DEBUG PASSPORT AUTH SUCCESS 28")
              if (req.session && req.session.returnTo) {
                console.log("DEBUG PASSPORT AUTH SUCCESS 29")
                url = req.session.returnTo;
                console.log("DEBUG PASSPORT AUTH SUCCESS 30")
                delete req.session.returnTo;
              }
              console.log("DEBUG PASSPORT AUTH SUCCESS 31")
              return res.redirect(url);
            }
            console.log("DEBUG PASSPORT AUTH SUCCESS 32")
            if (options.successRedirect) {
              console.log("DEBUG PASSPORT AUTH SUCCESS 33")
              return res.redirect(options.successRedirect);
            }
            console.log("DEBUG PASSPORT AUTH SUCCESS 34")
            next();
          }
          
          console.log("DEBUG PASSPORT AUTH SUCCESS 35")
          if (options.authInfo !== false) {
            console.log("DEBUG PASSPORT AUTH SUCCESS 36")
            passport.transformAuthInfo(info, req, function(err, tinfo) {
              console.log("DEBUG PASSPORT AUTH SUCCESS 37.1", err)
              console.log("DEBUG PASSPORT AUTH SUCCESS 37.2", tinfo)
              if (err) { return next(err); }
              console.log("DEBUG PASSPORT AUTH SUCCESS 38")
              req.authInfo = tinfo;
              console.log("DEBUG PASSPORT AUTH SUCCESS 39")
              complete();
            });
          } else {
            console.log("DEBUG PASSPORT AUTH SUCCESS 40")
            complete();
          }
        });
      };
      
      /**
       * Fail authentication, with optional `challenge` and `status`, defaulting
       * to 401.
       *
       * Strategies should call this function to fail an authentication attempt.
       *
       * @param {String} challenge
       * @param {Number} status
       * @api public
       */
      strategy.fail = function(challenge, status) {
        console.log("DEBUG PASSPORT AUTH FAIL 1.1", challenge)
        console.log("DEBUG PASSPORT AUTH FAIL 1.2", status)
        if (typeof challenge == 'number') {
          console.log("DEBUG PASSPORT AUTH FAIL 2")
          status = challenge;
          console.log("DEBUG PASSPORT AUTH FAIL 3")
          challenge = undefined;
        }
        
        // push this failure into the accumulator and attempt authentication
        // using the next strategy
        console.log("DEBUG PASSPORT AUTH FAIL 4")
        failures.push({ challenge: challenge, status: status });
        console.log("DEBUG PASSPORT AUTH FAIL 5")
        attempt(i + 1);
      };
      
      /**
       * Redirect to `url` with optional `status`, defaulting to 302.
       *
       * Strategies should call this function to redirect the user (via their
       * user agent) to a third-party website for authentication.
       *
       * @param {String} url
       * @param {Number} status
       * @api public
       */
      strategy.redirect = function(url, status) {
        // NOTE: Do not use `res.redirect` from Express, because it can't decide
        //       what it wants.
        //
        //       Express 2.x: res.redirect(url, status)
        //       Express 3.x: res.redirect(status, url) -OR- res.redirect(url, status)
        //         - as of 3.14.0, deprecated warnings are issued if res.redirect(url, status)
        //           is used
        //       Express 4.x: res.redirect(status, url)
        //         - all versions (as of 4.8.7) continue to accept res.redirect(url, status)
        //           but issue deprecated versions
        console.log("DEBUG PASSPORT AUTH REDIRECT 1.1", url)
        console.log("DEBUG PASSPORT AUTH REDIRECT 1.2", url)
        
        res.statusCode = status || 302;
        console.log("DEBUG PASSPORT AUTH REDIRECT 2")
        res.setHeader('Location', url);
        console.log("DEBUG PASSPORT AUTH REDIRECT 3")
        res.setHeader('Content-Length', '0');
        console.log("DEBUG PASSPORT AUTH REDIRECT 4")
        res.end();
      };
      
      /**
       * Pass without making a success or fail decision.
       *
       * Under most circumstances, Strategies should not need to call this
       * function.  It exists primarily to allow previous authentication state
       * to be restored, for example from an HTTP session.
       *
       * @api public
       */
      strategy.pass = function() {
        console.log("DEBUG PASSPORT AUTH PASS")
        next();
      };
      
      /**
       * Internal error while performing authentication.
       *
       * Strategies should call this function when an internal error occurs
       * during the process of performing authentication; for example, if the
       * user directory is not available.
       *
       * @param {Error} err
       * @api public
       */
      strategy.error = function(err) {
        console.log("DEBUG PASSPORT AUTH ERROR")
        if (callback) {
          return callback(err);
        }
        
        next(err);
      };
      
      // ----- END STRATEGY AUGMENTATION -----
    
      console.log("DEBUG PASSPORT AUTH STRAT")
      strategy.authenticate(req, options);
    })(0); // attempt
  };
};
