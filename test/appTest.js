const assert = require('chai').assert;
const SessionManager = require('../index.js');
const sinon = require('sinon');

describe('App Logging Cycle', () => {
    const SM = new SessionManager();

    let session_key = SM.loadNewSession("Luca")
    it('Check session string:', () => {
        //console.log("session_key:", session_key)
        assert.equal(typeof session_key, 'string')
    });

    it('Get username from session key', () => {
        assert.equal(SM.getUsernameFromSessionKey(session_key), "Luca")
    });

    let second_session_key = SM.loadNewSession("Fabio")
    it('Check second session string:', () => {
        //console.log("session_key:", second_session_key)
        assert.equal(typeof second_session_key, 'string')
    });

    it('Get second username from session key', () => {
        assert.equal(SM.getUsernameFromSessionKey(second_session_key), "Fabio")
    });

    it('Get all logged users', () => {
        assert.equal(SM.getLoggedUsers().length, 2)
        assert.equal(SM.getLoggedUsers()[0], "Luca")
        assert.equal(SM.getLoggedUsers()[1], "Fabio")
    });

    it('Deleting session of first user', () => {
        assert.equal(SM.deleteSession(session_key), true)
        assert.equal(SM.getLoggedUsers().length, 1)
        assert.notEqual(SM.getLoggedUsers()[0], "Luca")
    });

    it('Try to get first username even if it was deleted', () => {
        assert.equal(SM.getUsernameFromSessionKey(session_key), false)
    })

    const SM2 = new SessionManager();
    // Check if singleton works fine with different instances of SessionManager class:
    it('Check if singleton works fine with different instances of SessionManager class', () => {
        assert.equal(SM2.getLoggedUsers().length, 1)
        assert.equal(SM2.getLoggedUsers()[0], "Fabio")
        assert.deepEqual(SM, SM2)
    });

    let third_session_key = ""
    it('Setting SESSION_TIMEOUT to 2 second, wait and create a new user "Ugo"', () => {
        SM.setSessionTimeOut(2)
        assert.equal(SM.getSessionTimeout(), 2)
        third_session_key = SM.loadNewSession("Ugo")
        assert.equal(SM.getUsernameFromSessionKey(third_session_key), "Ugo")
    });

    it('Wait 1 seconds', function(done) {
        setTimeout(done, 1000);
    });

    it('Wait 2 seconds', function(done) {
        setTimeout(done, 1000);
    });

    it('Wait 3 seconds', function(done) {
        setTimeout(done, 1000);
    });

    it('Check if "Ugo" is still logged', () => {
        assert.equal(SM.getUsernameFromSessionKey(third_session_key), false)
    });

    it('Should load a new session "Franco" that will expire in 2 seconds', () => {
        third_session_key = SM.loadNewSession("Franco")
        assert.equal(SM.getUsernameFromSessionKey(third_session_key), "Franco")
    });

    it('Wait 1 second', function(done) {
        setTimeout(done, 1000);
    });

    it('Sets sessionTimeout to 4 seconds and restarts the session timer for the last session key, so it will expire in 4 seconds from now', () => {
        SM.setSessionTimeOut(4)
        assert.equal(SM.getSessionTimeout(), 4)
        SM.restartSessionTimer(third_session_key)
    });

    it('Wait 1 second', function(done) {
        setTimeout(done, 1000);
    });

    it('Wait 2 seconds', function(done) {
        setTimeout(done, 1000);
    });

    it('Wait 3 seconds', function(done) {
        setTimeout(done, 1000);
    });

    it('Check if "Franco" is still logged', () => {
        assert.equal(SM.getUsernameFromSessionKey(third_session_key), "Franco")
    });

    it('Setting SESSION_TIMEOUT to 200 second, wait and create a new user "Giovanni"', () => {
        SM.setSessionTimeOut(200)
        assert.equal(SM.getSessionTimeout(), 200)
        third_session_key = SM.loadNewSession("Giovanni")
        assert.equal(SM.getUsernameFromSessionKey(third_session_key), "Giovanni")
    });

    it('Deleting all sessions:', () => {
        assert.equal(SM.deleteAllSessions(), true)
    })

    it('Check if all sessions are deleted', () => {
        assert.equal(SM.getLoggedUsers().length, 0)
    })

    // Check setSessionData and getSessionData methods:
    it('Sets session data for the last session key', () => {
        let k = SM.loadNewSession("Andrea")
        const fake_data = {
            "history": ["login", "getTable1", "getTable2", "getTable3"],
            "last_action": "getTable3",
            "last_action_time": new Date().getTime()
        }
        assert.deepEqual(SM.setSessionData(k, fake_data), true)
        assert.deepEqual(SM.getSessionData(k), fake_data)
            // delete user Andrea:
        assert.equal(SM.deleteAllSessions(), true)
        assert.equal(SM.getLoggedUsers().length, 0)
    })

    // Check getSessionDetails method:
    it('Check getSessionDetails method', () => {
        let k = SM.loadNewSession("Andrea")
        const session_details_no_data = SM.getSessionDetails(k)
        assert.include(Object.keys(session_details_no_data), "username")
        assert.include(Object.keys(session_details_no_data), "createdAt")
        assert.notInclude(Object.keys(session_details_no_data), "data")
        const fake_data = {
            "history": ["login", "getTable1", "getTable2", "getTable3"],
            "last_action": "getTable3",
            "last_action_time": new Date().getTime()
        }
        assert.deepEqual(SM.setSessionData(k, fake_data), true)
        assert.deepEqual(SM.getSessionData(k), fake_data)
        const session_details = SM.getSessionDetails(k)
        assert.include(Object.keys(session_details), "username")
        assert.include(Object.keys(session_details), "createdAt")
        assert.include(Object.keys(session_details), "data")
        assert.equal(session_details.username, "Andrea")
        assert.deepEqual(session_details.data, fake_data)

        // delete user Andrea:
        assert.equal(SM.deleteAllSessions(), true)
        assert.equal(SM.getLoggedUsers().length, 0)
    })

    // Check callbacks:
    let newKey = ""
    it('Check if callback "sessionCreated" is called when a new user is logged', () => {
        const spy = sinon.spy()
        SM.on('sessionCreated', spy)
        newKey = SM.loadNewSession("Gianfilippo")
        sinon.assert.calledOnce(spy)
        sinon.assert.calledWith(spy, newKey)
    });

    it('Check if callback "sessionDeleted" is called when previous user is deleted', () => {
        const spy = sinon.spy()
        SM.on('sessionDeleted', spy)
        SM.deleteSession(newKey)
        sinon.assert.calledOnce(spy)
    });

    // Check if initSocketReference works fine:
    it('Check if initSocketReference works fine', () => {
        const skIo = {}
        SM.initSocketReference(skIo)
        assert.deepEqual(SM.getSocketReference(), skIo)
    });

    it('Check if callback "notifyClientToLogout" is called', () => {
        const spy = sinon.spy()
        SM.on('notifyClientToLogout', spy)
        SM.sendLogoutMessage(newKey)
        sinon.assert.calledOnce(spy)
    });

    it('Makes the module to get errored to check the "error" EventEmit', () => {
        const spy = sinon.spy()
        SM.on('error', spy)
        SM.checkSessionStatus("WRONG_NAME")
        sinon.assert.calledOnce(spy)
        try {
            throw spy.args[0][0] // The first argument of the first call is the error
        } catch (e) {
            // Check if the error is the right one:
            assert.equal(e.message, "[Session Manager]: ⚠ !Session rejected! ⚠")
        }
        assert.equal(spy.args[0][1].key, "WRONG_NAME")
    });

    // Auxiliary functions:
    // Add process.env.DEBUG to see the console.log messages:
    process.env.DEBUG = true
    it('Should log messages to the console', () => {
        const spy = sinon.spy(console, 'log')
        SM.checkSessionStatus("WRONG_NAME")
        sinon.assert.calledOnce(spy)
        console.log.restore()
    });

    it('Should try to set SESSION_TIMEOUT below the minimum and it should return false', () => {
        assert.equal(SM.setSessionTimeOut(1), false)
    });

    it('Should try to call setSessionData with a non existing value, than should return false', () => {
        assert.equal(SM.setSessionData("WRONG_KEY", {}), false)
    });

    it('Should try to call getSessionData with a non existing value, than should return false', () => {
        assert.equal(SM.getSessionData("WRONG_KEY"), false)
    });

    it('Should try to call getSessionDetails with a non existing value, than should return false', () => {
        assert.equal(SM.getSessionDetails("WRONG_KEY"), false)
    });

    it('Should try to call deleteSession with a non existing values, than should return false', () => {
        assert.equal(SM.deleteSession("WRONG_KEY"), false)
    });

    it('Should try to call getLoggedUsers, than should return false', () => {
        assert.equal(SM.getLoggedUsers(), false)
    });

    it('Should try to call restartSessionTimer with a non existing value, than should return false', () => {
        assert.equal(SM.restartSessionTimer("WRONG_KEY"), false)
    });

    after(() => {
        console.log("SessionManager test ended")
    })
})