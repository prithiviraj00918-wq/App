

let currentUser = null;
let currentView = null;
let appsChartInstance = null;

const SUGGESTED_SKILLS = [
  'Python','JavaScript','React','Node.js','HTML','CSS','SQL','Git',
  'Flask','Django','FastAPI','Java','C++','TypeScript','MongoDB','PostgreSQL',
  'Docker','AWS','REST API','Machine Learning','TensorFlow','PyTorch',
  'Pandas','NumPy','Tableau','Excel','Figma','Tailwind','Vue.js','Angular'
];

const STATUS_LABELS = {
  saved: 'Saved', applied: 'Applied', under_review: 'Under Review',
  interview_scheduled: 'Interview Scheduled', selected: 'Selected', rejected: 'Rejected'
};

const CAREER_ICONS = {
  'Frontend Developer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  'Backend Developer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6"/></svg>',
  'Full Stack Developer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M12 9v6"/></svg>',
  'Data Analyst': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  'Python Developer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  'AI Engineer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v12M6 12h12"/></svg>'
};

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type !== 'success' ? ' ' + type : '');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => { t.className = 'toast'; }, 3500);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function switchAuthTab(tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.innerHTML = inp.type === 'password'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');
  btn.disabled = true; btn.innerHTML = '<span>Signing in…</span>';
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
      })
    });
    currentUser = data;
    enterApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false; btn.innerHTML = '<span>Sign In</span><span class="btn-icon">→</span>';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('register-btn');
  const errEl = document.getElementById('register-error');
  errEl.classList.add('hidden');
  btn.disabled = true; btn.innerHTML = '<span>Creating account…</span>';
  try {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        full_name: document.getElementById('reg-fullname').value,
        email: document.getElementById('reg-email').value
      })
    });
    currentUser = data;
    showToast('Account created successfully! Welcome');
    enterApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false; btn.innerHTML = '<span>Create Account</span><span class="btn-icon">→</span>';
  }
}

async function handleLogout() {
  await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
  currentUser = null;
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  switchAuthTab('login');
}

function enterApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  buildSidebar();
  updateTopbarUser();
  if (currentUser.role === 'admin') {
    navigateTo('admin-dashboard');
  } else {
    api('/api/student/profile').then(p => {
      currentUser.full_name = p.full_name;
      updateTopbarUser();
    }).catch(() => {});
    navigateTo('dashboard');
  }
}

function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  const userEl = document.getElementById('sidebar-user');
  const isAdmin = currentUser.role === 'admin';

  userEl.innerHTML = `
    <div class="user-name">${currentUser.username}</div>
    <div class="user-role">${isAdmin ? 'Admin' : 'Student'}</div>
  `;

  const studentNav = [
    { section: 'Main' },
    { id: 'dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', label: 'Dashboard' },
    { id: 'profile', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', label: 'My Profile' },
    { id: 'skills', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>', label: 'My Skills' },
    { section: 'Opportunities' },
    { id: 'internships', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>', label: 'Explore Internships' },
    { id: 'recommendations', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', label: 'AI Recommendations' },
    { id: 'my-applications', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>', label: 'My Applications' },
    { section: 'Career' },
    { id: 'career', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>', label: 'Career Roadmap' },
  ];

  const adminNav = [
    { section: 'Overview' },
    { id: 'admin-dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>', label: 'Dashboard' },
    { id: 'admin-profile', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', label: 'My Profile' },
    { section: 'Management' },
    { id: 'admin-students', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', label: 'Students' },
    { id: 'admin-companies', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/></svg>', label: 'Companies' },
    { id: 'admin-internships', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>', label: 'Internships' },
    { id: 'admin-applications', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', label: 'Applications' },
    { section: 'Analytics' },
    { id: 'admin-reports', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', label: 'Reports & Exports' },
  ];

  const items = isAdmin ? adminNav : studentNav;
  nav.innerHTML = items.map(item => {
    if (item.section) return `<div class="nav-section-label">${item.section}</div>`;
    return `<div class="nav-item" id="nav-${item.id}" onclick="navigateTo('${item.id}')">
      <span class="nav-icon">${item.icon}</span>${item.label}
    </div>`;
  }).join('');
}

function getGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 17) return 'Good afternoon';
  return 'Good evening';
}

function updateTopbarUser() {
  const badge = currentUser.role === 'admin' ? 'Admin' : 'Student';
  if (currentUser.role === 'student') {
    const greeting = getGreeting();
    const displayName = currentUser.full_name || currentUser.username;
    document.getElementById('topbar-user').innerHTML = `
      <span class="user-greeting" style="margin-right:1rem;font-size:0.875rem;color:var(--text-secondary)">${greeting}, <strong style="color:var(--text-primary)">${displayName}</strong></span>
      <span class="user-badge-role student" style="background:rgba(16,185,129,0.1);color:#34D399;border:1px solid rgba(16,185,129,0.2);padding:0.2rem 0.6rem;border-radius:12px;font-size:0.75rem;font-weight:600">${badge}</span>
    `;
  } else {
    document.getElementById('topbar-user').innerHTML = `
      <span class="user-badge-role admin" style="background:rgba(37,99,235,0.1);color:var(--primary-light);border:1px solid rgba(37,99,235,0.2);padding:0.2rem 0.6rem;border-radius:12px;font-size:0.75rem;font-weight:600;margin-right:0.75rem">${badge}</span>
      <span class="user-badge-name" style="font-weight:600;font-size:0.875rem">${currentUser.username}</span>
    `;
  }
}

function navigateTo(viewId) {
  
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById('view-' + viewId);
  if (!view) return;
  view.classList.remove('hidden');
  currentView = viewId;

  const navEl = document.getElementById('nav-' + viewId);
  if (navEl) navEl.classList.add('active');

  const titles = {
    'dashboard': 'Dashboard', 'profile': 'My Profile',
    'skills': 'My Skills', 'internships': 'Explore Internships',
    'recommendations': 'AI Recommendations', 'my-applications': 'My Applications',
    'career': 'Career Roadmap',
    'admin-dashboard': 'Admin Dashboard', 'admin-profile': 'My Profile', 'admin-students': 'Students',
    'admin-companies': 'Companies', 'admin-internships': 'Internships',
    'admin-applications': 'Applications', 'admin-reports': 'Reports'
  };
  document.getElementById('topbar-title').textContent = titles[viewId] || viewId;

  const loaders = {
    'dashboard': loadStudentDashboard,
    'profile': loadProfile,
    'skills': loadSkills,
    'internships': loadInternships,
    'recommendations': loadRecommendations,
    'my-applications': loadMyApplications,
    'career': loadCareerAnalysis,
    'admin-dashboard': loadAdminDashboard,
    'admin-profile': loadAdminProfile,
    'admin-students': loadAdminStudents,
    'admin-companies': loadAdminCompanies,
    'admin-internships': loadAdminInternships,
    'admin-applications': loadAdminApplications,
  };
  if (loaders[viewId]) loaders[viewId]();
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main-content');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
  }
}

function setTargetRole(roleName) {
  localStorage.setItem('student-target-path', roleName);
  loadStudentDashboard();
}

async function loadStudentDashboard() {
  try {
    const [stats, recs, apps, career, profile] = await Promise.all([
      api('/api/student/dashboard'),
      api('/api/student/recommendations'),
      api('/api/student/applications'),
      api('/api/student/career-analysis'),
      api('/api/student/profile')
    ]);

    let filled = 0;
    const totalFields = 8;
    if (profile.full_name) filled++;
    if (profile.email) filled++;
    if (profile.phone) filled++;
    if (profile.college) filled++;
    if (profile.department) filled++;
    if (profile.cgpa > 0) filled++;
    if (profile.grad_year > 0) filled++;
    if (profile.resume_path) filled++;
    const profilePct = Math.round((filled / totalFields) * 100);

    const targetRoleName = localStorage.getItem('student-target-path') || (career[0] ? career[0].title : '');
    const targetPath = career.find(c => c.title === targetRoleName) || career[0];
    
    let targetCardHtml = '';
    if (targetPath) {
      const missingSkills = targetPath.missing_skills || [];
      const missingList = missingSkills.length 
        ? missingSkills.slice(0, 3).map(sk => `<span class="skill-tag" style="background:rgba(239,68,68,0.15);color:#FCA5A5;border:1px solid rgba(239,68,68,0.2)">${sk}</span>`).join('')
        : '<span style="color:#34D399;font-weight:600">All skills acquired!</span>';
        
      targetCardHtml = `
        <div class="bento-card bento-wide" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
              <div class="bento-label" style="margin-top:0;text-transform:uppercase;letter-spacing:0.05em;font-weight:600">Target Career Goal</div>
              <select class="filter-select" style="font-size:0.75rem;padding:0.25rem 0.5rem;width:auto;margin:0;cursor:pointer" onchange="setTargetRole(this.value)">
                ${career.map(c => `<option value="${c.title}" ${c.title === targetRoleName ? 'selected' : ''}>${c.title}</option>`).join('')}
              </select>
            </div>
            <div style="font-size:1.25rem;font-weight:800;color:var(--text-primary)">${targetPath.title}</div>
            <div class="bento-label" style="margin-top:0.5rem;font-size:0.8rem">${targetPath.description}</div>
          </div>
          <div style="margin-top:1rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem">
            <div style="flex:1">
              <div class="bento-label" style="margin-top:0;margin-bottom:0.35rem">Next Skills to Learn:</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.35rem">${missingList}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
              <div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center">
                <svg viewBox="0 0 36 36" style="transform:rotate(-90deg);width:52px;height:52px">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3.5"></circle>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="var(--primary-light)" stroke-width="3.5" stroke-dasharray="100" stroke-dashoffset="${100 - targetPath.readiness_score}" stroke-linecap="round"></circle>
                </svg>
                <div style="position:absolute;font-size:0.75rem;font-weight:800;color:var(--text-primary)">${targetPath.readiness_score}%</div>
              </div>
              <div class="bento-label" style="font-size:0.68rem;margin-top:0.25rem;font-weight:600">Readiness</div>
            </div>
          </div>
        </div>
      `;
    }

    const scheduledInterviews = apps.filter(a => a.status === 'interview_scheduled');
    let interviewBannersHtml = '';
    if (scheduledInterviews.length) {
      interviewBannersHtml = scheduledInterviews.map(i => `
        <div class="interview-banner">
          <div class="interview-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14l2 2 4-4"/></svg>
          </div>
          <div class="interview-banner-content">
            <div class="interview-banner-title">Upcoming Interview: <strong>${i.title}</strong> at <strong>${i.company_name}</strong></div>
            <div class="interview-banner-meta">
              <span style="display:flex;align-items:center;gap:4px">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${formatDate(i.interview_date)}
              </span>
              <span style="display:flex;align-items:center;gap:4px">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${i.interview_time}
              </span>
            </div>
            ${i.interview_message ? `<div class="interview-banner-msg"><strong>Admin Notes:</strong> ${escapeHtml(i.interview_message)}</div>` : ''}
          </div>
        </div>
      `).join('');
    }

    const statsHtml = `
      <div class="bento-grid" style="margin-bottom:1.5rem">
        <div class="bento-card" onclick="navigateTo('profile')" style="display:flex;align-items:center;gap:1rem;cursor:pointer">
          <div class="profile-ring">
            <svg viewBox="0 0 56 56">
              <circle class="ring-bg" cx="28" cy="28" r="22"></circle>
              <circle class="ring-fill" cx="28" cy="28" r="22" stroke-dasharray="138" stroke-dashoffset="${138 - (138 * profilePct) / 100}"></circle>
            </svg>
            <div class="ring-text">${profilePct}%</div>
          </div>
          <div>
            <div class="bento-value" style="font-size:1.25rem">Profile Strength</div>
            <div class="bento-label" style="margin-top:0.15rem">${profilePct === 100 ? 'Fully complete' : 'Update profile details'}</div>
          </div>
        </div>
        
        ${targetCardHtml}
        
        <div class="bento-card" onclick="navigateTo('my-applications')" style="cursor:pointer">
          <div class="bento-icon" style="background:rgba(37,99,235,0.15);color:#60A5FA">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div class="bento-value">${stats.total_applications}</div>
          <div class="bento-label">Applications Sent</div>
        </div>
        
        <div class="bento-card" onclick="navigateTo('my-applications')" style="cursor:pointer">
          <div class="bento-icon" style="background:rgba(245,158,11,0.15);color:#FBBF24">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="bento-value">${stats.interviews}</div>
          <div class="bento-label">Interviews Scheduled</div>
        </div>

        <div class="bento-card" onclick="navigateTo('my-applications')" style="cursor:pointer">
          <div class="bento-icon" style="background:rgba(16,185,129,0.15);color:#34D399">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="bento-value">${stats.selected}</div>
          <div class="bento-label">Selected Offers</div>
        </div>

        <div class="bento-card" onclick="navigateTo('skills')" style="cursor:pointer">
          <div class="bento-icon" style="background:rgba(139,92,246,0.15);color:#A78BFA">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div class="bento-value">${stats.skills_count}</div>
          <div class="bento-label">Skills Tracked</div>
        </div>
      </div>
    `;

    let recentAppsList = '';
    if (!apps.length) {
      recentAppsList = `
        <div class="empty-state" style="padding:1.5rem">
          <p>No applications yet. Start exploring opportunities!</p>
        </div>
      `;
    } else {
      const timelineDotColors = {
        saved: 'dot-blue',
        applied: 'dot-blue',
        under_review: 'dot-purple',
        interview_scheduled: 'dot-amber',
        selected: 'dot-green',
        rejected: 'dot-red'
      };
      recentAppsList = apps.slice(0, 4).map(a => `
        <div class="timeline-item">
          <div class="timeline-dot ${timelineDotColors[a.status] || 'dot-blue'}">
            ${a.company_name ? a.company_name[0] : '?'}
          </div>
          <div class="timeline-content">
            <div class="tc-title">${a.title}</div>
            <div class="tc-sub">${a.company_name} · <span class="status-badge status-${a.status}">${STATUS_LABELS[a.status]}</span></div>
            <div class="tc-time">${formatDate(a.applied_date)}</div>
          </div>
        </div>
      `).join('');
    }

    let recsHtml = '';
    if (!recs.length) {
      recsHtml = `
        <div class="empty-state" style="padding:1.5rem">
          <p>Add technical skills to unlock AI matchmaking recommendations.</p>
        </div>
      `;
    } else {
      recsHtml = recs.slice(0, 3).map(r => `
        <div class="featured-rec" onclick="viewInternshipDetails(${r.id})">
          <div class="fr-header">
            <div>
              <div class="fr-title">${r.title}</div>
              <div class="fr-company">${r.company_name} · ${r.location || 'Remote'}</div>
            </div>
            <span class="fr-match ${matchClass(r.match_score)}">${r.match_score}% Match</span>
          </div>
          <div class="fr-skills">
            ${r.skills_required ? r.skills_required.split(',').slice(0,4).map(sk => `<span class="skill-tag">${sk.trim()}</span>`).join('') : ''}
          </div>
        </div>
      `).join('');
    }

    const dashboardHtml = `
      <div class="dash-hero" style="margin-bottom:1.5rem">
        <div class="dash-hero-content">
          <h2>Welcome back, ${profile.full_name || currentUser.username}!</h2>
          <p>Track your goals, monitor active application cycles, and review matching openings below.</p>
        </div>
      </div>
      
      ${interviewBannersHtml}
      
      ${statsHtml}
      
      <div class="dash-content-grid">
        <div class="card" style="padding:1.5rem">
          <div class="dash-section" style="margin-top:0;margin-bottom:1.25rem">
            <div class="dash-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Recent Application Cycles
            </div>
          </div>
          <div class="activity-timeline">
            ${recentAppsList}
          </div>
        </div>
        
        <div>
          <div class="card" style="padding:1.5rem;margin-bottom:1.25rem">
            <div class="dash-section" style="margin-top:0;margin-bottom:1.25rem">
              <div class="dash-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Top Matches For You
              </div>
            </div>
            <div>
              ${recsHtml}
            </div>
          </div>
          
          <div class="card" style="padding:1.5rem">
            <div class="dash-section" style="margin-top:0;margin-bottom:1.25rem">
              <div class="dash-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Quick Actions
              </div>
            </div>
            <div class="quick-actions">
              <button class="qa-btn" onclick="navigateTo('profile')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Update Profile
              </button>
              <button class="qa-btn" onclick="navigateTo('internships')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Explore Postings
              </button>
              <button class="qa-btn" onclick="navigateTo('skills')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Manage Skills
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('student-dashboard-content').innerHTML = dashboardHtml;
  } catch (err) {
    showToast('Error loading dashboard: ' + err.message, 'error');
  }
}

function matchClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'strong';
  if (score >= 40) return 'moderate';
  return 'low';
}

async function loadProfile() {
  try {
    const p = await api('/api/student/profile');
    document.getElementById('p-fullname').value = p.full_name || '';
    document.getElementById('p-email').value = p.email || '';
    document.getElementById('p-phone').value = p.phone || '';
    document.getElementById('p-college').value = p.college || '';
    document.getElementById('p-dept').value = p.department || '';
    document.getElementById('p-cgpa').value = p.cgpa || '';
    document.getElementById('p-gradyear').value = p.grad_year || '';

    const resumeEl = document.getElementById('resume-status');
    if (p.resume_path) {
      resumeEl.className = 'resume-status';
      resumeEl.innerHTML = `Resume uploaded: <a href="/uploads/${p.resume_path}" target="_blank" style="color:#60A5FA">${p.resume_path}</a>`;
    } else {
      resumeEl.className = 'resume-status empty';
      resumeEl.textContent = 'No resume uploaded yet.';
    }
  } catch (err) {
    showToast('Error loading profile', 'error');
  }
}

async function saveProfile(e) {
  e.preventDefault();
  const fullNameVal = document.getElementById('p-fullname').value;
  try {
    await api('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify({
        full_name: fullNameVal,
        email: document.getElementById('p-email').value,
        phone: document.getElementById('p-phone').value,
        college: document.getElementById('p-college').value,
        department: document.getElementById('p-dept').value,
        cgpa: parseFloat(document.getElementById('p-cgpa').value) || 0,
        grad_year: parseInt(document.getElementById('p-gradyear').value) || 0
      })
    });
    currentUser.full_name = fullNameVal;
    updateTopbarUser();
    showToast('Profile saved successfully');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAdminProfile() {
  try {
    const p = await api('/api/admin/profile');
    document.getElementById('ap-username').value = p.username || '';
    document.getElementById('ap-fullname').value = p.full_name || '';
    document.getElementById('ap-email').value = p.email || '';
    document.getElementById('ap-phone').value = p.phone || '';
    document.getElementById('ap-dept').value = p.department || '';
    document.getElementById('ap-created').value = formatDate(p.created_at) || '';
  } catch (err) {
    showToast('Error loading admin profile', 'error');
  }
}

async function saveAdminProfile(e) {
  e.preventDefault();
  try {
    await api('/api/admin/profile', {
      method: 'PUT',
      body: JSON.stringify({
        full_name: document.getElementById('ap-fullname').value,
        email: document.getElementById('ap-email').value,
        phone: document.getElementById('ap-phone').value,
        department: document.getElementById('ap-dept').value
      })
    });
    showToast('Profile saved successfully');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function uploadResume(input) {
  const file = input.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('resume', file);
  try {
    const res = await fetch('/api/student/resume', {
      method: 'POST', body: fd, credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast('Resume uploaded successfully');
    loadProfile();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadSkills() {
  try {
    const skills = await api('/api/student/skills');
    renderSkillsCloud(skills);
    renderSuggestedSkills(skills);
  } catch (err) {
    showToast('Error loading skills', 'error');
  }
}

function renderSkillsCloud(skills) {
  const el = document.getElementById('skills-cloud');
  if (!skills.length) {
    el.innerHTML = '<div class="empty-state" style="padding:1rem"><p>No skills added yet. Type above to add your first skill!</p></div>';
    return;
  }
  el.innerHTML = skills.map(s => `
    <div class="skill-chip">
      ${s}
      <span class="del-btn" onclick="removeSkill('${s.replace(/'/g, "\\'")}')" title="Remove skill">✕</span>
    </div>`).join('');
}

function renderSuggestedSkills(existing) {
  const el = document.getElementById('suggested-skills');
  const existingLower = existing.map(s => s.toLowerCase());
  const suggestions = SUGGESTED_SKILLS.filter(s => !existingLower.includes(s.toLowerCase()));
  el.innerHTML = suggestions.slice(0, 25).map(s =>
    `<span class="suggest-tag" onclick="quickAddSkill('${s}')">${s}</span>`
  ).join('');
}

async function addSkill() {
  const input = document.getElementById('skill-input');
  const skill = input.value.trim();
  if (!skill) return;
  try {
    await api('/api/student/skills', { method: 'POST', body: JSON.stringify({ skill }) });
    input.value = '';
    loadSkills();
    showToast(`Skill "${skill}" added`);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function quickAddSkill(skill) {
  try {
    await api('/api/student/skills', { method: 'POST', body: JSON.stringify({ skill }) });
    loadSkills();
    showToast(`Skill "${skill}" added`);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function removeSkill(skillName) {
  try {
    await api(`/api/student/skills/${encodeURIComponent(skillName)}`, { method: 'DELETE' });
    loadSkills();
    showToast(`Skill removed`);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadInternships() {
  const skill = document.getElementById('f-skill').value;
  const location = document.getElementById('f-location').value;
  const company = document.getElementById('f-company').value;
  const mode = document.getElementById('f-mode').value;
  const params = new URLSearchParams();
  if (skill) params.set('skill', skill);
  if (location) params.set('location', location);
  if (company) params.set('company', company);
  if (mode) params.set('work_mode', mode);
  try {
    const internships = await api('/api/internships?' + params.toString());
    renderInternshipGrid(internships, 'internship-grid');
  } catch (err) {
    showToast('Error loading internships', 'error');
  }
}

function clearFilters() {
  ['f-skill','f-location','f-company'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-mode').value = '';
  loadInternships();
}

function renderInternshipGrid(internships, gridId, showMatchScore = false) {
  const grid = document.getElementById(gridId);
  if (!internships.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><p>No internships found. Try different filters.</p></div>`;
    return;
  }
  grid.innerHTML = internships.map(i => {
    const skills = (i.skills_required || '').split(',').map(s => s.trim()).filter(Boolean);
    return `
    <div class="internship-card" onclick="showInternshipDetail(${i.id})">
      <div class="intern-header">
        <div class="intern-company">
          <div class="company-avatar">${(i.company_name || '?')[0]}</div>
          <div>
            <div class="company-name">${i.company_name || 'Unknown Company'}</div>
            <div class="intern-title">${i.title}</div>
          </div>
        </div>
        ${showMatchScore && i.match_score !== undefined ? `<span class="match-badge match-${matchClass(i.match_score)}">${i.match_score}%</span>` : ''}
      </div>
      ${showMatchScore && i.match_score !== undefined ? `
        <div class="match-score-bar">
          <div class="progress-label"><span>Match Score</span><span>${i.match_score}%</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${i.match_score}%"></div></div>
        </div>` : ''}
      <div class="intern-meta">
        <span class="meta-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="vertical-align:middle;margin-right:2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${i.location || 'Remote'}
        </span>
        <span class="meta-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="vertical-align:middle;margin-right:2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${i.duration || 'N/A'}
        </span>
        <span class="meta-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="vertical-align:middle;margin-right:2px"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          ${i.work_mode}
        </span>
        ${i.deadline ? `
        <span class="meta-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="vertical-align:middle;margin-right:2px"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${i.deadline}
        </span>` : ''}
      </div>
      <div class="intern-skills">
        ${skills.slice(0, 5).map(s => {
          const cls = showMatchScore && i.matched_skills
            ? (i.matched_skills.map(m => m.toLowerCase()).includes(s.toLowerCase()) ? 'matched' : 'missing')
            : '';
          return `<span class="skill-tag ${cls}">${s}</span>`;
        }).join('')}
        ${skills.length > 5 ? `<span class="skill-tag">+${skills.length - 5} more</span>` : ''}
      </div>
      <div class="intern-footer">
        <span class="stipend-badge">₹${(i.stipend || 0).toLocaleString('en-IN')}/mo</span>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();applyInternship(${i.id},'${escapeHtml(i.title)}')">Apply Now</button>
      </div>
    </div>`;
  }).join('');
}

async function showInternshipDetail(id) {
  try {
    const i = await api(`/api/internships/${id}`);
    const skills = (i.skills_required || '').split(',').map(s => s.trim()).filter(Boolean);
    document.getElementById('detail-modal-title').textContent = i.title;
    document.getElementById('detail-modal-body').innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><div class="di-label">Company</div><div class="di-value"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:-2px;margin-right:4px"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/></svg>${i.company_name || 'N/A'}</div></div>
        <div class="detail-item"><div class="di-label">Location</div><div class="di-value"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:-2px;margin-right:4px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${i.location || 'N/A'}</div></div>
        <div class="detail-item"><div class="di-label">Duration</div><div class="di-value"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:-2px;margin-right:4px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${i.duration || 'N/A'}</div></div>
        <div class="detail-item"><div class="di-label">Work Mode</div><div class="di-value"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:-2px;margin-right:4px"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>${i.work_mode}</div></div>
        <div class="detail-item"><div class="di-label">Stipend</div><div class="di-value" style="color:var(--secondary)">₹${(i.stipend || 0).toLocaleString('en-IN')}/month</div></div>
        <div class="detail-item"><div class="di-label">Deadline</div><div class="di-value"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:-2px;margin-right:4px"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${i.deadline || 'Open'}</div></div>
      </div>
      <div style="margin-top:0.75rem">
        <div class="di-label" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);font-weight:600;margin-bottom:0.5rem">Skills Required</div>
        <div class="intern-skills">${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
      </div>
      ${i.description ? `<div class="detail-desc"><div class="di-label">About the Internship</div><p>${i.description}</p></div>` : ''}
    `;
    document.getElementById('detail-modal-footer').innerHTML = `
      <button class="btn btn-ghost" onclick="closeModal('detail-modal-overlay')">Close</button>
      <button class="btn btn-secondary" onclick="saveForLater(${i.id},'${escapeHtml(i.title)}')">Save for Later</button>
      <button class="btn btn-primary" onclick="applyInternship(${i.id},'${escapeHtml(i.title)}');closeModal('detail-modal-overlay')">Apply Now</button>
    `;
    document.getElementById('detail-modal-overlay').classList.remove('hidden');
  } catch (err) {
    showToast('Error loading details', 'error');
  }
}

async function applyInternship(id, title) {
  if (currentUser && currentUser.role !== 'student') { showToast('Only students can apply', 'error'); return; }
  try {
    await api(`/api/student/apply/${id}`, { method: 'POST', body: JSON.stringify({ status: 'applied' }) });
    showToast(`Applied to "${title}"`);
  } catch (err) {
    showToast(err.message === 'Already applied' ? `Already applied to "${title}"` : err.message, 'info');
  }
}

async function saveForLater(id, title) {
  try {
    await api(`/api/student/apply/${id}`, { method: 'POST', body: JSON.stringify({ status: 'saved' }) });
    showToast(`"${title}" saved for later`);
  } catch (err) {
    showToast(err.message, 'info');
  }
}

async function loadRecommendations() {
  try {
    const recs = await api('/api/student/recommendations');
    const grid = document.getElementById('recommendation-grid');
    if (!recs.length) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><p>Add skills to your profile to get AI-powered internship recommendations!</p><br><button class="btn btn-primary" onclick="navigateTo('skills')">Add Skills</button></div>`;
      return;
    }
    grid.innerHTML = recs.map((r, idx) => `
      <div class="rec-card">
        <div class="rec-rank">#${idx + 1}</div>
        <div class="rec-body">
          <div class="rec-title">${r.title}</div>
          <div class="rec-company">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="vertical-align:middle;margin-right:2px"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/></svg>
            ${r.company_name || 'Unknown'} · 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="vertical-align:middle;margin-right:2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${r.location || 'Remote'} · ₹${(r.stipend || 0).toLocaleString('en-IN')}/mo
          </div>
          <div class="match-score-bar">
            <div class="progress-label">
              <span>Match Score</span>
              <span class="match-badge match-${matchClass(r.match_score)}">${r.match_level} — ${r.match_score}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${r.match_score}%"></div></div>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem">
            ${r.matched_skills.map(s => `<span class="skill-tag matched">✓ ${s}</span>`).join('')}
            ${r.missing_skills.map(s => `<span class="skill-tag missing">✗ ${s}</span>`).join('')}
          </div>
        </div>
        <div class="rec-actions">
          <button class="btn btn-primary btn-sm" onclick="applyInternship(${r.id},'${escapeHtml(r.title)}')">Apply</button>
          <button class="btn btn-ghost btn-sm" onclick="showInternshipDetail(${r.id})">Details</button>
        </div>
      </div>`).join('');
  } catch (err) {
    showToast('Error loading recommendations', 'error');
  }
}

async function loadMyApplications() {
  try {
    const apps = await api('/api/student/applications');
    const el = document.getElementById('applications-list');
    if (!apps.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><p>No applications yet. <a href="#" onclick="navigateTo('internships')" style="color:var(--primary-light)">Explore internships</a> to get started!</p></div>`;
      return;
    }
    const pipeline = ['saved', 'applied', 'under_review', 'interview_scheduled', 'selected'];
    el.innerHTML = apps.map(a => {
      const isRejected = a.status === 'rejected';
      const steps = isRejected
        ? ['saved', 'applied', 'under_review', 'rejected']
        : pipeline;
      const currentIdx = steps.indexOf(a.status);
      return `
        <div class="app-tracker-card">
          <div class="app-tracker-header">
            <div>
              <div class="app-title">${a.title}</div>
              <div class="app-company">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="vertical-align:middle;margin-right:2px"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/></svg>
                ${a.company_name || 'Unknown'} · Applied ${formatDate(a.applied_date)}
              </div>
            </div>
            <span class="status-badge status-${a.status}">${STATUS_LABELS[a.status]}</span>
          </div>
          <div class="status-pipeline">
            ${steps.map((step, i) => {
              let cls = '';
              if (i < currentIdx) cls = 'done';
              else if (i === currentIdx) cls = isRejected && step === 'rejected' ? 'rejected' : 'current';
              const step_num = i + 1;
              return `<div class="pipeline-step ${cls}">
                <div class="step-dot">${cls === 'done' ? '✓' : (cls === 'rejected' ? '✕' : step_num)}</div>
                <div class="step-label">${STATUS_LABELS[step]}</div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    showToast('Error loading applications', 'error');
  }
}

async function loadCareerAnalysis() {
  try {
    const paths = await api('/api/student/career-analysis');
    const grid = document.getElementById('career-grid');
    if (!paths.length) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg></div><p>No career paths available.</p></div>`;
      return;
    }
    grid.innerHTML = paths.map(p => `
      <div class="career-card">
        <div class="career-header">
          <div class="career-icon">${CAREER_ICONS[p.title] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'}</div>
          <div>
            <div class="career-title">${p.title}</div>
            <div class="readiness-score">${p.readiness_score}% Ready</div>
          </div>
        </div>
        <div class="career-desc">${p.description}</div>
        <div class="match-score-bar">
          <div class="progress-label"><span>Career Readiness</span><span>${p.readiness_score}%</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${p.readiness_score}%;background:${readinessGradient(p.readiness_score)}"></div></div>
        </div>
        ${p.missing_skills.length ? `
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem">Missing Skills</div>
            <div class="missing-skills">${p.missing_skills.map(s => `<span class="skill-tag missing">✗ ${s}</span>`).join('')}</div>
          </div>` : `<div style="font-size:0.8rem;color:var(--secondary)">You have all required skills!</div>`}
        ${p.certifications.length ? `
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem">Recommended Courses</div>
            <div class="certs-list">
              ${p.certifications.map(c => `
                <div class="cert-item">
                  <div><div class="cert-name">${c.name}</div><div class="cert-provider">by ${c.provider}</div></div>
                  ${c.course_url ? `<a href="${c.course_url}" target="_blank" class="cert-link">Enroll →</a>` : ''}
                </div>`).join('')}
            </div>
          </div>` : ''}
      </div>`).join('');
  } catch (err) {
    showToast('Error loading career analysis', 'error');
  }
}

function readinessGradient(score) {
  if (score >= 80) return 'linear-gradient(90deg,#10B981,#34D399)';
  if (score >= 60) return 'linear-gradient(90deg,#2563EB,#06B6D4)';
  if (score >= 40) return 'linear-gradient(90deg,#D97706,#F59E0B)';
  return 'linear-gradient(90deg,#EF4444,#FCA5A5)';
}

async function loadAdminDashboard() {
  try {
    const stats = await api('/api/admin/dashboard');

    let recentStudentsTimeline = '';
    if (!stats.recent_students || !stats.recent_students.length) {
      recentStudentsTimeline = '<div class="empty-state" style="padding:1.5rem"><p>No registrations yet.</p></div>';
    } else {
      recentStudentsTimeline = stats.recent_students.map(s => `
        <div class="timeline-item">
          <div class="timeline-dot dot-purple">
            ${s.full_name ? s.full_name[0] : '?'}
          </div>
          <div class="timeline-content">
            <div class="tc-title">${s.full_name}</div>
            <div class="tc-sub">${s.college || 'College'} · ${s.department || 'Dept'}</div>
            <div class="tc-time">${formatDate(s.created_at)}</div>
          </div>
        </div>
      `).join('');
    }

    const adminDashboardHtml = `
      <div class="dash-hero" style="margin-bottom:1.5rem">
        <div class="dash-hero-content">
          <h2>Administrator Hub</h2>
          <p>Monitor applications, manage corporate partners, update openings, and schedule upcoming rounds.</p>
        </div>
      </div>
      
      <div class="bento-grid" style="margin-bottom:1.5rem">
        <div class="bento-card" onclick="navigateTo('admin-students')" style="cursor:pointer">
          <div class="bento-icon" style="background:rgba(37,99,235,0.15);color:#60A5FA">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="bento-value">${stats.total_students}</div>
          <div class="bento-label">Students Registered</div>
        </div>
        
        <div class="bento-card" onclick="navigateTo('admin-companies')" style="cursor:pointer">
          <div class="bento-icon" style="background:rgba(139,92,246,0.15);color:#A78BFA">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/></svg>
          </div>
          <div class="bento-value">${stats.total_companies}</div>
          <div class="bento-label">Partner Companies</div>
        </div>

        <div class="bento-card" onclick="navigateTo('admin-internships')" style="cursor:pointer">
          <div class="bento-icon" style="background:rgba(16,185,129,0.15);color:#34D399">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
          <div class="bento-value">${stats.total_internships}</div>
          <div class="bento-label">Active Postings</div>
        </div>

        <div class="bento-card" onclick="navigateTo('admin-applications')" style="cursor:pointer">
          <div class="bento-icon" style="background:rgba(6,182,212,0.15);color:#06B6D4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div class="bento-value">${stats.total_applications}</div>
          <div class="bento-label">Applications Tracked</div>
        </div>
      </div>
      
      <div class="dash-content-grid">
        <div class="card" style="padding:1.5rem">
          <div class="dash-section" style="margin-top:0;margin-bottom:1.25rem">
            <div class="dash-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Status Metrics
            </div>
          </div>
          <div style="position:relative;height:250px" id="admin-chart-container">
            <canvas id="apps-status-chart"></canvas>
          </div>
        </div>
        
        <div class="card" style="padding:1.5rem">
          <div class="dash-section" style="margin-top:0;margin-bottom:1.25rem">
            <div class="dash-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Recent Sign-ups
            </div>
          </div>
          <div class="activity-timeline">
            ${recentStudentsTimeline}
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('admin-dashboard-content').innerHTML = adminDashboardHtml;

    const ctx = document.getElementById('apps-status-chart');
    if (appsChartInstance) { appsChartInstance.destroy(); appsChartInstance = null; }
    const statusData = stats.applications_by_status || {};
    const labels = Object.keys(statusData).map(k => STATUS_LABELS[k] || k);
    const values = Object.values(statusData);
    const colors = ['#64748B','#2563EB','#F59E0B','#06B6D4','#10B981','#EF4444'];
    if (ctx && values.length) {
      appsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, values.length), borderWidth: 0, hoverOffset: 8 }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', font: { family: 'Inter', size: 11 }, padding: 8, usePointStyle: true } } }
        }
      });
    } else if (ctx) {
      document.getElementById('admin-chart-container').innerHTML = '<div class="empty-state"><p>No application data yet.</p></div>';
    }
  } catch (err) {
    showToast('Error loading admin dashboard', 'error');
  }
}

async function loadAdminStudents(search = '') {
  try {
    const students = await api('/api/admin/students' + (search ? `?search=${encodeURIComponent(search)}` : ''));
    const tbody = document.getElementById('students-tbody');
    if (!students.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state" style="text-align:center;padding:2rem">No students found.</td></tr>`;
      return;
    }
    tbody.innerHTML = students.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><div style="font-weight:600">${s.full_name}</div></td>
        <td><a href="mailto:${s.email}" style="color:var(--primary-light)">${s.email}</a></td>
        <td>${s.college || '—'}</td>
        <td>${s.department || '—'}</td>
        <td>
          <div style="display:flex;flex-wrap:wrap;gap:0.25rem;max-width:200px">
            ${s.skills ? s.skills.split(',').slice(0,3).map(sk => `<span class="skill-tag">${sk.trim()}</span>`).join('') : '—'}
            ${s.skills && s.skills.split(',').length > 3 ? `<span class="skill-tag">+${s.skills.split(',').length - 3}</span>` : ''}
          </div>
        </td>
        <td>${s.resume_path ? `<a href="/uploads/${s.resume_path}" target="_blank" class="btn btn-ghost btn-sm">View</a>` : '<span style="color:var(--text-muted)">—</span>'}</td>
        <td><span style="color:var(--text-muted);font-size:0.8rem">${formatDate(s.created_at)}</span></td>
        <td>
          <div class="actions-cell">
            <button class="btn btn-ghost btn-sm" onclick="viewStudentProfile(${s.id})" title="View Profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id},'${escapeHtml(s.full_name)}')" title="Delete Student">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`).join('');
  } catch (err) {
    showToast('Error loading students', 'error');
  }
}

function searchStudents() {
  const search = document.getElementById('student-search').value;
  loadAdminStudents(search);
}

async function viewStudentProfile(id) {
  try {
    const s = await api(`/api/admin/students/${id}`);
    document.getElementById('vs-name').textContent = s.full_name || '—';
    document.getElementById('vs-email').textContent = s.email || '—';
    document.getElementById('vs-phone').textContent = s.phone || '—';
    document.getElementById('vs-college').textContent = s.college || '—';
    document.getElementById('vs-dept').textContent = s.department || '—';
    document.getElementById('vs-cgpa').textContent = s.cgpa ? s.cgpa.toFixed(2) : '—';
    document.getElementById('vs-gradyear').textContent = s.grad_year || '—';
    
    const resumeEl = document.getElementById('vs-resume');
    if (s.resume_path) {
      resumeEl.innerHTML = `<a href="/uploads/${s.resume_path}" target="_blank" style="color:var(--primary-light)">View Resume</a>`;
    } else {
      resumeEl.textContent = 'Not uploaded';
    }
    
    const skillsEl = document.getElementById('vs-skills');
    if (s.skills && s.skills.length) {
      const skillsArray = Array.isArray(s.skills) ? s.skills : s.skills.split(',');
      skillsEl.innerHTML = skillsArray.map(sk => `<span class="skill-tag">${sk.trim()}</span>`).join('');
    } else {
      skillsEl.innerHTML = '<span style="color:var(--text-muted)">No skills added</span>';
    }
    
    document.getElementById('student-modal-overlay').classList.remove('hidden');
  } catch (err) {
    showToast('Error loading student profile', 'error');
  }
}

async function deleteStudent(id, name) {
  if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return;
  try {
    await api(`/api/admin/students/${id}`, { method: 'DELETE' });
    loadAdminStudents();
    showToast(`Student "${name}" deleted`);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openOwnResetPasswordModal() {
  document.getElementById('opw-current').value = '';
  document.getElementById('opw-new').value = '';
  document.getElementById('opw-confirm').value = '';
  document.getElementById('own-pw-error').classList.add('hidden');
  document.getElementById('own-pw-modal-overlay').classList.remove('hidden');
}

async function submitChangeOwnPassword(e) {
  e.preventDefault();
  const currentPw = document.getElementById('opw-current').value;
  const newPw = document.getElementById('opw-new').value;
  const confirmPw = document.getElementById('opw-confirm').value;
  const errEl = document.getElementById('own-pw-error');
  
  if (newPw !== confirmPw) {
    errEl.textContent = 'Passwords do not match';
    errEl.classList.remove('hidden');
    return;
  }
  if (newPw.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters';
    errEl.classList.remove('hidden');
    return;
  }
  
  try {
    await api('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPw, new_password: newPw })
    });
    closeModal('own-pw-modal-overlay');
    showToast('Password changed successfully');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
}

async function loadAdminCompanies() {
  try {
    const companies = await api('/api/admin/companies');
    const tbody = document.getElementById('companies-tbody');
    if (!companies.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">No companies yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = companies.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><div style="font-weight:600">${c.name}</div><div style="font-size:0.75rem;color:var(--text-muted)">${c.description ? c.description.substring(0,60) + '...' : ''}</div></td>
        <td>${c.industry || '—'}</td>
        <td>${c.location || '—'}</td>
        <td>${c.website ? `<a href="${c.website}" target="_blank" style="color:var(--primary-light);font-size:0.8rem">Visit</a>` : '—'}</td>
        <td>
          <div class="actions-cell">
            <button class="btn btn-ghost btn-sm" onclick="openCompanyModal(${c.id})" title="Edit Company">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteCompany(${c.id},'${escapeHtml(c.name)}')" title="Delete Company">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`).join('');
  } catch (err) {
    showToast('Error loading companies', 'error');
  }
}

async function openCompanyModal(id = null) {
  document.getElementById('company-id').value = '';
  document.getElementById('c-name').value = '';
  document.getElementById('c-website').value = '';
  document.getElementById('c-industry').value = '';
  document.getElementById('c-location').value = '';
  document.getElementById('c-desc').value = '';
  document.getElementById('company-modal-title').textContent = id ? 'Edit Company' : 'Add Company';
  if (id) {
    try {
      const companies = await api('/api/admin/companies');
      const c = companies.find(x => x.id === id);
      if (c) {
        document.getElementById('company-id').value = c.id;
        document.getElementById('c-name').value = c.name;
        document.getElementById('c-website').value = c.website || '';
        document.getElementById('c-industry').value = c.industry || '';
        document.getElementById('c-location').value = c.location || '';
        document.getElementById('c-desc').value = c.description || '';
      }
    } catch (err) { showToast('Error loading company', 'error'); return; }
  }
  document.getElementById('company-modal-overlay').classList.remove('hidden');
}

async function saveCompany(e) {
  e.preventDefault();
  const id = document.getElementById('company-id').value;
  const data = {
    name: document.getElementById('c-name').value,
    website: document.getElementById('c-website').value,
    industry: document.getElementById('c-industry').value,
    location: document.getElementById('c-location').value,
    description: document.getElementById('c-desc').value
  };
  try {
    if (id) {
      await api(`/api/admin/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      showToast('Company updated successfully');
    } else {
      await api('/api/admin/companies', { method: 'POST', body: JSON.stringify(data) });
      showToast('Company added successfully');
    }
    closeModal('company-modal-overlay');
    loadAdminCompanies();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCompany(id, name) {
  if (!confirm(`Delete company "${name}"? All associated internships will also be deleted.`)) return;
  try {
    await api(`/api/admin/companies/${id}`, { method: 'DELETE' });
    loadAdminCompanies();
    showToast(`Company deleted`);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAdminInternships() {
  try {
    const list = await api('/api/admin/internships');
    const tbody = document.getElementById('admin-internships-tbody');
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text-muted)">No internships yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = list.map((i, idx) => {
      const skills = (i.skills_required || '').split(',').map(s => s.trim()).filter(Boolean);
      return `<tr>
        <td>${idx + 1}</td>
        <td><div style="font-weight:600">${i.title}</div></td>
        <td>${i.company_name || '—'}</td>
        <td><div style="display:flex;flex-wrap:wrap;gap:.25rem">${skills.slice(0,3).map(s=>`<span class="skill-tag">${s}</span>`).join('')}${skills.length>3?`<span class="skill-tag">+${skills.length-3}</span>`:''}</div></td>
        <td>${i.location || '—'}</td>
        <td><span class="meta-pill">${i.work_mode}</span></td>
        <td style="color:var(--secondary)">₹${(i.stipend||0).toLocaleString('en-IN')}</td>
        <td style="color:var(--text-muted);font-size:0.8rem">${i.deadline || '—'}</td>
        <td>
          <div class="actions-cell">
            <button class="btn btn-ghost btn-sm" onclick="findMatchesForInternship(${i.id}, '${escapeHtml(i.title)}')" title="Find Matching Candidates" style="color:var(--primary-light)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="openInternshipModal(${i.id})" title="Edit Internship">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteInternship(${i.id},'${escapeHtml(i.title)}')" title="Delete Internship">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch (err) {
    showToast('Error loading internships', 'error');
  }
}

async function findMatchesForInternship(iid, title) {
  try {
    const list = await api(`/api/admin/internships/${iid}/matches`);
    document.getElementById('matches-modal-title').textContent = `Matching Candidates: ${title}`;
    const tbody = document.getElementById('matches-tbody');
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:1.5rem">No registered candidates.</td></tr>';
    } else {
      tbody.innerHTML = list.map(c => {
        const skillsList = Array.isArray(c.skills) ? c.skills : [];
        return `
          <tr>
            <td><div style="font-weight:600">${c.full_name}</div></td>
            <td>${c.college || '—'}</td>
            <td>${c.cgpa ? c.cgpa.toFixed(2) : '—'}</td>
            <td><span class="match-badge match-${matchClass(c.match_score)}">${c.match_score}%</span></td>
            <td>
              <div style="display:flex;flex-wrap:wrap;gap:0.25rem;max-width:300px">
                ${skillsList.map(s => `<span class="skill-tag">${s}</span>`).join('')}
              </div>
            </td>
            <td><a href="mailto:${c.email}" style="color:var(--primary-light)">${c.email}</a></td>
          </tr>
        `;
      }).join('');
    }
    document.getElementById('internship-matches-modal-overlay').classList.remove('hidden');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function openInternshipModal(id = null) {
  
  ['internship-id','i-title','i-skills','i-location','i-duration','i-stipend','i-deadline','i-desc'].forEach(fid => {
    const el = document.getElementById(fid);
    if (el) el.value = '';
  });
  document.getElementById('i-mode').value = 'remote';
  document.getElementById('internship-modal-title').textContent = id ? 'Edit Internship' : 'Create Internship';

  try {
    const companies = await api('/api/admin/companies');
    const sel = document.getElementById('i-company');
    sel.innerHTML = '<option value="">Select Company</option>' +
      companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (id) {
      const list = await api('/api/admin/internships');
      const intern = list.find(x => x.id === id);
      if (intern) {
        document.getElementById('internship-id').value = intern.id;
        document.getElementById('i-title').value = intern.title;
        sel.value = intern.company_id;
        document.getElementById('i-skills').value = intern.skills_required;
        document.getElementById('i-location').value = intern.location;
        document.getElementById('i-duration').value = intern.duration;
        document.getElementById('i-mode').value = intern.work_mode;
        document.getElementById('i-stipend').value = intern.stipend;
        document.getElementById('i-deadline').value = intern.deadline;
        document.getElementById('i-desc').value = intern.description;
      }
    }
  } catch (err) {
    showToast('Error loading data', 'error'); return;
  }
  document.getElementById('internship-modal-overlay').classList.remove('hidden');
}

async function saveInternship(e) {
  e.preventDefault();
  const id = document.getElementById('internship-id').value;
  const data = {
    company_id: parseInt(document.getElementById('i-company').value) || null,
    title: document.getElementById('i-title').value,
    skills_required: document.getElementById('i-skills').value,
    location: document.getElementById('i-location').value,
    duration: document.getElementById('i-duration').value,
    work_mode: document.getElementById('i-mode').value,
    stipend: parseFloat(document.getElementById('i-stipend').value) || 0,
    deadline: document.getElementById('i-deadline').value,
    description: document.getElementById('i-desc').value
  };
  try {
    if (id) {
      await api(`/api/admin/internships/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      showToast('Internship updated successfully');
    } else {
      await api('/api/admin/internships', { method: 'POST', body: JSON.stringify(data) });
      showToast('Internship created successfully');
    }
    closeModal('internship-modal-overlay');
    loadAdminInternships();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteInternship(id, title) {
  if (!confirm(`Delete internship "${title}"?`)) return;
  try {
    await api(`/api/admin/internships/${id}`, { method: 'DELETE' });
    loadAdminInternships();
    showToast('Internship deleted');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAdminApplications() {
  const search = document.getElementById('app-search')?.value || '';
  const status = document.getElementById('app-status-filter')?.value || '';
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  try {
    const apps = await api('/api/admin/applications?' + params.toString());
    const tbody = document.getElementById('admin-apps-tbody');
    if (!apps.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">No applications found.</td></tr>`;
      return;
    }
    tbody.innerHTML = apps.map((a, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><div style="font-weight:600">${a.student_name}</div><div style="font-size:0.75rem;color:var(--text-muted)">${a.student_email}</div></td>
        <td>${a.internship_title}</td>
        <td>${a.company_name || '—'}</td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${formatDate(a.applied_date)}</td>
        <td><span class="status-badge status-${a.status}">${STATUS_LABELS[a.status]}</span></td>
        <td>
          <select class="filter-select" style="font-size:0.8rem;padding:0.35rem 0.6rem"
            onchange="updateApplicationStatus(${a.id}, this.value, this)">
            <option value="">Change Status</option>
            <option value="under_review">Under Review</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </td>
      </tr>`).join('');
  } catch (err) {
    showToast('Error loading applications', 'error');
  }
}

function searchApplications() {
  loadAdminApplications();
}

async function updateApplicationStatus(appId, newStatus, selectEl) {
  if (!newStatus) return;
  if (newStatus === 'interview_scheduled') {
    document.getElementById('int-app-id').value = appId;
    document.getElementById('int-date').value = '';
    document.getElementById('int-time').value = '';
    document.getElementById('int-message').value = '';
    document.getElementById('interview-modal-overlay').classList.remove('hidden');
    selectEl.value = '';
    return;
  }
  try {
    await api(`/api/admin/applications/${appId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    showToast(`Status updated to "${STATUS_LABELS[newStatus]}"`);
    selectEl.value = '';
    loadAdminApplications();
  } catch (err) {
    showToast(err.message, 'error');
    selectEl.value = '';
  }
}

async function submitInterviewSchedule(e) {
  e.preventDefault();
  const appId = document.getElementById('int-app-id').value;
  const dateVal = document.getElementById('int-date').value;
  const timeVal = document.getElementById('int-time').value;
  const msgVal = document.getElementById('int-message').value;
  try {
    await api(`/api/admin/applications/${appId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'interview_scheduled',
        interview_date: dateVal,
        interview_time: timeVal,
        interview_message: msgVal
      })
    });
    closeModal('interview-modal-overlay');
    showToast('Interview scheduled successfully');
    loadAdminApplications();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
});

function escapeHtml(str) {
  return String(str).replace(/['"<>&]/g, c => ({'\'': '&#39;', '"': '&quot;', '<': '&lt;', '>': '&gt;', '&': '&amp;'}[c]));
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

(async function init() {
  try {
    const me = await api('/api/auth/me');
    if (me.logged_in) {
      currentUser = me;
      enterApp();
    }
  } catch (_) {
    
  }
})();
