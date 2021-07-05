module.exports = {
    checkLocationPath: function (location) {
        if (location.slice(-1) !== '/') {
            location = location + '/';
        }
        return location;
    },
    checkProjectName: function (project) {
        project = project.replace(/ /g, "_");
        return project;
    }
};