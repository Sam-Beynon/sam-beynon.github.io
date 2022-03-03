//Don't forget to add the $scope to the function parameters, this pulls it in via AngularJS dependency injection
angular.module('umbraco').controller('exampleCustomPropertyEditorController', function ($scope) {

    //Umbraco stores the configuration information inside $scope.model.config.
    //So let's alias it for slightly more readable code.
    let config = $scope.model.config;

    //Now we have our config object, we can console.log() it so we can see exactly what's in it from a quick console glance.
    console.log(config);

    //this then reports the following information to the browser config.
    //Object { showAsTextArea: "1" }
    //If you had multiple configuration options, you would see a property for each one.

    //set a default value of false if the config option wasn't passed in, it's likely you haven't saved your data type since adding the config option.
    if (typeof (config.showAsTextArea) === 'undefined' || config.showAsTextArea === null)
        config.showAsTextArea = false;


    //check the value, as it's passed in a string, we'll convert to boolean.
    config.showAsTextArea = config.showAsTextArea === "0" ? false : true;

    //Apply the value to a $scoped variable, for easy, concise access.
    $scope.showAsTextArea = config.showAsTextArea;

});