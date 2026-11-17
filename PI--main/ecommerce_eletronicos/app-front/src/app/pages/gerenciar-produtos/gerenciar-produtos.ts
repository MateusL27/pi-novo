// Recursos do Angular usados para formatar preços, fazer pedidos ao servidor,
// conectar este arquivo ao HTML e navegar entre páginas.
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DadosProduto, Produto } from '../../models/produto';

// Cria um formulário vazio, usado ao abrir a tela ou limpar o formulário.
const novoProdutoVazio = (): DadosProduto => ({
  nome: '',
  preco: 0,
  quantidade: 0,
  categoria: '',
  imagem: '',
});

// Categorias fixas disponíveis para os produtos.
const categorias = ['Monitores', 'Periféricos', 'Áudio', 'Smartphones', 'Notebooks'];

// Liga esta classe ao HTML e ao CSS da tela e declara os recursos Angular usados no HTML.
@Component({
  selector: 'app-gerenciar-produtos',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './gerenciar-produtos.html',
  styleUrl: './gerenciar-produtos.css',
})
export class GerenciarProdutos implements OnInit {
  // Dados que a tela mostra ou está usando no momento.
  produtos: Produto[] = [];
  categorias = categorias;
  formulario = novoProdutoVazio();
  produtoEmEdicao: string | null = null;
  mensagem = '';
  mensagemErro = '';
  carregando = false;
  salvando = false;

  // Ferramentas Angular para conversar com o servidor, atualizar a tela e navegar.
  private readonly http = inject(HttpClient);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  // Quando a tela abre, carrega a lista de produtos.
  ngOnInit(): void {
    this.carregarProdutos();
  }

  // Busca os produtos no servidor e mostra o resultado ou uma mensagem de erro.
  carregarProdutos(): void {
    this.carregando = true;

    this.http.get<Produto[]>('http://localhost:3000/produtos').subscribe({
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

  // Confere os campos e envia o produto. Se houver um id em edição, atualiza;
  // se não houver, cadastra um produto novo.
  salvar(): void {
    this.mensagem = '';
    this.mensagemErro = '';
    const nome = this.formulario.nome.trim();
    const categoriaValida = this.categorias.includes(this.formulario.categoria);

    // Impede o envio se algum campo obrigatório ou algum valor estiver inválido.
    if (
      !nome ||
      !categoriaValida ||
      !Number.isFinite(this.formulario.preco) ||
      this.formulario.preco < 0 ||
      !Number.isInteger(this.formulario.quantidade) ||
      this.formulario.quantidade < 0 ||
      !this.formulario.imagem
    ) {
      this.mensagemErro =
        'Preencha todos os campos corretamente. Preço e estoque não podem ser negativos.';
      return;
    }

    // Prepara os dados e escolhe a operação: PUT atualiza; POST cria.
    this.salvando = true;
    const estaEditando = this.produtoEmEdicao !== null;
    const dados: DadosProduto = {
      ...this.formulario,
      nome,
      categoria: this.formulario.categoria.trim(),
    };

    const requisicao = this.produtoEmEdicao
      ? this.http.put<Produto>(`http://localhost:3000/produtos/${this.produtoEmEdicao}`, dados)
      : this.http.post<Produto>('http://localhost:3000/produtos', dados);

    requisicao.subscribe({
      // Se salvar der certo, limpa o formulário, mostra uma confirmação e atualiza a lista.
      next: () => {
        this.cancelarEdicao();
        this.mensagem = estaEditando ? 'Produto atualizado.' : 'Produto cadastrado.';
        this.salvando = false;
        this.changeDetector.markForCheck();
        this.carregarProdutos();
      },
      // Se o servidor falhar, registra o erro e mostra uma mensagem na tela.
      error: (erro: unknown) => {
        console.error('Não foi possível salvar o produto:', erro);
        this.mensagemErro = 'Não foi possível salvar o produto. Tente novamente.';
        this.salvando = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  // Copia os dados do produto escolhido para o formulário e ativa o modo de edição.
  editar(produto: Produto): void {
    this.produtoEmEdicao = produto.id;
    this.formulario = {
      nome: produto.nome,
      preco: produto.preco,
      quantidade: produto.quantidade,
      categoria: produto.categoria,
      imagem: produto.imagem,
    };
    this.mensagem = '';
    this.mensagemErro = '';
  }

  // Confirma a exclusão e pede ao servidor para remover o produto selecionado.
  excluir(produto: Produto): void {
    if (!window.confirm(`Deseja excluir "${produto.nome}"?`)) {
      return;
    }

    this.mensagem = '';
    this.mensagemErro = '';
    this.http.delete<void>(`http://localhost:3000/produtos/${produto.id}`).subscribe({
      next: () => {
        this.mensagem = 'Produto excluído.';
        this.changeDetector.markForCheck();
        this.carregarProdutos();
      },
      error: (erro: unknown) => {
        console.error('Não foi possível excluir o produto:', erro);
        this.mensagemErro = 'Não foi possível excluir o produto. Tente novamente.';
        this.changeDetector.markForCheck();
      },
    });
  }

  // Sai do modo de edição e limpa os campos do formulário.
  cancelarEdicao(): void {
    this.produtoEmEdicao = null;
    this.formulario = novoProdutoVazio();
  }

  // O botão Sair leva de volta para a página de login.
  sair(): void {
    this.router.navigate(['/login']);
  }
}
