using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using Castle.MonoRail.Framework;
using Castle.MonoRail.ActiveRecordSupport;
using Castle.ActiveRecord;
using stellar.Models;
using System.Security.Principal;
//using MonoRailHelper;
using stellar.Services;
using Microsoft.Exchange.WebServices.Data;
using log4net;
using System.Collections;

namespace stellar.Filters {
    public class user_authentication : IFilter {
        ILog log = log4net.LogManager.GetLogger("user_authentication");

        protected userService userService = new userService();
        protected helperService helperService = new helperService();
        public bool Perform(ExecuteWhen exec, IEngineContext context, IController controller, IControllerContext controllerContext) {

            //this should be removed
            if (!Controllers.BaseController.authenticated()) System.Web.HttpContext.Current.Response.Redirect("~/center/login.castle");

            controllerContext.PropertyBag["post_types"] = ActiveRecordBase<posting_type>.FindAll();
            controllerContext.PropertyBag["userService"] = userService;
            controllerContext.PropertyBag["helperService"] = helperService;
            controllerContext.PropertyBag["user"] = userService.getUserFull();
            
            //return true;

            if (context.Request.IsLocal) {
                if (!controllerContext.Action.Contains("install") && ActiveRecordBase<appuser>.Exists()) {
                    //controllerContext.PropertyBag["campuses"] = ActiveRecordBase<campus>.FindAll();
                    controllerContext.PropertyBag["post_types"] = ActiveRecordBase<posting_type>.FindAll();
                    controllerContext.PropertyBag["userService"] = userService;
                    controllerContext.PropertyBag["helperService"] = helperService;
                    controllerContext.PropertyBag["user"] = userService.getUserFull();
                }
                return true;
            }
            // Read previous authenticated principal from session 
            // (could be from cookie although with more work)
            User user = (User)context.Session["user"];

            // Redirect to dailystellar.wsu.edu because dailystellar.com can't catch the cookie
            //if (context.Request.Uri.ToString().ToLower().Contains("dailystellar.com"))
            //{
            //     context.Response.Redirect("http://dev.stellar.wsu.edu/admin");
            //     return false;
            //}
            // Sets the principal as the current user
            context.CurrentUser = user;
            if (Controllers.BaseController.authenticated()) return true;
            // Checks if it is OK
            //if (context.CurrentUser == null ||
            //    !context.CurrentUser.Identity.IsAuthenticated ||
            //    !Authentication.logged_in())
            if (Controllers.BaseController.authenticated()) {
                // Not authenticated, redirect to login
                String username = userService.getNid();





                appuser[] users = ActiveRecordBase<appuser>.FindAllByProperty("nid", username);

                if (users.Length == 0) {
                    //context.Response.RedirectToUrl("~/admin", false);
                    //return false;
                }
                //context.Session["manager"] = true;
                //context.Cookies["unldap"].Value = username;
                user = new User(username, new String[0]);
                context.CurrentUser = user;
                System.Threading.Thread.CurrentPrincipal = user;
            }


            if (userService.isLogedIn())// || Authentication.logged_in()) /* not 100% we can't just strip off the Authentication.*/
            {
                appuser currentUser = userService.getUser();
                if (currentUser != null) {
                    appuser you = ActiveRecordBase<appuser>.Find(currentUser.baseid);
                    you.logedin = true;
                    you.last_active = DateTime.Now;
                    ActiveRecordMediator<appuser>.Update(you);
                    ActiveRecordMediator<appuser>.Save(you);
                }
            }
            if (!controllerContext.Action.Contains("install")) {
               // controllerContext.PropertyBag["campuses"] = ActiveRecordBase<campus>.FindAll();
                controllerContext.PropertyBag["post_types"] = ActiveRecordBase<posting_type>.FindAll();
                controllerContext.PropertyBag["userService"] = userService;
                controllerContext.PropertyBag["helperService"] = helperService;
                controllerContext.PropertyBag["user"] = userService.getUserFull();
            }
            // Everything is ok
            return true;
        }
    }
}
