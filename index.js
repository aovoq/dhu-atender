import puppeteer from 'puppeteer'
import cron from 'node-cron'
import fs from 'fs'
import 'dotenv/config'

if (!process.env.DHU_ID || !process.env.DHU_PASS) {
   console.log('Please touch .env file.')
   process.exit()
}

const read = () => {
   try {
      return fs.readFileSync('./out.json', 'utf8')
   } catch (err) {
      console.log('out.json がありません\ngetdata.js を実行してください。')
      process.exit()
   }
}
const timetable = read()

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
      console.log('waiting...')
   } catch (e) {
      console.log(e)
   }
}

const run = (dayOfWeek, time) => {
   console.log('今日の時間割↓')
   console.table(timetable[dayOfWeek - 1])
   if (timetable[dayOfWeek - 1][time]) {
      console.log(`${time + 1}限目、授業あるぜ！ 授業名: ${timetable[dayOfWeek - 1][time]}`)
      puppetter()
   } else {
      console.log(`${time + 1}限目、授業ないぜ！ マタネ！`)
      console.log('Waiting...')
   }
}

const dayCheck = (time) => {
   let date = new Date()
   let dayOfWeek = date.getDay()
   let dayOfWeekStr = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]
   console.log(`今日は${dayOfWeekStr}曜日`)
   run(dayOfWeek, time)
}

console.log(`ID: ${process.env.DHU_ID}`)
console.log(`PASS: ${process.env.DHU_PASS}`)
console.log('Waiting...')

// !(() => {
//    dayCheck(5)
// })()
