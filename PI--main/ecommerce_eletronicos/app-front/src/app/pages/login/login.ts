import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Dados de administrador recebidos do servidor para conferir o acesso.
interface Adm {
  id: string;
  nome: string;
  email: string;
  senha: string;
}

// Conecta a lógica do login ao formulário HTML e ao sistema de navegação.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Valores digitados no formulário e mensagens mostradas na tela.
  email = '';
  senha = '';
  mensagem = '';
  carregando = false;

  // Ferramentas Angular para consultar o servidor e abrir outra página.
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Confere o e-mail e a senha com os administradores salvos no servidor.
  entrar(): void {
    this.mensagem = '';
    this.carregando = true;

    this.http.get<Adm[]>('http://localhost:3000/adms').subscribe({
      // Se a consulta funcionar, procura uma conta com os dados digitados.
      next: (adms) => {
        const admEncontrado = adms.find(
          (adm) =>
            adm.email.toLowerCase() === this.email.trim().toLowerCase() && adm.senha === this.senha,
        );

        this.carregando = false;
        if (!admEncontrado) {
          this.mensagem = 'E-mail ou senha incorretos.';
          return;
        }

        // Login válido: abre a página de produtos.
        this.router.navigate(['/produtos']);
      },
      // Se não conseguir consultar o servidor, mostra uma mensagem de erro.
      error: (erro: unknown) => {
        console.error('Não foi possível consultar os administradores:', erro);
        this.carregando = false;
        this.mensagem =
          'Não foi possível conectar ao servidor. Verifique se o json-server está iniciado.';
      },
    });
  }
}
