//additional
const express = require("express");
const path = require("path");
const createError = require("http-errors");

const utils = require("./utils/Utils");
const { setCorsHeaders } = utils;

const apiRouter = require("./routes/api");
const constants = require("./Constants");

//const chatRouter = require("./routes/chat");

exports.setRoutes = (app, peerServer) => {
  app.use("/peerjsServer", peerServer);

  app.use("/api", apiRouter);

  //app.use("/chat", chatRouter);

  app.use(function (req, res, next) {
    if (req.headers["host"] === constants.SEED_DOMAIN_NAME) {
      let servedFile = "";
      if (req.url === "/") {
        servedFile = "index.html";
      } else {
        servedFile = decodeURI(req.url).substring(1);
      }
      res.sendFile(path.join(__dirname, "public", "seed", servedFile));
    } else {
      next();
    }
  });

  if (process.env.NODE_ENV === "production") {
    // domains specific routing
    // Serve any static files
    app.use(express.static(path.join(__dirname, "client/build")));

    // Handle React routing, return all requests to React app
    app.get("*", function (req, res) {
      res.sendFile(path.join(__dirname, "client/build", "index.html"));
    });
  }

  // catch 404 and forward to error handler
  app.use(function (err, req, res, next) {
    next(createError(404, err.toString()));
  });

  const dbControllerError = require("./controllers/DBcontrollerError");

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    dbControllerError.insertErrorToDb(err, req).then();
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    if (req.xhr) {
      res.send({ error: "Something failed!" + err.toString() });
    } else {
      //res.render('error',{message:err.toString(),error:err});
      setCorsHeaders(req, res);
      res.json("Description: " + err.toString());
    }
  });

  return app;
};
