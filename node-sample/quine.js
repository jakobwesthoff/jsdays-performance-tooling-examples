var fs = require('fs');

fs.readFile(__filename, function(err, content) {
    console.log(content.toString('utf8'));
});