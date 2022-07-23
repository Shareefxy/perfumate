module.exports = {
    errorHandler: (err, req, res, next) => {
      res.send("async wrapper error"+err)
    },
  };