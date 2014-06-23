using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DotNetOpenAuth.OAuth.ChannelElements;
using DotNetOpenAuth.OAuth.Messages;
using stellar.Tools;
using System.Diagnostics;
using stellar;
using stellar.Models;

namespace stellar.Code {
    /// <summary> </summary>
    public class DatabaseTokenManager : IServiceProviderTokenManager {
        #region IServiceProviderTokenManager


        /// <summary> </summary>
        public IConsumerDescription GetConsumer(string consumerKey) {
            var consumerRow = GlobalApplication.Consumers.SingleOrDefault(
                consumerCandidate => consumerCandidate.Key == consumerKey);
            if (consumerRow == null) {
                throw new KeyNotFoundException();
            }

            return consumerRow;
        }

        /// <summary> </summary>
        public IServiceProviderRequestToken GetRequestToken(string token) {

            var foundToken = GlobalApplication.AuthTokens.FirstOrDefault(t => t.Token == token && t.State != TokenAuthorizationState.AccessToken);

            if (foundToken == null) {
                throw new KeyNotFoundException("Unrecognized token");
            }
            return foundToken;
        }

        /// <summary> </summary>
        public IServiceProviderAccessToken GetAccessToken(string token) {
            try {
                return GlobalApplication.AuthTokens.First(t => t.Token == token && t.State == TokenAuthorizationState.AccessToken);
            } catch (InvalidOperationException ex) {
                throw new KeyNotFoundException("Unrecognized token", ex);
            }
        }

        /// <summary> </summary>
        public void UpdateToken(IServiceProviderRequestToken token) {
            var tokenInDb = GlobalApplication.AuthTokens.SingleOrDefault(x => x.Token == token.Token);
            if (tokenInDb != null) {
                tokenInDb.VerificationCode = token.VerificationCode;
                tokenInDb.Callback = token.Callback;
                //tokenInDb.ConsumerKey = token.ConsumerKey;
                tokenInDb.Version = token.ConsumerVersion;
                tokenInDb.Token = token.Token;
                tokenInDb.VerificationCode = token.VerificationCode;
            }
        }

        #endregion

        #region ITokenManager Members

        /// <summary> </summary>
        public string GetTokenSecret(string token) {
            var tokenRow = GlobalApplication.AuthTokens.SingleOrDefault(
                tokenCandidate => tokenCandidate.Token == token);
            if (tokenRow == null) {
                throw new ArgumentException();
            }

            return tokenRow.TokenSecret;
        }

        /// <summary> </summary>
        public void StoreNewRequestToken(UnauthorizedTokenRequest request, ITokenSecretContainingMessage response) {
            RequestScopedTokenMessage scopedRequest = (RequestScopedTokenMessage)request;
            var consumer = GlobalApplication.Consumers.Single(consumerRow => consumerRow.Key == request.ConsumerKey);
            string scope = scopedRequest.Scope;
            OAuthToken newToken = new OAuthToken {
                Consumer = consumer,
                Token = response.Token,
                TokenSecret = response.TokenSecret,
                IssueDate = DateTime.UtcNow,
                Scope = scope,
            };

            GlobalApplication.AuthTokens.Add(newToken);
        }

        /// <summary>
        /// Checks whether a given request token has already been authorized
        /// by some user for use by the Consumer that requested it.
        /// </summary>
        /// <param name="requestToken">The Consumer's request token.</param>
        /// <returns>
        /// True if the request token has already been fully authorized by the user
        /// who owns the relevant protected resources.  False if the token has not yet
        /// been authorized, has expired or does not exist.
        /// </returns>
        public bool IsRequestTokenAuthorized(string requestToken) {
            var tokenFound = GlobalApplication.AuthTokens.SingleOrDefault(
                token => token.Token == requestToken &&
                token.State == TokenAuthorizationState.AuthorizedRequestToken);
            return tokenFound != null;
        }

        /// <summary> </summary>
        public void ExpireRequestTokenAndStoreNewAccessToken(string consumerKey, string requestToken, string accessToken, string accessTokenSecret) {

            var consumerRow = GlobalApplication.Consumers.Single(consumer => consumer.Key == consumerKey);
            var tokenRow = GlobalApplication.AuthTokens.Single(token => token.Token == requestToken && token.Consumer == consumerRow);
            Debug.Assert(tokenRow.State == TokenAuthorizationState.AuthorizedRequestToken, "The token should be authorized already!");

            // Update the existing row to be an access token.
            tokenRow.IssueDate = DateTime.UtcNow;
            tokenRow.State = TokenAuthorizationState.AccessToken;
            tokenRow.Token = accessToken;
            tokenRow.TokenSecret = accessTokenSecret;
        }

        /// <summary>
        /// Classifies a token as a request token or an access token.
        /// </summary>
        /// <param name="token">The token to classify.</param>
        /// <returns>Request or Access token, or invalid if the token is not recognized.</returns>
        public TokenType GetTokenType(string token) {
            var tokenRow = GlobalApplication.AuthTokens.SingleOrDefault(tokenCandidate => tokenCandidate.Token == token);
            if (tokenRow == null) {
                return TokenType.InvalidToken;
            } else if (tokenRow.State == TokenAuthorizationState.AccessToken) {
                return TokenType.AccessToken;
            } else {
                return TokenType.RequestToken;
            }
        }

        #endregion

        /// <summary> </summary>
        public void AuthorizeRequestToken(string requestToken, appuser user) {
            if (requestToken == null) {
                throw new ArgumentNullException("requestToken");
            }
            if (user == null) {
                throw new ArgumentNullException("user");
            }

            var tokenRow = GlobalApplication.AuthTokens.SingleOrDefault(
                tokenCandidate => tokenCandidate.Token == requestToken &&
                tokenCandidate.State == TokenAuthorizationState.UnauthorizedRequestToken);
            if (tokenRow == null) {
                throw new ArgumentException();
            }

            tokenRow.State = TokenAuthorizationState.AuthorizedRequestToken;
            tokenRow.User = user;
        }

        /// <summary> </summary>
        public OAuthConsumer GetConsumerForToken(string token) {
            if (String.IsNullOrEmpty(token)) {
                throw new ArgumentNullException("requestToken");
            }

            var tokenRow = GlobalApplication.AuthTokens.SingleOrDefault(
                tokenCandidate => tokenCandidate.Token == token);
            if (tokenRow == null) {
                throw new ArgumentException();
            }

            return tokenRow.Consumer;
        }
    }
}