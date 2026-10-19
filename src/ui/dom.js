export function mark(btn, r) {
  if (r === 'strike') {
    btn.classList.add('bad');
    setTimeout(() => btn.classList.remove('bad'), 450);
  } else if (r !== 'ignored' && r !== 'caught') {
    if (r !== 'ok' || !btn.dataset.reusable) {
      btn.classList.add('done');
    }
  }
}

/** Views only build markup with <button data-i="n">; this wires taps to api.act. */
export function bind(el, api) {
  el.onclick = (e) => {
    const b = e.target.closest('button[data-i]');
    if (!b || b.classList.contains('done')) return;
    mark(b, api.act(+b.dataset.i));
  };
}
