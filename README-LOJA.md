# Jogo Minha Loja — plano gratuito Firebase Spark

O jogo funciona com Authentication, Firestore e transações no navegador. Não é necessário ativar faturamento nem publicar Cloud Functions.

## Publicação

```sh
firebase login
firebase use loner-manga
firebase deploy --only firestore:rules,firestore:indexes
```

O site estático continua sendo publicado normalmente pelo GitHub Pages. O catálogo oficial permanece em `catalogo.js`; qualquer novo volume cadastrado nele entra automaticamente no jogo.

## Limitação do plano gratuito

Sem um backend confiável, o Firebase Spark não permite proteger integralmente sorteios e valores econômicos contra alguém que modifique deliberadamente o JavaScript no navegador. As regras validam autenticação, tipos, limites mínimos, propriedade dos dados e condições de anúncios; as operações normais usam transações atômicas do Firestore.

A pasta `functions/` permanece apenas como implementação opcional futura. Ela não é usada nem publicada pela configuração atual.
