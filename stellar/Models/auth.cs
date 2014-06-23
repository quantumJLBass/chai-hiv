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

namespace stellar.Models
{
    /*there is more that should go in there.
    public class Nonce {
        public String Context { get; set; }
        public String Code { get; set; }

        public DateTime Timestamp { get; set; }
    } */

    //This needs to be peared down.  The consumter and provider have different needs.
    /// <summary> </summary>
    [ActiveRecord(BatchSize = 30)]
    public class connections_slave : _base {

        /// <summary> </summary>
        [JoinedKey("connections_slave_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String notes { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public site _site { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String api_url { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public appuser _user { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public user_group _group { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String access_token { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String client_id { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String _key { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String secret { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String callback_url { get; set; }

    }

    //This needs to be peared down.  The consumter and provider have different needs.
    /// <summary> </summary>
    [ActiveRecord(BatchSize = 30)]
    public class connections_master : _base {

        /// <summary> </summary>
        [JoinedKey("connections_master_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String notes { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String api_url { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public site _site { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public appuser _user { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public user_group _group { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String access_token { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String client_id { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String _key { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String secret { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String callback_url { get; set; }

    }
}

