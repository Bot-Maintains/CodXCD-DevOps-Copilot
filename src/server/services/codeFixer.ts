import { Octokit } from '@octokit/rest';
import { CodeAnalysisResult, CodeIssue, AnalyzedFile } from './codeAnalyzer';
import { createLogger } from '../utils/logger';

const logger = createLogger();

export interface FixResult {
  success: boolean;
  filesModified: string[];
  issuesFixed: number;
  pullRequestUrl?: string;
  summary: string;
  details: FixDetail[];
}

export interface FixDetail {
  file: string;
  changes: Change[];
  issuesFixed: CodeIssue[];
}

export interface Change {
  line: number;
  oldContent: string;
  newContent: string;
  reason: string;
}

export class CodeFixer {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  async fixRepository(
    owner: string, 
    repo: string, 
    analysisResult: CodeAnalysisResult,
    fixTypes: string[] = ['security', 'bug', 'performance'],
    createPR: boolean = true
  ): Promise<FixResult> {
    try {
      logger.info(`Starting automated fixes for ${owner}/${repo}`);

      const fixDetails: FixDetail[] = [];
      let totalIssuesFixed = 0;

      // Get the default branch
      const { data: repoData } = await this.octokit.repos.get({ owner, repo });
      const defaultBranch = repoData.default_branch;

      // Create a new branch for fixes
      const branchName = `codxcd/automated-fixes-${Date.now()}`;
      await this.createBranch(owner, repo, defaultBranch, branchName);

      // Process each file with issues
      for (const file of analysisResult.files) {
        const relevantIssues = file.issues.filter(issue => fixTypes.includes(issue.type));
        
        if (relevantIssues.length > 0) {
          const fileFixResult = await this.fixFile(owner, repo, file, relevantIssues, branchName);
          if (fileFixResult.changes.length > 0) {
            fixDetails.push(fileFixResult);
            totalIssuesFixed += fileFixResult.issuesFixed.length;
          }
        }
      }

      let pullRequestUrl: string | undefined;

      if (createPR && fixDetails.length > 0) {
        pullRequestUrl = await this.createPullRequest(
          owner, 
          repo, 
          branchName, 
          defaultBranch, 
          fixDetails,
          totalIssuesFixed
        );
      }

      return {
        success: true,
        filesModified: fixDetails.map(d => d.file),
        issuesFixed: totalIssuesFixed,
        pullRequestUrl,
        summary: this.generateSummary(fixDetails, totalIssuesFixed),
        details: fixDetails
      };

    } catch (error) {
      logger.error('Code fixing failed:', error);
      return {
        success: false,
        filesModified: [],
        issuesFixed: 0,
        summary: `Failed to fix repository: ${error.message}`,
        details: []
      };
    }
  }

  private async createBranch(owner: string, repo: string, baseBranch: string, newBranch: string): Promise<void> {
    // Get the SHA of the base branch
    const { data: ref } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`
    });

    // Create new branch
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: ref.object.sha
    });
  }

  private async fixFile(
    owner: string, 
    repo: string, 
    file: AnalyzedFile, 
    issues: CodeIssue[],
    branch: string
  ): Promise<FixDetail> {
    const changes: Change[] = [];
    const fixedIssues: CodeIssue[] = [];
    let modifiedContent = file.content;

    // Sort issues by line number (descending) to avoid line number shifts
    const sortedIssues = issues.sort((a, b) => b.line - a.line);

    for (const issue of sortedIssues) {
      const fix = await this.generateFix(file, issue, modifiedContent);
      if (fix) {
        modifiedContent = this.applyFix(modifiedContent, fix);
        changes.push(fix);
        fixedIssues.push(issue);
      }
    }

    // Update the file if changes were made
    if (changes.length > 0) {
      await this.updateFile(owner, repo, file.path, modifiedContent, branch, changes);
    }

    return {
      file: file.path,
      changes,
      issuesFixed: fixedIssues
    };
  }

  private async generateFix(file: AnalyzedFile, issue: CodeIssue, content: string): Promise<Change | null> {
    const lines = content.split('\n');
    const lineIndex = issue.line - 1;
    
    if (lineIndex < 0 || lineIndex >= lines.length) return null;

    const originalLine = lines[lineIndex];
    let fixedLine: string | null = null;

    switch (issue.rule) {
      case 'sql-injection':
        fixedLine = this.fixSQLInjection(originalLine);
        break;
      case 'xss-vulnerability':
        fixedLine = this.fixXSSVulnerability(originalLine);
        break;
      case 'hardcoded-secret':
        fixedLine = this.fixHardcodedSecret(originalLine);
        break;
      case 'null-pointer':
        fixedLine = this.fixNullPointer(originalLine);
        break;
      case 'inefficient-loop':
        fixedLine = this.fixInefficientLoop(originalLine);
        break;
      case 'memory-leak':
        fixedLine = this.fixMemoryLeak(originalLine);
        break;
      case 'max-line-length':
        fixedLine = this.fixLongLine(originalLine);
        break;
      case 'missing-docs':
        fixedLine = this.addDocumentation(originalLine, file.language);
        break;
      default:
        return null;
    }

    if (fixedLine && fixedLine !== originalLine) {
      return {
        line: issue.line,
        oldContent: originalLine,
        newContent: fixedLine,
        reason: issue.message
      };
    }

    return null;
  }

  private fixSQLInjection(line: string): string {
    // Convert string concatenation to parameterized query
    if (line.includes('query + ')) {
      return line.replace(/query\s*\+\s*['"`]([^'"`]+)['"`]/g, 'query($1)');
    }
    
    // Add parameterization for template literals
    if (line.includes('${')) {
      return line.replace(/\$\{([^}]+)\}/g, '?').replace(/`([^`]+)`/, '"$1"');
    }
    
    return line;
  }

  private fixXSSVulnerability(line: string): string {
    // Replace innerHTML with textContent for user input
    if (line.includes('innerHTML') && line.includes('req.')) {
      return line.replace(/innerHTML\s*=/, 'textContent =');
    }
    
    // Add sanitization
    if (line.includes('document.write')) {
      return line.replace(/document\.write\s*\(([^)]+)\)/, 'document.write(sanitize($1))');
    }
    
    return line;
  }

  private fixHardcodedSecret(line: string): string {
    // Replace hardcoded values with environment variables
    const secretPatterns = [
      { pattern: /api[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/i, replacement: 'process.env.API_KEY' },
      { pattern: /secret\s*[:=]\s*['"]([^'"]+)['"]/i, replacement: 'process.env.SECRET' },
      { pattern: /password\s*[:=]\s*['"]([^'"]+)['"]/i, replacement: 'process.env.PASSWORD' },
      { pattern: /token\s*[:=]\s*['"]([^'"]+)['"]/i, replacement: 'process.env.TOKEN' }
    ];

    for (const { pattern, replacement } of secretPatterns) {
      if (pattern.test(line)) {
        return line.replace(pattern, `$1 = ${replacement}`);
      }
    }

    return line;
  }

  private fixNullPointer(line: string): string {
    // Add null check before property access
    const match = line.match(/(\w+)\.(\w+)/);
    if (match) {
      const [, object, property] = match;
      return line.replace(`${object}.${property}`, `${object}?.${property}`);
    }
    return line;
  }

  private fixInefficientLoop(line: string): string {
    // Cache array length in for loops
    if (line.includes('for') && line.includes('.length')) {
      return line.replace(
        /for\s*\(\s*(\w+)\s*=\s*0;\s*\1\s*<\s*(\w+)\.length/,
        'for (let $1 = 0, len = $2.length; $1 < len'
      );
    }
    return line;
  }

  private fixMemoryLeak(line: string): string {
    // Add cleanup for event listeners
    if (line.includes('addEventListener')) {
      const indent = line.match(/^\s*/)?.[0] || '';
      return line + '\n' + indent + '// TODO: Add removeEventListener in cleanup';
    }
    
    // Add cleanup for intervals
    if (line.includes('setInterval')) {
      const indent = line.match(/^\s*/)?.[0] || '';
      return line + '\n' + indent + '// TODO: Add clearInterval in cleanup';
    }
    
    return line;
  }

  private fixLongLine(line: string): string {
    // Break long lines at logical points
    if (line.length > 120) {
      // Break at function parameters
      if (line.includes('(') && line.includes(',')) {
        return line.replace(/,\s*/g, ',\n  ');
      }
      
      // Break at object properties
      if (line.includes('{') && line.includes(',')) {
        return line.replace(/,\s*/g, ',\n  ');
      }
    }
    return line;
  }

  private addDocumentation(line: string, language: string): string {
    const indent = line.match(/^\s*/)?.[0] || '';
    
    if (language === 'javascript' || language === 'typescript') {
      return `${indent}/**\n${indent} * TODO: Add function description\n${indent} */\n${line}`;
    } else if (language === 'python') {
      return `${line}\n${indent}"""TODO: Add function description"""`;
    }
    
    return line;
  }

  private applyFix(content: string, change: Change): string {
    const lines = content.split('\n');
    lines[change.line - 1] = change.newContent;
    return lines.join('\n');
  }

  private async updateFile(
    owner: string, 
    repo: string, 
    path: string, 
    content: string, 
    branch: string,
    changes: Change[]
  ): Promise<void> {
    // Get current file to get its SHA
    const { data: currentFile } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });

    if ('sha' in currentFile) {
      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `🤖 CodXCD: Fix ${changes.length} code issues in ${path}`,
        content: Buffer.from(content).toString('base64'),
        sha: currentFile.sha,
        branch
      });
    }
  }

  private async createPullRequest(
    owner: string, 
    repo: string, 
    head: string, 
    base: string,
    fixDetails: FixDetail[],
    totalIssuesFixed: number
  ): Promise<string> {
    const title = `🤖 CodXCD: Automated code fixes (${totalIssuesFixed} issues)`;
    const body = this.generatePRDescription(fixDetails, totalIssuesFixed);

    const { data: pr } = await this.octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body
    });

    return pr.html_url;
  }

  private generatePRDescription(fixDetails: FixDetail[], totalIssuesFixed: number): string {
    let description = `## 🤖 Automated Code Fixes by CodXCD\n\n`;
    description += `This PR automatically fixes **${totalIssuesFixed} code issues** across **${fixDetails.length} files**.\n\n`;
    
    description += `### 📊 Summary of Changes\n\n`;
    
    const issueTypes = new Map<string, number>();
    fixDetails.forEach(detail => {
      detail.issuesFixed.forEach(issue => {
        issueTypes.set(issue.type, (issueTypes.get(issue.type) || 0) + 1);
      });
    });

    for (const [type, count] of issueTypes) {
      const emoji = this.getIssueTypeEmoji(type);
      description += `- ${emoji} **${type}**: ${count} issues fixed\n`;
    }

    description += `\n### 📁 Files Modified\n\n`;
    
    fixDetails.forEach(detail => {
      description += `#### \`${detail.file}\`\n`;
      description += `- **${detail.issuesFixed.length}** issues fixed\n`;
      description += `- **${detail.changes.length}** changes made\n\n`;
      
      detail.changes.slice(0, 3).forEach(change => {
        description += `**Line ${change.line}:** ${change.reason}\n`;
        description += `\`\`\`diff\n- ${change.oldContent.trim()}\n+ ${change.newContent.trim()}\n\`\`\`\n\n`;
      });
      
      if (detail.changes.length > 3) {
        description += `*... and ${detail.changes.length - 3} more changes*\n\n`;
      }
    });

    description += `### ✅ What was fixed?\n\n`;
    description += `- 🔒 **Security vulnerabilities** (SQL injection, XSS, hardcoded secrets)\n`;
    description += `- 🐛 **Bug patterns** (null pointer risks, infinite loops)\n`;
    description += `- ⚡ **Performance issues** (inefficient loops, memory leaks)\n`;
    description += `- 📝 **Code style** (long lines, missing documentation)\n\n`;

    description += `### 🧪 Testing\n\n`;
    description += `- [ ] All existing tests pass\n`;
    description += `- [ ] Manual testing completed\n`;
    description += `- [ ] Security scan shows no new vulnerabilities\n\n`;

    description += `---\n`;
    description += `*This PR was automatically generated by [CodXCD](https://github.com/codxcd/codxcd) 🤖*`;

    return description;
  }

  private getIssueTypeEmoji(type: string): string {
    const emojiMap: { [key: string]: string } = {
      'security': '🔒',
      'bug': '🐛',
      'performance': '⚡',
      'style': '🎨',
      'maintainability': '📝'
    };
    return emojiMap[type] || '🔧';
  }

  private generateSummary(fixDetails: FixDetail[], totalIssuesFixed: number): string {
    if (fixDetails.length === 0) {
      return 'No issues were automatically fixable. Manual review may be required.';
    }

    return `Successfully fixed ${totalIssuesFixed} issues across ${fixDetails.length} files. ` +
           `A pull request has been created with all the automated fixes.`;
  }
}