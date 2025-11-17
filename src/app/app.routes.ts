import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/homepage/homepage.component';
import { LoginPageComponent } from './pages/loginpage/loginpage.component';
import { SignupPageComponent } from './pages/signuppage/signuppage.component';
import { AdminDashboardComponent } from './pages/admindashboard/admindashboard.component';
import { ClientExpensesComponent } from './pages/clientexpenses/clientexpenses.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'home', component: HomePageComponent },
  { path: 'signup',component: SignupPageComponent},
  { path: 'admin',component: AdminDashboardComponent},
  { path: 'client-expenses', component: ClientExpensesComponent}

];