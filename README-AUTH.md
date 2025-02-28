## Authentication
For **NPK Interior**, we are building a modern e-commerce platform for home interior decor. We are providing a secure login/signup system using JWT authentication. This will allow users to create an account and log in to access their personalized experience.

To ensure the security of our platform, we are using a combination of encryption and authentication measures to protect user data and prevent unauthorized access.

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
- Remove the user automatically if the `OTP` is not verified in 5 minutes. And, if its verified but he is not provided the `password`, we will remove the user. After 3 minutes.
### How it works:

- Creates a time-to-live (TTL) index on the createdAt field
- Uses `partialFilterExpression` to only apply the TTL to documents where `isVerified` is false
- Sets the expiration time to 7200 seconds (3 minutes)

This way, only unverified users will be automatically deleted after 3 minutes,
while verified users will remain in the database indefinitely.

> Note: MongoDB's TTL cleanup process runs approximately once per minute, so there might be a slight delay between when a document expires and when it's actually removed.
#### Prevent Deletion When User is Verified

- If a user verifies their account within 3 minutes, remove the `createdAt` field to prevent auto-deletion.
```aiignore
~ Create a TTL index on createdAt, but only for unverified users

userSchema.index({ createdAt: 1 }, {
    name: 'createdAtIndex',
    expireAfterSeconds: 180,  // 3 minutes
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
