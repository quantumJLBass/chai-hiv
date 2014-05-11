#region using
using System;
using System.Web;
using Castle.MonoRail.Framework;
using stellar.Models;
//using MonoRailHelper;
using stellar.Services;
#endregion

namespace stellar.Filters{
    public class scriptFilter : IFilter{

        public bool Perform(ExecuteWhen exec, IEngineContext context, IController controller, IControllerContext controllerContext){

            controllerContext.PropertyBag["objectService"] = new objectService();
            controllerContext.PropertyBag["scriptsService"] = new scriptsService();
            controllerContext.PropertyBag["htmlService"] = new htmlService();
            controllerContext.PropertyBag["settings"] = new settingsService();
            controllerContext.PropertyBag["postingService"] = new postingService();
            controllerContext.PropertyBag["themeService"] = new themeService();
            controllerContext.PropertyBag["taxonomyService"] = new taxonomyService();
            controllerContext.PropertyBag["userService"] = new userService();

            Boolean loggedin = Controllers.BaseController.authenticated();
            Boolean viewstate = false;

            if (Controllers.BaseController.authenticated()) {
                viewstate = userService.checkPrivleage("is_view_only");
            }
            HttpCookie myCookie = Controllers.BaseController.context().Request.Cookies["hivviewonly"];


            if (Controllers.BaseController.context().Request.Params["viewonly"] == "1") {
                viewstate = true;
            }
            if (myCookie != null) {
                viewstate = Convert.ToBoolean(myCookie.Value);
            }


            controllerContext.PropertyBag["viewonly"] = viewstate;


            controllerContext.PropertyBag["signedin"] = loggedin;
            //if(admin)
            if (siteService.is_admin()) {
                controllerContext.PropertyBag["versionService"] = new versionService();
                
                controllerContext.PropertyBag["file_info"] =  new file_info();
            }
            /*site based.  Must be installed first*/
            if (Controllers.installController.is_installed()){
                controllerContext.PropertyBag["current_site"] = siteService.getCurrentSite();
                controllerContext.PropertyBag["siteService"] = new siteService();
                controllerContext.PropertyBag["site_ext"] = Controllers.BaseController.site_ext;
            }

            return true;
        }
    }
}
