const generate = require('meaningful-string')
const EventEmitter = require('events')
const eventEmitter = new EventEmitter()

const MIN_SESSION_TIMEOUT = 2
const settings = {
    SESSION_TIMEOUT: 3000 // Seconds of session elapsing time
}

/** setSessionTimeout(sessionTimeout)
 * 
 * @description This function is used to set the session timeout
 * @param {number} sessionTimeout The session timeout in seconds
 * @return {boolean} true or false: true if ok
 * 
 * @example setSessionTimeout(60) // returns true
 **/
function setSessionTimeOut(sessionTimeout) {
    if (typeof sessionTimeout === 'number' && sessionTimeout >= MIN_SESSION_TIMEOUT) {
        settings.SESSION_TIMEOUT = sessionTimeout
        return true
    }
    return false
}

/** getSessionTimeout() -> number
 * 
 * @description This function is used to get the session timeout
 * @return {number} The session timeout in seconds
 * 
 * @example getSessionTimeout() // returns 60
 **/
function getSessionTimeout() {
    return settings.SESSION_TIMEOUT
}

/** getLoggedUsers():
 * 
 * @description This function is used to get the list of logged users
 * @return {array} The list of logged users
 * @example getLoggedUsers() // returns ['username1', 'username2', ...]
 * @example getLoggedUsers() // returns [] if no users are logged
 **/
function getLoggedUsers() {
    return Object.keys(sessions).map((k, i) => sessions[Object.keys(sessions)[i]].username)
}

let generation_options = {
    "min": 20,
    "max": 30,
    "capsWithNumbers": true
}
var m_options = {
    "numberUpto": 60,
    "joinBy": '-'
}

let sessions = [] // Sessions collection
let skIo = null // Reference to the socket IO http server

/**
 * Function used to copy the Socket IO http server reference
 *
 * @param {*} ioRef
 */
function initSocketReference(ioRef) {
    skIo = ioRef
}

/**
 * Function to add users sessions in this module. Use it at login
 *
 * @param {string} username The username provided on successful login
 * @return {string} user unique key
 */
function loadNewSession(username) { // Generate new session
    console.log('[Session Manager]: New session saved! 😉')
    const newSessionKey = `${generate.meaningful(m_options)}_${generate.random(generation_options)}`
    sessions[newSessionKey] = {
        username,
        key: newSessionKey,
        timer: createNewSessionTimer(newSessionKey, username)
    }
    eventEmitter.emit('newActiveUser', newSessionKey)
        //console.log("[Session Manager]: Active sessions:", sessions)
    return newSessionKey
}

/**
 * Function to delete users sessions in this module. Use it at client logout
 *
 * @param {string} key The session_key provided on successful login
 * @return {boolean} true or false, true if ok
 * @throws {Error} if key is not found in the collection of sessions
 * @throws {Error} if key is not a string or is empty or null or undefined
 * @throws {Error} if key is not a valid session key (not a string or is empty or null or undefined)
 */
function deleteSession(key) { // Generate new session
    console.log('[Session Manager]: Deleting session! 😉')
    let ret = false
    try {
        if (checkSessionStatus(key)) {
            clearTimeout(sessions[key].timer)
            delete sessions[key]
            ret = true
            eventEmitter.emit('activeUserDeleted', key)
        }
    } catch (error) {
        console.log(error.message)
        ret = false
        eventEmitter.emit('error', new Error(`[Session Manager]: Deleting session`), {
            // or anything that you can like an user id
            error
        })
    }
    return ret
}

/**
 * Use this to notify the client to logout with WebSocket
 *
 * @param {string} key The session_key
 * @return {boolean} true or false, true if ok
 */
function sendLogoutMessage(key) {
    if (skIo !== null) {
        eventEmitter.emit('notifyClientToLogout', skIo, key)
    }
}

/**
 * Function to return a new setTimeout object and start it.
 *
 * @param {string} key The session_key
 * @param {string} username The username, only for logging features
 * @return {NodeJS.Timeout}
 */
function createNewSessionTimer(key, username) {
    return setTimeout((_key, _username) => {
        sendLogoutMessage(_key) // Session is expired... logging out
        delete sessions[_key]
        eventEmitter.emit('activeUserDeleted', key)
        console.log('[Session Manager]: Removed user', _username)
    }, settings.SESSION_TIMEOUT * 1000, key, username)
}

/**
 * Function to check if a key is valid and exists in the stored collection
 * Use this before every API.js function execution.
 *
 * @param {string} key the user key generated at login
 * @return {boolean} true or false: true if session is active
 */
function checkSessionStatus(key) {
    if (sessions[key]) {
        console.log('[Session Manager]: Session accepted! 👍')
        return true
    }
    console.log('[Session Manager]: ⚠ !Session rejected! ⚠')
    eventEmitter.emit('error', new Error(`[Session Manager]: ⚠ !Session rejected! ⚠`), {
        // or anything that you can like an user id
        key
    })
    return false
}

/**
 * getUsernameFromSessionKey(key) -> string
 * 
 * @description This function is used to get the username from a session key
 * @param {string} key The session key
 * @return {string} The username or false if not found
 * 
 * @example getUsernameFromSessionKey('123456789_123456789') // returns 'username' or false if not found
 **/
function getUsernameFromSessionKey(key) {
    if (sessions[key]) {
        return sessions[key].username
    }
    console.log('[Session Manager]: Session not found...')
    return false
}

module.exports = {
    eventEmitter,
    setSessionTimeOut,
    getSessionTimeout,
    initSocketReference,
    sendLogoutMessage,
    loadNewSession,
    deleteSession,
    checkSessionStatus,
    getUsernameFromSessionKey,
    getLoggedUsers
}