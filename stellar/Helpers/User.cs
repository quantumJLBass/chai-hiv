using System;
using System.Security.Principal;
using stellar.Models;
namespace stellar {
    /// <summary> </summary>
    public class User : IPrincipal
    {
        private string[] roles;
        private IIdentity identity;

        /// <summary> </summary>
        public User(String name, String[] roles)
        {
            identity = new GenericIdentity(name, "Custom MonoRail authentication");
            this.roles = roles;
        }

        /// <summary> </summary>
        public bool IsInRole(string role)
        {
            return Array.IndexOf(roles, role) >= 0;
        }

        /// <summary> </summary>
        public IIdentity Identity
        {
            get { return identity; }
        }
    }
}