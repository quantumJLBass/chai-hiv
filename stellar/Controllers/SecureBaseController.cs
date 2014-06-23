using Castle.MonoRail.Framework;
using stellar.Services;
using System.Text.RegularExpressions;
using System;
using stellar.Models;
using Castle.ActiveRecord;
using stellar.Filters;
//using MonoRailHelper;
using DotNetOpenAuth.OAuth2;
namespace stellar.Controllers {
    /// <summary> </summary>
    [Filter(ExecuteWhen.BeforeAction, typeof(user_authentication))]
    public abstract class SecureBaseController : BaseController {
        /// <summary> </summary>
        public SecureBaseController() {
            Controllers.BaseController.in_admin = true;
        }
        /// <summary> </summary>
        public void logout() {
            if (userService.logoutUser()) {
                logger.writelog("user logged out");
                HttpContext.Session.Abandon();
                HttpContext.Response.Redirect("~/admin", false);
                HttpContext.ApplicationInstance.CompleteRequest();
            }
            return;
        }
    }
}
