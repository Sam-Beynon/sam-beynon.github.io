// adds the resource to umbraco.resources module:
angular.module('umbraco.resources').factory('customApiResource',
    //pull in your dependencies,
    //$http is an AngularJS provided resource that handles http calls
    //umRequestHelper is an Umbraco provided resource that helps wrap promises and some other useful things.
    function ($http, umbRequestHelper) {
        // the factory object returned
        return {
            // this calls the ApiController we setup earlier
            getAll: function () {
                return umbRequestHelper.resourcePromise(
                    //take note of the route
                    //backoffice is required for all authorized controllers
                    //MyCustomPlugin is defined in the [PluginController] attribute on the api controller.
                    //MyCustomApi is the name of the class without the trailing "Controller"
                    //GetAll is the name of the method we are calling.
                    $http.get("backoffice/MyCustomPlugin/MyCustomApi/GetAll"),
                    //Second parameter is the error message that should occur if the call fails.
                    "Failed to retrieve data");
            }
        };
    }
);