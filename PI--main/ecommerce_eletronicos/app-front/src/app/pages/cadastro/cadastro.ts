import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Formato de uma conta de administrador enviada ou recebida do servidor.
interface Adm {
  id: string;
  nome: string;
  email: string;
  senha: string;
}

// Conecta a lógica de cadastro ao HTML, ao formulário e à navegação.
@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  // Valores digitados e estado das mensagens do formulário.
  nome = '';
  email = '';
  senha = '';
  mensagem = '';
  carregando = false;

  // Ferramentas Angular para consultar/gravar dados e abrir outra página.
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Confere os campos, evita e-mails repetidos e cria a conta no servidor.
  cadastrar(): void {
    this.mensagem = '';

    // Limpa espaços extras e verifica se os dados obrigatórios estão corretos.
    const nome = this.nome.trim();
    const email = this.email.trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!nome || /\d/.test(nome) || !emailValido || !this.senha) {
      this.mensagem = 'Informe um nome sem números, um e-mail válido e uma senha.';
      return;
    }

    // Primeiro consulta as contas para impedir o cadastro do mesmo e-mail duas vezes.
    this.carregando = true;
    this.http.get<Adm[]>('http://localhost:3000/adms').subscribe({
      next: (adms) => {
        // Se o e-mail já existir, avisa e não tenta criar outra conta.
        if (adms.some((adm) => adm.email.toLowerCase() === email.toLowerCase())) {
          this.carregando = false;
          this.mensagem = 'Já existe uma conta cadastrada com esse e-mail.';
          return;
        }

        // Se não houver conta com esse e-mail, envia os dados para criar a nova conta.
        this.http
          .post<Adm>('http://localhost:3000/adms', {
            nome,
            email,
            senha: this.senha,
          })
          .subscribe({
            next: () => {
              // Ao terminar, abre o login. Não guardamos mensagem temporária no navegador.
              this.carregando = false;
              this.router.navigate(['/login']);
            },
            // Mostra erro se o servidor não conseguir criar a conta.
            error: (erro: unknown) => {
              console.error('Não foi possível criar a conta:', erro);
              this.carregando = false;
              this.mensagem = 'Não foi possível criar a conta. Tente novamente.';
            },
          });
      },
      // Mostra erro se não for possível consultar as contas existentes.
      error: (erro: unknown) => {
        console.error('Não foi possível consultar as contas:', erro);
        this.carregando = false;
        this.mensagem =
          'Não foi possível conectar ao servidor. Verifique se o json-server está iniciado.';
      },
    });
  }
}
