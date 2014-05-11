using System;
using System.Security.Principal;
using stellar.Models;
namespace stellar
{
    public class User : IPrincipal
    {
        private string[] roles;
        private IIdentity identity;

        public User(String name, String[] roles)
        {
            identity = new GenericIdentity(name, "Custom MonoRail authentication");
            this.roles = roles;
        }

        public bool IsInRole(string role)
        {
            return Array.IndexOf(roles, role) >= 0;
        }

        public IIdentity Identity
        {
            get { return identity; }
        }
    }
}