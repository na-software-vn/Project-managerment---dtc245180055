document.addEventListener('DOMContentLoaded', function () {
  // Auto dismiss flash alerts
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      if (bsAlert) bsAlert.close();
    }, 5000);
  });

  // Confirm delete prompts
  const deleteForms = document.querySelectorAll('form[data-confirm]');
  deleteForms.forEach(form => {
    form.addEventListener('submit', function (e) {
      const msg = form.getAttribute('data-confirm') || 'Bạn có chắc chắn muốn xóa không? Hành động này không thể hoàn tác.';
      if (!confirm(msg)) {
        e.preventDefault();
      }
    });
  });
});

// Quick demo login autofill helper
function fillDemoUser(email, password) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  if (emailInput && passwordInput) {
    emailInput.value = email;
    passwordInput.value = password;
  }
}

