const fs = require('fs');

const NAME_FILE = 'config/name.json';

const intent = () => ({
    keywords: ["your new name is q", "i'm going to call you q", "set name to q"],
    module: 'name'
});

let name = 'Brain';

function * name_resp(query) {
    const words = query.split(' ');
    name = words[words.length - 1];
    name = name.charAt(0).toUpperCase() + name.slice(1);

    fs.writeFile(NAME_FILE, JSON.stringify({name: name}, null, 2), function (err) {
        if (err) {
            return console.log(err);
        }
    });

    return { text: `You can now call me ${name}.`, name: name};
}

function register(app) {
    try {
        const nameJson = JSON.parse(fs.readFileSync(NAME_FILE));
        name = nameJson.name;
        console.log(`Name loaded from file: ${name}`);
    } catch (err) {
        // Ignore and use the default name.
    }
    app.get('/', function(req, res) {
        res.json({name: name});
    });
}

module.exports = {
    get: name_resp,
    register: register,
    intent: intent
};