const assert = require('chai').assert;
const { loadNewSession, getUsernameFromSessionKey, getLoggedUsers, deleteSession, setSessionTimeOut, getSessionTimeout } = require("../index.js");

describe('App Logging Cycle', () => {
    let session_key = loadNewSession("Luca")
    it('Check session string:', () => {
        console.log("session_key:", session_key)
        assert.equal(typeof session_key, 'string')
    });

    it('Get username from session key', () => {
        assert.equal(getUsernameFromSessionKey(session_key), "Luca")
    });

    let second_session_key = loadNewSession("Fabio")
    it('Check second session string:', () => {
        console.log("session_key:", second_session_key)
        assert.equal(typeof second_session_key, 'string')
    });

    it('Get second username from session key', () => {
        assert.equal(getUsernameFromSessionKey(second_session_key), "Fabio")
    });

    it('Get all logged users', () => {
        assert.equal(getLoggedUsers().length, 2)
        assert.equal(getLoggedUsers()[0], "Luca")
        assert.equal(getLoggedUsers()[1], "Fabio")
    });

    it('Deleting session of first user', () => {
        assert.equal(deleteSession(session_key), true)
        assert.equal(getLoggedUsers().length, 1)
        assert.notEqual(getLoggedUsers()[0], "Luca")
    });

    it('Try to get first username even if it was deleted', () => {
        assert.equal(getUsernameFromSessionKey(session_key), false)
    })

    /*
    let third_session_key = ""
    it('Setting SESSION_TIMEOUT to 2 second, wait and create a new user "Ugo"', () => {
        setSessionTimeOut(2)
        assert.equal(getSessionTimeout(), 2)
        third_session_key = loadNewSession("Ugo")
        assert.equal(getUsernameFromSessionKey(third_session_key), "Ugo")
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
            assert.equal(getUsernameFromSessionKey(third_session_key), false)
        });*/

    after(() => {
        deleteSession(second_session_key)
    })

})