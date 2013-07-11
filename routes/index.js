
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.upload = function(req, res){
  res.send('ok success!');
};

exports.uploadForm = function(req, res){
    res.render('uploadForm');
};