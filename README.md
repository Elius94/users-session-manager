# users-session-manager
A simple Node.js library to manage users sessions on a web application or any kind of JS apps

Install with:

    npm i users-session-manager

Example of usage

    // Import module
    const sm = require('users-session-manager')
    // Or with ES6 syntax
    // import { setSessionTimeOut, loadNewSession } from 'users-session-manager'

    // Change session Expiration time:
    sm.setSessionTimeOut(6)

    // Call this to initialize a new user session
    sm.loadNewSession("Luca")
    sm.loadNewSession("Fabio")

    // You can listen to events emitted from this library through eventEmitter object exported
    sm.eventEmitter.on("activeUserDeleted", (key) => {
        console.log(`User ${key} has been deleted`)
    })

    setInterval(() => {
        console.log(sm.getLoggedUsers())
    }, 5000)



## Exported APIs

 - ```eventEmitter```:
    Node.js Event Emitter object. It fires the following events:
    - 'error': Called when some error happens (eg: Session is rejected)
    - 'activeUserDeleted': Called when a session is deleted or if expired
    - 'newActiveUser': Called when a user session is created
    - 'notifyClientToLogout': Called when a session timer is expired, bind this to a Socket.io server to force clients to logout

 ## Functions

<dl>
<dt><a href="#setSessionTimeOut">setSessionTimeOut(sessionTimeout)</a> ⇒ <code>boolean</code></dt>
<dd><p>This function is used to set the session timeout</p>
</dd>
<dt><a href="#getSessionTimeout">getSessionTimeout()</a> ⇒ <code>number</code></dt>
<dd><p>This function is used to get the session timeout</p>
</dd>
<dt><a href="#getLoggedUsers">getLoggedUsers()</a> ⇒ <code>array</code></dt>
<dd><p>This function is used to get the list of logged users</p>
</dd>
<dt><a href="#initSocketReference">initSocketReference(ioRef)</a></dt>
<dd><p>Function used to copy the Socket IO http server reference</p>
</dd>
<dt><a href="#loadNewSession">loadNewSession(username)</a> ⇒ <code>string</code></dt>
<dd><p>Function to add users sessions in this module. Use it at login</p>
</dd>
<dt><a href="#deleteSession">deleteSession(key)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function to delete users sessions in this module. Use it at client logout</p>
</dd>
<dt><a href="#sendLogoutMessage">sendLogoutMessage(key)</a> ⇒ <code>boolean</code></dt>
<dd><p>Use this to notify the client to logout with WebSocket</p>
</dd>
<dt><a href="#createNewSessionTimer">createNewSessionTimer(key, username)</a> ⇒ <code>NodeJS.Timeout</code></dt>
<dd><p>Function to return a new setTimeout object and start it.</p>
</dd>
<dt><a href="#checkSessionStatus">checkSessionStatus(key)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function to check if a key is valid and exists in the stored collection
Use this before every API.js function execution.</p>
</dd>
<dt><a href="#getUsernameFromSessionKey">getUsernameFromSessionKey(key)</a> ⇒ <code>string</code></dt>
<dd><p>This function is used to get the username from a session key</p>
</dd>
</dl>

<a name="setSessionTimeOut"></a>

## setSessionTimeOut(sessionTimeout) ⇒ <code>boolean</code>
This function is used to set the session timeout

**Kind**: global function
**Returns**: <code>boolean</code> - true or false: true if ok

| Param | Type | Description |
| --- | --- | --- |
| sessionTimeout | <code>number</code> | The session timeout in seconds |

**Example**
```js
setSessionTimeout(60) // returns true
```
<a name="getSessionTimeout"></a>

## getSessionTimeout() ⇒ <code>number</code>
This function is used to get the session timeout

**Kind**: global function
**Returns**: <code>number</code> - The session timeout in seconds
**Example**
```js
getSessionTimeout() // returns 60
```
<a name="getLoggedUsers"></a>

## getLoggedUsers() ⇒ <code>array</code>
This function is used to get the list of logged users

**Kind**: global function
**Returns**: <code>array</code> - The list of logged users
**Example**
```js
getLoggedUsers() // returns ['username1', 'username2', ...]
```
**Example**
```js
getLoggedUsers() // returns [] if no users are logged
```
<a name="initSocketReference"></a>

## initSocketReference(ioRef)
Function used to copy the Socket IO http server reference

**Kind**: global function

| Param | Type |
| --- | --- |
| ioRef | <code>\*</code> |

<a name="loadNewSession"></a>

## loadNewSession(username) ⇒ <code>string</code>
Function to add users sessions in this module. Use it at login

**Kind**: global function
**Returns**: <code>string</code> - user unique key

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | The username provided on successful login |

<a name="deleteSession"></a>

## deleteSession(key) ⇒ <code>boolean</code>
Function to delete users sessions in this module. Use it at client logout

**Kind**: global function
**Returns**: <code>boolean</code> - true or false, true if ok
**Throws**:

- <code>Error</code> if key is not found in the collection of sessions
- <code>Error</code> if key is not a string or is empty or null or undefined
- <code>Error</code> if key is not a valid session key (not a string or is empty or null or undefined)


| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The session_key provided on successful login |

<a name="sendLogoutMessage"></a>

## sendLogoutMessage(key) ⇒ <code>boolean</code>
Use this to notify the client to logout with WebSocket

**Kind**: global function
**Returns**: <code>boolean</code> - true or false, true if ok

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The session_key |

<a name="createNewSessionTimer"></a>

## createNewSessionTimer(key, username) ⇒ <code>NodeJS.Timeout</code>
Function to return a new setTimeout object and start it.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The session_key |
| username | <code>string</code> | The username, only for logging features |

<a name="checkSessionStatus"></a>

## checkSessionStatus(key) ⇒ <code>boolean</code>
Use this before every API.js function execution.n the stored collection

**Kind**: global function
**Returns**: <code>boolean</code> - true or false: true if session is active

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | the user key generated at login |

<a name="getUsernameFromSessionKey"></a>

## getUsernameFromSessionKey(key) ⇒ <code>string</code>
This function is used to get the username from a session key

**Kind**: global function
**Returns**: <code>string</code> - The username or false if not found

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The session key |

**Example**
```js
getUsernameFromSessionKey('123456789_123456789') // returns 'username' or false if not found
```