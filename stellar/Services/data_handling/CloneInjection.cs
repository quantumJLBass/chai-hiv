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
using Omu.ValueInjecter;
using System.Collections;
using System.Linq;
#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class CloneInjection : ConventionInjection {
        /// <summary> </summary>
        protected override bool Match(ConventionInfo c) {
            return c.SourceProp.Name == c.TargetProp.Name && c.SourceProp.Value != null;
        }

        /// <summary> </summary>
        protected override object SetValue(ConventionInfo c) {
            //for value types and string just return the value as is
            if (c.SourceProp.Type.IsValueType || c.SourceProp.Type == typeof(string))
                return c.SourceProp.Value;

            //handle arrays
            if (c.SourceProp.Type.IsArray) {
                var arr = c.SourceProp.Value as Array;
                var clone = arr.Clone() as Array;

                for (int index = 0; index < arr.Length; index++) {
                    var a = arr.GetValue(index);
                    if (a.GetType().IsValueType || a.GetType() == typeof(string)) continue;
                    clone.SetValue(Activator.CreateInstance(a.GetType()).InjectFrom<CloneInjection>(a), index);
                }
                return clone;
            }


            if (c.SourceProp.Type.IsGenericType) {
                //handle IEnumerable<> also ICollection<> IList<> List<>
                if (c.SourceProp.Type.GetGenericTypeDefinition().GetInterfaces().Contains(typeof(IEnumerable))) {
                    var t = c.SourceProp.Type.GetGenericArguments()[0];
                    if (t.IsValueType || t == typeof(string)) return c.SourceProp.Value;
                    /*
                    var tlist = typeof(List<>).MakeGenericType(t);
                    //var list = Activator.CreateInstance(tlist);
                    dynamic list = Activator.CreateInstance(tlist);

                    var addMethod = tlist.GetMethod("Add");
                    foreach (var o in c.SourceProp.Value as IEnumerable) {
                        var e = Activator.CreateInstance(t).InjectFrom<CloneInjection>(o);
                        //addMethod.Invoke(list, new[] { e }); // in 4.0 you can use dynamic and just do list.Add(e);
                        list.Add(e);
                    }
                     * */
                    var tlist = typeof(List<>).MakeGenericType(t);
                    dynamic list = Activator.CreateInstance(tlist);
                    return list;
                }

                //unhandled generic type, you could also return null or throw
                return c.SourceProp.Value;
            }

            //for simple object types create a new instace and apply the clone injection on it
            return Activator.CreateInstance(c.SourceProp.Type)
                .InjectFrom<CloneInjection>(c.SourceProp.Value);
        }
    }
}
