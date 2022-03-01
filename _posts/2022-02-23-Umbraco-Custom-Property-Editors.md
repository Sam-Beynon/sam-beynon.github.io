---
layout: post
title: Everything I've learned about custom property editors in Umbraco 9.
---

Recently I have been working with property editors in Umbraco 9, more specifically creating custom property editors that return complex multi-level objects that need to be stored as JSON by the underlying system.

As a result of this, i have become aware of a large disconnect between the information provided on the subject of more complex tasks achievable within Umbraco and the often non-existent documentation that can make it rather difficult to identify how to do some of these operations, such as client-side validation using the `val-property-validator` directive provided by Umbraco.

This post is intended to be a journey of everything i have learned recently while working with custom property editors and will cover the following subjects

* Creating a basic property editor and registering it for use in Umbraco.
* Adding configuration to the property editor
* Using data from an Umbraco registered API in your property editor
* Using infinite editor style modals.
* Validating basic properties.
* Validating complex objects.
* Accessing other properties on the same document type.
* Converting complex objects into consumable front-end models using PropertyConverters. (For your razor views.)
* Adding 3rd party angularJS code to the module.
* Locating and understanding where the data lives in the Umbraco database.
* Examples : Creating a picker that is powered by an Umbraco DropDown data type.


## Creating a basic property editor and registering it for use in Umbraco.
Creating a custom property editor in Umbraco is a rather simple process, first of all you have to understand that a custom property editor is basically a "plugin" that needs to be registered inside the `App_Plugins` directory in your umbraco root. It's important to note that if the directory does no exist, you can just create it.

To register a new "plugin" you should first create a dedicated folder within the `App_Plugins` directory, with a name relevant to whatever the plugin will be used for, although the name doesn't really matter, it's nice to be able to identify what it is for at a glance.

So, create your folder, in my case i have named it "ExampleCustomPropertyEditor". It is important to take into consideration that a plugin can contain multiple custom property editors.

![The Umbraco install screen.]({{ site.baseurl }}/images/Umbraco-9-net-core-linux/umbraco-install-screen.png)

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

![The Umbraco install screen.]({{ site.baseurl }}/images/Umbraco-9-net-core-linux/umbraco-install-screen.png)

The result of creating these files and the package manifest is rather self explanatory, but to ensure there's no ambiguity, i'll give a brief explanation here, within the `package.manifest` you need to define the javascript files relevant to your plugin, you can include as many as you would like, same with the CSS files, within the `properyEditors` array you declare what the name and aliases of your property editor should be as well as a few other extra configuration options and the location of the angularJS view.

Once put together, this enables Umbraco to inject all this information into the back office AngularJS app, allowing it to render and use the relevant styles, html and javascript included within your custom files.

Your next step is to create content you require for your custom property editor, for this example i'll just create a very basic input that writes to the model and expand upon it as we progress through the post to cover some of the more in-depth topics.

In my html view, i'll create a very "umbraco" like structure, while you can create this with their built in directives, sometimes it's easier to just style some div's with their classes so that you don't have to work around some of the specific weirdness within their directives, especially when attempting to use a `umbProperty` directive, of which there is very little actual documentation. 

For my view I added the following content to my `exampleCustomPropertyEditor.html` file.
```

```
