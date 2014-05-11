#region Directives
using stellar.Models;
using stellar.Services;

using System;
using System.Data;
using System.Configuration;
using System.Net;
using System.IO;
using System.Web;
//using MonoRailHelper;

using System.Collections.Generic;
using System.Text.RegularExpressions;
using Castle.ActiveRecord;
#endregion

namespace stellar.Services {
    public class logger {
        /*
        We want to have option to write to database, file, or both
        The need is to set up a thread of it's own, and start the log process and release the 
        current thread as quick as we can so that user can move on.  

        */

        //we would want to have a set of core log files to use
        public static Boolean is_logfile(String file) {
            return file == "/logs/install.log" || file.IndexOf("install.log")>0;
        }

        public static void writelog(string txt, appuser user, string controller, string action, int obj_id) {
            if (Controllers.installController.is_installed()) {
                logs loger = new logs();
                loger.entry = txt;
                loger.nid = user == null ? userService.getNid() : user.nid;
                loger.ip = userService.getUserIp();
                loger.date = DateTime.Now;
                loger.controller = controller;
                loger.action = action;
                loger.obj_id = obj_id;
                ActiveRecordMediator<logs>.Save(loger);
            } else {
                DateTime time = DateTime.Now;
                string format = "MMM ddd d HH:mm yyyy";
                //file_handler.write_to_file("logs/install.log", time.ToString(format)+" "+ txt, true);
            }
        }

        public static void writelog(string txt, int obj_id) {
            writelog(txt, null, "", "", obj_id);
        }

        public static void writelog(string txt, appuser user, int obj_id) {
            writelog(txt, user, "", "", obj_id);
        }

        public static void writelog(string txt, appuser user) {
            writelog(txt, user, "", "", 0);
        }

        public static void writelog(string txt, string controller, string action, int obj_id) {
            writelog(txt, null, controller, action, obj_id);
        }
        public static void writelog(string txt, string controller, string action) {
            writelog(txt, null, controller, action, 0);
        }
        public static void writelog(string txt) {
            writelog(txt, null, "", "", 0);
        }
    }
}
