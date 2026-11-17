// Formato completo de um produto guardado no sistema.
export interface Produto {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string;
  imagem: string;
}

// Dados usados para criar ou atualizar produto; não inclui o id.
export type DadosProduto = Omit<Produto, 'id'>;
