using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using NHibernate.Criterion;
using Castle.ActiveRecord;
using System.Collections;
using System.Collections.Generic;
using System.Data.SqlTypes;
using stellar.Services;

namespace stellar.Models {
    [ActiveRecord(Lazy = true, BatchSize = 10)]
    public class logs : ActiveRecordBase<logs> {
        [PrimaryKey("log_id")]
        virtual public int id { get; set; }

        [Property("entry")]
        virtual public string entry { get; set; }

        [Property("code")]
        virtual public string code { get; set; }

        [Property("obj_id")]
        virtual public int obj_id { get; set; }

        [Property("action")]
        virtual public string action { get; set; }

        [Property("controller")]
        virtual public string controller { get; set; }

        [Property]
        virtual public string nid { get; set; }

        [Property]
        virtual public string ip { get; set; }

        private DateTime? _logdate;
        [Property("dtOfLog")]
        virtual public DateTime? date {
            get { return _logdate; }
            set {
                if ((value >= (DateTime)SqlDateTime.MinValue) && (value <= (DateTime)SqlDateTime.MaxValue)) {
                    // bla is a valid sql datetime
                    _logdate = value;

                }
            }
        }

        [BelongsTo]
        virtual public appuser _user { get; set; }

        [BelongsTo]
        virtual public _base item { get; set; }


    }
}
