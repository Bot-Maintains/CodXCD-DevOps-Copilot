import { Octokit } from '@octokit/rest';
import { createLogger } from '../utils/logger';

const logger = createLogger();

export interface CodeAnalysisResult {
  files: AnalyzedFile[];
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  complexity: ComplexityMetrics;
}

export interface AnalyzedFile {
  path: string;
  content: string;
  language: string;
  size: number;
  issues: CodeIssue[];
}

export interface CodeIssue {
  type: 'bug' | 'security' | 'performance' | 'style' | 'maintainability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  column?: number;
  message: string;
  suggestion?: string;
  rule?: string;
}

export interface CodeSuggestion {
  type: 'refactor' | 'optimize' | 'modernize' | 'security' | 'documentation';
  priority: 'low' | 'medium' | 'high';
  description: string;
  files: string[];
  estimatedEffort: string;
}

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  linesOfCode: number;
  technicalDebt: number;
  maintainabilityIndex: number;
  testCoverage?: number;
}

export class CodeAnalyzer {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  async analyzeRepository(owner: string, repo: string, path: string = ''): Promise<CodeAnalysisResult> {
    try {
      logger.info(`Starting code analysis for ${owner}/${repo}${path ? `/${path}` : ''}`);

      // Get repository contents
      const contents = await this.getRepositoryContents(owner, repo, path);
      const files = await this.analyzeFiles(contents, owner, repo);
      
      // Analyze code quality and issues
      const issues = await this.detectCodeIssues(files);
      const suggestions = await this.generateSuggestions(files, issues);
      const complexity = await this.calculateComplexity(files);

      return {
        files,
        issues,
        suggestions,
        complexity
      };
    } catch (error) {
      logger.error('Code analysis failed:', error);
      throw new Error(`Failed to analyze repository: ${error.message}`);
    }
  }

  private async getRepositoryContents(owner: string, repo: string, path: string): Promise<any[]> {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path
    });

    const contents = Array.isArray(data) ? data : [data];
    const allFiles = [];

    for (const item of contents) {
      if (item.type === 'file' && this.isCodeFile(item.name)) {
        allFiles.push(item);
      } else if (item.type === 'dir' && !this.isIgnoredDirectory(item.name)) {
        // Recursively get directory contents
        const subContents = await this.getRepositoryContents(owner, repo, item.path);
        allFiles.push(...subContents);
      }
    }

    return allFiles;
  }

  private async analyzeFiles(contents: any[], owner: string, repo: string): Promise<AnalyzedFile[]> {
    const files: AnalyzedFile[] = [];

    for (const item of contents) {
      if (item.type === 'file') {
        try {
          const { data } = await this.octokit.repos.getContent({
            owner,
            repo,
            path: item.path
          });

          if ('content' in data) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            const language = this.detectLanguage(item.name);
            
            files.push({
              path: item.path,
              content,
              language,
              size: data.size,
              issues: []
            });
          }
        } catch (error) {
          logger.warn(`Failed to analyze file ${item.path}:`, error);
        }
      }
    }

    return files;
  }

  private async detectCodeIssues(files: AnalyzedFile[]): Promise<CodeIssue[]> {
    const allIssues: CodeIssue[] = [];

    for (const file of files) {
      const issues = await this.analyzeFileIssues(file);
      allIssues.push(...issues);
      file.issues = issues;
    }

    return allIssues;
  }

  private async analyzeFileIssues(file: AnalyzedFile): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const lines = file.content.split('\n');

    // Security vulnerability detection
    issues.push(...this.detectSecurityIssues(file, lines));
    
    // Performance issues
    issues.push(...this.detectPerformanceIssues(file, lines));
    
    // Code style and maintainability
    issues.push(...this.detectStyleIssues(file, lines));
    
    // Bug patterns
    issues.push(...this.detectBugPatterns(file, lines));

    return issues;
  }

  private detectSecurityIssues(file: AnalyzedFile, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // SQL Injection patterns
      if (this.containsSQLInjectionPattern(trimmedLine)) {
        issues.push({
          type: 'security',
          severity: 'high',
          line: lineNumber,
          message: 'Potential SQL injection vulnerability detected',
          suggestion: 'Use parameterized queries or prepared statements',
          rule: 'sql-injection'
        });
      }

      // XSS patterns
      if (this.containsXSSPattern(trimmedLine)) {
        issues.push({
          type: 'security',
          severity: 'high',
          line: lineNumber,
          message: 'Potential XSS vulnerability detected',
          suggestion: 'Sanitize user input and use proper encoding',
          rule: 'xss-vulnerability'
        });
      }

      // Hardcoded secrets
      if (this.containsHardcodedSecret(trimmedLine)) {
        issues.push({
          type: 'security',
          severity: 'critical',
          line: lineNumber,
          message: 'Hardcoded secret or API key detected',
          suggestion: 'Move secrets to environment variables',
          rule: 'hardcoded-secret'
        });
      }
    });

    return issues;
  }

  private detectPerformanceIssues(file: AnalyzedFile, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // Inefficient loops
      if (this.isInefficientLoop(trimmedLine)) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          line: lineNumber,
          message: 'Potentially inefficient loop detected',
          suggestion: 'Consider using more efficient algorithms or data structures',
          rule: 'inefficient-loop'
        });
      }

      // Memory leaks
      if (this.hasMemoryLeakPattern(trimmedLine)) {
        issues.push({
          type: 'performance',
          severity: 'high',
          line: lineNumber,
          message: 'Potential memory leak detected',
          suggestion: 'Ensure proper cleanup of resources and event listeners',
          rule: 'memory-leak'
        });
      }
    });

    return issues;
  }

  private detectStyleIssues(file: AnalyzedFile, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Long lines
      if (line.length > 120) {
        issues.push({
          type: 'style',
          severity: 'low',
          line: lineNumber,
          message: 'Line too long (exceeds 120 characters)',
          suggestion: 'Break long lines for better readability',
          rule: 'max-line-length'
        });
      }

      // Missing documentation
      if (this.isFunctionDeclaration(line) && !this.hasDocumentation(lines, index)) {
        issues.push({
          type: 'maintainability',
          severity: 'medium',
          line: lineNumber,
          message: 'Function lacks documentation',
          suggestion: 'Add JSDoc or similar documentation',
          rule: 'missing-docs'
        });
      }
    });

    return issues;
  }

  private detectBugPatterns(file: AnalyzedFile, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // Null pointer dereference
      if (this.hasNullPointerRisk(trimmedLine)) {
        issues.push({
          type: 'bug',
          severity: 'high',
          line: lineNumber,
          message: 'Potential null pointer dereference',
          suggestion: 'Add null checks before accessing properties',
          rule: 'null-pointer'
        });
      }

      // Infinite loop risk
      if (this.hasInfiniteLoopRisk(trimmedLine, lines, index)) {
        issues.push({
          type: 'bug',
          severity: 'high',
          line: lineNumber,
          message: 'Potential infinite loop detected',
          suggestion: 'Ensure loop has proper exit condition',
          rule: 'infinite-loop'
        });
      }
    });

    return issues;
  }

  private async generateSuggestions(files: AnalyzedFile[], issues: CodeIssue[]): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];

    // Group issues by type and severity
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const securityIssues = issues.filter(i => i.type === 'security');
    const performanceIssues = issues.filter(i => i.type === 'performance');

    if (criticalIssues.length > 0) {
      suggestions.push({
        type: 'security',
        priority: 'high',
        description: `Fix ${criticalIssues.length} critical security issues`,
        files: [...new Set(criticalIssues.map(i => files.find(f => f.issues.includes(i))?.path).filter(Boolean))],
        estimatedEffort: '2-4 hours'
      });
    }

    if (performanceIssues.length > 5) {
      suggestions.push({
        type: 'optimize',
        priority: 'medium',
        description: 'Optimize performance bottlenecks',
        files: [...new Set(performanceIssues.map(i => files.find(f => f.issues.includes(i))?.path).filter(Boolean))],
        estimatedEffort: '4-8 hours'
      });
    }

    // Suggest modernization
    const oldPatterns = this.detectOldPatterns(files);
    if (oldPatterns.length > 0) {
      suggestions.push({
        type: 'modernize',
        priority: 'medium',
        description: 'Modernize codebase with latest best practices',
        files: oldPatterns,
        estimatedEffort: '1-2 days'
      });
    }

    return suggestions;
  }

  private async calculateComplexity(files: AnalyzedFile[]): Promise<ComplexityMetrics> {
    let totalComplexity = 0;
    let totalLines = 0;
    let totalIssues = 0;

    for (const file of files) {
      const complexity = this.calculateFileComplexity(file);
      totalComplexity += complexity;
      totalLines += file.content.split('\n').length;
      totalIssues += file.issues.length;
    }

    const avgComplexity = files.length > 0 ? totalComplexity / files.length : 0;
    const maintainabilityIndex = Math.max(0, 100 - (avgComplexity * 2) - (totalIssues * 0.5));

    return {
      cyclomaticComplexity: avgComplexity,
      linesOfCode: totalLines,
      technicalDebt: totalIssues,
      maintainabilityIndex
    };
  }

  private calculateFileComplexity(file: AnalyzedFile): number {
    const lines = file.content.split('\n');
    let complexity = 1; // Base complexity

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Count decision points
      if (this.isDecisionPoint(trimmedLine)) {
        complexity++;
      }
    }

    return complexity;
  }

  // Helper methods for pattern detection
  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  private isIgnoredDirectory(dirname: string): boolean {
    const ignoredDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '__pycache__'];
    return ignoredDirs.includes(dirname);
  }

  private detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    return languageMap[ext || ''] || 'unknown';
  }

  private containsSQLInjectionPattern(line: string): boolean {
    const patterns = [
      /query\s*\+\s*['"]/i,
      /execute\s*\(\s*['"]/i,
      /\$\{.*\}/,
      /\+\s*req\.(body|query|params)/i
    ];
    return patterns.some(pattern => pattern.test(line));
  }

  private containsXSSPattern(line: string): boolean {
    const patterns = [
      /innerHTML\s*=\s*.*req\./i,
      /document\.write\s*\(/i,
      /eval\s*\(/i,
      /dangerouslySetInnerHTML/i
    ];
    return patterns.some(pattern => pattern.test(line));
  }

  private containsHardcodedSecret(line: string): boolean {
    const patterns = [
      /api[_-]?key\s*[:=]\s*['"]/i,
      /secret\s*[:=]\s*['"]/i,
      /password\s*[:=]\s*['"]/i,
      /token\s*[:=]\s*['"]/i,
      /['"]\w{20,}['"]/
    ];
    return patterns.some(pattern => pattern.test(line));
  }

  private isInefficientLoop(line: string): boolean {
    return /for\s*\(.*\.length.*\)/.test(line) || /while\s*\(.*\.length/.test(line);
  }

  private hasMemoryLeakPattern(line: string): boolean {
    const patterns = [
      /addEventListener.*without.*removeEventListener/i,
      /setInterval.*without.*clearInterval/i,
      /setTimeout.*without.*clearTimeout/i
    ];
    return patterns.some(pattern => pattern.test(line));
  }

  private isFunctionDeclaration(line: string): boolean {
    const patterns = [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=\s*\(/,
      /\w+\s*:\s*function\s*\(/,
      /\w+\s*\([^)]*\)\s*{/
    ];
    return patterns.some(pattern => pattern.test(line));
  }

  private hasDocumentation(lines: string[], index: number): boolean {
    // Check previous lines for documentation
    for (let i = Math.max(0, index - 5); i < index; i++) {
      const line = lines[i].trim();
      if (line.includes('/**') || line.includes('//') || line.includes('#')) {
        return true;
      }
    }
    return false;
  }

  private hasNullPointerRisk(line: string): boolean {
    return /\w+\.\w+/.test(line) && !/if\s*\(.*\w+.*\)/.test(line);
  }

  private hasInfiniteLoopRisk(line: string, lines: string[], index: number): boolean {
    if (!/while\s*\(/.test(line) && !/for\s*\(/.test(line)) return false;
    
    // Check if there's a break or return statement in the loop
    for (let i = index + 1; i < Math.min(lines.length, index + 20); i++) {
      const nextLine = lines[i].trim();
      if (nextLine.includes('break') || nextLine.includes('return')) return false;
      if (nextLine === '}') break;
    }
    return true;
  }

  private isDecisionPoint(line: string): boolean {
    const patterns = [
      /if\s*\(/,
      /else\s*if\s*\(/,
      /while\s*\(/,
      /for\s*\(/,
      /switch\s*\(/,
      /case\s+/,
      /catch\s*\(/,
      /\?\s*.*:/
    ];
    return patterns.some(pattern => pattern.test(line));
  }

  private detectOldPatterns(files: AnalyzedFile[]): string[] {
    const oldPatternFiles: string[] = [];
    
    for (const file of files) {
      const hasOldPatterns = [
        /var\s+\w+/,  // var instead of let/const
        /function\s*\(/,  // function instead of arrow functions
        /\.indexOf\(/,  // indexOf instead of includes
        /new Promise\(/  // Promise constructor instead of async/await
      ].some(pattern => pattern.test(file.content));
      
      if (hasOldPatterns) {
        oldPatternFiles.push(file.path);
      }
    }
    
    return oldPatternFiles;
  }
}