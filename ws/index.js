const connect = require('connect');
const serveStatic = require('serve-static');
const path = require('path');
const PORT = 3010;
const bp = process.argv.find(i => i.indexOf('--basepath') === 0);
const port = [process.argv.find(i => i.indexOf('--port') === 0)].map(String)
    .map(i=>i.match(/.*=(.*)/) || [0, 3010])
    .map(i => i[1]).map(Number)[0];
let dir = __dirname;
if (bp) {
    const m = bp.match(/.*=(.*)/);
    if (m) {
        dir = path.resolve(m[1]);
    }
}

console.info(`base dir: ${dir}`);

connect()
    .use(serveStatic(dir))
    .listen(port, () => {
        console.info(`Server is running on ${PORT}...`);
    });
