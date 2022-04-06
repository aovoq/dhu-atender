import puppeteer from 'puppeteer'
import cron from 'node-cron'
import fs from 'fs'
import 'dotenv/config'

const timetable = JSON.parse(fs.readFileSync('./out.json', 'utf8'))

const times = [
   '00 31 8 * * *',
   '00 11 10 * * *',
   '00 31 12 * * *',
   '00 11 14 * * *',
   '00 51 15 * * *',
   '00 31 17 * * *',
]

cron.schedule(times[0], () => {
   console.log('hi! 1限目の時間')
   dayCheck(0)
})
cron.schedule(times[1], () => {
   console.log('hi! 2限目の時間')
   dayCheck(1)
})
cron.schedule(times[2], () => {
   console.log('hi! 3限目の時間')
   dayCheck(2)
})
cron.schedule(times[3], () => {
   console.log('hi! 4限目の時間')
   dayCheck(3)
})
cron.schedule(times[4], () => {
   console.log('hi! 5限目の時間')
   dayCheck(4)
})
cron.schedule(times[5], () => {
   console.log('hi! 6限目の時間')
   dayCheck(5)
})

const puppetter = async () => {
   try {
      console.log('processing...')
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

const run = (time) => {
   console.log('今日の時間割↓')
   console.table(timetable[0])
   if (timetable[0][time]) {
      console.log(`この時間、授業あるぜ！ ${time + 1}限目 授業名: ${timetable[0][time]}`)
      puppetter()
   } else {
      console.log('この時間、授業ないぜ！ マタネ！')
   }
}

const dayCheck = (time) => {
   let date = new Date()
   let toDay = date.getDay()
   switch (toDay) {
      case 1:
         console.log('今日は月曜日')
         run(time)
         break
      case 2:
         console.log('今日は火曜日')
         run(time)
         break
      case 3:
         console.log('今日は水曜日')
         run(time)
         break
      case 4:
         console.log('今日は木曜日')
         run(time)
         break
      case 5:
         console.log('今日は金曜日')
         run(time)
         break
      case 6:
         console.log('今日は土曜日')
         run(time)
         break
      default:
         console.log('今日、授業なくね？')
   }
}

console.log(`ID: ${process.env.DHU_ID}`)
console.log(`PASS: ${process.env.DHU_PASS}`)
console.log('Waiting...')
