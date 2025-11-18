import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getDoc, doc, Firestore } from '@angular/fire/firestore';
import { Auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.css'],
})
export class LoginPageComponent {
  auth = inject(Auth);
  firestore = inject(Firestore);
  router = inject(Router);

  email = '';
  password = '';

  async login() {

    this.email = this.email.trim();
    this.password = this.password.trim();

    if (!this.email || !this.password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      const user = cred.user;

      if (!user.emailVerified) {
        alert('Please verify your email before logging in.');
        return;
      }

      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const snap = await getDoc(userDocRef);

      if (!snap.exists()) {
        alert('No user data found.');
        return;
      }

      const role = snap.data()['role'];

      if (!role) {
        alert('User role missing. Contact admin.');
        return;
      }

      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (role === 'client') {
        this.router.navigate(['/home']);
      } else {
        alert('Unauthorized role.');
      }

    } catch (err: any) {
        console.log("FIREBASE LOGIN ERROR:", err.code, err.message); 
      switch (err.code) {
        case 'auth/user-not-found':
          alert('No user found with this email.');
          break;

        case 'auth/wrong-password':
          alert('Incorrect password.');
          break;

        case 'auth/invalid-email':
          alert('Invalid email format.');
          break;

        case 'auth/too-many-requests':
          alert('Too many attempts. Please wait and try again.');
          break;

        default:
          alert('Login failed. Please try again.');
      }
    }
  }

  async openForgotPassword() {
  const emailInput = prompt('Enter your email to reset password:');

  if (!emailInput) {
    return;
  }

  const email = emailInput.trim();
  if (!email) {
    alert('Please enter a valid email.');
    return;
  }

  try {
    await sendPasswordResetEmail(this.auth, email);
    alert('Password reset email has been sent. Please check your inbox.');
  } catch (err: any) {

    switch (err.code) {
      case 'auth/user-not-found':
        alert('No user found with this email.');
        break;
      case 'auth/invalid-email':
        alert('Invalid email format.');
        break;
      case 'auth/too-many-requests':
        alert('Too many attempts. Please try again later.');
        break;
      default:
        alert('Could not send reset email. Please try again.');
    }
  }
}

showPassword = false;

togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}


}



