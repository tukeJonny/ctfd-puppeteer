const { Cluster } = require('puppeteer-cluster')
const fs = require('fs')
const domain = process.env.DOMAIN || ''
const numOfTrials = process.env.NUM_OF_TRIALS || 100000
const numOfUsers = process.env.NUM_OF_USERS || 100
const parallel = process.env.PARALLEL || 100
const failures = process.env.FAILURES || 9

const content = fs.readFileSync("src/challenges.json")
const challJSON = JSON.parse(content)

function loadChallenges() {
    let table = {}

    challJSON.results.map(result => {
        table[result.name] = result.id
    })

    return table
}

const table = loadChallenges()

function choose(choices) {
    const idx = Math.floor(Math.random()*choices.length)
    return choices[idx]
}

function chooseChall() {
    const chall = choose(challJSON.results)

    const autoIncChallId = chall.id
    const challName = chall.name

    return [challName, autoIncChallId]
}

function chooseFlag(challName) {
    return choose(Array.prototype.concat(Array.from({ length: failures }, (v, k) => `TESTCTF{WRONG${k}}`), [`TESTCTF{${challName}}`]))
}


(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: parallel
    })

    cluster.task(async ({page, data: {username, challName, autoIncChallId} }) => {
        // login
        console.log('Move login')
        await page.goto(`https://${domain}/login`, {
            waitUntil: ['load', 'networkidle2'],
            timeout: 0
        })

        await page.type('#name', username)
        await page.type('#password', `${username}password`)
        await page.click('[name="_submit"]')
        console.log('Wait for login')
        await page.waitForNavigation()

        // trial
        console.log('Move trial')
        await page.goto(`https://${domain}/challenges#${challName}-${autoIncChallId}`, {
            waitUntil: ['load', 'networkidle2'],
            timeout: 0
        })

        console.log(`Wait for submission selector: ${challName}-${autoIncChallId}`)
        await page.waitForSelector("#challenge-input")
        await page.waitForSelector("#challenge-submit")
        await page.waitForTimeout(500)

        console.log('Typing submission')
        await page.type("#challenge-input", chooseFlag(challName))
        await page.click("#challenge-submit")

        console.log(`[+] Submitted by ${username} to ${challName} ${t}/${numOfTrials}`)
    })

    for (let userIdx = 0; userIdx < numOfUsers; userIdx++) {
        for (let t = 0; t < numOfTrials; t++) {
            const [challName, autoIncChallId] = chooseChall()
            cluster.queue({ username: `user${userIdx}`, challName: challName, autoIncChallId: autoIncChallId })
        }
    }

    await cluster.idle()
    await cluster.close()
})()
