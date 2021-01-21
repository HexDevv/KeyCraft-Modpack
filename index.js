const fs = require('fs-extra');
const chalk = require('chalk');
const {execSync} = require('child_process');
const request = require('request');
const progress = require('request-progress');
const extract = require('extract-zip');
const { exit } = require('process');
const prompt = require('prompt-sync')();

//const DOWNLOADURL = 'https://github.com/HexDevv/KeyCraft-Modpack/archive/main.zip';

function error(msg, exitcode) {
    console.log(`There was an error whilst attempting to run this.`);
    console.log(`Error Message: ${msg}`);
    prompt('[Press anything to continue] ');
    process.exit(exitcode);
}

console.log(`Welcome to the ${chalk.italic('unofficial')} ${chalk.bold(chalk.cyan('KeyCraft'))} Modpack Installer.\nThis is for lazy cunts who don't know how to install mods.`);
console.log(`${chalk.underline('Few things before we get started:')}\n${chalk.bold('- This will delete ALL mods in the mods folder. If you\'re using this installer it probably means you don\'t have anything in your mods folder anyways.')}\n- If you have any issues, please DM HexDev#0001 on Discord, or open up an issue on the Github.\n- If you\'d like to suggest a mod, open up an issue on the Github.\n- This is a bodged installer. I cannot guarantee this will work. By using this installer you agree that I am not liable for any damages caused, and i provide no warranty.`);
let yn = prompt('[Y/n] ');

if (yn.toLowerCase().includes('n')) {
    console.log('Cancelled');
    prompt('[Press anything to continue] ');
    process.exit(0);
}

if (!fs.existsSync('./mods.zip')) {
}

console.clear();
console.log('Would you like to install Forge 1.12.2?');
yn = prompt('[y/N] ');

if (yn.toLowerCase().includes('y')) {
    if (!fs.existsSync('./forge.jar')) {console.log('You appear to not have forge.jar in the same folder.', 0)};
    console.log('Starting up Forge Installer.\nIn order to install: Mod System Installer > Install Client > Link to your .minecraft folder (should be already set) > Ok\nOnce done, simply close the pop-up and the installer will continue on.');
    execSync('java -jar forge.jar');
    console.log('Forge Installation complete.');
}

if (!fs.existsSync(process.env.APPDATA + '/.minecraft/mods/')) {
    error('Your /mods directory is non existent. Forge didn\'t install correctly. Please re-run the installer', 0);
}

console.log('Deleting mods folder...');
fs.removeSync(`${process.env.APPDATA}\\.minecraft\\mods`, {recursive:true});
fs.mkdirSync(`${process.env.APPDATA}/.minecraft/mods`);

request.get('https://pastebin.com/raw/qQzFqYpd', (err, res, body) => {
    if (res.statusCode != 200) error(`HTTP Error Status is ${res.statusCode}`, 0);
    const downloadURL = JSON.parse(body).downloadURL;
    
    const modFILE = fs.createWriteStream('./mods.zip');
    progress(request.get(downloadURL))
    .on('progress', function (state) {
        let downloadPercentage = '';
        for (let i=0;i<20;i++) {
            if (i<state.percent*20) downloadPercentage = downloadPercentage + '#';
            else downloadPercentage = downloadPercentage + '-';
        }
        console.clear();
        console.log(`Downloading mods... [${downloadPercentage}] ${(state.speed/1000000).toFixed(2)}MB/s\nThis may take a minute. Go listen to keyfm.net whilst you wait`);
    })
    .on('response', (res) => {
        res.pipe(modFILE);
    })
    .on('error', () => {fs.unlink('./mods.zip'); error('Failed to download mods.zip',0);})
    .on('end', async () => {
        console.clear();
        console.log('Extracting files...');
        await extract('./mods.zip', {dir: `${process.env.APPDATA}/.minecraft/mods/`});
        await console.clear();
        await console.log(`${chalk.green('Successfully installed KeyCraft! Ensure you have the Forge profile selected, then you should be ready to go!.\nDM HexDev#0001 for the server IP.')}`);
        prompt('[Press anything to continue] ');
        process.exit(0);
    });
});