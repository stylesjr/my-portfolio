document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));

      projectCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.style.display = matches ? 'flex' : 'none';
      });
    });
  });

  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const successMessage = name ? `Thanks ${name}! Your message has been received.` : 'Thanks! Your message has been received.';

      formStatus.textContent = successMessage;
      form.reset();
    });
  }

  const progressForm = document.getElementById('progressForm');
  const projectList = document.getElementById('projectList');
  const emptyState = document.getElementById('emptyState');
  const projectNameInput = document.getElementById('projectName');
  const projectTypeInput = document.getElementById('projectType');
  const projectProgressInput = document.getElementById('projectProgress');
  const progressValue = document.getElementById('progressValue');
  const currentMilestoneInput = document.getElementById('currentMilestone');
  const remainingWorkInput = document.getElementById('remainingWork');
  const projectIdInput = document.getElementById('projectId');
  const clearButton = document.getElementById('clearProject');

  if (progressForm) {
    const storageKey = 'portfolioOngoingProjects';
    const defaultProjects = [
      {
        id: 'project-1',
        name: 'Client Portfolio Redesign',
        type: 'Web',
        progress: 72,
        milestone: 'Brand colors and homepage sections are approved',
        remaining: 'Rework mobile navigation, add project case studies, final QA'
      },
      {
        id: 'project-2',
        name: 'Business Dashboard',
        type: 'Business',
        progress: 48,
        milestone: 'Dashboard layout and chart components are in place',
        remaining: 'Add filters, connect data, test user flow'
      }
    ];

    const parseRemainingItems = (remainingText) => {
      return remainingText
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    };

    const getProjects = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (Array.isArray(saved) && saved.length > 0) {
          return saved;
        }
      } catch (error) {
        console.error('Unable to read saved projects', error);
      }

      localStorage.setItem(storageKey, JSON.stringify(defaultProjects));
      return defaultProjects;
    };

    const saveProjects = (projects) => {
      localStorage.setItem(storageKey, JSON.stringify(projects));
    };

    const updateProgressValueLabel = () => {
      if (!projectProgressInput || !progressValue) return;
      progressValue.textContent = `${projectProgressInput.value}%`;
    };

    const resetForm = () => {
      progressForm.reset();
      projectIdInput.value = '';
      projectTypeInput.value = 'Web';
      projectProgressInput.value = 50;
      updateProgressValueLabel();
      projectNameInput.focus();
    };

    const renderProjects = () => {
      if (!projectList) return;

      const projects = getProjects();
      projectList.innerHTML = '';

      if (!projects.length) {
        emptyState.classList.add('show');
        return;
      }

      emptyState.classList.remove('show');

      projects.forEach((project) => {
        const article = document.createElement('article');
        article.className = 'progress-card';
        const status = project.progress >= 80 ? 'Almost complete' : project.progress >= 40 ? 'In progress' : 'Starting';
        const remainingItems = parseRemainingItems(project.remaining);

        article.innerHTML = `
          <div class="project-top">
            <h4>${project.name}</h4>
            <span class="project-status">${status}</span>
          </div>

          <div class="project-meta">
            <span>${project.type}</span>
            <span>${project.progress}% complete</span>
          </div>

          <div class="progress-bar">
            <span style="width: ${project.progress}%"></span>
          </div>

          <div class="progress-details">
            <div class="progress-box">
              <strong>Current milestone</strong>
              <p>${project.milestone}</p>
            </div>

            <div class="progress-box">
              <strong>What is left</strong>
              <ul class="remaining-list">
                ${remainingItems
                  .map((item) => `<li>${item}</li>`)
                  .join('') || '<li>Project is ready for final review</li>'}
              </ul>
            </div>
          </div>

          <div class="card-actions">
            <button type="button" class="inline-btn" data-edit-project="${project.id}">Update progress</button>
            <button type="button" class="inline-btn delete" data-delete-project="${project.id}">Delete</button>
          </div>
        `;

        const editButton = article.querySelector('[data-edit-project]');
        editButton.addEventListener('click', () => {
          const selectedProject = getProjects().find((item) => item.id === project.id);
          if (!selectedProject) return;

          projectIdInput.value = selectedProject.id;
          projectNameInput.value = selectedProject.name;
          projectTypeInput.value = selectedProject.type;
          projectProgressInput.value = selectedProject.progress;
          currentMilestoneInput.value = selectedProject.milestone;
          remainingWorkInput.value = selectedProject.remaining;
          updateProgressValueLabel();
          projectNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        const deleteButton = article.querySelector('[data-delete-project]');
        deleteButton.addEventListener('click', () => {
          const projectsAfterDelete = getProjects().filter((item) => item.id !== project.id);
          saveProjects(projectsAfterDelete);
          renderProjects();
        });

        projectList.appendChild(article);
      });
    };

    projectProgressInput.addEventListener('input', updateProgressValueLabel);

    clearButton.addEventListener('click', resetForm);

    progressForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const updatedProject = {
        id: projectIdInput.value || `project-${Date.now()}`,
        name: projectNameInput.value.trim(),
        type: projectTypeInput.value,
        progress: Number(projectProgressInput.value),
        milestone: currentMilestoneInput.value.trim(),
        remaining: remainingWorkInput.value.trim()
      };

      if (!updatedProject.name || !updatedProject.milestone || !updatedProject.remaining) {
        return;
      }

      const projects = getProjects();
      const existingIndex = projects.findIndex((item) => item.id === updatedProject.id);

      if (existingIndex >= 0) {
        projects[existingIndex] = updatedProject;
      } else {
        projects.unshift(updatedProject);
      }

      saveProjects(projects);
      renderProjects();
      resetForm();
    });

    updateProgressValueLabel();
    renderProjects();
  }
});
