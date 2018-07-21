const ytdl = require('ytdl-core');
const search = require('yt-search');
const fs = require('fs');
const prompt = require('prompt-base');
const colors = require('colors');

var dir = './Downloaded';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

process.title = "Youtube Downloader by Etzyy"

let term = new prompt({
    name: 'term',
    message: 'Please, input an url or search term:'
})

let format = new prompt({
    name: 'format',
    message: 'Please, input a format (mp3/mp4):'
})

let choose = new prompt({
    name: 'choose',
    message: "What video would you like?"
})

let endprompt = new prompt({
    name: 'endprompt',
    message: 'Would you like to download more? (Y\\N)'
})

function askFormat(ter) {
    format.run()
        .then(async form => {
            let formath;
            if (typeof form !== "string") return askFormat();
            if (form.startsWith("mp4")) formath = "video"
            else if (form.startsWith("mp3")) formath = "audioonly"
            else askFormat(ter)
            download(ter, formath, form)
        })
}

function askTerm() {
    console.clear()
    term.run()
        .then(async ter => {
            askFormat(ter)
        })
}

askTerm()

async function download(ter, form, extension) {
    if (typeof ter !== "string") {
        return askFormat(ter); // if term is not a string then return to start
    }
    if (!ytdl.validateURL(ter)) {
        console.clear()
        search(ter, (err, res) => {
            if (err) return console.log('Could not get that search term! Please be more specific.'.bgRed)
            let videos = res.videos.slice(0, 10)
            if (videos.length < 1) return console.log('Could not get the search term. Please be more specify.'.bgRed)
            let resp = '';
            for (var i in videos) {
                resp += `[${parseInt(i)+1}]: "${videos[i].title}"\n`
            }
            resp += `\nChoose a number between 1-${videos.length}. To cancel use "0"`;
            console.log(resp)
            choose.run().then(async num => {
                let ch = parseInt(num);
                if (ch == 0) return askTerm();
                // [videos[ch - 1].url]
                console.clear()
                let info = await ytdl.getInfo(videos[parseInt(num) - 1].url)
                // console.log(info)
                console.log(`"${info.title}" by "${info.author.name}" is being downloaded..`.bold)

                await ytdl(videos[parseInt(num) - 1].url, {
                        filter: form
                    })
                    .pipe(fs.createWriteStream(`Downloaded/${info.title}.${extension}`)).on('close', () => {
                        console.log('\nThanks for downloading with us!\n'.rainbow)

                        function endProm() {
                            endprompt.run().then(response => {
                                if (response.toUpperCase().includes("Y")) return askTerm();
                                else if (response.toUpperCase().includes("N")) return process.exit();
                                else return endProm()
                            })
                        }
                        endProm()
                    })
            })
        })
    } else {
        console.clear()
        let info = await ytdl.getInfo(ter)
        // console.log(info)
        console.log(`"${info.title}" by "${info.author.name}" is being downloaded..`.bold)

        await ytdl(ter, {
                filter: form
            })
            .pipe(fs.createWriteStream(`Downloaded/${info.title}.${extension}`)).on('close', () => {
                console.log('Thanks for downloading with us!\n'.rainbow)

                function endProm() {
                    endprompt.run().then(response => {
                        if (response.toUpperCase().includes("Y")) return askTerm();
                        else if (response.toUpperCase().includes("N")) return process.exit();
                        else return endProm()
                    })
                }
                endProm()
            })
    }
}
