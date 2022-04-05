import puppeteer from 'puppeteer'
import cron from 'node-cron'
import 'dotenv/config'

cron.schedule('00 11 10 * * *', () => {
   console.log('hi!')
   console.log('processing...')
   puppetter()
})

const puppetter = async () => {
   try {
      const browser = await puppeteer.launch({
         headless: true,
      })
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
      await page.click('#pmPage\\:funcForm\\:j_idt140')
      await page.waitForNavigation()
      await browser.close()
      console.log('done!')
   } catch (e) {
      console.log(e)
   }
}
