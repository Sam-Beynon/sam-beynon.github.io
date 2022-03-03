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
