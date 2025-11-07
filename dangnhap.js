const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const tabs = $$('.tab');
const formLogin = $('#form-login');
const formRegister = $('#form-register');
const loginMsg = $('#login-msg');
const regMsg = $('#reg-msg');

function clearMessages() {
  [loginMsg, regMsg].forEach(m => { m.style.display = 'none'; m.textContent = ''; });
}

function showMsg(el, text, type='error') {
  el.style.display = 'block';
  el.textContent = text;
  el.className = 'msg ' + (type === 'success' ? 'success' : 'error');
}

// Tab switching
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  if (t.dataset.tab === 'login') {
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
  } else {
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
  }
  clearMessages();
}));

$('#to-register').addEventListener('click', () => {
  window.location.href = "home.html";
});
$('#to-login').addEventListener('click', () => $('[data-tab="login"]').click());

// Toggle password visibility
function toggle(id, btn) {
  const el = $(id);
  btn.addEventListener('click', () => {
    el.type = el.type === 'password' ? 'text' : 'password';
    btn.textContent = el.type === 'password' ? '👁️' : '🙈';
  });
}
toggle('#login-pass', $('#toggle-login-pass'));
toggle('#reg-pass', $('#toggle-reg-pass'));
toggle('#reg-pass2', $('#toggle-reg-pass2'));

// Password strength meter
const pwBar = $('#pw-bar');
const pwText = $('#pw-text');
$('#reg-pass').addEventListener('input', e => {
  const v = e.target.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const pct = (score / 4) * 100;
  pwBar.style.width = pct + '%';
  if (pct <= 25) pwBar.style.background = 'linear-gradient(90deg,#ef4444,#f97316)';
  else if (pct <= 50) pwBar.style.background = 'linear-gradient(90deg,#f97316,#f59e0b)';
  else if (pct <= 75) pwBar.style.background = 'linear-gradient(90deg,#f59e0b,#84cc16)';
  else pwBar.style.background = 'linear-gradient(90deg,#84cc16,#06b6d4)';
});

// LocalStorage accounts
const KEY = 'demo_accounts_v1';
function loadAccounts() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}
function saveAccounts(obj) { localStorage.setItem(KEY, JSON.stringify(obj)); }

// Register
formRegister.addEventListener('submit', e => {
  e.preventDefault(); clearMessages();
  const email = $('#reg-email').value.trim().toLowerCase();
  const pass = $('#reg-pass').value;
  const pass2 = $('#reg-pass2').value;

  if (!email || !pass || !pass2) return showMsg(regMsg, 'Vui lòng nhập đầy đủ thông tin');
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailPattern.test(email)) return showMsg(regMsg, 'Email không hợp lệ');
  if (pass.length < 8) return showMsg(regMsg, 'Mật khẩu phải có ít nhất 8 ký tự');
  if (pass !== pass2) return showMsg(regMsg, 'Mật khẩu và xác nhận không khớp');

  const accounts = loadAccounts();
  if (accounts[email]) return showMsg(regMsg, 'Email đã được đăng ký');

  accounts[email] = { pwd: btoa(pass), created: new Date().toISOString() };
  saveAccounts(accounts);
  showMsg(regMsg, 'Tạo tài khoản thành công — bạn có thể đăng nhập ngay', 'success');
  setTimeout(() => $('[data-tab="login"]').click(), 900);
});

// Login
formLogin.addEventListener('submit', e => {
  e.preventDefault(); clearMessages();
  const email = $('#login-email').value.trim().toLowerCase();
  const pass = $('#login-pass').value;
  const accounts = loadAccounts();
  if (!accounts[email]) return showMsg(loginMsg, 'Không tìm thấy tài khoản');
  if (accounts[email].pwd !== btoa(pass)) return showMsg(loginMsg, 'Sai mật khẩu');
  showMsg(loginMsg, 'Đăng nhập thành công — chào mừng!', 'success');
  localStorage.setItem('demo_session', JSON.stringify({ email, at: new Date().toISOString() }));
  localStorage.setItem("loggedInUser", email);
  setTimeout(() => {
  window.location.href = "home.html"; 
  }, 1000);
});

// Tạo sẵn tài khoản demo
(function seed() {
  const acc = loadAccounts();
  if (Object.keys(acc).length === 0) {
    acc['No1example.com'] = { pwd: btoa('Demo@1234'), created: new Date().toISOString() };
    saveAccounts(acc);
  }
})();
