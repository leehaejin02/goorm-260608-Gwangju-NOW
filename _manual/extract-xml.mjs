import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const dir = path.dirname(fileURLToPath(import.meta.url))
const target = fs.readdirSync(dir).find((f) => f.includes('활용매뉴얼') && f.endsWith('.docx'))
if (!target) throw new Error('manual not found')

const tmp = path.join(dir, '_docx_tmp')
fs.rmSync(tmp, { recursive: true, force: true })
fs.mkdirSync(tmp, { recursive: true })

execSync(
  `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${path.join(dir, target).replace(/'/g, "''")}' -DestinationPath '${tmp.replace(/'/g, "''")}' -Force"`,
)

const xml = fs.readFileSync(path.join(tmp, 'word', 'document.xml'), 'utf8')
const plain = xml
  .replace(/<w:tab[^/]*\/>/g, '\t')
  .replace(/<w:br[^/]*\/>/g, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')

const keywords = [
  'searchFestival',
  'KorService',
  'serviceKey',
  '인증키',
  '일반 인증',
  'Encoding',
  'Decoding',
  'areaCode',
  'lDongRegnCd',
  'eventStartDate',
  'apis.data.go.kr',
]

for (const kw of keywords) {
  let idx = 0
  let count = 0
  while ((idx = plain.indexOf(kw, idx)) !== -1 && count < 3) {
    console.log('\n---', kw, '---')
    console.log(plain.slice(Math.max(0, idx - 80), idx + 120))
    idx += kw.length
    count++
  }
}
