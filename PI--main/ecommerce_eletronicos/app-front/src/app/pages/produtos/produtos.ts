// Recursos Angular para mostrar preços, consultar o servidor,
// atualizar a tela, usar o campo de busca e navegar entre páginas.
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Produto } from '../../models/produto';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css',
})
export class Produtos implements OnInit {
  // Informações usadas pela lista, busca, filtros e mensagens da página.
  produtos: Produto[] = [];
  mensagemErro = '';
  carregando = true;
  termoBusca = '';
  categoriaSelecionada = 'Todas';

  // Ferramentas para buscar produtos, atualizar a tela e navegar.
  private readonly http = inject(HttpClient);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  // Monta as categorias dos filtros a partir dos produtos carregados.
  get categorias(): string[] {
    return ['Todas', ...new Set(this.produtos.map((produto) => produto.categoria))];
  }

  // Devolve somente os produtos que combinam com o texto e a categoria selecionados.
  get produtosFiltrados(): Produto[] {
    const termo = this.termoBusca.trim().toLocaleLowerCase();

    return this.produtos.filter((produto) => {
      const correspondeCategoria =
        this.categoriaSelecionada === 'Todas' || produto.categoria === this.categoriaSelecionada;
      const correspondeNome = produto.nome.toLocaleLowerCase().includes(termo);

      return correspondeCategoria && correspondeNome;
    });
  }

  // Quando a página abre, pede a lista de produtos ao servidor.
  ngOnInit(): void {
    this.http.get<Produto[]>('http://localhost:3000/produtos').subscribe({
      // Guarda os produtos recebidos ou mostra uma mensagem se a consulta falhar.
      next: (produtos) => {
        this.produtos = produtos;
        this.carregando = false;
        this.changeDetector.markForCheck();
      },
      error: (erro: unknown) => {
        console.error('Não foi possível carregar os produtos:', erro);
        this.mensagemErro =
          'Não foi possível carregar os produtos. Verifique se o json-server está iniciado.';
        this.carregando = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  // Guarda a categoria escolhida no filtro.
  selecionarCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
  }

  // O botão Sair leva de volta para a página de login.
  sair(): void {
    this.router.navigate(['/login']);
  }
}
