// Simple Expense Tracker using localStorage
const STORAGE_KEY = 'expense-tracker:v1'

// Elements
const form = document.getElementById('expense-form')
const titleInput = document.getElementById('title')
const amountInput = document.getElementById('amount')
const typeInput = document.getElementById('type')
const categoryInput = document.getElementById('category')
const dateInput = document.getElementById('date')
const transactionsUl = document.getElementById('transactions')
const totalIncomeEl = document.getElementById('total-income')
const totalExpenseEl = document.getElementById('total-expense')
const balanceEl = document.getElementById('balance')
const clearAllBtn = document.getElementById('clear-all')
const filterInput = document.getElementById('filter')

let items = []

// Helpers
function formatCurrency(num){
  return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(num)
}

function save(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(items))
}

function load(){
  const raw = localStorage.getItem(STORAGE_KEY)
  items = raw ? JSON.parse(raw) : []
}

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7)
}

function render(filter=''){
  transactionsUl.innerHTML = ''
  const filtered = items.filter(i=>{
    const t = (i.title + ' ' + (i.category||'')).toLowerCase()
    return t.includes(filter.toLowerCase())
  })

  if(filtered.length===0){
    transactionsUl.innerHTML = '<li class="tx-empty">No transactions yet.</li>'
  }

  filtered.forEach(item => {
    const li = document.createElement('li')
    li.className = 'transaction'
    const left = document.createElement('div')
    left.className = 'tx-left'
    left.innerHTML = `<div>
      <div class="tx-title">${escapeHtml(item.title)}</div>
      <div class="tx-meta">${escapeHtml(item.category || '')} • ${item.date}</div>
    </div>`

    const right = document.createElement('div')
    right.className = 'tx-right'
    const amount = document.createElement('div')
    amount.className = 'tx-amount ' + (item.type === 'income' ? 'in' : 'out')
    amount.textContent = (item.type === 'income' ? '+' : '-') + formatCurrency(Math.abs(item.amount))

    const actions = document.createElement('div')
    actions.className = 'tx-actions'
    const delBtn = document.createElement('button')
    delBtn.textContent = 'Delete'
    delBtn.title = 'Delete this transaction'
    delBtn.addEventListener('click', ()=>{
      if(confirm('Delete this transaction?')){
        items = items.filter(x=>x.id!==item.id)
        save(); render(filterInput.value)
      }
    })

    actions.appendChild(delBtn)
    right.appendChild(amount)
    right.appendChild(actions)

    li.appendChild(left)
    li.appendChild(right)
    transactionsUl.appendChild(li)
  })

  // stats
  const income = items.filter(i=>i.type==='income').reduce((s,i)=>s+i.amount,0)
  const expense = items.filter(i=>i.type==='expense').reduce((s,i)=>s+Math.abs(i.amount),0)
  totalIncomeEl.textContent = formatCurrency(income)
  totalExpenseEl.textContent = formatCurrency(expense)
  balanceEl.textContent = formatCurrency(income - expense)
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
  })[s])
}

// Events
form.addEventListener('submit', (e)=>{
  e.preventDefault()
  const title = titleInput.value.trim()
  const amount = parseFloat(amountInput.value||0)
  const type = typeInput.value
  const category = categoryInput.value.trim()
  const date = dateInput.value || new Date().toISOString().slice(0,10)

  if(!title || isNaN(amount) || amount===0){
    alert('Please provide a title and non-zero amount.')
    return
  }

  const entry = {id: uid(), title, amount: type==='expense' ? -Math.abs(amount) : Math.abs(amount), type, category, date}
  items.unshift(entry)
  save()
  form.reset()
  // set today's date field blank after add
  dateInput.value = ''
  render(filterInput.value)
})

clearAllBtn.addEventListener('click', ()=>{
  if(items.length===0) return
  if(confirm('Clear all transactions?')){
    items = []
    save()
    render()
  }
})

filterInput.addEventListener('input', ()=>{
  render(filterInput.value)
})

// Initial boot
load()
render()
