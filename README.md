# time-app-test
This repository serves as a proof of concept for a secure time tracking application, 
demonstrating the implementation of a secure login flow and end-to-end data encryption.
The application is designed to provide complete offline functionality with optional real-time synchronization with a self-hosted server.

## Offline Functionality

To allow the application to function entirely offline, all *necessary* data is stored locally on the client device.

## Auth Flow

User authentication is handled using Secure Remote Password (SRP) protocol.

### Register
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database
    participant Cache
    Client->>+Server: username
    Server-->Database: Check if username already exists
    break when username already exists
        Server->>Client: Error
    end
    Server->>Server: Generate userId
    Server->>+Cache: userId -> username
    Server->>-Client: userId
    Client->>Client: Generate authSalt
    Client->>Client: Derive privateKey (authSalt, userId, password)
    Client->>Client: Derive verifier (privateKey)
    Client->>Client: Generate dek
    Client->>Client: Generate kekSalt
    Client->>Client: Derive kek (kekSalt, password)
    Client->>Client: Derive encryptedDek (dek, kek)
    Client->>+Server: userId, username, authSalt, verifier, kekSalt, encryptedDek
    Cache->>-Server: userId -> username
    Note over Cache,Server: We just want to make sure a rouge client didn't change its mind
    break when username does not match
        Server->>Client: Error
    end
    Server->>Database: userId, username, authSalt, verifier, kekSalt, encryptedDek
    Server->>-Client: Success
```

### Login
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database
    participant Cache
    Client->>Client: Generate clientSecretEphemeral
    Client->>Client: Generate clientPublicEphemeral
    Client->>+Server: username, clientPublicEphemeral
    Database->>Server: username -> userId, authSalt, verifier
    Server->>Server: Generate serverSecretEphemeral
    Server->>Server: Generate serverPublicEphemeral
    Server->>+Cache: userId -> serverSecretEphemeral, clientPublicEphemeral, authSalt, verifier
    Server->>-Client: userId, salt, serverPublicEphemeral
    Client->>Client: Calculate privateKey (salt, userId, password)
    Client->>Client: Derive clientSession (clientSecretEphemeral,serverPublicEphemeral,salt,userId,privateKey)
    Client->>+Server: userId, clientSessionProof
    Cache->>-Server: userId -> serverSecretEphemeral, clientPublicEphemeral, salt, verifier
    Server->>Server: Derive serverSession (serverSecretEphemeral, clientPublicEphemeral, salt, verifier, userId, clientSessionProof)
    break when clientSessionProof is invalid
        Server->>Client: Error
    end
    Server->>Server: Generate refreshToken (random)
    Server->>Server: Derive deviceId (refreshToken)
    Server->>Server: Generate accessToken (userId, deviceId)
    Server->>+Cache: refreshToken -> userId
    Server->>-Client: serverSessionProof, accessToken, kekSalt, encryptedDek
    Note over Server,Client: refreshToken is stored in cookie, client can't see
    Client->>Client: verifySession (clientPublicEphemeral, clientSession, serverProof)
    break when serverSessionProof is invalid
        Client->>Client: Error
    end
    Client->>Client: Derive kek (kekSalt, password)
    Client->>Client: Derive dek (encryptedDek, kek)
    deactivate Cache
```

### Authenticated Endpoint
```mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>+Server: Authentication: Bearer accessToken
    Note over Server,Client: refreshToken is stored in cookie, client can't see
    Server->>Server: (userId, jwtDeviceId) = Decode JWT (accessToken)
    break when accessToken is invalid
        Server->>Client: Error
    end
    Server->>Server: (derivedDeviceId) = Derive deviceId (refreshToken)
    Server->>Server: Compare jwtDeviceId and derivedDeviceId
    break when deviceId does not match
        Server->>Client: Error
    end
    Server->>-Client: Success Response
```

### Refresh
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Cache
    Client->>+Server: Request
    Note over Server,Client: refreshToken is stored in cookie, client can't see
    Cache->>Server: refreshToken -> userId
    break when refreshToken does not exist
        Server->>Client: Error
    end
    Server->>Server: Derive deviceId (refreshToken)
    Server->>Server: Generate accessToken (userId, deviceId)
    Server->>-Client: accessToken
```

## Encryption Strategy

TODO

## Real-time Synchronization

TODO