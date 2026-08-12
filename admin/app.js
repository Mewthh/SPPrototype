const themeToggle = document.querySelector('[data-theme-toggle]');
const composeForm = document.querySelector('[data-compose-form]');
const typeTabs = Array.from(document.querySelectorAll('[data-post-type]'));
const sectionTabs = Array.from(document.querySelectorAll('[data-section]'));
const queueList = document.querySelector('[data-queue-list]');
const previewCounts = {
  announcement: document.querySelector('[data-preview-count="announcement"]'),
  event: document.querySelector('[data-preview-count="event"]'),
};
const previewLists = {
  announcement: document.querySelector('[data-preview-list="announcement"]'),
  event: document.querySelector('[data-preview-list="event"]'),
};
const metrics = {
  announcement: document.querySelector('[data-metric="announcement-count"]'),
  event: document.querySelector('[data-metric="event-count"]'),
  scheduled: document.querySelector('[data-metric="scheduled-count"]'),
  published: document.querySelector('[data-metric="published-count"]'),
};

const localStorageKey = 'spp-admin-posts';
const themeKey = 'spp-theme';

const defaultPosts = [
  {
    id: 'post-1',
    type: 'announcement',
    title: 'SPP 2026 abstract submission opens next week',
    section: 'News',
    status: 'published',
    publishDate: '2026-08-10',
    summary: 'Members can submit abstracts for the annual conference through the portal.',
    body: 'sample',
    featured: true,
  },
  {
    id: 'post-2',
    type: 'event',
    title: 'Research colloquium on plasma diagnostics',
    section: 'Activities',
    status: 'scheduled',
    publishDate: '2026-08-16',
    summary: 'An online talk featuring faculty researchers and graduate students.',
    body: 'sample',
    featured: true,
  },
  {
    id: 'post-3',
    type: 'announcement',
    title: 'Updated resource links for members',
    section: 'Resources',
    status: 'draft',
    publishDate: '2026-08-20',
    summary: 'New links for research groups, archives, and downloadable templates.',
    body: 'sample',
    featured: false,
  },
];

const templates = {
  announcement: {
    title: 'SPP bulletin: member update',
    section: 'News',
    status: 'draft',
    summary: 'A short notice that appears in the announcements feed.',
    body: 'sample',
    publishDate: '2026-08-03',
  },
  event: {
    title: 'SPP event: physics forum',
    section: 'Activities',
    status: 'scheduled',
    summary: 'A live event card for the activities stream.',
    body: 'sample',
    publishDate: '2026-08-14',
  },
};

const state = {
  activeType: 'announcement',
  filter: 'all',
  posts: loadPosts(),
};

function loadPosts() {
  try {
    const stored = localStorage.getItem(localStorageKey);
    if (!stored) {
      return defaultPosts.slice();
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultPosts.slice();
  } catch (error) {
    return defaultPosts.slice();
  }
}

function savePosts() {
  localStorage.setItem(localStorageKey, JSON.stringify(state.posts));
}

function setTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', nextTheme);

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.title = nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }

  localStorage.setItem(themeKey, nextTheme);
}

function formatDate(value) {
  if (!value) {
    return 'No date set';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function renderTabs() {
  typeTabs.forEach((tab) => {
    const isActive = tab.dataset.postType === state.activeType;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
}

function renderSectionTabs() {
  if (!composeForm) {
    return;
  }

  const sectionField = composeForm.elements.section;
  const currentSection = sectionField?.value || 'News';

  sectionTabs.forEach((tab) => {
    const isActive = tab.dataset.section === currentSection;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
}

function renderMetrics() {
  const counts = state.posts.reduce(
    (accumulator, post) => {
      if (post.type === 'announcement') {
        accumulator.announcement += 1;
      }

      if (post.type === 'event') {
        accumulator.event += 1;
      }

      if (post.status === 'scheduled') {
        accumulator.scheduled += 1;
      }

      if (post.status === 'published') {
        accumulator.published += 1;
      }

      return accumulator;
    },
    { announcement: 0, event: 0, scheduled: 0, published: 0 },
  );

  if (metrics.announcement) metrics.announcement.textContent = String(counts.announcement);
  if (metrics.event) metrics.event.textContent = String(counts.event);
  if (metrics.scheduled) metrics.scheduled.textContent = String(counts.scheduled);
  if (metrics.published) metrics.published.textContent = String(counts.published);
}

function renderQueue() {
  if (!queueList) {
    return;
  }

  const filteredPosts = state.filter === 'all' ? state.posts : state.posts.filter((post) => post.type === state.filter);

  if (!filteredPosts.length) {
    queueList.innerHTML = '<div class="empty-state">No saved posts yet. Create an announcement or event to populate the queue.</div>';
    return;
  }

  queueList.innerHTML = filteredPosts
    .map(
      (post) => `
        <article class="queue-row" data-post-id="${post.id}">
          <div class="queue-cell queue-title">
            <strong>${post.title}</strong>
            <span>${post.summary || post.body || 'No summary added yet.'}</span>
            <em>${post.section}</em>
          </div>
          <div class="queue-cell queue-type">${post.type === 'event' ? 'Activity' : 'News'}</div>
          <div class="queue-cell queue-status">
            <span class="post-tag" data-status="${post.status}">${statusLabel(post.status)}</span>
          </div>
          <div class="queue-cell queue-date">${formatDate(post.publishDate)}</div>
          <div class="queue-cell queue-actions">
            ${post.status !== 'published' ? '<button type="button" class="item-action primary" data-action="publish">Publish</button>' : ''}
            ${post.status !== 'scheduled' ? '<button type="button" class="item-action" data-action="schedule">Schedule</button>' : ''}
            <button type="button" class="item-action danger" data-action="delete">Delete</button>
          </div>
        </article>
      `,
    )
    .join('');
}

function renderPreview() {
  const postsByType = {
    announcement: state.posts.filter((post) => post.type === 'announcement'),
    event: state.posts.filter((post) => post.type === 'event'),
  };

  Object.entries(postsByType).forEach(([type, posts]) => {
    if (previewCounts[type]) {
      previewCounts[type].textContent = `${posts.length} item${posts.length === 1 ? '' : 's'}`;
    }

    const list = previewLists[type];
    if (!list) {
      return;
    }

    const previewPosts = posts.slice(0, 3);

    if (!previewPosts.length) {
      list.innerHTML = '<div class="empty-state">No items published yet.</div>';
      return;
    }

    list.innerHTML = previewPosts
      .map(
        (post) => `
          <article class="preview-item">
            <div class="preview-item-head">
              <strong>${post.title}</strong>
              <span class="post-tag" data-status="${post.status}">${statusLabel(post.status)}</span>
            </div>
            <div class="preview-item-meta">
              <span>${post.section}</span>
              <span>${formatDate(post.publishDate)}</span>
            </div>
            <p>${post.summary}</p>
          </article>
        `,
      )
      .join('');
  });
}

function renderAll() {
  renderTabs();
  renderSectionTabs();
  renderMetrics();
  renderQueue();
  renderPreview();
}

function setActiveType(type) {
  state.activeType = type === 'event' ? 'event' : 'announcement';
  renderTabs();
  fillTemplate(state.activeType, true);
}

function fillTemplate(type, preserveTitle = false) {
  const template = templates[type];
  if (!composeForm || !template) {
    return;
  }

  const titleField = composeForm.elements.title;
  const sectionField = composeForm.elements.section;
  const statusField = composeForm.elements.status;
  const summaryField = composeForm.elements.summary;
  const bodyField = composeForm.elements.body;
  const dateField = composeForm.elements.publishDate;

  if (!preserveTitle || !titleField.value.trim()) {
    titleField.value = template.title;
  }

  sectionField.value = template.section;
  statusField.value = template.status;
  summaryField.value = template.summary;
  bodyField.value = template.body;
  dateField.value = template.publishDate;
  renderSectionTabs();
}

function handleSubmit(event) {
  event.preventDefault();

  if (!composeForm) {
    return;
  }

  const submitStatus = event.submitter?.dataset.status;

  const data = new FormData(composeForm);
  const post = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `post-${Date.now()}`,
    type: state.activeType,
    title: String(data.get('title') || '').trim(),
    section: String(data.get('section') || 'News'),
    publishDate: String(data.get('publishDate') || ''),
    status: submitStatus || String(data.get('status') || 'draft'),
    summary: String(data.get('summary') || '').trim(),
    body: String(data.get('body') || '').trim(),
    featured: data.get('featureOnHomepage') === 'on',
  };

  if (!post.title) {
    return;
  }

  state.posts = [post, ...state.posts];
  savePosts();
  renderAll();
  composeForm.reset();
  setActiveType(post.type);
}

function updatePost(postId, action) {
  const index = state.posts.findIndex((post) => post.id === postId);
  if (index < 0) {
    return;
  }

  if (action === 'delete') {
    state.posts.splice(index, 1);
  }

  if (action === 'publish') {
    state.posts[index].status = 'published';
  }

  if (action === 'schedule') {
    state.posts[index].status = 'scheduled';
  }

  savePosts();
  renderAll();
}

function handleQueueAction(event) {
  const target = event.target.closest('[data-action]');
  if (!target) {
    return;
  }

  const item = target.closest('[data-post-id]');
  if (!item) {
    return;
  }

  updatePost(item.dataset.postId, target.dataset.action);
}

function bindQuickActions() {
  sectionTabs.forEach((button) => {
    button.addEventListener('click', () => {
      if (!composeForm) {
        return;
      }

      composeForm.elements.section.value = button.dataset.section;
      renderSectionTabs();
    });
  });

  document.querySelectorAll('[data-fill-template]').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveType(button.dataset.fillTemplate);
    });
  });

  document.querySelectorAll('[data-scroll-target="preview"]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector('[data-preview-panel]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
      renderQueue();
    });
  });
}

const savedTheme = localStorage.getItem(themeKey);
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
fillTemplate(state.activeType);
renderAll();
bindQuickActions();

themeToggle?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});

typeTabs.forEach((tab) => {
  tab.addEventListener('click', () => setActiveType(tab.dataset.postType));
});

composeForm?.addEventListener('submit', handleSubmit);
composeForm?.addEventListener('reset', () => {
  window.setTimeout(() => fillTemplate(state.activeType), 0);
});

queueList?.addEventListener('click', handleQueueAction);

// Mobile Sidebar Menu Toggling
const menuToggle = document.querySelector('[data-menu-toggle]');
const menuClose = document.querySelector('[data-menu-close]');
const sidebar = document.querySelector('[data-sidebar]');
const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));

menuToggle?.addEventListener('click', () => {
  sidebar?.classList.add('is-open');
});

menuClose?.addEventListener('click', () => {
  sidebar?.classList.remove('is-open');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    sidebar?.classList.remove('is-open');
  });
});
