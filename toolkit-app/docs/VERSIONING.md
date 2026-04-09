# VERSIONING: Roadmap SDD Toolkit

---

## v1.0.1 ✅ RELEASED (Patch)

**Release Date:** 2026-04-08

### Fixed
- Corrigido `resolveToolkitPath()` em `pathUtils.ts`: subia 3 níveis a partir de `dist/utils/` chegando ao diretório pai `SDD/` em vez de `toolkit-app/docs/`
- Corrigido `validateToolkitPath()` em `validation.ts`: removido `README.md` da lista de arquivos obrigatórios (não existe em `docs/`)
- Corrigido `fileGenerator.ts`: removido `README.md` do array `CLAUDE_FILES` (não existe em `docs/`)
- Corrigido `configGenerator.ts`: `toolkitVersion` era `'1.1.0'` (versão futura); corrigido para `'1.0.1'`

### Added
- Geração de `specs/guidelines/` nos projetos criados: os 4 guidelines de `docs/guidelines/` agora são copiados automaticamente para o projeto gerado
- README.md completamente reescrito com mapa completo de `docs/`, referências aos templates e guia detalhado de como/onde aplicar cada guideline

### Changed
- CLI banner atualizado para v1.0.1
- Mensagem de erro de validação do toolkit atualizada para referenciar `docs/` em vez de `bks-spec-toolkit/`

---

## v1.0 ✅ RELEASED

**Release Date:** 2026-04-08

### Features
- ✅ 6 Princípios SDD (CLAUDE.md)
- ✅ Stack .NET 8+ (CLAUDE-PROJECT.md)
- ✅ Padrões agnósticos (CLAUDE-ARCHITECT.md)
- ✅ Implementações .NET (CLAUDE-ARCHITECT-NET.md)
- ✅ Estratégia TDD (CLAUDE-TDD.md)
- ✅ Workflow 5 fases (PLAN.md)
- ✅ CLI para criar projetos (toolkit-app)
- ✅ Exemplo Wallet (5 features)
- ✅ Templates agnósticos + .NET
- ✅ Documentação completa

### Documentation
- docs/CLAUDE.md — 6 princípios
- docs/CLAUDE-PROJECT.md — Stack .NET
- docs/CLAUDE-ARCHITECT.md — Padrões agnósticos
- docs/CLAUDE-ARCHITECT-NET.md — .NET específico com exemplos C#
- docs/CLAUDE-TDD.md — Testes 70/20/10
- docs/PLAN.md — 5 fases workflow
- README.md — Toolkit overview

### Quality
- CLI buildable e testável
- Wallet exemplo com estrutura SDD
- Templates reutilizáveis
- Rastreabilidade RF → CA → Tasks → Código

### Known Limitations
- ❌ Apenas .NET 8+
- ❌ Apenas PostgreSQL
- ❌ Apenas Dapper (não EF Core)
- ❌ CLI sem persistência de histórico

---

## v1.1 🔄 IN PROGRESS (Next)

**ETA:** Q2 2026

### Python Support
- [ ] CLAUDE-ARCHITECT-PYTHON.md
- [ ] Templates agnósticos + Python
- [ ] Exemplo Django/FastAPI
- [ ] CLI com opção `--stack=python`
- [ ] Tests: pytest, pytest-cov

### Melhorias
- [ ] CLI salvar histórico de projetos criados
- [ ] Templates customizáveis
- [ ] Git init automático em novos projetos
- [ ] Pre-commit hooks (lint, format)
- [ ] GitHub Actions templates

### Testing
- [ ] CLI próprio com testes automatizados
- [ ] E2E tests para geração de projetos
- [ ] Validação de estrutura gerada

---

## v1.2 🔮 PLANNED

**ETA:** Q3 2026

### Java Support
- [ ] CLAUDE-ARCHITECT-JAVA.md
- [ ] Templates agnósticos + Java/Spring
- [ ] Exemplo Spring Boot
- [ ] CLI com opção `--stack=java`
- [ ] Tests: JUnit 5, Mockito, Testcontainers

### Outras Linguagens
- [ ] Go
- [ ] Rust
- [ ] TypeScript/Node.js

---

## v2.0 🎯 VISION

**ETA:** Q4 2026+

### Plugin System
- [ ] Marketplace de plugins/templates
- [ ] Custom validators
- [ ] Custom generators
- [ ] Extend padrões com plugins

### Advanced Features
- [ ] Monorepo support
- [ ] Microservices templates
- [ ] Event Sourcing
- [ ] CQRS
- [ ] GraphQL support

### DevOps
- [ ] Docker templates
- [ ] Kubernetes deployments
- [ ] CI/CD pipelines (GitHub Actions, GitLab CI)
- [ ] Terraform configs

### Analytics
- [ ] Métricas de qualidade
- [ ] Coverage tracking
- [ ] Performance benchmarks

---

## Princípios de Versionamento

### Semver
- **MAJOR:** Breaking changes (v1.0 → v2.0)
- **MINOR:** New features backward-compatible (v1.0 → v1.1)
- **PATCH:** Bug fixes (v1.0.0 → v1.0.1)

### Release Criteria
- [ ] Testes passando 100%
- [ ] Documentação completa
- [ ] Exemplos funcionando
- [ ] Breaking changes documentadas

### Deprecation Policy
- Features deprecated terão aviso por 2 releases
- Exemplo: v1.0 deprecate feature X, removido em v1.2

---

## How to Report Issues

1. Check toolkit/examples/wallet/ for working reference
2. Try com CLI: `node toolkit/cli/dist/index.js create`
3. Valide contra docs/CLAUDE.md
4. Reporte com reproduction steps

---

## Contributing

Contribuições são bem-vindas!

### Para reportar bug
1. Título: `[BUG] Descrição curta`
2. Stack trace ou passos para reproduzir
3. Versão SDD Toolkit

### Para feature request
1. Título: `[FEATURE] Nome da feature`
2. Descrição detalhada
3. Caso de uso

### Para docs
- Correções de typo
- Exemplos adicionais
- Clarificações

---

## Compatibility Matrix

| Version | .NET | Python | Java | Node.js |
|---------|------|--------|------|---------|
| v1.0 | ✅ 8+ | ❌ | ❌ | ❌ |
| v1.1 | ✅ 8+ | ✅ 3.9+ | ❌ | ❌ |
| v1.2 | ✅ 8+ | ✅ 3.9+ | ✅ 11+ | ❌ |
| v2.0 | ✅ 8+ | ✅ 3.9+ | ✅ 11+ | ✅ 18+ |

---

## Support Timeline

| Version | Released | Support Until | LTS? |
|---------|----------|---------------|------|
| v1.0 | Apr 2026 | Oct 2026 | Yes |
| v1.1 | Jun 2026 | Dec 2026 | No |
| v1.2 | Sep 2026 | Mar 2027 | No |
| v2.0 | Dec 2026 | Dec 2027 | Yes |

**LTS:** Long-term support (bug fixes + security patches)

---

## Changelog Format

```
### Added
- New feature description
- Another feature

### Changed
- Breaking change with migration guide

### Fixed
- Bug description and solution

### Deprecated
- Feature deprecated message with timeline

### Removed
- Feature removed (with migration guide to v1.1)

### Security
- Security fix description
```

---

**Última atualização:** 2026-04-08  
**Mantido por:** Fabio (@luisfabiosm)

