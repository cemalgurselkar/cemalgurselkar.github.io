# Cemal Gürsel Kar — Portfolio

An evidence-led engineering portfolio built with Next.js, React, TypeScript,
and Tailwind CSS. The implementation follows the phased contract in
[`plan.md`](./plan.md).

## Local development

The setup script installs dependencies, downloads a project-local Node.js 24
runtime when needed, and starts the local preview:

```bash
./setup.sh
```

The preview is available at `http://127.0.0.1:3000`. Use a different port with
`PORT=4173 ./setup.sh`.

Alternatively, use an existing Node.js 24 installation and npm:

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

The production build is a static export in `out/`, suitable for user-managed
GitHub Pages deployment. A repository subpath or custom-domain configuration
will be added only after the final hosting topology is confirmed.
