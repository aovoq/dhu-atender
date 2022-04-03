import puppeteer from 'puppeteer'
import fs from 'fs'
import 'dotenv/config'

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
      const result = await page.evaluate(() => {
         const array = Array.from(
            document.querySelector('table').querySelectorAll('tbody > tr'),
            (row) => Array.from(row.querySelectorAll('th, td'), (cell) => cell.innerText),
         )
         return array
      })
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
