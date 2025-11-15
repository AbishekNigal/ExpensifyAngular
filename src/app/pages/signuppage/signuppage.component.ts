import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, setDoc, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-signuppage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signuppage.component.html',
  styleUrls: ['./signuppage.component.css'],
})
export class SignupPageComponent {

  email = '';
  password = '';
  username = '';


  auth = inject(Auth);
  firestore = inject(Firestore);
  router = inject(Router);

  async signup() {
    if (!this.email || !this.password || !this.username) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      const user = userCredential.user;
      await sendEmailVerification(user);

      await setDoc(doc(this.firestore, 'users', user.uid), {
        email: user.email,
        username: this.username,
        role: 'client',
        createdAt: new Date().toISOString(),
      });

      alert('Verification link has been sent to your email!');
      this.router.navigate(['/login']);
    } catch (error: any) {
      alert(error.message);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}


