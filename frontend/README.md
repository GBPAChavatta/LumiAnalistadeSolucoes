# Lumi – Frontend

Frontend Next.js do projeto Lumi (ElevenLabs AgentAI com supressor de ruídos). Inclui o chat conversacional e a página **Consulta de Leads** (protegida por Google OAuth, domínio @gbpa.com.br).

## Getting Started

Configure as variáveis de ambiente em `.env.local` (copie de `.env.local.example`). Depois, inicie o servidor:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Acesse [http://localhost:3000](http://localhost:3000).

- **Página principal**: chat com o agente Lumi (ElevenLabs)
- **Consulta de Leads** (`/consulta-leads`): lista de leads, requer login Google @gbpa.com.br (ver [docs/CONSULTA_LEADS_SETUP.md](../docs/CONSULTA_LEADS_SETUP.md))

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
