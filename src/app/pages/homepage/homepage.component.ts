import { Component, inject, OnInit, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomePageComponent implements OnInit {

  firestore = inject(Firestore);
  auth = inject(Auth);
  router = inject(Router);


  username = 'User';
  currentUserUID: string | null = null;
  expenses: any[] = [];
  totalAmount = 0;


  title = '';
  category = '';
  date = '';
  amount: number | null = null;
  editId: string | null = null;

  ngOnInit() {

    runInInjectionContext(this.auth as any, () => {
      onAuthStateChanged(this.auth, async (user: User | null) => {
        if (user) {
          this.currentUserUID = user.uid;
          const snap = await getDoc(doc(this.firestore, `users/${user.uid}`));
          this.username = snap.exists() ? (snap.data() as any).username ?? 'User' : 'User';
          await this.loadExpenses();
        } else {
          this.router.navigate(['/login']);
        }
      });
    });
  }

  async loadExpenses() {
    if (!this.currentUserUID) return;


    return runInInjectionContext(this.firestore as any, async () => {
      const expensesCol = collection(this.firestore, `users/${this.currentUserUID}/expenses`);
      const snapshot = await getDocs(expensesCol);
      this.expenses = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      this.updateTotal();
    });
  }

  async saveExpense(expense: any) {
    if (!this.currentUserUID) return;

    return runInInjectionContext(this.firestore as any, async () => {
      const expensesCol = collection(this.firestore, `users/${this.currentUserUID}/expenses`);

      if (expense.id) {
        const ref = doc(expensesCol, expense.id);
        await updateDoc(ref, {
          title: expense.title,
          category: expense.category,
          date: expense.date,
          amount: expense.amount,
        });
      } else {
        await addDoc(expensesCol, expense);
      }

      await this.loadExpenses();
    });
  }

  async deleteExpense(id: string) {
    if (!this.currentUserUID) return;

    return runInInjectionContext(this.firestore as any, async () => {
      const expenseRef = doc(this.firestore, `users/${this.currentUserUID}/expenses`, id);
      await deleteDoc(expenseRef);
      await this.loadExpenses();
    });
  }

  editExpense(expense: any) {
    this.title = expense.title;
    this.category = expense.category;
    this.date = expense.date;
    this.amount = expense.amount;
    this.editId = expense.id;
  }

async addExpense() {
  if (!this.title || !this.category || !this.date || !this.amount) {
    alert('Please fill all fields.');
    return;
  }

  const expense: any = {
    title: this.title,
    category: this.category,
    date: this.date,
    amount: this.amount,
  };


  if (this.editId) {
    expense.id = this.editId;
  }

  await this.saveExpense(expense);


  this.title = '';
  this.category = '';
  this.date = '';
  this.amount = null;
  this.editId = null;
}

  updateTotal() {
    this.totalAmount = this.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }
}


