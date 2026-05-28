'use strict';

let selectedChar = null;
let selectedMode = null;
const btnGo = document.getElementById('btn-go');

document.querySelectorAll('[data-char]').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('[data-char]').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedChar = card.dataset.char;
    checkReady();
  });
});

document.querySelectorAll('[data-mode]').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedMode = card.dataset.mode;
    checkReady();
  });
});

function checkReady() {
  btnGo.disabled = !(selectedChar && selectedMode);
  if (!btnGo.disabled) btnGo.classList.add('ready');
}

btnGo.addEventListener('click', () => {
  if (selectedChar && selectedMode)
    location.href = `game.html?char=${selectedChar}&mode=${selectedMode}`;
});
