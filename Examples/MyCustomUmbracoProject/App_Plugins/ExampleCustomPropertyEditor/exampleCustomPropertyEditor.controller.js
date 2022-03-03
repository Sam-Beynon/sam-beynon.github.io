//First off, you add the customApiResource to the function parameter, to utilise the dependency injection.
angular.module('umbraco').controller('exampleCustomPropertyEditorController', function ($scope, customApiResource) {

    let config = $scope.model.config;

    if (typeof (config.showAsTextArea) === 'undefined' || config.showAsTextArea === null)
        config.showAsTextArea = false;

    config.showAsTextArea = config.showAsTextArea === "0" ? false : true;

    $scope.showAsTextArea = config.showAsTextArea;

    //then you can call the api method like so.
    customApiResource.getAll().then(function (returnValue) {
        //returnValue is now the data passed back by the API which you can view by logging it to the console.
        console.log(returnValue);
        //it looks like...
        //Array(8)["string 1", "string 2", "string 3", "string 4", "string 5", "string 6", "string 7", "string 8"]

        //You could then render that by binding it to a scoped variable.
        $scope.listOfRandomThings = returnValue;
        //and adding an ng-for to the html.
    })


});