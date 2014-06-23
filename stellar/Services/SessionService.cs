#region Directives
using System;
using System.Data;
using System.Configuration;
using stellar.Models;
using NHibernate.Criterion;
using System.Collections.Generic;
using Castle.ActiveRecord;
using System.Net;
using System.Text.RegularExpressions;
using System.IO;
using System.Web;
//using MonoRailHelper;
using System.Xml;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Collections.Specialized;
using Newtonsoft.Json;
using Newtonsoft.Json.Utilities;
using Newtonsoft.Json.Linq;
using stellar.Services;
using log4net;
using log4net.Config;
using Goheer.EXIF;
using System.Xml.Linq;
#endregion

namespace stellar.Services {

    /// <summary> </summary>
    public class SessionService {
        //Com back to 


        private static readonly object padlock = new object();

        private static Dictionary<string, SessionData> sessions = new Dictionary<string, SessionData>();

        /// <summary> </summary>
        public static Dictionary<string, SessionData> Sessions {
            get { lock (padlock) { return sessions; } }
        }

        /// <summary> </summary>
        public struct SessionData {
            /// <summary> </summary>
            public string Name { get; set; }
            /// <summary> </summary>
            public int AccountId { get; set; }
            /// <summary> </summary>
            public string CurrentLocation { get; set; }
        }

        /// <summary> </summary>
        protected void Session_Start(object sender, EventArgs e) {
            //Sessions.Add(Session.SessionID, new SessionData());
        }

        /// <summary> </summary>
        protected void Session_End(object sender, EventArgs e) {
            //Sessions.Remove(Session.SessionID);
        }

        /// <summary> </summary>
        public static void SetSessionData(string sessionId, int accountId, string name, string currentLoc) {
            Sessions.Remove(sessionId);
            Sessions.Add(sessionId, new SessionData { AccountId = accountId, CurrentLocation = currentLoc, Name = name });
        }

        /// <summary> </summary>
        public static void SetCurrentLocation(string sessionId, string currentLoc) {
            SessionData currentData = Sessions[sessionId];
            Sessions.Remove(sessionId);
            Sessions.Add(sessionId, new SessionData { AccountId = currentData.AccountId, CurrentLocation = currentLoc, Name = currentData.Name });
        }
    }
}
