'use strict';

let runtime = require('./Runtime');
const Log = require('./Log');
const request = require('request');

class Gist {
    static getGistLink( gistID ) {
        return `https://gist.github.com/${runtime.credentials.gistUsername}/${gistID}`;
    }

    static hasGistCredentials() {
        return runtime.credentials.gistUsername && runtime.credentials.gistAccessToken;
    }

    /**
     * Builds the request options object.
     * @return {object}
     */
    static getRequestOptions() {
        return {
            url: 'https://api.github.com/gists',
            headers: {
                'User-Agent' : 'Livecoding.tv Chat Bot'
            },
            auth: {
                'user' : runtime.credentials.gistUsername,
                'pass' : runtime.credentials.gistAccessToken
            },
            json: true,
            body: {
                description: 'LCTV Bot Gist',
                public: true,
                files: {}
            }
        };
    }

    /**
     * Creates a new Gist
     * @param  {String}   title
     * @param  {String}   content
     * @param  {Function} callback
     * @return {void}
     */
    static createGist( title, content, callback ) {
        if ( !Gist.hasGistCredentials() ) {
            Log.log('[Gist] No Gist credentials, not creating a Gist!');
            return;
        }

        let requestOpts = Gist.getRequestOptions();
        requestOpts.body.files = {
            "lctv-bot-help.md": {
                content: content
            }
        };

        request.post( requestOpts, ( err, response, body ) => {
            Gist.handleResponse( err, response, body, callback );
        });
    }

    /**
     * Updates an existing Gist
     * @param  {String}   gistID
     * @param  {String}   content
     * @param  {Function} callback
     * @return {void}
     */
    static updateGist( gistID, content, callback ) {
        if ( !Gist.hasGistCredentials() ) {
            Log.log('[Gist] No Gist credentials, not updating Gist!');
            return;
        }

        let requestOpts = Gist.getRequestOptions();
        requestOpts.url += '/' + gistID;
        requestOpts.body.files = {
            "lctv-bot-help.md": {
                content: content
            }
        };

        request.patch( requestOpts, ( err, response, body ) => {
            Gist.handleResponse( err, response, body, callback );
        });
    }

    /**
     * Handles response from Gist server.
     * @param  {?}   err
     * @param  {?}   response
     * @param  {object}   body
     * @param  {Function} callback
     * @return {void}
     */
    static handleResponse( err, response, body, callback ) {
        if ( err ) {
            Log.log( 'Error creating Gist: ' + err );
        }

        Log.log('[Gist] Gist post created', body.id);

        if ( callback ) {
            callback( body.id );
        }
    }
}

module.exports = Gist;
