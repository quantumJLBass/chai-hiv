/* this needs readdressed. and fixed.
 * 
 * The goal is that we want to make connections to a site from another site.  
 * This way we can share files adn or db data, pull from a job or anything 
 * else dreamed up.  Connectiong will be stored in the db and will need to 
 * do the handshake and all to make the connection.  It's by site, but can be by user as well.
 * 
 * We will use the connections model in the site.cs.   We want to be able to selectivly give access via 
 * group or one user or site.
 * 
 */



public class AuthServerHostImpl : IAuthorizationServerHost {
    public IClientDescription GetClient(string clientIdentifier) {
        switch (clientIdentifier) {

            case "RP":
                var allowedCallback = "https://localhost/RP/Secure4ownAuthSvr/OAuth";
                return new ClientDescription(
                             "data!",
                             new Uri(allowedCallback),
                             ClientType.Confidential);
        }

        return null;
    }

    public bool IsAuthorizationValid(IAuthorizationDescription authorization) {
        if (authorization.ClientIdentifier == "RP"
              && authorization.Scope.Count == 1
              && authorization.Scope.First() == "http://localhost/demo"
              && authorization.User == "Max Muster") {
            return true;
        }

        return false;
    }

    public AccessTokenResult CreateAccessToken(
                 IAccessTokenRequest accessTokenRequestMessage) {

        var token = new AuthorizationServerAccessToken();

        token.Lifetime = TimeSpan.FromMinutes(10);

        var signCert = LoadCert(Config.STS_CERT);
        token.AccessTokenSigningKey =
                 (RSACryptoServiceProvider)signCert.PrivateKey;

        var encryptCert = LoadCert(Config.SERVICE_CERT);
        token.ResourceServerEncryptionKey =
                 (RSACryptoServiceProvider)encryptCert.PublicKey.Key;

        var result = new AccessTokenResult(token);
        return result;
    }

    private static X509Certificate2 LoadCert(string thumbprint) {
        X509Store store = new X509Store(StoreName.My, StoreLocation.LocalMachine);
        store.Open(OpenFlags.ReadOnly);
        var certs = store.Certificates.Find(
                          X509FindType.FindByThumbprint,
                          thumbprint,
                          validOnly: false);

        if (certs.Count == 0) throw new Exception("Could not find cert");
        var cert = certs[0];
        return cert;
    }

    public DotNetOpenAuth.Messaging.Bindings.ICryptoKeyStore CryptoKeyStore {
        get {
            return new InMemoryCryptoKeyStore();
        }
    }

    public DotNetOpenAuth.Messaging.Bindings.INonceStore NonceStore {
        get { return new DummyNonceStore(); }
    }

    public AutomatedAuthorizationCheckResponse
             CheckAuthorizeClientCredentialsGrant(
                         IAccessTokenRequest accessRequest) {
        throw new NotImplementedException();
    }

    public AutomatedUserAuthorizationCheckResponse
             CheckAuthorizeResourceOwnerCredentialGrant(
                 string userName, string password,
                 IAccessTokenRequest accessRequest) {
        throw new NotImplementedException();
    }
}