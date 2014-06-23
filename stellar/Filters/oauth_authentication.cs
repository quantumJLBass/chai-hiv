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

namespace stellar.Filters {
    /// <summary> </summary>
    public class oauth_authentication : IFilter {
        /// <summary> </summary>
        protected userService userService = new userService();
        /// <summary> </summary>
        protected helperService helperService = new helperService();
        /// <summary> </summary>
        public bool Perform(ExecuteWhen exec, IEngineContext context, IController controller, IControllerContext controllerContext) {





            return true;
        }
    }
}
