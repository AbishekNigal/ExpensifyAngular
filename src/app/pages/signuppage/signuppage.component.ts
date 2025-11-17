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

  async signup(form: any) {
  let errorMessage = "";

  if (!this.username || !this.email || !this.password) {
    errorMessage += "Please fill in all fields.\n";
  }

  if (form.controls['username']?.errors?.['pattern']) {
    errorMessage += "Username can only contain letters and numbers.\n";
  }

    if (form.controls['email']?.errors?.['email']) {
    errorMessage += "Please enter a valid email address.\n";
  }

  if (form.controls['password']?.errors?.['pattern']) {
    errorMessage +=
      "Password must be 8–16 characters long and include at least one number.\n";
  }


  if (errorMessage) {
    alert(errorMessage);
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


