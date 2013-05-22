function utf8_to_b64( str ) {
  return window.btoa(unescape(encodeURIComponent( str )));
};

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
};
    
String.prototype.toTitleCase = function() {
    var i, str, lowers, uppers;
    str = this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless 
    // they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At', 
    'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
    for (i = 0; i < lowers.length; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), 
            function(txt) {
                return txt.toLowerCase();
            });

    // Certain words such as initialisms or acronyms should be left uppercase
    uppers = ['Id'];
    for (i = 0; i < uppers.length; i++)
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), 
            uppers[i].toUpperCase());

    return str;
};    
