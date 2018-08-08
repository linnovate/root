var userSchema = require('./user');

function superSeeAll(entity, next) {
    userSchema.find({})
        .then(docs => {
            entity.watchers = [];
            docs.forEach(doc => entity.watchers.push(doc._id));
            entity.permissions = superSeeAllPerms(entity.watchers);
            next();
        });
}

function superSeeAllPerms(newWatchers) {
    let newPerms = [];
    if (newWatchers.length > 0) {
        newWatchers.forEach(function (watcher) {
            let permLevel = 'editor';
            let watcherAddedPerms = { id: String(watcher), level: permLevel };
            newPerms.push(watcherAddedPerms);
        })
    }
    return newPerms;
}

module.exports = {
    superSeeAll: superSeeAll
}; 