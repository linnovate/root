var mongoose = require('mongoose'),
  Project = mongoose.model('Project');


exports.render = function(req, res) {
  Project.findById(req.params.id).populate('creator').exec(function(err, project) {
    if(err || !project) return res.status(500).send('Oops! Something went wrong.');
    res.render('project', {
      project: {
        title: project.title,
        id: project._id.toString(),
        creatorUid: project.creator.uid.toString()
      }
    });
  });
};
