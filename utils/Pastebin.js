'use strict';

const request = require('request');
const Log = require('./Log');
const apiKey = 'c768c168d9bc885941e2e67e9cd8ad82';

class Pastebin {
    /**
     * Creates a new paste on pastebin.
     * @param  {String}   pasteName
     * @param  {String}   pasteContent
     * @param  {Function} callback
     * @return {void}
     */
    static createPaste( pasteName, pasteContent, callback ) {
        // Post the documentation to pastebin
        Log.log('[help] Creating a new post on pastebin');
        let requestOpts = {
            url: 'http://pastebin.com/api/api_post.php',
            form : {
                api_dev_key: apiKey,
                api_option: 'paste',
                api_paste_code : pasteContent,
                api_paste_name: pasteName
            }
        };
        request.post( requestOpts, ( err, response, body ) => {
            if ( err ) {
                Log.log( 'Error creating TextUploader post: ' + err );
            }

            Log.log('[help] Pastebin post created', body);

            if ( callback ) {
                callback( body );
            }
        } );
    }
}
module.exports = Pastebin;
