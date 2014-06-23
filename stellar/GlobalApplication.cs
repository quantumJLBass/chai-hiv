namespace stellar {
    using System;
    using System.Linq;
    using System.Web;
    using Castle.Windsor;
    using Castle.Windsor.Configuration.Interpreters;
    using Castle.ActiveRecord;
    //using MonoRailHelper;
    using stellar.Models;
    using System.Net.Mail;
    using System.IO;
    using System.Reflection;
    using stellar.Services;
    using System.Configuration;
    using System.Data;
    using NHibernate.Engine;
    using System.Data.SqlClient;
    using Microsoft.SqlServer.Management.Common;

    using System.Collections.Generic;
    using DotNetOpenAuth.OAuth.ChannelElements;
    using stellar.Tools;
    using stellar.Code;
    using DotNetOpenAuth.OAuth.Messages;
    using stellar.oauth.Code;


    /// <summary> </summary>
    class FirstRequestInitialization {

        private static bool s_InitializedAlready = false;
        private static Object s_lock = new Object();

        // Initialize only on the first request

        /// <summary> </summary>
        public static void Initialize(HttpContext context) {

            if (s_InitializedAlready) {

                return;
            }

            lock (s_lock) {

                if (s_InitializedAlready) {

                    return;
                }

                // Perform first-request initialization here ...

                s_InitializedAlready = true;
            }

        }

    }


    /// <summary> </summary>
    public class GlobalApplication : HttpApplication, IContainerAccessor {
        private static IWindsorContainer container;
        /* ok this is  for the plugins.. it's in ref to 
         * http://docs.castleproject.org/Windsor.Three-Calls-Pattern.ashx
         * so go back to that.
         
        public IWindsorContainer BootstrapContainer() {
            return new WindsorContainer()
                    .Install(Configuration.FromAppConfig(),
                        FromAssembly.This()
                    //perhaps pass other installers here if needed 
                );
        }
        */


        /// <summary> </summary>
        public GlobalApplication() {
        }

        #region IContainerAccessor

        /// <summary> </summary>
        public IWindsorContainer Container {
            get { return container; }
        }

        #endregion


        #region(auth parts)
        /// <summary> </summary>
            public static stellar.Models.appuser LoggedInUser {
                get { return GlobalApplication.Users.SingleOrDefault(user => user.nid == HttpContext.Current.User.Identity.Name.ToString()); }
            }

            /// <summary> </summary>
            public static void AuthorizePendingRequestToken() {
                ITokenContainingMessage tokenMessage = PendingOAuthAuthorization;
                TokenManager.AuthorizeRequestToken(tokenMessage.Token, LoggedInUser);
                PendingOAuthAuthorization = null;
            }

            /// <summary> </summary>
            public static List<OAuthConsumer> Consumers { get; set; }
            /// <summary> </summary>
            public static List<OAuthToken> AuthTokens { get; set; }
            /// <summary> </summary>
            public static List<Nonce> Nonces { get; set; }
            /// <summary> </summary>
            public static List<appuser> Users { get; set; }

            /// <summary> </summary>
            public static DatabaseNonceStore NonceStore { get; set; }
            /// <summary> </summary>
            public static DatabaseKeyNonceStore KeyNonceStore { get; set; }

            /// <summary> </summary>
            public static DatabaseTokenManager TokenManager { get; set; }

            /// <summary> </summary>
            public static UserAuthorizationRequest PendingOAuthAuthorization {
                get { return HttpContext.Current.Session["authrequest"] as UserAuthorizationRequest; }
                set { HttpContext.Current.Session["authrequest"] = value; }
            }
            /// <summary>
            /// Gets the transaction-protected database connection for the current request.
            /// </summary>
            public static DataClassesDataContext DataContext {
                get {
                    DataClassesDataContext dataContext = DataContextSimple;
                    if (dataContext == null) {
                        dataContext = new DataClassesDataContext();
                        dataContext.Connection.Open();
                        dataContext.Transaction = dataContext.Connection.BeginTransaction();
                        DataContextSimple = dataContext;
                    }

                    return dataContext;
                }
            }

            /*public static User LoggedInUser {
                get { return DataContext.Users.SingleOrDefault(user => user.OpenIDClaimedIdentifier == HttpContext.Current.User.Identity.Name); }
            }*/

            /// <summary> </summary>
            private static DataClassesDataContext DataContextSimple {
                get {
                    if (HttpContext.Current != null) {
                        return HttpContext.Current.Items["DataContext"] as DataClassesDataContext;
                    } else {
                        throw new InvalidOperationException();
                    }
                }

                set {
                    if (HttpContext.Current != null) {
                        HttpContext.Current.Items["DataContext"] = value;
                    } else {
                        throw new InvalidOperationException();
                    }
                }
            }
        #endregion

            /// <summary> </summary>
            protected void Application_Start(object sender, EventArgs e) {

                if (HttpContext.Current.Request.Url.ToString().IndexOf("/api/") > -1) {
                    Consumers = new List<OAuthConsumer>();
                    Consumers.Add(new OAuthConsumer { Key = "key1", Secret = "secret1", Callback = new Uri("http://localhost:51439/") });

                    Nonces = new List<Nonce>();


                    //remove later
                    Users = new List<appuser>();
                    Users.Add(new appuser { nid = "test", password = "test" });

                    AuthTokens = new List<OAuthToken>();


                    string appPath = HttpContext.Current.Request.ApplicationPath;
                    if (!appPath.EndsWith("/")) {
                        appPath += "/";
                    }

                    GlobalApplication.TokenManager = new DatabaseTokenManager();
                    GlobalApplication.NonceStore = new DatabaseNonceStore();
                }

        }



            /// <summary> </summary>
        public void Application_OnStart() {



            container = new WindsorContainer(new XmlInterpreter());

            try{
                // !Controllers.installController.is_installed() && 
                    String path = Context.Server.MapPath("/config/export.sql");
                    ActiveRecordStarter.GenerateCreationScripts(path);
                    String export = "";
                    using (StreamReader srM = new StreamReader(path)) {
                        export = srM.ReadToEnd();
                    }

                    String sql_prep = Context.Server.MapPath("/config/sql_prep.sql");
                    String prep = "";
                    using (StreamReader srM = new StreamReader(sql_prep)) {
                        prep = srM.ReadToEnd();
                    }
                    using (StreamReader sr = new StreamReader(Context.Server.MapPath("/config/defaults.sql"))) {   //use the config project name.. from intall controller area
                        string connectionSting = ConfigurationManager.ConnectionStrings[0].ConnectionString;
                        var sfimpl = ActiveRecordMediator.GetSessionFactoryHolder().GetSessionFactory(typeof(object));
                        IDbConnection conn = ((ISessionFactoryImplementor)sfimpl).ConnectionProvider.GetConnection();
                        //set with a fresh data base.  Later an update script will be needed
                        SqlConnection sqlConnection = new SqlConnection(conn.ConnectionString);
                        ServerConnection svrConnection = new ServerConnection(sqlConnection);

                        string server = svrConnection.SqlConnectionObject.DataSource;
                        string database = svrConnection.SqlConnectionObject.Database;

                        String line = @"USE [" + database + @"] 
    GO 
    " + prep + @"
    " + export + @"
    " + sr.ReadToEnd();
                        File.WriteAllText(path, line);
                    }
               if (System.Web.HttpContext.Current.Request.IsLocal) {  }
            } catch { }//truth of the matter, if Request is not there then we are on the server and the export is already set


        }
        protected void Session_Start(object sender, EventArgs e) {
            if ( Controllers.BaseController.authenticated() ) {
                Services.logger.writelog("User loged in");
            }
        }


        protected void Session_End(object sender, EventArgs e) {

        }
/*
        protected void Application_BeginRequest(object sender, EventArgs e) {

            HttpApplication app = (HttpApplication)sender;
            HttpContext context = app.Context;

            // Attempt to peform first request initialization

            FirstRequestInitialization.Initialize(context);



        }
        */
        protected void Application_AuthenticateRequest(object sender, EventArgs e) {

        }

        protected void Application_Error(object sender, EventArgs e) {

        }

        protected void Session_OnEnd(Object sender, EventArgs e) {
            try {
                if (HttpContext.Current.Request.Cookies["unldap"] != null) {
                    if (Services.userService.logoutUser()) {
                        Services.logger.writelog("User was loged out");
                    }
                }
            } catch {

            }
        }

        public void Application_OnEnd() {

            container.Dispose();
        }
    }
}
