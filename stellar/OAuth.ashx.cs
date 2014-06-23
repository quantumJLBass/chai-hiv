using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.SessionState;
using DotNetOpenAuth.OAuth;
using stellar.Code;
using DotNetOpenAuth.Messaging;
using stellar.Tools;
using DotNetOpenAuth.OAuth.Messages;

namespace stellar {
    /// <summary> </summary>
    public class OAuth : IHttpHandler, IRequiresSessionState {
        ServiceProvider sp;

        /// <summary> </summary>
        public OAuth() {
            sp = new ServiceProvider(Constants.SelfDescription, GlobalApplication.TokenManager, new CustomOAuthMessageFactory(GlobalApplication.TokenManager));
        }

        /// <summary> </summary>
        public void ProcessRequest(HttpContext context) {
            IProtocolMessage request = sp.ReadRequest();
            RequestScopedTokenMessage requestToken;
            UserAuthorizationRequest requestAuth;
            AuthorizedTokenRequest requestAccessToken;
            if ((requestToken = request as RequestScopedTokenMessage) != null) {
                var response = sp.PrepareUnauthorizedTokenMessage(requestToken);
                sp.Channel.Send(response);
            } else if ((requestAuth = request as UserAuthorizationRequest) != null) {
                GlobalApplication.PendingOAuthAuthorization = requestAuth;
                HttpContext.Current.Response.Redirect("~/Sites/Authorize.aspx");
            } else if ((requestAccessToken = request as AuthorizedTokenRequest) != null) {
                var response = sp.PrepareAccessTokenMessage(requestAccessToken);
                sp.Channel.Send(response);
            } else {
                throw new InvalidOperationException();
            }
        }

        /// <summary> </summary>
        public bool IsReusable {
            get { return true; }
        }
    }
}