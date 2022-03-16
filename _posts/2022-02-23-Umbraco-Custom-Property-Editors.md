---
layout: post
title: Everything I've learned about custom property editors in Umbraco 9.
---

Recently I have been working with property editors in Umbraco 9, more specifically creating custom property editors that return complex multi-level objects that need to be stored as JSON by the underlying system.

As a result of this, i have become aware of a large disconnect between the information provided on the subject of more complex tasks achievable within Umbraco and the often non-existent documentation that can make it rather difficult to identify how to do some of these operations, such as client-side validation using the `val-property-validator` directive provided by Umbraco.

This post is intended to be a journey of everything i have learned recently while working with custom property editors and will cover the following subjects

* Creating a basic property editor and registering it for use in Umbraco
* Adding configuration to the property editor
* Using data from an Umbraco registered Custom API in your property editor
* Using data from the Umbraco system in your property editor
* Using infinite editor style modals.
* Validating basic properties.
* Validating complex objects.
* Accessing other properties on the same document type.
* Converting complex objects into consumable front-end razor models using PropertyConverters.
* Adding 3rd party angularJS code to the module.
* Automatically populating related custom and system defined properties on the server side
* Automatically populating related custom and system defined properties on the client side


## Creating a basic property editor and registering it for use in Umbraco.
Creating a custom property editor in Umbraco is a rather simple process, first of all you have to understand that a custom property editor is basically a "plugin" that needs to be registered inside the `App_Plugins` directory in your umbraco root. It's important to note that if the directory does no exist, you can just create it.

To register a new "plugin" you should first create a dedicated folder within the `App_Plugins` directory, with a name relevant to whatever the plugin will be used for, although the name doesn't really matter, it's nice to be able to identify what it is for at a glance.

So, create your folder, in my case i have named it "ExampleCustomPropertyEditor". It is important to take into consideration that a plugin can contain multiple custom property editors.

![App_Plugins folder. ({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\App_Plugins_Folder.png)

Once you have created the new home folder for your plugin you need to add a manifest file, which is what Umbraco initially reads and processes to register your plugin related files in the application.

This file should be called `package.manifest`, this is what Umbraco expects and you should not deviate from this pattern.

Within your `package.manifest` you will need to define your property editor and refer to any additional files such as `.js` and `.css` files so that Umbraco will load them into the Back Office structure at start up. Your `package.manifest` should look something like this.

```Json
{
    // we can define multiple editors
    "propertyEditors": [
        {
            /*this must be a unique alias*/
            "alias": "customPropertyEditor",
            /*the name*/
            "name": "Custom Editor",
            /*the icon- You can find a list of them here, although the list is for V7, it mostly still works for V9 https://nicbell.github.io/ucreate/icons.html */ 
            "icon": "icon-list",
            /*grouping for "Select editor" dialog*/
            "group": "Common",
            /*the HTML file we will load for the editor*/
            "editor": {
                "view": "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.html"
            }
        }
    ],
     // array of CSS files we want to inject into the application on app_start
    "css": [
        "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.css"
    ],
    // array of JS files we want to inject into the application on app_start
    "javascript": [
        "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.controller.js"
    ]
}
```
After which you will obviously need to ensure that the files you have defined within the `package.manifest` exist. So that your folder structure would now look something more like this.

![App_Plugins folder. ({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\App_Plugins_Folder_Two.png)


The result of creating these files and the package manifest is rather self explanatory, but to ensure there's no ambiguity, i'll give a brief explanation here, within the `package.manifest` you need to define the javascript files relevant to your plugin, you can include as many as you would like, same with the CSS files, within the `properyEditors` array you declare what the name and aliases of your property editor should be as well as a few other extra configuration options and the location of the angularJS view.

Once put together, this enables Umbraco to inject all this information into the back office AngularJS app, allowing it to render and use the relevant styles, html and javascript included within your custom files.

Your next step is to create content you require for your custom property editor, for this example i'll just create a very basic input that writes to the model and expand upon it as we progress through the post to cover some of the more in-depth topics.

In my html view, I created a super simple input, with nothing magic about it. This is essentially a simplified textstring property editor, It will become more complex as we move on through the post, but for now i just want to show a very simple example.

For my view I added the following content to my `exampleCustomPropertyEditor.html` file.

```html
<div ng-controller="exampleCustomPropertyEditorController">
    <input type="text" placeholder="Enter some text" ng-model="model.value" />
</div>
```

You'll note that there is some odd non-standard html attributes applied to the elements, these are angularJS element directives, that allow us to bind our angularJS code to our view.

The `ng-controller` directive binds a specific controller to everything that is contained within the `<div>` element, while the `ng-model` is a rather nifty little directive, that essentially applies 2 way data binding, meaning that whenever you make a change to the `model.value` in the controller, or you modify the value of the text box, that change is instantly reflected in both.

It's important to note here, that property editors in Umbraco use the `$scope.model.value` to store the value of the property, which means we have to override the value with the new value to tell Umbraco what the new value is.

The next step is to create the controller inside our `exampleCustomPropertyEditor.controller.js` file, this will be where all the related javascript code will be located. For this example i've added a very simple controller to mine.

```js
angular.module('umbraco').controller('exampleCustomPropertyEditorController', function () {
    alert('I am triggered by the angular controller. If you see this, you have connected everything up correctly!');
});
```

As you can see, you set a controller of the same name as the one that is being referenced inside the html view, enabling the system to easily identify the controller that is required for this view when it is loaded up. 

I added a simple alert to the controller, just so that we see something JS related as soon as we open something that contains our new property editor.

At this point, you may wish to add some styles to your property editor, in this case, you'll add some rules to the `exampleCustomPropertyEditor.css` file that we have also created, to keep this brief, i'll add a single rule, just as evidence that it's working as expected.

```css
input {
    color:red;
}
```

An extremely brief example of the CSS binding, as it's fairly unrelated to my goals, i will not be going into much detail on CSS in this post. 

Now that we have created the configuration and files required for a custom property editor, we need to register it within the Umbraco system, to do this we need to open our Umbraco back office and navigate to `Settings -> Data Types`, click the three dots that appear when you hover over the `Data Types` folder and click the `New Data Type` option.

![Creating a new data type in Umbraco]({{ site.baseurl }}/images/Umbraco-Custom-Property-Editors/Create-A-New-Data-Type.png)

Which will then open up a new screen, you'll need to enter a name for your new `Data Type`, this should be something descriptive, as it's what an editor will see when they attempt to add it to a `Document Type`, for this example i have gone against this rule and just called it `My Custom Editor`, once you have named your new `Data Type` you need to set the `Property editor` drop down to the property editor you have just added to the system, this will be set to the name you applied to the `package.manifest`, the specific line that affects this is `"name": "Custom Editor"` as such mine appears as "Custom Editor" in the back office and then press `Save` in the bottom right.

![Creating a new data type in Umbraco]({{ site.baseurl }}/images/Umbraco-Custom-Property-Editors/Create-A-New-Data-Type-2.png)

Now the new `Data Type` should appear under the `Data Types` folder.

![Created a new data type in Umbraco]({{ site.baseurl }}/images/Umbraco-Custom-Property-Editors/data-type-created.png)

Which will then allow you to add the new `Data Type` as a property editor in a document type, like so.

![Using the custom property editor]({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\using-custom-property-editor-1.png)

Immediately after clicking submit on the popup that allows you to select the property type, if you followed along, you'll receive a javascript alert that matches the one in your controller, this is your first proof that everything you have configured is now working as expected, You'll also see a little preview window on the new property that should show the contents of the html view.

![Using the custom property editor]({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\using-custom-property-editor-2.png)

Having now added your new property to your `Document Type`, you will be able to see it on the `Document Type` when you go into the edit/create document type view, like so.

![Using the custom property editor]({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\edit-create-doc-type.png)

Now, as we bound the input directly to `model.value`, if you enter a value into the field, save it and reload the view, you will see the value has been saved and will appear on load of the document type from now on.

## Adding configuration to the property editor

Umbraco provides the functionality that allows you to pass configuration options into your custom property editor, these appear in the `Data Type` view, and allow a user to set specific flags and send values directly into the property editor which you can use to cater the relevant logic. 

You can see examples of this with the built in Umbraco `Data Types` such as the `Checkbox list`, which allows a user to set the values which will appear in the checkbox list.

![Using the custom property editor]({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\checkbox-list.png)

You can add as many seperate configuration options to your property editor as you want, these are controlled within the `package.manifest` and you add them below the `editor` block in the following manner.

```Json
{
    // we can define multiple editors
    "propertyEditors": [
      {
        /*this must be a unique alias*/
        "alias": "customPropertyEditor",
        /*the name*/
        "name": "Custom Editor",
        /*the icon- You can find a list of them here, although the list is for V7, it mostly still works for V9 https://nicbell.github.io/ucreate/icons.html */
        "icon": "icon-list",
        /*grouping for "Select editor" dialog*/
        "group": "Common",
        /*the HTML file we will load for the editor*/
        "editor": {
          "view": "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.html"
        }, //Remember your comma here
        //Configuration fields start here.
        "prevalues": {
          "fields": [
            {
              "label": "Show as Text Area?",
              "description": "If you tick this, the property will display as a text area instead of a single line text box.",
              "key": "showAsTextArea",
              "view": "boolean"
            }
          ]
        }
        //Configuration fields end here.
      }
    ],
     // array of CSS files we want to inject into the application on app_start
    "css": [
        "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.css"
    ],
    // array of JS files we want to inject into the application on app_start
    "javascript": [
        "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.controller.js"
    ]
}
```

Now, in the above example I have configured a check box to appear which I would eventually like to set the property editor as a text area, instead of a regular text box. I will get to how you consume the configuration values in a moment, but for now you should be able to see something along the lines of a checkbox or a switch with the label "Show as text area" when you are creating a new, or modifying an old `Data Type` as long as the custom property editor is selected.

An additional note here is that you can see all the built-in umbraco "views" for the fields by going to `wwwroot/umbraco/views/prevalueeditors` in your project and removing the ".html" from the end.

![Adding configuration to custom property editor]({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\display-configuration-options.png)

If I now set this value to true and save the `Data Type`, nothing happens because the JS Controller doesn't know anything about it, so the next step is to modify the controller and view to recognise the configuration option and handle it as required.

```Javascript
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
```


```Html
<div ng-controller="exampleCustomPropertyEditorController">
    <!--Add an ng-if to the input, to render it if showAsTextArea is false.-->
    <input type="text" placeholder="Enter some text" ng-model="model.value" ng-if="!showAsTextArea" />
    <!-- add a text area with the opposite ng-if so we can render it if showTextArea is true-->
    <!-- 4 rows, for fun-->
    <textarea placeholder="Enter some text" ng-model="model.value" ng-if="showAsTextArea" rows="4"></textarea>
</div>
```

Take note of the comments in the code snippets above, as they explain how everything works and fits together.

Now, once we've created that, we'll see a text area or input dependant on what that configuration setting is set to.

![Custom configuration options showcase]({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\configuration-options-1.png)


## Using data from an Umbraco registered API in your property editor

Alot of custom properties are likely to require custom data, data that you may store within the Umbraco database, or as part of another property. There are different ways to get at this information in the system, one of which is to provide an API for your angular controller to call, you do this "properly" by defining a re-usable resource.

While you can put these calls directly into your controller, it typically makes sense to wrap them in a factory so that they can be used anywhere you might need them without duplicating code.

So your first step in this case is to create an `UmbracoAuthorizedApiController`, these controllers are accessible only to back office authorised users and as such, external sources are unable to access them.

To create your consumable API, you need to create a class that inherits from `UmbracoAuthorizedApiController` which returns whatever data you want it too, this post isn't about business logic, or accessing databases, so i'll just return a hardcoded list of objects that my controller can consume.

```C#
using System.Collections.Generic;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;

namespace MyCustomUmbracoProject.Controllers
{

    //define your plugin controller here, this affects the route for the API endpoints.
    [PluginController("MyCustomPlugin")]
    //make sure you inherit from UmbracoAuthorisedApiController
    public class MyCustomApiController: UmbracoAuthorizedApiController
    {
        //Create a basic GetAll method
        public IEnumerable<string> GetAll()
        {
            //hard coded data.
            List<string> vs = new List<string>()
            {
                "string 1",
                "string 2",
                "string 3",
                "string 4",
                "string 5",
                "string 6",
                "string 7",
                "string 8",
            };
            //return that data to the consumer.
            return vs;
        }
    }
}
```

Now that you have an API that your angularJS controller can consume you need to create an angularJS resource. To do this, you need to create another js file, in my case i have created the file `~/App_Plugins/ExampleCustomPropertyEditor/customApi.resource.js` with the following contents 

```js
// adds the resource to umbraco.resources module:
angular.module('umbraco.resources').factory('customApiResource',
    //pull in your dependencies,
    //$http is an AngularJS provided resource that handles http calls
    //umbRequestHelper is an Umbraco provided resource that helps wrap promises and some other useful things.
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
```

I've put all the pertinent information into the comments on the resource code itself so that it's better contextualized.

After creating the resource you need to inject it into the back office inside your `package.manifest`, which is achieved by simply adding a second js file to the `javascript` block, like so.

```json
{
    // we can define multiple editors
    "propertyEditors": [
      {
        /*this must be a unique alias*/
        "alias": "customPropertyEditor",
        /*the name*/
        "name": "Custom Editor",
        /*the icon- You can find a list of them here, although the list is for V7, it mostly still works for V9 https://nicbell.github.io/ucreate/icons.html */
        "icon": "icon-list",
        /*grouping for "Select editor" dialog*/
        "group": "Common",
        /*the HTML file we will load for the editor*/
        "editor": {
          "view": "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.html"
        }, //Remember your comma here
        //Configuration fields start here.
        "prevalues": {
          "fields": [
            {
              "label": "Show as Text Area?",
              "description": "If you tick this, the property will display as a text area instead of a single line text box.",
              "key": "showAsTextArea",
              "view": "boolean"
            }
          ]
        }
        //Configuration fields end here.
      }
    ],
     // array of CSS files we want to inject into the application on app_start
    "css": [
        "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.css"
    ],
    // array of JS files we want to inject into the application on app_start
    "javascript": [
        "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.controller.js",
        "~/App_Plugins/ExampleCustomPropertyEditor/customApi.resource.js"
    ]
}
```

Once it is defined within the `package.manifest` you can inject it into your controller and utilise the `GetAll()` method to call the api and return the data, to do this, i modified my controller to the following.

```javascript
//First off, you add the customApiResource to the function parameter, to utilise the dependency injection.
angular.module('umbraco').controller('exampleCustomPropertyEditorController', function ($scope, customApiResource) {

    let config = $scope.model.config;

    if (typeof (config.showAsTextArea) === 'undefined' || config.showAsTextArea === null)
        config.showAsTextArea = false;

    config.showAsTextArea = config.showAsTextArea === "0" ? false : true;

    $scope.showAsTextArea = config.showAsTextArea;

    //Define your empty variable
    $scope.listOfRandomThings = [];

    //then you can call the api method like so.
    customApiResource.getAll().then(function (returnValue) {
        //returnValue is now the data passed back by the API which you can view by logging it to the console.
        console.log(returnValue);
        //it looks like...
        //Array(8)["string 1", "string 2", "string 3", "string 4", "string 5", "string 6", "string 7", "string 8"]

        //You could then render that by binding it to a scoped variable.
        $scope.listOfRandomThings = returnValue;
        //and adding an ng-repeat to the html.
    })


});
```
Once you've retrieved the data from the server and have bound it to a $scoped variable, you can access it from the html and display the data using html similar to the following.

```html
<div ng-controller="exampleCustomPropertyEditorController">
    <!--Add an ng-if to the input, to render it if showAsTextArea is false.-->
    <input type="text" placeholder="Enter some text" ng-model="model.value" ng-if="!showAsTextArea" />
    <!-- add a text area with the opposite ng-if so we can render it if showTextArea is true-->
    <!-- 4 rows, for fun-->
    <textarea placeholder="Enter some text" ng-model="model.value" ng-if="showAsTextArea" rows="4"></textarea>
  
    <!--this line is rendering data from the server side.-->
    <ul>
        <li ng-repeat="something in listOfRandomThings track by $index">{{something}}</li>
    </ul>
</div>
```

It's as simple as that! There are a few components around that you need to remember, but it does mean that everything is becoming re-usable throughout your properties and other relevant angular code, such as building custom dashboards. For reference, if you're following along with me, you'll see something as beautifully dull as the image below at this point.

![Data loaded from the server]({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\display-data-from-server.png)

## Using data from the Umbraco system in your property editor from angular resources

Umbraco provides a decent number of resources out of the box that allow us to access things like content, document types and data types without implementing custom API's to access the C# services, these are quite powerful as they allow you to build custom components that allow you to list things in your custom properties that aren't generally available as built-in property editors.

Some examples of things you can create with this are document type selectors, which would allow users to select one (or more) document types and attach it to a document as a property, or accessing data stored within the pre-values of a data type.

I'm going to provide an example of accessing a few resource, but the full list is available on their official documentation - https://apidocs.umbraco.com/v9/ui/#/api/umbraco.resources

The first thing you have to do is inject the relevant resource into your controller and then you can access it and call any of the underlying methods, of course you can see these methods in your browser with a simple `console.log()` if you prefer to avoid the documentation, in the following manner.

```javascript
//firstly, add the contentResource as an injected parameter.
angular.module('umbraco').controller('exampleCustomPropertyEditorController',
    function ($scope, customApiResource, contentResource) {

        //then you can console.log() it to find the underlying methods available to you.
        console.log(contentResource);
        //this returns the following - 
        //allowsCultureVariation: function allowsCultureVariation()
        //contentVersionPreventCleanup: function contentVersionPreventCleanup(contentId, versionId, preventCleanup)
        //copy: function copy(args)
        //createBlueprintFromContent: function createBlueprintFromContent(contentId, name)
        //deleteBlueprint: function deleteBlueprint(id)
        //deleteById: function deleteById(id)
        //emptyRecycleBin: function emptyRecycleBin()
        //getBlueprintById: function getBlueprintById(id)
        //getBlueprintScaffold: function getBlueprintScaffold(parentId, blueprintId)
        //getById: function getById(id)
        //getByIds: function getByIds(ids)
        //getChildren: function getChildren(parentId, options)
        //getCultureAndDomains: function getCultureAndDomains(id)
        //getDetailedPermissions: function getDetailedPermissions(contentId)
        //getNiceUrl: function getNiceUrl(id)
        //getNotifySettingsById: function getNotifySettingsById(id)
        //getPagedContentVersions: function getPagedContentVersions(contentId, pageNumber, pageSize, culture)
        //getPublicAccess: function getPublicAccess(contentId)
        //getRecycleBin: function getRecycleBin()
        //getRollbackVersion: function getRollbackVersion(versionId, culture)
        //getRollbackVersions: function getRollbackVersions(contentId, culture)
        //getScaffold: function getScaffold(parentId, alias)
        //getScaffoldByKey: function getScaffoldByKey(parentId, contentTypeKey)
        //getScaffoldByKeys: function getScaffoldByKeys(parentId, scaffoldKeys)
        //getScaffolds: function getScaffolds(parentId, aliases)
        //move: function move(args)
        //publish: function publish(content, isNew, files, showNotifications)
        //publishById: function publishById(id)
        //publishWithDescendants: function publishWithDescendants(content, isNew, force, files, showNotifications)
        //removePublicAccess: function removePublicAccess(contentId)
        //rollback: function rollback(contentId, versionId, culture)
        //save: function save(content, isNew, files, showNotifications)
        //saveBlueprint: function saveBlueprint(content, isNew, files, showNotifications)
        //saveLanguageAndDomains: function saveLanguageAndDomains(model)
        //savePermissions: function savePermissions(saveModel)
        //saveSchedule: function saveSchedule(content, isNew, files, showNotifications)
        //sendToPublish: function sendToPublish(content, isNew, files, showNotifications)
        //setNotifySettingsById: function setNotifySettingsById(id, options)
        //sort: function sort(args)
        //unpublish: function unpublish(id, cultures)
        //updatePublicAccess: function updatePublicAccess(contentId, groups, usernames, loginPageId, errorPageId)

        //Knowing what your own root node id is you can then access it like so.
        contentResource.getById(1057).then(function (response) {
            //log your response
            console.log(response);
            //this looks something like this for me.
            //allowPreview: true
            //allowedActions: Array(19)["C", "A", "D", … ]
            //allowedTemplates: Object { }
            //apps: Array[{ … }, { … }]
            //contentTypeAlias: "testDocumentType"
            //contentTypeId: 1056
            //contentTypeKey: "74f69d59-749f-4785-9bf2-cddd59447af8"
            //contentTypeName: "Test Document Type"
            //documentType: Object { alias: "testDocumentType", updateDate: "2022-03-03 12:37:46", createDate: "2022-03-03 12:37:46", … }
            //icon: "icon-item-arrangement"
            //id: 1057
            //isBlueprint: false
            //isChildOfListView: false
            //isContainer: false
            //isElement: false
            //key: "7e6e67ff-228a-4b5b-806c-e7d6d6ec2f6f"
            //metaData: null
            //notifications: Array[]
            //owner: Object { id: -1, name: "Sam" }
            //parentId: -1
            //path: "-1,1057"
            //sortOrder: 0
            //template: null
            //templateId: 0
            //trashed: false
            //treeNodeUrl: "/umbraco/backoffice/umbracotrees/contenttree/GetTreeNode/7e6e67ff228a4b5b806ce7d6d6ec2f6f"
            //udi: "umb://document/7e6e67ff228a4b5b806ce7d6d6ec2f6f"
            //updateDate: "2022-03-03 12:52:17"
            //updater: Object { id: -1, name: "Sam" }
            //urls: Array[{ … }]
            //variants: Array[{ … }]


            //You can then bind any data you want  to a scoped variable and display it in the front end using angularjs binding.
        })


        let config = $scope.model.config;

        if (typeof (config.showAsTextArea) === 'undefined' || config.showAsTextArea === null)
            config.showAsTextArea = false;

        config.showAsTextArea = config.showAsTextArea === "0" ? false : true;

        $scope.showAsTextArea = config.showAsTextArea;

        $scope.listOfRandomThings = [];
        customApiResource.getAll().then(function (returnValue) {
            $scope.listOfRandomThings = returnValue;
        })


    });
```

This example is solely there to show you how to access these resources, and how to find the information you might require.
Unforunately the `ContentResource` has very specific use cases and typically requires you to know the id of something you want to access, but alot of the other resources typically have a `GetAll` method that you will be able to use, allowing people to select specific items so you are able to capture the value and run operations on it using different available methods, I may go into more detail on using specific resources in future posts, but for the scope of this post, a general understanding of how to access them is the goal.

## Using infinite editor style modals.

Umbraco provides a nice service called the `editorService` which allows us to open media pickers and some other built in pickers, while also providing us with the ability to open custom infinite editors.
An infinite editor is one of the lovely little panels that slides in from the right of the screen when you are using a media picker, you can add whatever UI and data you want to the infinite editor and utilise it to pass data down to your custom property editor.

In my example here, I'm going to add create an infinite editor that displays the list of strings that I previously created, pulled down from an API, allow a user to select one and then display the selected string in the custom property editor, it's a nice way to seperate large amounts of selectable content especially content like media and content nodes that have a larger information set to portray to the selector than something that can just be stored within a simple dropdown.

So my first step when creating an infinite editor is to create a new html,js and css file to house the view, controller and styles for the content that will be displayed within the infinite editor.

As such I create the following files

![App_Plugins structure after creating infinite editor files]({{ site.baseurl }}/images\Umbraco-Custom-Property-Editors\infinite-editor-create-files.png)

Following by referencing these new files within the `package.manifest`, an interesting point with these editors, is that you do not provide the html view to the `package.manifest` as you directly refer to it in the call to the infinite editor service, so my `package.manifest` ends up looking like so.

```C#
{
    // we can define multiple editors
    "propertyEditors": [
      {
        /*this must be a unique alias*/
        "alias": "customPropertyEditor",
        /*the name*/
        "name": "Custom Editor",
        /*the icon- You can find a list of them here, although the list is for V7, it mostly still works for V9 https://nicbell.github.io/ucreate/icons.html */
        "icon": "icon-list",
        /*grouping for "Select editor" dialog*/
        "group": "Common",
        /*the HTML file we will load for the editor*/
        "editor": {
          "view": "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.html"
        }, //Remember your comma here
        //Configuration fields start here.
        "prevalues": {
          "fields": [
            {
              "label": "Show as Text Area?",
              "description": "If you tick this, the property will display as a text area instead of a single line text box.",
              "key": "showAsTextArea",
              "view": "boolean"
            }
          ]
        }
        //Configuration fields end here.
      }
    ],
     // array of CSS files we want to inject into the application on app_start
  "css": [
    "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.css",
    "~/App_Plugins/ExampleCustomPropertyEditor/exampleInfiniteEditor.css"
  ],
    // array of JS files we want to inject into the application on app_start
  "javascript": [
    "~/App_Plugins/ExampleCustomPropertyEditor/exampleCustomPropertyEditor.controller.js",
    "~/App_Plugins/ExampleCustomPropertyEditor/exampleInfiniteEditor.controller.js",
    "~/App_Plugins/ExampleCustomPropertyEditor/customApi.resource.js"
  ]
}
```

Once these files have been inserted into the `package.manifest` like this, they will, as per the previous steps be injected into the back office application and allow us to access them, now, while the html view does not need to be declared, the css and JS do, firstly, because the CSS can actually be used anywhere within the application and secondly, the controller within your angularJS code needs to be injected into the module, which is best done at startup.

Now we can focus on building up the content of these files, what I need to do here is fairly simple, I just need to pull the data down and display it with radio boxes, so a user can select a specific row and then pass that row back to the property editor.

First of all, I'll build up a typical controller and view like so.

```JavaScript
angular.module('umbraco').controller('exampleInfiniteEditorController',
    function ($scope, customApiResource) {

        $scope.listOfRandomThings = [];
        customApiResource.getAll().then(function (returnValue) {
            $scope.listOfRandomThings = returnValue;
        })


    });
```

This will load down the list of strings that I create within a custom API controller from a previous section of this post, and then the view will display it like so.

```html
<div ng-controller="exampleInfiniteEditorController">  
    <umb-panel>
        <umb-editor-view>
            <umb-editor-container>
                <ng-form>
                    <div ng-repeat="something in listOfRandomThings track by $index">
                        <span>
                            <input type="radio" id="{{something}}" value="{{something}}" name="selectedRandomThing" ng-model="selectedRandomThing" />
                        </span>
                        <span>
                            {{something}}
                        </span>

                    </div>
                </ng-form>
            </umb-editor-container>
        </umb-editor-view>

        <umb-editor-footer >
            <umb-editor-footer-content-right>
                <umb-button action="model.close()"
                            type="button"
                            button-style="action"
                            state="vm.saveButton.state"
                            label="Close"
                            disabled="vm.buttonState === 'busy'">
                </umb-button>
                <umb-button action="model.save()"
                            type="button"
                            button-style="action"
                            state="vm.saveButton.state"
                            shortcut="ctrl+s"
                            label="Save"
                            disabled="vm.buttonState === 'busy'">
                </umb-button>
            </umb-editor-footer-content-right>
        </umb-editor-footer>

    </umb-panel>
    
    
</div>
```

This view will load a simple list of strings with associated checkboxes and then bind the selected value to the `$scope.selectedRandomThing` variable, which will be automatically defined and created for us by angularJS as soon as an item is selected. As well as this, it will create umbraco styled buttons along the bottom of the editor, in keeping with the standard umbraco styles.

Now, the next step to achieving this, is to add the code we require to our custom property editor, to call and open an infinite editor with this content in, we can do this using the `editorService` like so.

```javascript
angular.module('umbraco').controller('exampleCustomPropertyEditorController',
//note the editorService, injected.
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


        //use the editorService to open your editor.
        $scope.openInfiniteEditor = function () {
            editorService.open($scope.infiniteEditorOptions);
        }

        //set up some configuration options for the infinite editor.
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

```

And we'll need to add a button, or some form of trigger to the property editor to allow us to call the infinite editor.

```html


```


## Validating basic properties.
//val-property-validator
//strings, ints, bools, etc.

## Validating complex objects.
//val-property-validator with an object instead of a string/bool val.

## Automatically populating related custom and system defined properties on the server side
//notifications
## Automatically populating related custom and system defined properties on the client side
//traverse scope chain and see if this is possible.

## Converting objects into consumable front-end razor models using PropertyConverters. 

//How to use property converters.

## Adding 3rd party angularJS code to the module.
//Simple, module definition, need to find a package to include. https://angular-ui.github.io/


And there you have it, my attempt at sharing the knowledge I have gained regarding custom property editors in Umbraco 9, and while some of these features/techniques will work nicely with custom dashboards as well, they are a bit of a different ballgame, so I'll cover some bits on them in the future, but for now, stay safe and have a wonderful day.