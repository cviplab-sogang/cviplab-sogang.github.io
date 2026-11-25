(() => {
  'use strict';
  const dialog = document.getElementById('project-detail-modal');
  if (!dialog) return;
  const supportsDialog = typeof dialog.showModal === 'function';
  const titleNode = document.getElementById('project-detail-title');
  const topicNode = dialog.querySelector('.project-dialog-topic');
  const imageNode = dialog.querySelector('.project-detail-image');
  const captionNode = dialog.querySelector('.project-detail-caption');
  const textNode = document.getElementById('project-detail-copy');
  const closeButton = dialog.querySelector('.project-dialog-close');
  let lastTrigger = null;

  const openProject = (card) => {
    const key = card.dataset.projectDetail;
    const template = document.getElementById('project-text-' + key);
    if (!template) return;
    const image = card.querySelector('figure img');
    const caption = card.querySelector('figcaption');
    lastTrigger = card;
    titleNode.textContent = card.querySelector('h3, h4')?.textContent.trim() || 'Research project';
    topicNode.textContent = card.querySelector('.topic')?.textContent.trim() || 'Research';
    imageNode.src = image?.getAttribute('src') || '';
    imageNode.alt = image?.getAttribute('alt') || titleNode.textContent;
    captionNode.textContent = caption?.textContent.trim() || 'Illustration from the archived CVIP Lab research page.';
    textNode.replaceChildren(template.content.cloneNode(true));
    if (supportsDialog) {
      document.body.classList.add('project-dialog-open');
      dialog.showModal();
      closeButton.focus();
    } else {
      dialog.setAttribute('open', '');
      document.body.classList.add('project-dialog-open');
      closeButton.focus();
    }
  };

  const closeProject = () => {
    if (supportsDialog) dialog.close();
    else { dialog.removeAttribute('open'); onClose(); }
  };
  const onClose = () => {
    document.body.classList.remove('project-dialog-open');
    if (lastTrigger?.isConnected) lastTrigger.focus({preventScroll: true});
  };

  document.querySelectorAll('.project-detail-trigger').forEach(card => {
    card.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.target.closest('a, button, summary')) return;
      openProject(card);
    });
    card.addEventListener('keydown', event => {
      if (event.target !== card) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProject(card);
      }
    });
  });
  closeButton.addEventListener('click', closeProject);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeProject(); });
  dialog.addEventListener('close', onClose);
  if (!supportsDialog) document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.hasAttribute('open')) closeProject();
  });
})();
