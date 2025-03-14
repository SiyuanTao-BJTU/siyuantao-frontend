const fs = require('fs');
const readline = require('readline');
const {exec} = require('child_process');

function buildElectron(callback){
    const inputFilePath = __dirname + '/dist/index.html';
    const outputFilePath = __dirname + '/dist/modified_index.html';

    const readStream = fs.createReadStream(inputFilePath,'utf-8');
    const writeStream = fs.createWriteStream(outputFilePath);

    const rl = readline.createInterface({
        input: readStream,
        output: writeStream,
        terminal: false
    });

    rl.on('line', (line) => {
        const modifiedLine = line.replace(/src="\/src/g, 'src=".');
        writeStream.write(modifiedLine + '\n');
    });


    rl.on('close', () => {
        console.log('File modified');

        fs.rename(outputFilePath, inputFilePath, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('File renamed');
            fs.mkdir(__dirname + '/dist/assets/js', { recursive: true }, (err) => {
                fs.copyFile(__dirname + '/src/assets/js/index.full.js', __dirname + '/dist/assets/js/index.full.js', (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('File copied');
                });

                fs.copyFile(__dirname + '/src/assets/js/vue.global.js', __dirname + '/dist/assets/js/vue.global.js', (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('File copied');
                });

                callback()
            })
        });
    });
}

exec('npm run build:desktop', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    buildElectron(()=>{
        exec('npm run electron:build',()=>{
            console.log('Electron build complete');
        })
    });
});
