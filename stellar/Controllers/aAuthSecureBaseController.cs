using Castle.MonoRail.Framework;
using stellar.Services;
using System.Text.RegularExpressions;
using System;
using stellar.Models;
using Castle.ActiveRecord;
using stellar.Filters;
//using MonoRailHelper;
using DotNetOpenAuth.OAuth2;


//to remove in lue of service
namespace stellar.Controllers {
    /// <summary> </summary>
    [Filter(ExecuteWhen.BeforeAction, typeof(oauth_authentication))]
    public abstract class aAuthSecureBaseController : BaseController {
        /// <summary> </summary>
        public aAuthSecureBaseController() {
            //Controllers.BaseController.in_api = true;
            Controllers.BaseController.current_controller = "aAuthSecureBase";
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
