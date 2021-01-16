const { Cluster } = require('puppeteer-cluster')
const numOfChalls = process.env.NUM_OF_CHALLS || 20
const domain = process.env.DOMAIN || ''
const loginUser = process.env.LOGIN_USER || ''
const loginPassword = process.env.LOGIN_PASSWORD || '';

function choose(choices) {
    const idx = Math.floor(Math.random()*choices.length)
    return choices[idx]
}

function chooseCategory() {
    return choose(['Web', 'Pwn', 'Crypto', 'Misc', 'Rev'])
}

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 20
    })

    cluster.task(async ({page, data: challname }) => {
        // login
        await page.goto(`https://${domain}/login`, {
            waitUntil: ['load', 'networkidle2'],
            timeout: 0
        })
        await page.type('#name', loginUser)
        await page.type('#password', loginPassword)
        await page.click('[name="_submit"]')
	console.log('Logged in')
        await page.waitForNavigation()

        // create chall
	console.log('Lets create chall')
        await page.goto(`https://${domain}/admin/challenges/new`, {
            waitUntil: ['load', 'networkidle2'],
            timeout: 0
        })

	console.log('Typing ...')
        await page.type('#create-chal-entry-div > form > div:nth-child(1) > input', challname)
        await page.type('#create-chal-entry-div > form > div:nth-child(2) > input', chooseCategory())
        await page.type('#create-chal-entry-div > form > div:nth-child(4) > input', "100")
        await page.click('#create-chal-entry-div > form > div:nth-child(7) > button')

	console.log('Wait for selector')
        await page.waitForSelector('.modal-content')

        await page.waitForSelector('#challenge-create-options > div > div > div.modal-body > form > div:nth-child(1) > div > div.col-md-8 > input')
        await page.waitForSelector('#challenge-create-options > div > div > div.modal-body > form > div:nth-child(3) > select')
        await page.waitForTimeout(1000)
        await page.type('#challenge-create-options > div > div > div.modal-body > form > div:nth-child(1) > div > div.col-md-8 > input', `TESTCTF{${challname}}`)
        await page.select('#challenge-create-options > div > div > div.modal-body > form > div:nth-child(3) > select', "visible")

        await page.click('#challenge-create-options > div > div > div.modal-body > form > div:nth-child(5) > button')
	console.log('Wait for navigation')
        await page.waitForNavigation()

        console.log(`[+] chall${idx} created`)
    })

    for (let idx = 0; idx < numOfChalls; idx++) {
        cluster.queue(`chall${idx}`)
    }

    await cluster.idle()
    await cluster.close()
})()
