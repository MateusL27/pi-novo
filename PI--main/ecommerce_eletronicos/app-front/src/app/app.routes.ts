import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { GerenciarProdutos } from './pages/gerenciar-produtos/gerenciar-produtos';
import { Produtos } from './pages/produtos/produtos';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
  { path: 'produtos', component: Produtos },
  { path: 'gerenciar', component: GerenciarProdutos },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];