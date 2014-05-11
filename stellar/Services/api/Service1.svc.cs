using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using stellar.Models;
using Castle.ActiveRecord;

namespace stellar
{
    public class Service1 : IService1
    {
        public string GetData()
        {
            return "Some secret data";
        }

        /// <summary>
        /// This service returns some data in JSON protected by OAuth.
        /// </summary>
        /// <returns></returns>
        public appuser[] GetAccounts()
        {
            appuser[] accounts = ActiveRecordBase<appuser>.FindAll();

            return accounts;
        }
    }
}
