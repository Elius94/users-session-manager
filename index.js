const generate = require('meaningful-string')
const EventEmitter = require('events');

const generation_options = {
    "min": 20,
    "max": 30,
    "capsWithNumbers": true
}
const m_options = {
    "numberUpto": 60,
    "joinBy": '-'
}

/**
 * SessionManager is a class that manages the sessions of the users.
 * @extends EventEmitter
 */
class SessionManager extends EventEmitter {
    constructor() {
        super()
            // Singleton declaration
        if (SessionManager._instance) {
            return SessionManager._instance
        }
        SessionManager._instance = this;

        /** @const {Object} sessions - The sessions of the users. */
        /** @const {SocketIO.Server} - The socket reference. */
        /** @const {number} MIN_SESSION_TIMEOUT - The minimum session timeout. */
        /** @const {Object} settings - The settings of the session manager. */

        // Initialize the settings
        this.sessions = []
        this.skIo = null
        this.MIN_SESSION_TIMEOUT = 2
        this.settings = {
            SESSION_TIMEOUT: 3000 // Seconds of session elapsing time
        }
    }

    /**
     * @param {string} msg
     * @returns {void}
     * 
     * @description Logs a message to the console if the debug flag is set to true in the config.
     * 
     */
    log(msg) {
        if (process.env.DEBUG) {
            console.log(msg)
        }
    }

    test2(x) {
        console.log(x)
    }

    /**
     * This function is used to set the session timeout
     * @param {number} sessionTimeout The session timeout in seconds
     * @return {boolean} true or false: true if ok
     * 
     * @example setSessionTimeOut(3000) // Returns true or false
     **/
    setSessionTimeOut(sessionTimeout) {
        if (typeof sessionTimeout === 'number' && sessionTimeout >= this.MIN_SESSION_TIMEOUT) {
            this.settings.SESSION_TIMEOUT = sessionTimeout
            return true
        }
        return false
    }

    /**
     * This function is used to get the session timeout
     * @return {number} The session timeout in seconds
     * 
     * @example getSessionTimeOut() // Returns 3000
     **/
    getSessionTimeout() {
        return this.settings.SESSION_TIMEOUT
    }

    /** 
     * This function is used to get the list of logged users
     * @return {array} The list of logged users
     * 
     * @example getLoggedUsers() // Returns ['Gino', 'Gino2']
     **/
    getLoggedUsers() {
        return Object.keys(this.sessions).map((k, i) => this.sessions[Object.keys(this.sessions)[i]].username)
    }

    /**
     * Function to copy the Socket IO http server reference
     * @param {*} ioRef
     * @return {boolean} true or false, true if ok
     */
    initSocketReference(ioRef) {
        this.skIo = ioRef
    }

    /**
     * Function to get the socket reference
     * @return {SocketIO.Server} The socket reference
     */
    getSocketReference() {
        return this.skIo
    }

    /** 
     * Function to add users sessions in this module. Use it at login
     * @param {string} username The username provided on successful login
     * @return {string} user unique key
     * 
     * @example addSession('Gino') // Returns 'session_key'
     */
    loadNewSession(username) { // Generate new session
        this.log('[Session Manager]: New session saved! 😉')
        const newSessionKey = `${generate.meaningful(m_options)}_${generate.random(generation_options)}`
        this.sessions[newSessionKey] = {
            username,
            key: newSessionKey,
            createdAt: Date.now(),
            timer: this.createNewSessionTimer(newSessionKey, username)
        }
        this.emit('sessionCreated', newSessionKey)
            //this.log("[Session Manager]: Active sessions:", sessions)
        return newSessionKey
    }

    /**
     * Function to set the property 'data' of a session. Use it for example to store something in the session, like the user actions history, etc.
     * 
     * @param {string} key The session_key provided on successful login 
     * @param {object} data The data to be stored in the session
     * @return {boolean} true or false, true if ok
     * @throws {Error} If the session_key is not found
     * 
     * @example setSessionData('session_key', {'actions': ["logged in", ...]}) // Returns true or false
     * 
     */
    setSessionData(key, data) {
        if (this.checkSessionStatus(key)) {
            this.sessions[key].data = data // Set the data
            return true
        }
        return false
    }

    /**
     * Function to get the property 'data' of a session. Use it for example to get the user actions history, etc.
     * 
     * @param {string} key The session_key provided on successful login
     * @return {object} The data stored in the session
     * @throws {Error} If the session_key is not found
     * 
     * @example getSessionData('session_key') // Returns {'actions': ["logged in", ...]}
     */
    getSessionData(key) {
        if (this.checkSessionStatus(key)) {
            return this.sessions[key].data
        }
        return false
    }

    /** Function that restart the session timer. Use it after an API call to keep the session alive.
     * 
     * @param {string} key The session_key
     * @return {boolean} true or false, true if ok
     * @throws {Error} If the session key is not found
     * 
     * @example restartSessionTimer('session_key') // Returns true or false
     */
    restartSessionTimer(key) {
        if (this.checkSessionStatus(key)) {
            clearTimeout(this.sessions[key].timer)
            this.sessions[key].timer = this.createNewSessionTimer(key, this.sessions[key].username)
            return true
        }
        return false
    }

    /**
     * Function to get details of a session. Use it to get the username, the creation date and the data.
     * 
     * @param {string} key The session_key
     * @return {object|boolean} The session details or false if not found
     * @throws {Error} If the session key is not found
     * 
     * @example getSessionDetails('session_key') // Returns {'username': 'Gino', 'createdAt': 1523456789, 'data': {'actions': ["logged in", ...]}}
     */
    getSessionDetails(key) {
        if (this.checkSessionStatus(key)) {
            if (this.sessions[key].data) {
                return {
                    username: this.sessions[key].username,
                    createdAt: this.sessions[key].createdAt,
                    data: this.sessions[key].data
                }
            } else {
                return {
                    username: this.sessions[key].username,
                    createdAt: this.sessions[key].createdAt,
                }
            }
        }
        return false
    }

    /**
     * Function to delete users sessions in this module. Use it at client logout
     * @param {string} key The session_key provided on successful login
     * @return {boolean} true or false, true if ok
     * @throws {Error} If the session_key is not found
     * 
     * @example deleteSession('session_key') // Returns true or false
     */
    deleteSession(key) { // Generate new session
        this.log('[Session Manager]: Deleting session! 😉')
        let ret = false
        if (this.checkSessionStatus(key)) {
            clearTimeout(this.sessions[key].timer)
            delete this.sessions[key]
            ret = true
            this.emit('sessionDeleted', key)
        } else {
            this.log(`[Session Manager]: Deleting session`)
            ret = false
            this.emit('error', new Error(`[Session Manager]: Deleting session`), {
                // or anything that you can like an user id
                key
            })
        }
        return ret
    }

    /**
     * Function to delete all sessions
     * @return {boolean} true or false, true if ok
     */
    deleteAllSessions() {
        for (let key in this.sessions) {
            this.deleteSession(key)
            this.sendLogoutMessage(key)
        }
        return this.sessions.length === 0
    }

    /**
     * Use this to notify the client to logout with WebSocket
     * @param {string} key The session_key
     * @return {boolean} true or false, true if ok
     * 
     * @example sendLogoutMessage('session_key') // Returns true or false
     */
    sendLogoutMessage(key) {
        if (this.skIo !== null) {
            this.emit('notifyClientToLogout', this.skIo, key)
        }
    }

    /**
     * Function to return a new setTimeout object and start it.
     * @param {string} key The session_key
     * @param {string} username The username, only for logging features
     * @return {NodeJS.Timeout}
     * 
     * @example createNewSessionTimer('session_key', 'username') // Returns a new setTimeout object
     */
    createNewSessionTimer(key, username) {
        return setTimeout((_key, _username) => {
            this.sendLogoutMessage(_key) // Session is expired... logging out
            delete this.sessions[_key]
            this.emit('sessionDeleted', key)
            this.log('[Session Manager]: Removed user', _username)
        }, this.settings.SESSION_TIMEOUT * 1000, key, username)
    }

    /**
     * Function to check if a key is valid and exists in the stored collection
     * Use this before every API.js function execution.
     * @param {string} key the user key generated at login
     * @return {boolean} true or false: true if session is active
     * @throws {Error} if the session is not valid
     * @throws {Error} if the session is expired
     * 
     * @example checkSessionStatus('my_session_key') // true or false
     * 
     */
    checkSessionStatus(key) {
        if (this.sessions[key]) {
            this.log('[Session Manager]: Session accepted! 👍')
            return true
        }
        this.log('[Session Manager]: ⚠ !Session rejected! ⚠')
        this.emit('error', new Error(`[Session Manager]: ⚠ !Session rejected! ⚠`), {
            // or anything that you can like an user id
            key
        })
        return false
    }

    /**
     * Function to get the username from a session key
     * @param {string} key The session key
     * @return {string} The username or false if not found
     * 
     * @example getUsernameFromSessionKey('123456789_123456789') // 'username'
     */
    getUsernameFromSessionKey(key) {
        if (this.sessions[key]) {
            return this.sessions[key].username
        }
        this.log('[Session Manager]: Session not found...')
        return false
    }
}

module.exports = SessionManager