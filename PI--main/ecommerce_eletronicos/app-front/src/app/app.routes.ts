// Define para qual componente cada endereço da aplicação deve levar.
import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { GerenciarProdutos } from './pages/gerenciar-produtos/gerenciar-produtos';
import { Produtos } from './pages/produtos/produtos';

export const routes: Routes = [
  // Páginas acessíveis pelo endereço escrito no navegador ou pelos links.
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
  { path: 'produtos', component: Produtos },
  { path: 'gerenciar', component: GerenciarProdutos },
  // Endereço inicial e endereços desconhecidos levam para o login.
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];