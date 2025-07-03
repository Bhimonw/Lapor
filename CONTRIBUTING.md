# Contributing to LAPOR

Terima kasih atas minat Anda untuk berkontribusi pada proyek LAPOR! 🎉

## 📋 Code of Conduct

Dengan berpartisipasi dalam proyek ini, Anda diharapkan untuk menjaga standar perilaku yang profesional dan menghormati semua kontributor.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Git
- Code editor (VS Code recommended)

### Development Setup

1. **Fork repository**
   ```bash
   # Fork di GitHub, kemudian clone
   git clone https://github.com/YOUR_USERNAME/lapor.git
   cd lapor
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi development Anda
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Development Workflow

### Branch Naming Convention

- `feature/feature-name` - Untuk fitur baru
- `bugfix/bug-description` - Untuk perbaikan bug
- `hotfix/critical-fix` - Untuk perbaikan critical
- `docs/documentation-update` - Untuk update dokumentasi
- `refactor/code-improvement` - Untuk refactoring

### Commit Message Convention

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: Fitur baru
- `fix`: Perbaikan bug
- `docs`: Perubahan dokumentasi
- `style`: Perubahan formatting (tidak mengubah logic)
- `refactor`: Refactoring code
- `test`: Menambah atau memperbaiki tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add password reset functionality
fix(reports): resolve image upload validation issue
docs(readme): update installation instructions
test(api): add unit tests for user controller
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- **Unit tests**: Test individual functions/components
- **Integration tests**: Test API endpoints
- **E2E tests**: Test complete user workflows

**Test file naming:**
- `*.test.js` - Unit tests
- `*.integration.test.js` - Integration tests
- `*.e2e.test.js` - End-to-end tests

### Test Coverage

Maintain minimum 80% test coverage untuk:
- Controllers
- Services
- Utilities
- Components (React)

## 📝 Code Style

### Linting & Formatting

```bash
# Check code style
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Code Standards

#### JavaScript/Node.js
- Gunakan ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use async/await over Promises
- Add JSDoc comments untuk functions
- Handle errors properly

```javascript
/**
 * Create a new report
 * @param {Object} reportData - Report data
 * @param {string} reportData.title - Report title
 * @param {string} reportData.description - Report description
 * @returns {Promise<Object>} Created report
 */
const createReport = async (reportData) => {
  try {
    const report = new Report(reportData);
    return await report.save();
  } catch (error) {
    throw new Error(`Failed to create report: ${error.message}`);
  }
};
```

#### React/JSX
- Use functional components dengan hooks
- Prefer named exports
- Use TypeScript-style prop validation
- Keep components small dan focused

```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ReportCard = ({ report, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await onUpdate(report.id);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-card">
      {/* Component content */}
    </div>
  );
};

ReportCard.propTypes = {
  report: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ReportCard;
```

## 🔒 Security Guidelines

- **Never commit secrets** (API keys, passwords, tokens)
- **Validate all inputs** di backend
- **Sanitize user data** sebelum menyimpan ke database
- **Use HTTPS** di production
- **Implement rate limiting** untuk API endpoints
- **Follow OWASP guidelines**

## 📚 Documentation

### Code Documentation
- Add JSDoc comments untuk functions dan classes
- Update README.md jika ada perubahan setup
- Document API endpoints dengan examples
- Add inline comments untuk complex logic

### API Documentation
Update API documentation jika menambah/mengubah endpoints:

```javascript
/**
 * @route POST /api/reports
 * @desc Create new report
 * @access Private
 * @param {string} title - Report title
 * @param {string} description - Report description
 * @param {File} image - Report image
 * @returns {Object} Created report
 */
```

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues
2. Reproduce the bug
3. Check if it's already fixed in latest version

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js version: [e.g. 18.17.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternatives**
Any alternative solutions considered?

**Additional Context**
Any other context or screenshots.
```

## 📋 Pull Request Process

### Before Submitting PR

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow coding standards
   - Add tests
   - Update documentation

3. **Run quality checks**
   ```bash
   npm run quality:check
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. **Automated checks** harus pass
2. **Code review** oleh maintainer
3. **Testing** di staging environment
4. **Approval** dan merge

## 🏷️ Release Process

### Versioning
Menggunakan [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Tagged release
- [ ] Deployed to production

## 🤝 Community

### Getting Help
- 📧 Email: dev@lapor.app
- 💬 Discord: [LAPOR Community](https://discord.gg/lapor)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/lapor/issues)

### Recognition
Kontributor akan diakui di:
- README.md
- Release notes
- Contributors page

---

**Terima kasih telah berkontribusi pada LAPOR! 🙏**