# SOP and Technical Standards for User Registration, Session Management, and Game Flow

## Overview

This document outlines the technical standards and procedures for user registration, session management, and game flow in a multiplayer and single-player game setup. The focus is on managing user sessions using Redis, ensuring that the user experience is smooth, and handling edge cases such as cookies being removed or sessions remaining active in Redis. Additionally, it covers the functionality for both single-player and multiplayer game modes.

---

## 1. **User Registration Flow**

### 1.1 **New User Registration**
When a new user enters a username and hits the `/register` API, the following steps are executed:

1. The system checks if the username exists in the database.
2. If the username doesn't exist in the database, the system proceeds with registration.
3. The username is then added to the system with a unique session ID, which is stored in **Redis** to track the active session.

### 1.2 **Error Handling for Duplicate Username**
If a user with the same username tries to register again, the `/register` API will return an error message, instructing the user to log in with the existing username.

### 1.3 **Session Tracking in Redis**
- The system stores the session ID in **Redis** for an active session. This helps to track whether a session is currently active or not.
- If a user tries to log in with a username that already has an active session (session ID exists in Redis), the login request will be denied.

---

## 2. **Login Flow**

### 2.1 **Login API Endpoint (`/login`)**
When a user tries to log in using a previously registered username, the following steps are executed:

1. **Check Redis for Active Session**: The system checks Redis to see if there is an active session associated with the username. An active session is identified by the presence of a session ID.
   
   - **If an active session exists**: The user is not allowed to log in and an error message is returned: `"Username already in use. Please wait for the session to complete."`
   
   - **If no active session exists**: The user is allowed to log in and the session is created in Redis.

2. **Session Persistence**: The session ID is stored in the user's browser cookies to maintain the session across page refreshes. If the user logs out, the session ID is removed.

---

## 3. **Handling Session Expiry / Cache Cleanup**

### 3.1 **Abnormal Logout (Cookie Removal)**
- In case a user removes cookies from their browser, the session ID in Redis still exists, meaning the session is still marked as active.
  
- To handle this, we need to implement a mechanism that can **expire or clear** the session in Redis if the session ID does not match the one in the browser. This can be achieved by:
  1. **Session Expiry**: The Redis session can have a TTL (time-to-live) set for the session, and after a certain period, the session will expire.
  2. **Manual Cache Burst**: If a user logs in again after removing cookies, the system should check the session in Redis, and if the session is invalid or expired, it should be removed from Redis.

   **Solution**: We can implement an API endpoint or a scheduled job that checks the session status in Redis and removes expired or invalid sessions.

### 3.2 **Track Score by Session**
- Scores are tracked based on the session ID, not the username.
- Every time a new session starts for a user, their score is reset to zero, and the game progresses from the start.
- This ensures that the user's score is not tied to a username but rather to the session, so a new session will not inherit the previous session's score.

### 3.3 **Single-Player Game Score Caching**
- Each time a player answers a question, the score is updated in Redis:
  - `game:{game_id}:responses`: Stores each response with the question ID, the user's selection, and whether the answer was correct.
  - `game:{game_id}`: Stores information about the next question and other game data.
  
- These caches are updated periodically to sync game progress with MongoDB.

---

## 4. **Game Flow**

### 4.1 **Single-Player Mode**
- When a user starts a game in single-player mode, the game session is created, and the user is asked a series of questions (default: 5 questions).
- The game progresses by:
  1. Presenting a question with options to the user.
  2. The user selects an answer, and the system validates it.
  3. The response (correct/incorrect) is cached in Redis and updated in the user's score.

- When all questions have been answered:
  - The game status is updated to **"completed"** in Redis.
  - The game data is synced with MongoDB, storing the total score and responses.

### 4.2 **Multiplayer Mode**
- For multiplayer mode, a user fills out a game start form with the player mode and number of questions in the game.
- When a user registers for multiplayer:
  1. Their username is registered in the **User table**.
  2. A session ID is stored in Redis, and a unique invite link is generated.
  3. The invite link is shared via **WhatsApp** to another player, containing the inviter’s score and the link to join the game.

- **Multiplayer Session Management**:
  1. If the invited user logs in via the invite link, they are shown the inviter's score.
  2. The invited user can join the game, and their session is tracked in Redis.

---

## 5. **Session Handling for Multiplayer**

### 5.1 **Invite Flow**
- The system generates an invite link for the invited player, which includes the following parameters:
  - **Session ID**: Tracks the session and score of the inviter.
  - **Invite Parameter**: A flag that ensures the invited player can log in even if their username has an active session.

### 5.2 **Cache Update for Multiplayer Game**
- When the multiplayer game session begins:
  1. The system updates the Redis cache with the new session data.
  2. The cache stores game state (questions, responses, scores, etc.) for each player involved.

---

## 6. **Security and Error Handling**

### 6.1 **Error Handling for Active Sessions**
- When a user tries to log in with an active session, an error message is returned, telling them to wait until their session is completed.

### 6.2 **Session ID Expiry**
- Set a TTL for each session in Redis to ensure that old sessions are automatically cleaned up after a certain time, preventing any stale sessions.

### 6.3 **Race Conditions**
- Handle race conditions where two users may try to register or log in with the same username at the same time by using locks in Redis or other synchronization techniques.

---

## 7. **Technical Standards**

- **Session Management**: Use **Redis** for session management with TTL for automatic session expiration.
- **Database**: **MongoDB** will store user profiles, but game progress (score, questions) will be cached in Redis for fast access.
- **Scalability**: The system should be designed to scale with Redis for handling large numbers of active sessions and game states.
- **Security**: Use **HTTPS** for secure communication and **JWT** or **session cookies** to maintain secure user sessions.

---

## Conclusion

By implementing the above standards, we ensure a smooth and efficient user registration, session management, and game flow, supporting both single-player and multiplayer modes while handling edge cases such as active sessions, session expiry, and player invites effectively. This ensures that users have a seamless experience, while also providing efficient caching and session management with Redis.