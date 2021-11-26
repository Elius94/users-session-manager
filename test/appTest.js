import { assert } from 'chai';
import { SessionManager } from '../index.js';

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
    });

    let third_session_key = ""
    it('Setting SESSION_TIMEOUT to 2 second, wait and create a new user "Ugo"', () => {
        SM.setSessionTimeOut(2)
        assert.equal(SM.getSessionTimeout(), 2)
        third_session_key = SM.loadNewSession("Ugo")
        assert.equal(SM.getUsernameFromSessionKey(third_session_key), "Ugo")
    });

    it('Wait 1 secs 1/3', function(done) {
        setTimeout(done, 1000);
    });

    it('Wait 1 secs 2/3', function(done) {
        setTimeout(done, 1000);
    });

    it('Wait 1 secs 3/3', function(done) {
        setTimeout(done, 1000);
    });

    it('Check if "Ugo" is still logged', () => {
        assert.equal(SM.getUsernameFromSessionKey(third_session_key), false)
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

    after(() => {
        console.log("SessionManager test ended")
    })

})