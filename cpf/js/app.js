const LSKEY = 'peopleDB_v1';

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 10);
}

function loadDB() {
  const raw = localStorage.getItem(LSKEY);
  if (!raw) {
    const seed = [
      { id: cryptoRandomId(), firstName:'João', lastName:'Silva', cpf:'12345678901', address:'Rua A, 123 - João Pessoa, PB', age:34, weight:82, photo:'' },
      { id: cryptoRandomId(), firstName:'Maria', lastName:'Oliveira', cpf:'98765432100', address:'Av. B, 45 - Campina Grande, PB', age:28, weight:65, photo:'' }
    ];
    localStorage.setItem(LSKEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch(e) {
    return [];
  }
}
function saveDB(db) {
  localStorage.setItem(LSKEY, JSON.stringify(db));
}

let db = loadDB();
let selectedId = null;

// elements
const q = document.getElementById('q');
const results = document.getElementById('results');
const searchBtn = document.getElementById('searchBtn');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const cpf = document.getElementById('cpf');
const address = document.getElementById('address');
const age = document.getElementById('age');
const weight = document.getElementById('weight');
const photoFile = document.getElementById('photoFile');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const deleteBtn = document.getElementById('deleteBtn');
const avatarImg = document.getElementById('avatarImg');
const avatarPlaceholder = document.getElementById('avatarPlaceholder');
const showName = document.getElementById('showName');
const showCpf = document.getElementById('showCpf');
const showAddress = document.getElementById('showAddress');
const showAge = document.getElementById('showAge');
const showWeight = document.getElementById('showWeight');
const downloadJson = document.getElementById('downloadJson');
const importJson = document.getElementById('importJson');
const importFile = document.getElementById('importFile');

function renderResults(list) {
  results.innerHTML = '';
  if (!list.length) {
    results.innerHTML = '<div class="muted small">Nenhum resultado</div>';
    return;
  }
  list.forEach(p => {
    const el = document.createElement('div');
    el.className = 'person-item';
    el.textContent = p.firstName + ' ' + p.lastName + (p.cpf ? (' — ' + p.cpf) : '');
    el.addEventListener('click', () => selectPerson(p.id));
    results.appendChild(el);
  });
}

function selectPerson(id) {
  const p = db.find(x => x.id === id);
  if (!p) return;
  selectedId = p.id;
  firstName.value = p.firstName;
  lastName.value = p.lastName;
  cpf.value = p.cpf;
  address.value = p.address;
  age.value = p.age;
  weight.value = p.weight;
  if (p.photo) {
    avatarImg.src = p.photo;
    avatarImg.style.display = 'block';
    avatarPlaceholder.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    avatarPlaceholder.style.display = 'block';
  }
  showName.textContent = p.firstName + ' ' + p.lastName;
  showCpf.textContent = p.cpf || '-';
  showAddress.textContent = p.address || '-';
  showAge.textContent = p.age || '-';
  showWeight.textContent = p.weight || '-';
}

function clearForm() {
  selectedId = null;
  firstName.value = '';
  lastName.value = '';
  cpf.value = '';
  address.value = '';
  age.value = '';
  weight.value = '';
  photoFile.value = '';
  avatarImg.style.display = 'none';
  avatarPlaceholder.style.display = 'block';
  showName.textContent = '';
  showCpf.textContent = '';
  showAddress.textContent = '';
  showAge.textContent = '';
  showWeight.textContent = '';
}

function doSearch() {
  const term = q.value.trim().toLowerCase();
  if (!term) { renderResults(db); return; }
  const out = db.filter(p =>
    (p.firstName || '').toLowerCase().includes(term) ||
    (p.lastName || '').toLowerCase().includes(term) ||
    (p.cpf || '').includes(term)
  );
  renderResults(out);
}

searchBtn.addEventListener('click', doSearch);
q.addEventListener('keyup', e => { if (e.key === 'Enter') doSearch(); });

saveBtn.addEventListener('click', async () => {
  const data = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    cpf: cpf.value.trim(),
    address: address.value.trim(),
    age: age.value.trim(),
    weight: weight.value.trim()
  };
  if (!data.firstName || !data.lastName) {
    alert('Nome e sobrenome são obrigatórios');
    return;
  }
  let photoData = '';
  if (photoFile.files && photoFile.files[0]) {
    photoData = await toDataURL(photoFile.files[0]);
  }
  if (selectedId) {
    const idx = db.findIndex(x => x.id === selectedId);
    db[idx] = { ...db[idx], ...data, photo: photoData || db[idx].photo };
  } else {
    db.push({ id: cryptoRandomId(), ...data, photo: photoData });
  }
  saveDB(db);
  doSearch();
  clearForm();
});

deleteBtn.addEventListener('click', () => {
  if (!selectedId) { alert('Selecione um registro antes de excluir'); return; }
  if (!confirm('Deseja realmente excluir esse registro?')) return;
  db = db.filter(x => x.id !== selectedId);
  saveDB(db);
  doSearch();
  clearForm();
});

clearBtn.addEventListener('click', () => clearForm());

function toDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// export/import
downloadJson.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'people-export.json'; a.click();
  URL.revokeObjectURL(url);
});

importJson.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', () => {
  const f = importFile.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const imported = JSON.parse(r.result);
      if (Array.isArray(imported)) {
        db = imported;
        saveDB(db);
        doSearch();
        alert('Importação concluída');
      } else {
        alert('Arquivo JSON inválido');
      }
    } catch(e) {
      alert('Erro ao ler JSON');
    }
  };
  r.readAsText(f);
});

// inicializar
doSearch();
