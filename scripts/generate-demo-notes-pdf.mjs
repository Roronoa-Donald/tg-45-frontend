import { writeFileSync } from 'node:fs'

const outputPath = new URL('../docs/demo-notes.pdf', import.meta.url)
const lines = [
  'ChainCacao - Notes de demonstration',
  '',
  '1. Message d ouverture',
  'Presenter ChainCacao comme une interface metier pour tracer les lots de cacao,',
  'securiser les operations et permettre une verification publique sans compte.',
  '',
  '2. Demonstration rapide',
  '- Se connecter avec un role agriculteur, cooperative ou verificateur.',
  '- Creer un lot avec photo, poids, date et coordonnees.',
  '- Montrer la sauvegarde locale du brouillon et la file de synchronisation.',
  '- Ouvrir la liste des lots puis le detail d un lot.',
  '- Basculer vers la verification publique et saisir un code lot.',
  '',
  '3. Points a souligner au jury',
  '- Mobile first et lisible hors ligne.',
  '- Routes protegees selon le role.',
  '- Mutations rejouables quand la connexion revient.',
  '- Style coherent et accessible.',
  '- README complet avec installation et utilisation.',
  '',
  '4. Rappel de soumission',
  'Verifier PHASE_2_DEMIFINAL, les liens du prototype, du README, la video et',
  'le document de notes exporte en PDF.',
]

const escaped = lines.map((line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'))
const textOps = ['BT', '/F1 14 Tf', '72 770 Td']

escaped.forEach((line, index) => {
  if (index === 0) {
    textOps.push(`(${line}) Tj`)
  } else {
    textOps.push('T*')
    textOps.push(`(${line}) Tj`)
  }
})

textOps.push('ET')
const content = `${textOps.join('\n')}\n`

const objects = [
  '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
  '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
  '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
  '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  `5 0 obj\n<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream\nendobj\n`,
]

let pdf = '%PDF-1.4\n'
const offsets = ['0000000000 65535 f \n']

for (const object of objects) {
  offsets.push(`${String(pdf.length).padStart(10, '0')} 00000 n \n`)
  pdf += object
}

const xrefPos = pdf.length
pdf += `xref\n0 ${objects.length + 1}\n`
pdf += offsets.join('')
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
pdf += `startxref\n${xrefPos}\n%%EOF\n`

writeFileSync(outputPath, pdf)
