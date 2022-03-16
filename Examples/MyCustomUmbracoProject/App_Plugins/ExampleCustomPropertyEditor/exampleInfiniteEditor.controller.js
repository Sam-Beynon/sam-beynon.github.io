//firstly, add the contentResource as an injected parameter.
angular.module('umbraco').controller('exampleInfiniteEditorController',
    function ($scope, customApiResource, contentResource) {

        $scope.listOfRandomThings = [];
        customApiResource.getAll().then(function (returnValue) {
            $scope.listOfRandomThings = returnValue;
        })


        this.close = function () {
            $scope.model.close();
        } 

    });