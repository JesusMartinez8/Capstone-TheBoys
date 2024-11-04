function selectMode(element) {
  document.querySelectorAll('.transportation-icons i').forEach(icon => {
    icon.classList.remove('selected');
  });
  element.classList.add('selected');
}
