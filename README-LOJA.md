# Jogo Minha Loja

O catálogo oficial permanece em `catalogo.js`. O comando `npm --prefix functions run catalog` gera `functions/catalog-runtime.json` para que o sorteio seguro das caixas use exatamente os mesmos volumes no backend.

## Publicação

```sh
cd functions
npm install
npm test
npm run catalog
cd ..
firebase login
firebase use loner-manga
firebase deploy --only firestore:rules,firestore:indexes,functions
```

As Functions usam Node.js 20 e a região `southamerica-east1`. No Console Firebase, habilite Firestore, Authentication com os provedores já usados pelo site e o plano Blaze (necessário para Functions de 2ª geração). Não adicione credenciais do Admin SDK ao repositório.
