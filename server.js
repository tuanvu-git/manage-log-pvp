var chokidar = require('chokidar');
const axios = require('axios');

var watcher = chokidar.watch('public/all_log', { ignored: /^\./, persistent: true, binaryInterval: 1000, interval: 1000 });
const currentStartServer = new Date().getTime();
const apiEndpoint = 'http://localhost:8080';
let counter = 0;
watcher
    .on('add', fileAddChange)
    .on('change', fileAddChange)
// .on('unlink', function (path) {
//     console.log('File', path, 'has been removed');
// })
// .on('error', function (error) {
//     console.error('Error happened', error);
// })



async function fileAddChange(path) {
    if (!path.includes('Test_result.csv')) return;
    counter++;

    console.log('file add or change ' + path);
    await axios.post(`${apiEndpoint}/api/execute-v2`, {
        fullPathFile: path,
        isMigratePhase: 'yes'
    });
    console.log('completed add file ' + path);
    counter--;
    if (counter === 0) {
        console.log('migrate done!!!');
    }

} 