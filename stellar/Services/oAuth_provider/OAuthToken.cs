using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DotNetOpenAuth.OAuth.ChannelElements;
using stellar.Models;

namespace stellar.Code {
    /// <summary> </summary>
    public class OAuthToken : IServiceProviderRequestToken, IServiceProviderAccessToken {

        #region IServiceProviderRequestToken

        private String _spRequesttoken;
        String IServiceProviderRequestToken.Token {
            get { return _spRequesttoken; }
        }

        private Uri _callback;

        /// <summary> </summary>
        public Uri Callback {
            get { return _callback; }
            set { _callback = value; }
        }

        Uri IServiceProviderRequestToken.Callback {
            get {
                return _callback;
            }
            set {
                _callback = value;
            }
        }

        string IServiceProviderRequestToken.ConsumerKey {
            get { return Consumer.Key; }
        }

        private Version _version;

        /// <summary> </summary>
        public Version Version {
            get { return _version; }
            set { _version = value; }
        }
        Version IServiceProviderRequestToken.ConsumerVersion {
            get {
                return _version;
            }
            set {
                _version = value;
            }
        }

        //private DateTime _createdOn;

        //public DateTime CreatedOn
        //{
        //    get { return _createdOn; }
        //    set { _createdOn = value; }
        //}

        DateTime IServiceProviderRequestToken.CreatedOn {
            get { return IssueDate; }
        }


        private string _verificationCode;

        /// <summary> </summary>
        public string VerificationCode {
            get { return _verificationCode; }
            set { _verificationCode = value; }
        }
        string IServiceProviderRequestToken.VerificationCode {
            get {
                return _verificationCode;
            }
            set {
                _verificationCode = value;
            }
        }

        #endregion

        #region IServiceProviderAccessToken

        /// <summary> </summary>
        private DateTime? _expirationDate;
        DateTime? IServiceProviderAccessToken.ExpirationDate {
            get { return _expirationDate; }
        }

        private string[] _roles;
        /// <summary> </summary>
        string[] IServiceProviderAccessToken.Roles {
            get { return _roles; }
        }

        /// <summary> </summary>
        string IServiceProviderAccessToken.Username {
            get { return User.nid; }
        }


        private String _spaccessToken;
        /// <summary> </summary>
        String IServiceProviderAccessToken.Token {
            get { return _spaccessToken; }
        }

        #endregion


        private OAuthConsumer _consumer;

        /// <summary> </summary>
        public OAuthConsumer Consumer {
            get { return _consumer; }
            set { _consumer = value; }
        }

        private TokenAuthorizationState _state;

        /// <summary> </summary>
        public TokenAuthorizationState State {
            get { return _state; }
            set { _state = value; }
        }

        private DateTime _issueDate;

        /// <summary> </summary>
        public DateTime IssueDate {
            get { return _issueDate; }
            set { _issueDate = value; }
        }

        private appuser _user;
        /// <summary> </summary>
        public appuser User {
            get { return _user; }
            set { _user = value; }
        }

        private String _tokenSecret;

        /// <summary> </summary>
        public String TokenSecret {
            get { return _tokenSecret; }
            set { _tokenSecret = value; }
        }

        private String _scope;

        /// <summary> </summary>
        public String Scope {
            get { return _scope; }
            set { _scope = value; }
        }

        /// <summary> </summary>
        public String Token {
            set {
                _spaccessToken = value;
                _spRequesttoken = value;
            }

            get {
                return _spaccessToken;
            }
        }
    }
}