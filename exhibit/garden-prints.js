(() => {
  const dialog = document.querySelector('.garden-loupe');
  const enlarged = dialog.querySelector('img');
  const caption = dialog.querySelector('#loupe-caption');
  const prints = Array.from(document.querySelectorAll('.garden-print[data-view]'));
  const names = {window:'园景', detail:'园景局部', pond:'池畔曲桥'};
  let index = 0;
  function show(at) {
    index = (at + prints.length) % prints.length;
    const print = prints[index], source = print.querySelector('img');
    enlarged.src = source.currentSrc || source.src;
    enlarged.alt = source.alt;
    dialog.dataset.view = print.dataset.view;
    caption.textContent = (index + 1) + ' / ' + prints.length + '　' + names[print.dataset.view];
  }
  for (const button of dialog.querySelectorAll('[data-step]')) {
    button.addEventListener('click', () => show(index + Number(button.dataset.step)));
  }
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(index + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  let opener;
  for (const print of document.querySelectorAll('.garden-triptych button[data-view]')) {
    print.addEventListener('click', () => {
      const view = print.dataset.view;
      opener = print;
      show(prints.findIndex(item => item.dataset.view === view));
      dialog.showModal();
      if (dialog.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const from = print.getBoundingClientRect(), to = dialog.getBoundingClientRect();
        const dx = from.left + from.width / 2 - to.left - to.width / 2;
        const dy = from.top + from.height / 2 - to.top - to.height / 2;
        dialog.animate([{transform:`translate(${dx}px,${dy}px) scale(${Math.min(1,from.width/to.width)})`,opacity:.4},{transform:'none',opacity:1}],{duration:240,easing:'cubic-bezier(.2,.7,.25,1)'});
      }
    });
  }
  dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
})();
