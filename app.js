const runs = [
  { id: 'Run 104', previous: 'Run 103', date: 'Nov 17 · 14:25 UTC', trigger: 'Manual', status: 'Passed', style: 'pass', current: 'baseline', ratio: '0.0%', note: 'The homepage is back within the approved visual baseline.' },
  { id: 'Run 103', previous: 'Run 102', date: 'Nov 17 · 12:10 UTC', trigger: 'Release', status: 'Regression', style: 'regression', current: 'regression', ratio: '12.2%', note: 'The hero shifted down after the release, exceeding the 1% visual threshold.' },
  { id: 'Run 102', previous: 'Run 101', date: 'Nov 17 · 09:17 UTC', trigger: 'Scheduled', status: 'Passed', style: 'pass', current: 'baseline', ratio: '0.0%', note: 'The screenshot matches the approved baseline.' },
  { id: 'Run 101', previous: null, date: 'Nov 16 · 17:42 UTC', trigger: 'Manual', status: 'Baseline', style: 'baseline', current: 'baseline', ratio: '—', note: 'The first passing run established the visual reference.' }
]
const find = id => document.getElementById(id)
const tabs = [...document.querySelectorAll('[data-view]')]
let selected
function view(name) {
  for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.view === name))
  const image = name === 'baseline' ? 'baseline' : name === 'diff' ? selected.current === 'regression' ? 'diff' : 'match' : selected.current
  find('screenshot').src = 'images/' + image + '.png'
  find('screenshot').alt = 'Mock ' + name + ' screenshot for ' + selected.id
}
function lineage(button, id) {
  button.disabled = !id
  button.textContent = id || '—'
  button.onclick = id ? () => select(runs.find(run => run.id === id)) : null
}
function select(run) {
  selected = run
  for (const button of document.querySelectorAll('.run')) button.setAttribute('aria-pressed', String(button.dataset.id === run.id))
  find('run-title').textContent = run.id
  find('run-meta').textContent = run.trigger + ' · ' + run.date
  find('verdict').textContent = run.status
  find('verdict').className = 'pill ' + run.style
  lineage(find('previous'), run.previous)
  lineage(find('baseline'), run.previous ? 'Run 101' : null)
  find('ratio').textContent = run.ratio === '—' ? 'Reference capture' : run.ratio + ' changed'
  find('visual-note').textContent = run.note
  find('check-count').textContent = run.style === 'regression' ? '2 passed · 1 failed' : '3 passed'
  const checks = [
    ['HTTP response', true, 'The mock homepage returned HTTP 200.'],
    ['Main heading', true, 'The expected heading “Fernando Soliva” was present.'],
    ['Homepage screenshot', run.style !== 'regression', run.note]
  ]
  find('checks').replaceChildren(...checks.map(([label, passed, description]) => {
    const item = document.createElement('details')
    const title = document.createElement('summary')
    const status = document.createElement('span')
    status.className = 'pill ' + (passed ? 'pass' : 'regression')
    status.textContent = passed ? 'Passed' : 'Failed'
    const text = document.createElement('p')
    text.textContent = description
    title.append(label, status)
    item.append(title, text)
    return item
  }))
  view(run.style === 'regression' ? 'diff' : 'current')
}
for (const run of runs) {
  const item = document.createElement('li')
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'run'
  button.dataset.id = run.id
  button.innerHTML = '<div><strong>' + run.id + '</strong><span class="pill ' + run.style + '">' + run.status + '</span></div><small>' + run.trigger + ' · ' + run.date + '</small>'
  button.onclick = () => select(run)
  item.append(button)
  find('runs').append(item)
}
for (const tab of tabs) tab.onclick = () => view(tab.dataset.view)
select(runs[1])
