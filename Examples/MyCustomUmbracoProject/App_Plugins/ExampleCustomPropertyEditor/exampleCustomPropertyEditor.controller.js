//firstly, add the contentResource as an injected parameter.
angular.module('umbraco').controller('exampleCustomPropertyEditorController',
    function ($scope, customApiResource, editorService) {

      


        let config = $scope.model.config;

        if (typeof (config.showAsTextArea) === 'undefined' || config.showAsTextArea === null)
            config.showAsTextArea = false;

        config.showAsTextArea = config.showAsTextArea === "0" ? false : true;

        $scope.showAsTextArea = config.showAsTextArea;

        $scope.listOfRandomThings = [];
        customApiResource.getAll().then(function (returnValue) {
            $scope.listOfRandomThings = returnValue;
        })


        $scope.openInfiniteEditor = function () {
            editorService.open($scope.infiniteEditorOptions);
        }


        $scope.infiniteEditorOptions = {
            title: "Infinite Editor Title",
            view: "/App_Plugins/ExampleCustomPropertyEditor/exampleInfiniteEditor.html",
            size: 'small', //small, medium or large
            submit: function (model) {

            },
            close: function () {
                editorService.close();
            }
        };



    });