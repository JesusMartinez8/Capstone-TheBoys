 // Loading Spinner Functions
  function showSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
  }

  function hideSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
  }

  // Notification Bar Functions
  function showNotification() {
    const notification = document.getElementById('notificationBar');
    const progressBar = document.getElementById('progressBar');
    notification.style.display = 'block';
    progressBar.style.width = '0%';

    setTimeout(() => {
      progressBar.style.width = '100%';
    }, 50);

    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
   document.addEventListener('DOMContentLoaded', () => {
    showSpinner();
    setTimeout(hideSpinner, 3000); // Hide spinner after 3 seconds
  });
