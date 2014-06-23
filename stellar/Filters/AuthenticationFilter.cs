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
using stellar.Filters;

namespace stellar.Filters {
    /// <summary> </summary>
    public class AuthenticationFilter : IFilter {
        /// <summary> </summary>
        public bool Perform(ExecuteWhen exec, IEngineContext context, IController controller, IControllerContext controllerContext) {
            if (context.Request.IsLocal)
                return true;
            // Read previous authenticated principal from session 
            // (could be from cookie although with more work)
            User user = (User)context.Session["user"];

            // Sets the principal as the current user
            context.CurrentUser = user;
            if (Controllers.BaseController.authenticated()) return true;

            // Checks if it is OK
           // if (context.CurrentUser == null ||
           //     !context.CurrentUser.Identity.IsAuthenticated ||
           //     !Authentication.logged_in())
           // {
                if (Controllers.BaseController.authenticated()) {
                // Not authenticated, redirect to login
                    String username = System.Web.HttpContext.Current.Response.Cookies["unldap"].Value;
                context.Session["authusername"] = username;
                //context.CurrentController.PropertyBag["authusername"] = username;
                // further filter if necessary
            }
            // Everything is ok
            return true;
        }
    }
}