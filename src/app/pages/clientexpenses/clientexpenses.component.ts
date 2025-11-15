import { Component, inject, OnInit, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-client-expenses',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './clientexpenses.component.html',
  styleUrls: ['./clientexpenses.component.css'],
})
export class ClientExpensesComponent implements OnInit {
  firestore = inject(Firestore);
  auth = inject(Auth);
  router = inject(Router);
  route = inject(ActivatedRoute);

  clientUsername = 'Client';
  expenses: any[] = [];
  totalAmount = 0;
  loading = true;

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }


      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      if (!userDoc.exists() || userDoc.data()['role'] !== 'admin') {
        this.router.navigate(['/home']);
        return;
      }

      const userId = this.route.snapshot.queryParamMap.get('userId');
      if (!userId) {
        alert('No user selected');
        this.router.navigate(['/admin-dashboard']);
        return;
      }

      await this.loadClientUsername(userId);
      await this.loadExpenses(userId);
    });
  }

  async loadClientUsername(userId: string) {
    const snap = await getDoc(doc(this.firestore, 'users', userId));
    if (snap.exists()) {
      this.clientUsername = snap.data()['username'] ?? 'Client';
    }
  }

  async loadExpenses(userId: string) {
    return runInInjectionContext(this.firestore as any, async () => {
      const colRef = collection(this.firestore, `users/${userId}/expenses`);
      const snapshot = await getDocs(colRef);

      this.expenses = snapshot.docs.map((d) => d.data());
      this.totalAmount = this.expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

      this.loading = false;
    });
  }

  goBackToDashboard() {
    this.router.navigate(['/admin']);
  }
}

