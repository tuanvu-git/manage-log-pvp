var chokidar = require('chokidar');
const axios = require('axios');

var watcher = chokidar.watch('public/all_log', { ignored: /^\./, persistent: true, binaryInterval: 1000, interval: 1000 });
const currentStartServer = new Date().getTime();
const apiEndpoint = 'http://localhost:8080';
let timeout = null;
let counter = 0;
watcher
    .on('add', async function (path, fileInfo) {
        if (!path.includes('Test_result.csv')) return;

        const fileCTime = new Date(fileInfo.ctime).getTime();
        counter++;
        if (currentStartServer <= fileCTime) {
            console.log('file name:' + path + ' has been added later');
            await axios.post(`${apiEndpoint}/api/execute-v2`, {
                fullPathFile: path,
                isMigratePhase: 'no'
            });

        } else {
            console.log('file need to migrate ' + path);
            await axios.post(`${apiEndpoint}/api/execute-v2`, {
                fullPathFile: path,
                isMigratePhase: 'yes'
            });
        }
        console.log('completed add file ' + path);
        counter--;
        if(counter ===0) {
            console.log('migrate done!!!');
        }
        // clearTimeout(timeout);
        // timeout = setTimeout(() => {
        //     console.log('migrate done!!!');
        // }, 3000);
    })
    // .on('change', function (path) {
    //     console.log('File', path, 'has been changed');
    // })
    // .on('unlink', function (path) {
    //     console.log('File', path, 'has been removed');
    // })
    // .on('error', function (error) {
    //     console.error('Error happened', error);
    // })