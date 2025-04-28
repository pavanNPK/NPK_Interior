## Authentication
For **NPK Interior**, we are building a modern e-commerce platform for home interior decor. We are providing a secure login/signup system using `JWT authentication`. This will allow users to create an account and log in to access their personalized experience.

To ensure the security of our platform, we are using a combination of encryption and authentication measures to protect user data and prevent unauthorized access.
Provided a `role-based authentication` system. 

-----------------------------------------------------------------------------------
## We uses `TTL` For Users.

A `TTL` index in MongoDB is used to automatically delete expired documents after a specific period of time. It helps in managing temporary data without needing manual cleanup.
Using TTL is a smart way to handle temporary users. It reduces workload, keeps the database efficient, and improves security. 🚀

-----------------------------------------------------------------------------------

## Register
#### `POST /register` - Register a new user. 
-  First, we will check if the user already exists in the database. If not, we will insert the user into the database. If the user already exists, we will return an error message.
- Before, inserting into db, we will send the `OTP` to the user's email. Then, check the OTP from the user and if it is correct, we will insert some details of the user into the database.
```
  const user = { firstName,lastName,userName,email}
```
```aiignore
 import Redis from 'ioredis'
 
 const redis = new Redis({
    host: REDIS_HOST, // Ensure Redis is accessible on this IP
    port: REDIS_PORT,
    connectTimeout: 10000, // Increase timeout to 10 seconds
    retryStrategy: (times) => Math.min(times * 50, 2000), // Retry strategy
});
```
- For `OTP` verification, we will create a key in `Redis`. It'll expire in 5 minutes.
- After Sending the `OTP`, we will validate the OTP. If the OTP is correct, User has been verified. and check the password.

```aiignore
  const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: EMAIL_USER, // Replace with your email
              pass: EMAIL_PASS  // Replace with your email password
          }
      });
      
   const mailOptions = {
        from: 'Your Name <any@gmail.com>',
        to: email,
        subject: 'your subject',
        html: `
            <template/>
        `
    };
    
  await transporter.sendMail(mailOptions);
```
- we will hash the password using `bcrypt`.
```aiignore
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
```
- After verifying the `OTP`, we will insert the user into the `database`.
- We are not storing `OTP` in the `database`.
```aiignore
  await User.updateOne({ email }, { $set: { isVerified: true, password: hashedPassword } });
```
- Remove the user automatically if the `OTP` is not verified in 5 minutes. And, if its verified but he is not provided the `password`, we will remove the user. After 20 minutes.
### How it works:

- Creates a time-to-live (TTL) index on the createdAt field
- Uses `partialFilterExpression` to only apply the TTL to documents where `isVerified` is false
- Sets the expiration time to 7200 seconds (20 minutes)

This way, only unverified users will be automatically deleted after 20 minutes,
while verified users will remain in the database indefinitely.

> Note: MongoDB's TTL cleanup process runs approximately once per minute, so there might be a slight delay between when a document expires and when it's actually removed.
#### Prevent Deletion When User is Verified

- If a user verifies their account within 20 minutes, remove the `createdAt` field to prevent auto-deletion.
```aiignore
~ Create a TTL index on createdAt, but only for unverified users

userSchema.index({ createdAt: 1 }, {
    name: 'createdAtIndex',
    expireAfterSeconds: 1200,  // 20 minutes
    partialFilterExpression: { isVerified: false }  // Apply only to unverified users
});

```
#### Check if TTL Index is Created
```aiignore
 db.users.getIndexes()
```

#### Drop the existing TTL index
```aiignore
 db.users.dropIndex("createdAtIndex");
```

-----------------------------------------------------------------------------------
### Create DB for each user

```aiignore
use main DB 
// Get all (collections for registered users) from the current database
const storeData = db.collectionHere.find({}).toArray();

// Loop through each user
storeData.forEach(user => {
  // Skip if code is not defined
  if (!user.code) {
    print(`User ${user._id} has no code, skipping`);
    return;
  }
  
  // Get the code value to use as database name
  const dbName = user.code;
  
  try {
    // Connect to the new database (this creates it if it doesn't exist)
    const targetDb = db.getSiblingDB(dbName);
    
    // Create a dummy collection to ensure database creation
    // MongoDB only creates databases when they have at least one collection
    targetDb.createCollection("new collection");
    
    // Create a document with the required fields
    const userData = {
      ...What data we want to insert
    };
    
    // Insert the document into the initials collection
    targetDb.initials.insertOne(userData);
    
    print(`Successfully created database '${dbName}' with initials for user ${user.firstName} ${user.lastName}`);
  } catch (err) {
    print(`Error creating database '${dbName}': ${err.message}`);
  }
});

print("Database creation and data migration completed");
```
-----------------------------------------------------------------------------------
## Login
#### `POST /login` - Login after verifying the user.
- First, we will check if the user exists in the database. If not, we will return an error message. 
- If the user exists, we will check if the user is verified. If not, we will return an error message.
- If the user is verified, we will check if the password is correct. If not, we will return an error message.
- If the password is correct, we will return the user details.
- After verifying the user, we will create a `JWT token`. It'll expire in 1 hour.
- Generating `refresh token` for the user and expires in day 7's.
```aiignore
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
```
- We will send the `JWT token & refresh token` to the user.
```aiignore
  res.status(200).json({ success: true, message: 'User logged in successfully', 1 hourresponse: token, refreshToken });
```
-----------------------------------------------------------------------------------
### How It Works
> The authentication system uses two tokens: an access token and a refresh token. This dual-token approach enhances security while maintaining a seamless user experience.

#### Access Token
 - Purpose: Authorizes user access to protected resources/endpoints
 - Expires: Short-lived (typically 15-60 minutes)—After 1 hour
 - Usage: Sent with each API request in the Authorization header.
 - Security: The access token is used to authenticate the user and grant access to the protected resources/endpoints.
 - Format: Authorization: Bearer {access_token}
 - Storage: Usually stored in memory or short-term storage (not persistent)

#### Refresh Token
 - Purpose: Obtain new access tokens without requiring re-authentication
 - Expires: Long-lived (days or weeks)—After 7 days
 - Usage: The refresh token is used to refresh the access token when it expires.
 - Security: Higher security requirements for storage.
 - Storage: Persistent storage, such as a database or file system or Secure HTTP-only cookie or secure storage.

### Token Flow

#### Initial Authentication

1. User provides username and password.
2. Server validates user credentials.
3. If successful, the server generates an access token and refresh token.
4. Access token is sent in the Authorization header of later requests.
5. The refresh token is securely stored.
6. If the access token expires, the server generates a new access token using the refresh token.
7. Again, the access token is sent in the Authorization header of later requests.

#### During Active Session

1. User remains authenticated. Access token authorizes all requests.
2. When the access token expires, requests are rejected with 401 Unauthorized.

#### Token Refresh Process:

1. When access token expires, client sends refresh token to token endpoint.
2. Server validates refresh token and issues new access token (and sometimes new refresh token).
3. Client continues session with new access token.

#### Security Measures

1. Refresh tokens can be revoked server-side.
2. Refresh tokens may be rotated (new refresh token with each use).
3. Refresh tokens should be used for authentication and not for authorization.
4. Access tokens should be used for authorization and not for authentication.
5. Both tokens should be invalidated on logout.

### Implementation Considerations

- Implementation Considerations
- Security Considerations
- Store tokens securely, according to best practices
- Token expiration and refresh logic
- Consider token rotation for refresh tokens
- Implement proper error handling for token expiration

### API Endpoints

#### Login
- Endpoint: `/login`
- Method: `POST`
- Description: Authenticate user and generate access and refresh tokens.
- Request Body: `{ "username": "username", "password": "password" }`
- Response: `{ "token": "access_token", "refresh_token": "refresh_token", user: { ... } }`

#### Refresh Token
- Endpoint: `/refresh-token`
- Method: `POST`
- Description: Exchanges refresh token for new access token.
- Request Body: `{ "refresh_token": "refresh_token" }`
- Response: `{ "access_token": "access_token" }`
- Error Response: `{ "error": "Invalid refresh token" }`

> What I'm doing here is creating a refresh token for the user, which will be used to generate new access tokens when the current access token expires.

```aiignore
// Extract the refresh token from the request body
const { refreshToken } = req.body;

// Check if the refresh token exists in the request
if (!refreshToken) {
return res.json({success: false,message: 'Refresh token is required!'})}

// Verify the refresh token
const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

// Find the user associated with the token's ID
const user = await User.findById(decoded.id, {}, { lean: true });
        
// Generate a new access token
const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// Send the new access token in the response
res.status(200).json({ accessToken });
```
-----------------------------------------------------------------------------------
## Logout
- After logging out, we will remove the `JWT token` from the `cookie`.
```aiignore
  removing the JWT token from the storage
  res.status(200).json({ success: true, message: 'User logged out successfully' });
```
-----------------------------------------------------------------------------------

## Now, Looking at the `Client` side

### Angular Authentication System Explanation
> Your Angular authentication system implements a comprehensive token-based authentication flow with automatic token refresh, route protection, and secure API requests. This is a well-structured approach that follows industry best practices for securing single-page applications.

### Key Components and Their Purposes
 -  The authentication system uses two tokens: an access token and a refresh token. This dual-token approach enhances security while maintaining a seamless user experience.

#### AuthService
The core service that manages authentication state and token operations:

1. `Token Management`: Handles storage, retrieval, and parsing of JWT tokens.
2. `Authentication State`: Maintains current user state using BehaviorSubject.
3. `Auto-Renewal`: Proactively refreshes tokens before they expire.
4. `Expiration Handling`: Includes automatic logout when tokens expire.
5. `Local Storage`: Securely persists authentication data between sessions.
```aiignore
// Example: Login a user
login(email: string, password: string): Observable<ResponseWithError<User>> {
  return this.userService.loginUser({ email, password }).pipe(
    tap((response: ResponseWithError<User>) => {
      if (response.success && response.response) {
        this.handleAuthSuccess(response.response);
      }
    })
  );
}

// Example: Check if user is authenticated
isAuthenticated(): boolean {
  const token = this.getToken();
  if (!token) return false;

  const expirationDate = this.getTokenExpirationDate();
  if (!expirationDate) return false;

  return expirationDate > new Date();
}

// Example: Auto-refresh token before expiration
private autoRenewToken(): void {
  const expirationDate = this.getTokenExpirationDate();
  if (!expirationDate) return;

  const expiresIn = expirationDate.getTime() - Date.now();

  // If the token expires in less than 5 minutes, refresh it
  if (expiresIn < 300000 && expiresIn > 0) {
    this.refreshToken().subscribe({
      next: () => console.log('Token refreshed successfully'),
      error: (err) => console.error('Token refresh failed:', err)
    });
  }
}
```
#### AuthGuard
The route guard that enforces authentication for protected routes:

1. `authGuard (CanActivateFn)`: Prevents access to protected main routes.
2. `authChildGuard (CanActivateChildFn)`: Secure nested/child routes.
3. `authLoadGuard (CanMatchFn)`: Prevents unauthorized lazy-loaded module access.

Guards implement a shared `checkAuth` function that:

1. Allows access to authenticated users.
2. Redirects unauthenticated users to the login page.
3. Stores the intended destination URL for post-login redirection.
4. Prevents redirection loops by detecting login page access.

```aiignore
// Example: Main route guard
export const authGuard: CanActivateFn = (route, state) => {
  console.log('Auth Guard checking:', state.url);
  return checkAuth(state.url);
};

// Example: Helper function used by all guards
const checkAuth = (url: string): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Store redirect URL and send to login
  localStorage.setItem('redirectUrl', url);
  return router.createUrlTree(['/login']);
};
```

#### Auth Interceptor

Automatically handles token injection and refresh for HTTP requests:

1. `Token Injection`: Adds the auth token to all non-auth API requests.
2. `401 Error Handling`: Detects expired tokens and initiates refresh.
3. `Token Refresh Management`: Prevents multiple simultaneous refresh attempts.
4. `Request Queueing`: Holds pending requests during refresh using BehaviorSubject.


```aiignore
// Example: Adding token to requests
private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

// Example: Handling 401 (Unauthorized) errors
private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  if (!this.isRefreshing) {
    this.isRefreshing = true;
    
    return this.authService.refreshToken().pipe(
      switchMap(response => {
        this.isRefreshing = false;
        const newToken = response?.response?.token;
        this.refreshTokenSubject.next(newToken);
        return next.handle(this.addToken(request, newToken));
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => new Error('Session expired'));
      })
    );
  }
}
```

#### Protected Routes

```aiignore
// Example: Route configuration with guards
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] 
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: 'users', component: UserManagementComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];
```

#### Token Refresh Scenario

1. User is working in the application.
2. Token approaches expiration (less than 5 minutes remaining).
3. autoRenewToken() proactively refreshes the token.
4. User session continues uninterrupted.

#### Expired Token Scenario

1. User makes a request with an expired token.
2. Server returns 401 Unauthorized.
3. Interceptor catches the 401 and tries to refresh the token.
4. If refresh succeeds, original request is retried with new token.
5. If refresh fails, user is logged out and redirected to login page.


### Why is This Architecture Necessary?

#### Security Benefits

1. `Token Isolation`: Separates authentication logic from business logic.
2. `Consistent Authorization`: Ensures every protected API request includes valid tokens.
3. `Route Protection`: Prevents unauthorized access to protected routes.
4. `XSS Mitigation`: Tokens are managed centrally with consistent security practices.

#### User Experience Benefits

1. `Seamless Token Renewal`: Users don't experience session timeouts during active use.
2. `Persistent Sessions`: Authenticated state survives page reloads.
3. `Smart Redirects`: After login, users return to their intended destination.
4. `Graceful Session Expiry`: Clean logout when refresh fails or token expires.

#### Development Benefits

1. `Separation of Concerns`: Authentication logic is isolated from components.
2. `Reusable Guards`: Consistent protection across different route types.
3. `Centralized Token Logic`: Single source of truth for authentication state.
4. `Interceptor Pattern`: Decouples token handling from component/service code.

### Key Implementation Details

#### Token Auto-Refresh

> My implementation proactively refreshes tokens before they expire (when less than 5 minutes remaining) which prevents interruption during active user sessions.

#### Best Practices Implemented

1. `SSR Compatibility`: Safely checks for localStorage availability before use.
2. `Token Expiry Tracking`: Extracts and verifies token expiration times.
3. `Error Handling`: Robust error catching throughout the authentication flow.
4. `Auth Endpoint Exclusion`: Prevents token injection for authentication endpoints.
5. `Session Restoration`: Auto-authenticates users with valid stored tokens.
6. `Last Login Tracking`: Records last login timestamp for user activity monitoring.

### Summary

This authentication system is a robust and secure solution that ensures user authentication and authorization,
promoting a seamless and secure user experience.
It handles the complex token lifecycle
while maintaining a seamless user experience and clean separation of concerns in your codebase.

-------------------------------------------------------------------

## Role-based Authentication
We are using a combination of encryption and authentication measures to protect user data and prevent unauthorized access.
Encryption is used to protect the data stored in the database, while authentication measures are used to verify the identity of users and their access rights.
This approach ensures that the data is secure and that only authorized users can access it.

> ### **At Client side**
> - We are using `ROLE GAURD` for protecting the routes. After, login, it will redirect the user to the intended route. Before, going to the intended route, it will check if the user has the required role to access the route. If not, it will redirect the user to the login page.
> - Example: 
> > { path: 'required path', component: required component, title: 'NPK | title', canActivate: [roleGuard] },
> - Here we can stop the user from going to the `required path`.
```angular2html
export const roleGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUserValue;
    if (!user) return router.createUrlTree(['/access-denied']);
    const role = user.role.toLowerCase();
    const currentUrl = state.url.toLowerCase();

    // here we  an manage the routes

    if (role.startsWith('admin role')) return true;
    if (role.startsWith('user role')) {
    const restrictedPaths = ['main path(parent)'];
    const allowedPaths = ['sub-paths(crud)'];
    const segments = currentUrl.split('?')[0].split('/');
    // If any restricted path is present in the URL segments, deny access
    if (segments.some(seg => restrictedPaths.includes(seg))) {
    return router.createUrlTree(['/access-denied']);
    }
    // Allow if any allowed path is in the URL
    if (segments.some(seg => allowedPaths.includes(seg))) {
    return true;
    }
    return router.createUrlTree(['/access-denied']);
    }
    return router.createUrlTree(['/access-denied']);
};
```
##### Explaination:

```angular2html
import { inject } from '@angular/core';
→ Brings in the inject function to manually inject services inside a standalone function.

import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
→ Imports types and classes needed for routing guards and redirections.

import { AuthService } from '../../services/auth.service';
→ Imports your custom AuthService which handles user authentication details.

export const roleGuard: CanActivateFn = (route, state) => {
→ Defines and exports a guard function (roleGuard) that determines if navigation is allowed.

const authService = inject(AuthService);
→ Injects an instance of AuthService to access the current user info.

const router = inject(Router);
→ Injects the Router service to programmatically create redirection URLs.

const user = authService.currentUserValue;
→ Retrieves the currently logged-in user's information.

if (!user) return router.createUrlTree(['/access-denied']);
→ If no user is logged in, redirect them to an "Access Denied" page.

const role = user.role.toLowerCase();
→ Converts the user's role to lowercase for easier comparison.

const currentUrl = state.url.toLowerCase();
→ Retrieves and lowercases the current navigation URL.

if (role.startsWith('sup')) return true;
→ If the user’s role starts with 'sup' (likely supervisor), allow access to all routes.

if (role.startsWith('shop')) {
→ If the user’s role starts with 'shop', apply additional restrictions.

const restrictedPaths = ['categories'];
→ Defines URL segments that "shop" users are not allowed to access.

const allowedPaths = ['view', 'details'];
→ Defines URL segments that "shop" users are allowed to access.

const segments = currentUrl.split('?')[0].split('/');
→ Splits the URL into segments, ignoring query parameters.

if (segments.some(seg => restrictedPaths.includes(seg))) {
→ If any URL segment matches a restricted path, deny access.

return router.createUrlTree(['/access-denied']);
→ Redirects to the "Access Denied" page if a restricted segment is found.

if (segments.some(seg => allowedPaths.includes(seg))) {
→ If any URL segment matches an allowed path, permit access.

return true;
→ Grants access to the route if allowed segments are found.

return router.createUrlTree(['/access-denied']);
→ Otherwise, if none match, deny access.
}
→ Ends the "shop" role conditional block.

return router.createUrlTree(['/access-denied']);
→ For any other roles (not "sup" or "shop"), deny access.

};
→ Ends the roleGuard function.
```


> ## **At Server side**
> - We are using ` authenticateToken, authorizeRoles` for verifying the user's token. It will check if the user has the required role to access the route. If not, it will return a `403` error response.
> - Example:
> > router.get('/path', authenticateToken, authorizeRoles('supervise', 'shopper'), function here(getCartItems));
> - Here we can stop the user from going to the `required path` By validating the token and role.

#### Token Creation: generateToken

```angular2html
export const generateToken = (user) => {
        return JWT.sign({ id: user._id.toString(), email: user.email, role:user.role, code: user.code }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

Purpose: Create a JWT token when the user logs in.
Details:
    Payload inside token: { id, email, role, code } from the user object.
    Secret: JWT_SECRET from .env file.
    Expiration: 24 hours.
Usage: Sent to client after login for secured requests.

```

####  Authentication Middleware: authenticateToken

```angular2html

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
            const userId = decoded.id; // Keep it as a string
        // Query using the ObjectId
        const user = await User.findOne({ _id: userId }, {}, { lean: true });
        if (!user) {
        return res.json({
                success: false,
                message: 'Invalid token or user not found.'
                        });
        }
        req.user = decoded; // Attach user info to the request
        next();
};
Purpose: Verify that incoming requests have a valid JWT token.
Step-by-Step:
    Reads token from Authorization header (Bearer TOKEN format).
    Verifies the token using JWT.verify().
    Fetches user info from database using decoded id.
    If valid → attaches user info to req.user and calls next().
    If invalid (token expired, wrong token, no token) → responds with error message.
Important:
    Handles expired tokens differently (TokenExpiredError).
    Uses .lean() for fast Mongoose queries (returns plain JS object, no overhead).
```
#### Role-based Authorization Middleware: authorizeRoles

```angular2html
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.json({
                response: null,
                role: "notAllowed",
                success: false,
                // message: `Role (${req.user.role}) is not allowed to access this resource.
                // Allowed roles are: ${roles.join(', ')}`
                message: `Role is not allowed to access this resource.`
            });
        }
        next();
    };
};

Purpose: Restrict access to specific roles only (e.g., admin, moderator, etc.).
How it works:
    Takes a list of allowed roles (...roles as a rest parameter).
    Checks if req.user.role is included in the allowed roles.
    If not, it blocks access with a custom JSON response.
    If yes, it proceeds to the next middleware or route handler.
```
#### Token Refresh: refreshToken
```angular2html
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.json({
                success: false,
                message: 'Refresh token is required!'
            });
        }
        const decoded = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id, {}, { lean: true });
        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid refresh token!'
            });
        }
        const newAccessToken = generateToken(user);
        res.json({
            response: {
            accessToken: newAccessToken
            },
            success: true,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
            res.json({
            success: false,
            message: 'Invalid refresh token!'
        });
    }
};

Purpose: Issue a new access token using a valid refresh token.
Process:
    Reads refreshToken from req.body.
    Verifies the refresh token using JWT.verify() with a different secret (REFRESH_TOKEN_SECRET).
    Finds the user in the database by ID from the decoded refresh token.
If the user exists:
    Creates a new access token using generateToken(user).
    Sends the new token back to the client.
If invalid:
    Responds with an error message.
Note: The refresh token mechanism improves security by limiting the lifespan of access tokens.
```
### Important Concepts Highlighted:


| Concept    | Explanation       |
|-----------|--------|
| JWT (JSON Web Token)	   | A compact, URL-safe way of representing claims between two parties.
| Access Token	      | Short-lived token used to access protected resources.|
| Refresh Token	   | Long-lived token used to get a new access token without re-login.|
| Middleware | Functions that execute during the request-response cycle, before the final handler.|
| Authorization Header	 | Standard HTTP header to pass the bearer token (Authorization: Bearer TOKEN).|
| Lean Queries	   |     In Mongoose, .lean() improves read performance by skipping the full Mongoose document creation.|

###  Quick Visual Summary of Flow:

Login Success ➔ generateToken() ➔ Client Stores Access Token

↓

Client Makes API Request with Access Token ➔ authenticateToken()

↓

If Role Restrictions ➔ authorizeRoles('admin', 'user')

↓

If Token Expires ➔ Client Requests refreshToken() ➔ Server Issues New Access Token

###  In Short:

- **generateToken**: Creates new access tokens.
- **authenticateToken**: Validates user by checking token.
- **authorizeRoles**: Restricts access to specific roles.
- **refreshToken**: Issues new access tokens using refresh tokens.(Provides new access tokens when the old ones expire.)