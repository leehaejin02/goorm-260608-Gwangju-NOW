import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.docx'))

for (const f of files) {
  console.log('\n=== FILE:', f)
  const buf = fs.readFileSync(path.join(dir, f))
  const text = buf.toString('utf8')

  const endpoints = [...text.matchAll(/KorService[12]\/[a-zA-Z0-9]+/g)]
  ;[...new Set(endpoints.map((m) => m[0]))].slice(0, 30).forEach((e) => console.log('EP', e))

  const keys = [...text.matchAll(/serviceKey|ServiceKey|인증키|일반.?인증/gi)]
  console.log('key mentions:', keys.length)

  if (text.includes('searchFestival2')) console.log('HAS searchFestival2')
  if (text.includes('searchFestival1')) console.log('HAS searchFestival1')
  if (text.includes('apis.data.go.kr')) console.log('HAS apis.data.go.kr')
}
