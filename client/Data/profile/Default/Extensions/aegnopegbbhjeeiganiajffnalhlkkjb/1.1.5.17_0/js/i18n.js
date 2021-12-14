/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2017 The uBlock Origin authors

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

'use strict';

/* global HTMLDocument, XMLDocument */

// For background page, auxiliary pages, and content scripts.

/******************************************************************************/

// https://bugzilla.mozilla.org/show_bug.cgi?id=1408996#c9
var vAPI = window.vAPI; // jshint ignore:line

// https://github.com/chrisaljoudi/uBlock/issues/464
// https://github.com/chrisaljoudi/uBlock/issues/1528
//   A XMLDocument can be a valid HTML document.

// https://github.com/gorhill/uBlock/issues/1124
//   Looks like `contentType` is on track to be standardized:
//   https://dom.spec.whatwg.org/#concept-document-content-type

// https://forums.lanik.us/viewtopic.php?f=64&t=31522
//   Skip text/plain documents.

if (
    (document instanceof HTMLDocument ||
      document instanceof XMLDocument &&
      document.createElement('div') instanceof HTMLDivElement
    ) &&
    (/^image\/|^text\/plain/.test(document.contentType || '') === false)
) {
    vAPI = window.vAPI = vAPI instanceof Object && vAPI.uBO === true
        ? vAPI
        : { uBO: true };
}

/******************************************************************************/

(function(self) {
    
    // https://bugs.chromium.org/p/project-zero/issues/detail?id=1225&desc=6#c10
    if ( !self.vAPI || self.vAPI.uBO !== true ) {
        self.vAPI = { uBO: true };
    }
    
    var vAPI = self.vAPI;
    var chrome = self.chrome;
    
    
    
    vAPI.setTimeout = vAPI.setTimeout || self.setTimeout.bind(self);
    
    
    
    /**
        * @function setScriptDirection
        * @description Change the direction of body tag for different languages.
        * @see http://www.w3.org/International/questions/qa-scripts#directions
        * @param {string} language - The title of the book
        * @author LavaSoft
        * @version 1.0
    */
    var setScriptDirection = function(language) {
        document.body.setAttribute(
            'dir',
            ['ar', 'he', 'fa', 'ps', 'ur'].indexOf(language) !== -1 ? 'rtl' : 'ltr'
        );
    };
    
    
    /**
        * @function download
        * @description download a url.
        * @param {string} details - details for url.
        * @author LavaSoft
        * @version 1.0
        * @source : vAPI
     */
    vAPI.download = function(details) {
        if ( !details.url ) {
            return;
        }
    
        var a = document.createElement('a');
        a.href = details.url;
        a.setAttribute('download', details.filename || '');
        a.setAttribute('type', 'text/plain');
        a.dispatchEvent(new MouseEvent('click'));
    };
    
    
    
    vAPI.getURL = chrome.runtime.getURL;
    
    
    
    vAPI.i18n = chrome.i18n.getMessage;
    
    setScriptDirection(vAPI.i18n('@@ui_locale'));
    
    
    vAPI.getUILanguage = chrome.i18n.getUILanguage;
    
    /**
     * This callback occur after client request for a certain webservice.
     *
     * @callback Bot~requestCallback
     * @param {Error}   Error during request
     * @param {Object}  Response from Telegram service
     */
    // https://github.com/gorhill/uBlock/issues/3057
    // - webNavigation.onCreatedNavigationTarget become broken on Firefox when we
    //   try to make the popup panel close itself using the original
    //   `window.open('', '_self').close()`. 
    vAPI.closePopup = function() {
        if (
            self.browser instanceof Object &&
            typeof self.browser.runtime.getBrowserInfo === 'function'
        ) {
            window.close();
            return;
        }
    
        // TODO: try to figure why this was used instead of a plain window.close().
        // https://github.com/gorhill/uBlock/commit/b301ac031e0c2e9a99cb6f8953319d44e22f33d2#diff-bc664f26b9c453e0d43a9379e8135c6a
        window.open('', '_self').close();
    };
    
    
    
    // A localStorage-like object which should be accessible from the
    // background page or auxiliary pages.
    // This storage is optional, but it is nice to have, for a more polished user
    // experience.
    
    // https://github.com/gorhill/uBlock/issues/2824
    //   Use a dummy localStorage if for some reasons it's not available.
    
    // https://github.com/gorhill/uMatrix/issues/840
    //   Always use a wrapper to seamlessly handle exceptions
    
    vAPI.localStorage = {
        clear: function() {
            try {
                window.localStorage.clear();
            } catch(ex) {
            }
        },
        getItem: function(key) {
            try {
                return window.localStorage.getItem(key);
            } catch(ex) {
            }
            return null;
        },
        removeItem: function(key) {
            try {
                window.localStorage.removeItem(key);
            } catch(ex) {
            }
        },
        setItem: function(key, value) {
            try {
                window.localStorage.setItem(key, value);
            } catch(ex) {
            }
        }
    };
    
    })(this);
    


// This file should always be included at the end of the `body` tag, so as
// to ensure all i18n targets are already loaded.

(function() {



// https://github.com/gorhill/uBlock/issues/2084
//   Anything else than <a>, <b>, <code>, <em>, <i>, <input>, and <span> will
//   be rendered as plain text.
//   For <input>, only the type attribute is allowed.
//   For <a>, only href attribute must be present, and it MUST starts with
//   `https://`, and includes no single- or double-quotes.
//   No HTML entities are allowed, there is code to handle existing HTML
//   entities already present in translation files until they are all gone.

var reSafeTags = /^([\s\S]*?)<(b|code|em|i|span)>(.+?)<\/\2>([\s\S]*)$/,
    reSafeInput = /^([\s\S]*?)<(input type="[^"]+")>(.*?)([\s\S]*)$/,
    reInput = /^input type=(['"])([a-z]+)\1$/,
    reSafeLink = /^([\s\S]*?)<(a href=['"]https:\/\/[^'" <>]+['"])>(.+?)<\/a>([\s\S]*)$/,
    reLink = /^a href=(['"])(https:\/\/[^'"]+)\1$/;

var safeTextToTagNode = function(text) {
    var matches, node;
    if ( text.lastIndexOf('a ', 0) === 0 ) {
        matches = reLink.exec(text);
        if ( matches === null ) { return null; }
        node = document.createElement('a');
        node.setAttribute('href', matches[2]);
        return node;
    }
    if ( text.lastIndexOf('input ', 0) === 0 ) {
        matches = reInput.exec(text);
        if ( matches === null ) { return null; }
        node = document.createElement('input');
        node.setAttribute('type', matches[2]);
        return node;
    }
    // Firefox extension validator warns if using a variable as argument for
    // document.createElement().
    switch ( text ) {
    case 'b':
        return document.createElement('b');
    case 'code':
        return document.createElement('code');
    case 'em':
        return document.createElement('em');
    case 'i':
        return document.createElement('i');
    case 'span':
        return document.createElement('span');
    default:
        break;
    }
};

var safeTextToTextNode = function(text) {
    // TODO: remove once no more HTML entities in translation files.
    if ( text.indexOf('&') !== -1 ) {
        text = text.replace(/&ldquo;/g, '“')
                   .replace(/&rdquo;/g, '”')
                   .replace(/&lsquo;/g, '‘')
                   .replace(/&rsquo;/g, '’');
    }
    return document.createTextNode(text);
};

var safeTextToDOM = function(text, parent) {
    if ( text === '' ) { return; }
    // Fast path (most common).
    if ( text.indexOf('<') === -1 ) {
        return parent.appendChild(safeTextToTextNode(text));
    }
    // Slow path.
    // `<p>` no longer allowed. Code below can be remove once all <p>'s are
    // gone from translation files.
    text = text.replace(/^<p>|<\/p>/g, '')
               .replace(/<p>/g, '\n\n');
    // Parse allowed HTML tags.
    var matches = reSafeTags.exec(text);
    if ( matches === null ) {
        matches = reSafeLink.exec(text);
        if ( matches === null ) {
            matches = reSafeInput.exec(text);
            if ( matches === null ) {
                parent.appendChild(safeTextToTextNode(text));
                return;
            }
        }
    }
    safeTextToDOM(matches[1], parent);
    var node = safeTextToTagNode(matches[2]) || parent;
    safeTextToDOM(matches[3], node);
    parent.appendChild(node);
    safeTextToDOM(matches[4], parent);
};



// Helper to deal with the i18n'ing of HTML files.
vAPI.i18n.render = function(context) {
    var docu = document;
    var root = context || docu;
    var elems, n, i, elem, text;

    elems = root.querySelectorAll('[data-i18n]');
    n = elems.length;
    for ( i = 0; i < n; i++ ) {
        elem = elems[i];
        text = vAPI.i18n(elem.getAttribute('data-i18n'));
        if ( !text ) {
            continue;
        }
        // TODO: remove once it's all replaced with <input type="...">
        if ( text.indexOf('{') !== -1 ) {
            text = text.replace(/\{\{input:([^}]+)\}\}/g, '<input type="$1">');
        }
        safeTextToDOM(text, elem);
    }

    elems = root.querySelectorAll('[title]');
    n = elems.length;
    for ( i = 0; i < n; i++ ) {
        elem = elems[i];
        text = vAPI.i18n(elem.getAttribute('title'));
        if ( text ) {
            elem.setAttribute('title', text);
        }
    }

    elems = root.querySelectorAll('[placeholder]');
    n = elems.length;
    for ( i = 0; i < n; i++ ) {
        elem = elems[i];
        elem.setAttribute('placeholder', vAPI.i18n(elem.getAttribute('placeholder')));
    }

    elems = root.querySelectorAll('[data-i18n-tip]');
    n = elems.length;
    for ( i = 0; i < n; i++ ) {
        elem = elems[i];
        elem.setAttribute(
            'data-tip',
            vAPI.i18n(elem.getAttribute('data-i18n-tip')).replace(/<br>/g, '\n').replace(/\n{3,}/g, '\n\n')
        );
    }
};

//vAPI.i18n.render();



vAPI.i18n.renderElapsedTimeToString = function(tstamp) {
    var value = (Date.now() - tstamp) / 60000;
    if ( value < 2 ) {
        return vAPI.i18n('elapsedOneMinuteAgo');
    }
    if ( value < 60 ) {
        return vAPI.i18n('elapsedManyMinutesAgo').replace('{{value}}', Math.floor(value).toLocaleString());
    }
    value /= 60;
    if ( value < 2 ) {
        return vAPI.i18n('elapsedOneHourAgo');
    }
    if ( value < 24 ) {
        return vAPI.i18n('elapsedManyHoursAgo').replace('{{value}}', Math.floor(value).toLocaleString());
    }
    value /= 24;
    if ( value < 2 ) {
        return vAPI.i18n('elapsedOneDayAgo');
    }
    return vAPI.i18n('elapsedManyDaysAgo').replace('{{value}}', Math.floor(value).toLocaleString());
};



})();


