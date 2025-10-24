// Force cache clear
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Force reload
window.location.reload(true);