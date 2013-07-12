var path = require('path');
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.upload = function(req, res){
  console.log(path.basename(req.files.file.path));
  res.send('ok success!');
};

exports.uploadForm = function(req, res){
    res.render('uploadForm');
};