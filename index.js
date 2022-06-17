import puppeteer from 'puppeteer'
import cron from 'node-cron'
import fs from 'fs'
import 'dotenv/config'
import process from 'process'

if (!process.env.DHU_ID || !process.env.DHU_PASS) {
   console.log('Please touch .env file.')
   process.exit()
}

const read = () => {
   try {
      return JSON.parse(fs.readFileSync('./out.json', 'utf8'))
   } catch (err) {
      console.log('out.json がありません\ngetdata.js を実行してください。')
      process.exit()
   }
}
const timetable = read()

const times = [
   '10 31 8 * * *',
   '05 11 10 * * *',
   '14 31 12 * * *',
   '19 11 14 * * *',
   '12 51 15 * * *',
   '08 31 17 * * *',
]

cron.schedule(times[0], () => {
   console.log('hi! 1限目の時間')
   dayCheck(1)
})
cron.schedule(times[1], () => {
   console.log('hi! 2限目の時間')
   dayCheck(2)
})
cron.schedule(times[2], () => {
   console.log('hi! 3限目の時間')
   dayCheck(3)
})
cron.schedule(times[3], () => {
   console.log('hi! 4限目の時間')
   dayCheck(4)
})
cron.schedule(times[4], () => {
   console.log('hi! 5限目の時間')
   dayCheck(5)
})
cron.schedule(times[5], () => {
   console.log('hi! 6限目の時間')
   dayCheck(6)
})

const runPuppeteer = async () => {
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
   console.log('===========================')
   timetable[dayOfWeek - 1].map((item, index) => {
      console.log(`${index + 1}限目: ${item ? item : 'XXXXXX'}`)
   })
   console.log('===========================')
   if (timetable[dayOfWeek - 1][time - 1]) {
      console.log(`${time}限目、授業あるぜ！ 授業名: ${timetable[dayOfWeek - 1][time - 1]}`)
      runPuppeteer()
   } else {
      console.log(`${time}限目、授業ないぜ！ マタネ！`)
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
// console.log(`ID: AXXDCXXX`)
// console.log(`PASS: XXXXXX`)
console.log('Waiting...')

if (process.argv[2] === '--now') {
   runPuppeteer()
}
