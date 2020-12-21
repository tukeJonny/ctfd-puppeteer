const { Cluster } = require('puppeteer-cluster')
const numOfUsers = process.env.NUM_OF_USERS || 100
const domain = process.env.DOMAIN || '';
(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 20,
    })

    cluster.task(async ({ page, data: username }) => {
        await page.goto(`https://${domain}/register`, {
            waitUntil: ['load', 'networkidle2'],
            timeout: 0
        })

        await page.type('#name', username)
        await page.type('#email', `${username}@${username}.com`)
        await page.type('#password', `${username}password`)
        await page.click('[name="_submit"]')

        await page.waitForNavigation()
        console.log(`[+] ${username} created`)
    })

    for (let idx = 0; idx < numOfUsers; idx++) {
        cluster.queue(`user${idx}`)
    }

    await cluster.idle()
    await cluster.close()
})();
