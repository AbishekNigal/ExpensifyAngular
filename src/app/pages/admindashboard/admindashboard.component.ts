import { Component, inject, OnInit, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  Firestore
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);

  loading = true;
  error: string | null = null;
  users: Array<{ id: string; username: string; email: string }> = [];

  async ngOnInit() {

    runInInjectionContext(this.auth as any, () => {
      onAuthStateChanged(this.auth, async (user: User | null) => {
        if (!user) {
  
          await this.router.navigate(['/login']);
          return;
        }

        try {
 
          await runInInjectionContext(this.firestore as any, async () => {
            const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
            if (!userDoc.exists()) {
              await signOut(this.auth);
              await this.router.navigate(['/login']);
              return;
            }

            const ud = userDoc.data() as any;
            if (ud?.role !== 'admin') {
  
              await this.router.navigate(['/']);
              return;
            }


            await this.loadUsers();
          });
        } catch (e: any) {
          this.error = e?.message ?? 'An error occurred';
          await signOut(this.auth);
          await this.router.navigate(['/login']);
        }
      });
    });
  }

  async loadUsers() {
    this.loading = true;
    this.error = null;
    this.users = [];

    try {
      await runInInjectionContext(this.firestore as any, async () => {
        const usersCol = collection(this.firestore, 'users');
        const snapshot = await getDocs(usersCol);

        if (snapshot.empty) {
          this.loading = false;
          return;
        }
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;

          if (data?.role === 'admin') return;

          this.users.push({
            id: docSnap.id,
            username: data?.username ?? 'N/A',
            email: data?.email ?? 'N/A'
          });
        });
        this.loading = false;
      });
    } catch (e: any) {
      this.error = e?.message ?? 'Error loading users';
      this.loading = false;
    }
  }


  openClientExpenses(userId: string) {

    this.router.navigate(['/client-expenses'], { queryParams: { userId } });
  }
  
  logout() {
  this.auth.signOut().then(() => {
    this.router.navigate(['/login']);
  });
}
}
