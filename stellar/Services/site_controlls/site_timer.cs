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
using System.Timers;
#endregion

namespace stellar.Services {

    // this will be for checking files.  And maybe some registored events to be done.
    /// <summary> </summary>
    public static class site_timer {// In App_Code folder

        static Timer _timer; // From System.Timers
        static List<DateTime> _l; // Stores timer results
        /// <summary> </summary>
        public static List<DateTime> DateList { // Gets the results
            get {
                if (_l == null) {// Lazily initialize the timer
                    Start(); // Start the timer
                }
                return _l; // Return the list of dates
            }
        }
        /// <summary> </summary>
        static void Start() {
            _l = new List<DateTime>(); // Allocate the list
            _timer = new Timer(3000); // Set up the timer for 3 seconds
            //
            // Type "_timer.Elapsed += " and press tab twice.
            //
            _timer.Elapsed += new ElapsedEventHandler(_timer_Elapsed);
            _timer.Enabled = true; // Enable it
        }
        /// <summary> </summary>
        static void _timer_Elapsed(object sender, ElapsedEventArgs e) {
            _l.Add(DateTime.Now); // Add date on each timer event
        }
    }
}
