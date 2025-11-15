import { Component, inject, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  getDoc,
  doc,
  Firestore,
} from '@angular/fire/firestore';
import {
  Auth,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
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
      alert("Please verify your email before logging in.");
      return;
    }

    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) {
      alert('User record missing.');
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
    console.error('Login error:', err);
    alert(err.message);
  }
}
}

