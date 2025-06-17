const loginModal = document.getElementById('login');
const app = document.getElementById('app');
const daysContainer = document.getElementById('days');

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logout');
const addDayBtn = document.getElementById('addDay');

let isAdmin = false;
let data = JSON.parse(localStorage.getItem('bootcampData') || '{"days": []}');

function save() {
  localStorage.setItem('bootcampData', JSON.stringify(data));
}

function createDay(title) {
  const day = { id: Date.now(), title, items: [] };
  data.days.push(day);
  save();
  render();
}

function createItem(dayId, item) {
  const day = data.days.find(d => d.id === dayId);
  if (day) {
    day.items.push(item);
    save();
    render();
  }
}

function render() {
  daysContainer.innerHTML = '';
  data.days.forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    const header = document.createElement('h3');
    header.textContent = day.title;
    dayDiv.appendChild(header);

    const list = document.createElement('div');
    list.id = `day-${day.id}`;
    list.className = 'item-list';
    day.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      itemDiv.textContent = `${item.title} (${item.duration})`;
      itemDiv.addEventListener('click', () => toggleDetail(itemDiv, item));
      list.appendChild(itemDiv);
    });

    dayDiv.appendChild(list);

    if (isAdmin) {
      const addItemBtn = document.createElement('button');
      addItemBtn.textContent = 'Add Item';
      addItemBtn.addEventListener('click', () => showItemModal(day.id));
      dayDiv.appendChild(addItemBtn);
    }

    daysContainer.appendChild(dayDiv);
    if (isAdmin) {
      new Sortable(list, {
        group: 'items',
        animation: 150,
        onEnd: (evt) => {
          const fromDayId = parseInt(evt.from.id.replace('day-', ''));
          const toDayId = parseInt(evt.to.id.replace('day-', ''));
          const [moved] = data.days.find(d => d.id === fromDayId).items.splice(evt.oldIndex, 1);
          data.days.find(d => d.id === toDayId).items.splice(evt.newIndex, 0, moved);
          save();
        }
      });
    }
  });
}

function showItemModal(dayId) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <h3>New Item</h3>
    <input id="itemTitle" placeholder="Title"/><br>
    <input id="itemDuration" placeholder="Duration (e.g., 1h)"/><br>
    <input id="itemLink" placeholder="External link (optional)"/><br>
    <textarea id="itemDesc" placeholder="Description"></textarea><br>
    <button id="saveItem">Save</button>
    <button id="cancelItem">Cancel</button>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#saveItem').onclick = () => {
    const item = {
      id: Date.now(),
      title: modal.querySelector('#itemTitle').value,
      duration: modal.querySelector('#itemDuration').value,
      link: modal.querySelector('#itemLink').value,
      desc: modal.querySelector('#itemDesc').value
    };
    createItem(dayId, item);
    document.body.removeChild(modal);
  };
  modal.querySelector('#cancelItem').onclick = () => {
    document.body.removeChild(modal);
  };
}

function toggleDetail(element, item) {
  let detail = element.querySelector('.item-detail');
  if (!detail) {
    detail = document.createElement('div');
    detail.className = 'item-detail';
    if (item.link) {
      detail.innerHTML = `<a href="${item.link}" target="_blank">Open link</a><p>${item.desc}</p>`;
    } else {
      detail.textContent = item.desc;
    }
    element.appendChild(detail);
  }
  detail.classList.toggle('show');
}

loginBtn.addEventListener('click', () => {
  if (usernameInput.value === 'admin' && passwordInput.value === 'password') {
    isAdmin = true;
  }
  loginModal.style.display = 'none';
  app.hidden = false;
  render();
});

logoutBtn.addEventListener('click', () => {
  isAdmin = false;
  render();
});

addDayBtn.addEventListener('click', () => {
  const title = prompt('Day title');
  if (title) createDay(title);
});

render();
