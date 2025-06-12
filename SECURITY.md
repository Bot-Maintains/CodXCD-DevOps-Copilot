# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

We support only the versions listed above with security updates. Users are strongly encouraged to upgrade to a supported version.

## Reporting a Vulnerability

Please help us keep CodXCD-DevOps-Copilot and its users safe by responsibly disclosing security issues.

- **Contact:** sourav.xcd@gmail.com or [GitHub Security Advisories](https://github.com/Bot-Maintains/CodXCD-DevOps-Copilot/security/advisories)
- **Information:** Include steps to reproduce, impact assessment, and any relevant logs or PoCs.
- **Response:** We will acknowledge reports within 48 hours and provide progress updates until resolution.
- **Disclosure:** Please do not disclose vulnerabilities publicly until we have resolved them and coordinated disclosure.

## Secure Development & Deployment Practices

- **Dependency Management**
  - All dependencies must be kept up-to-date with automated tools (Dependabot, npm audit).
  - Use only well-maintained, reputable libraries.
- **Code and Secret Scanning**
  - CodeQL, secret scanning, and static analysis are enabled on all branches.
  - No credentials, tokens, or sensitive data in code or configs.
- **Branch Protection**
  - Require pull request reviews, status checks, and signed commits before merging to main branches.
- **2FA and Access Control**
  - All contributors and maintainers must enable Two-Factor Authentication.
  - Use least-privilege principle for GitHub Apps and tokens; review access regularly.
- **Webhook Security**
  - All webhook endpoints must require HTTPS and validate GitHub signatures.
- **Audit & Monitoring**
  - Enable audit logging, set up notifications for security events, and monitor for suspicious activity.
  - Use GitHub Actions to trigger automated security tests on pull requests and pushes.

## Automated Security Tools

- **Static Application Security Testing (SAST):** Integrate tools like CodeQL and SonarQube in CI.
- **Dynamic Application Security Testing (DAST):** Use dynamic scanners for deployed instances.
- **Secret Detection:** Enable GitHub Secret Scanning and validate that no secrets are committed.
- **Dependency Scanning:** Use Dependabot alerts and npm audit for all package updates.

## Responsible Disclosure

We support and encourage responsible disclosure. Security researchers who report vulnerabilities will be credited in our release notes upon request.

## Additional Resources

- [GitHub Security Documentation](https://docs.github.com/en/code-security)
- [Security Advisories](https://github.com/Bot-Maintains/CodXCD-DevOps-Copilot/security/advisories)
- [Responsible Disclosure Policy](https://github.com/Bot-Maintains/CodXCD-DevOps-Copilot/blob/main/SECURITY.md)

---

- **Bishal Das (bishalcs4k@gmail.com)**

Place this file as SECURITY.md in the root or .github directory of your repository.
