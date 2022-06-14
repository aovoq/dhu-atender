import puppeteer from 'puppeteer'
import fs from 'fs'
import 'dotenv/config'

let quarter

if (process.argv[2] !== undefined) {
   if (process.argv[2].indexOf('-q') === 0) {
      quarter = process.argv[2].split('=')[1]
   } else {
      console.log('please enter [quarter argv]')
      console.log('sample: node getdata.js -q=1')
      console.log('--- Get 1quarter timetable')
      process.exit()
   }
} else {
   console.log('please enter [quarter argv]')
   console.log('sample: node getdata.js -q=1')
   console.log('--- Get 1quarter timetable')
   process.exit()
}

if (!process.env.DHU_ID || !process.env.DHU_PASS) {
   console.log('Please touch .env file.')
} else {
   !(async () => {
      try {
         const browser = await puppeteer.launch({ headless: true })
         const page = await browser.newPage()
         await page.goto('https://portal.dhw.ac.jp/uprx/up/pk/pky501/Pky50101.xhtml', {
            waitUntil: 'networkidle0',
         })
         await page.type('#pmPage\\:loginForm\\:userId_input', process.env.DHU_ID)
         await page.type('input[type="password"]', process.env.DHU_PASS)
         await Promise.all([
            page.click('#pmPage\\:loginForm\\:j_idt38'),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
         ])
         await page.click('button#pmPage\\:j_idt32')
         await page.click('.ui-panel-inner > ul > li:nth-of-type(7) > a')
         await page.waitForNavigation()
         const result = await page.evaluate((quarter) => {
            const array = Array.from(
               document.querySelector(`#pmPage\\:funcForm\\:j_idt87 > table:nth-of-type(${quarter})`).querySelectorAll('tbody > tr'),
               (row) => Array.from(row.querySelectorAll('th, td'), (cell) => cell.innerText),
            )
            return array
         }, quarter)
         result.splice(2, 1)
         result.map((item) => item.shift())
         browser.close()
         let picked = [[], [], [], [], [], []]

         result.map((item) => {
            item.map((item, indexX) => {
               picked[indexX].push(item)
            })
         })
         console.log(picked)
         fs.writeFile('out.json', JSON.stringify(picked), (err, data) => {
            if (err) console.log(err)
            else console.log('write end')
         })
      } catch (e) {
         console.log(e)
      }
   })()
}
