<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signup</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Jaro:opsz@6..72&display=swap" rel="stylesheet">
  <script>
    function validateForm(event) {
      event.preventDefault();
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('emailSignup').value;
      const confirmEmail = document.getElementById('confirmEmail').value;
      const password = document.getElementById('passwordSignup').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (email !== confirmEmail) {
        alert('Emails do not match.');
        return false;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return false;
      }

      alert('Account created successfully');
      window.location.href = 'index.html'; // Redirect to login page
    }
  </script>
</head>
<body>
  <div class="login-container">
    <div class="form-section">
      <h1>SIGN UP</h1>
      <form id="signupForm" action="/register" method="POST" onsubmit="validateForm(event)">
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" name="firstName" placeholder="First Name" required>

        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" name="lastName" placeholder="Last Name" required>

        <label for="emailSignup">Email</label>
        <input type="email" id="emailSignup" name="email" placeholder="Email" required>

        <label for="confirmEmail">Re-enter Email</label>
        <input type="email" id="confirmEmail" name="confirmEmail" placeholder="Re-enter Email" required>

        <label for="passwordSignup">Password</label>
        <input type="password" id="passwordSignup" name="password" placeholder="Password" required>

        <label for="confirmPassword">Re-enter Password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Re-enter Password" required>

        <button type="submit" class="btn-signup">Create Account</button>
      </form>

      <!-- Back to Login Button -->
      <a href="index.html" class="btn-back">Back to Login</a>
    </div>

    <div class="map-section">
      <img src="MeetMeHalfway.png" alt="Meet Me Halfway Logo" class="logo">
      <h2>MEET ME HALFWAY</h2>
    </div>
  </div>
</body>
</html>
