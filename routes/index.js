
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.upload = function(req, res){
  console.log(req.files.file);
  res.send('ok success!');
};

exports.uploadForm = function(req, res){
    res.render('uploadForm');
};