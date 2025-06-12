import { Octokit } from '@octokit/rest';
import { CodeAnalyzer, CodeAnalysisResult } from './codeAnalyzer';
import { CodeFixer, FixResult } from './codeFixer';
import { createLogger } from '../utils/logger';

const logger = createLogger();

export interface AICodeRequest {
  type: 'analyze' | 'fix' | 'refactor' | 'optimize' | 'modernize' | 'document';
  scope: 'file' | 'folder' | 'repository';
  target: string; // file path, folder path, or 'all'
  instructions?: string;
  options?: {
    createPR?: boolean;
    fixTypes?: string[];
    aggressive?: boolean;
  };
}

export interface AICodeResponse {
  success: boolean;
  type: string;
  summary: string;
  details: any;
  actions: CodeAction[];
  pullRequestUrl?: string;
  estimatedTime?: string;
}

export interface CodeAction {
  type: 'fix' | 'refactor' | 'optimize' | 'document';
  description: string;
  files: string[];
  priority: 'low' | 'medium' | 'high';
  automated: boolean;
}

export class AICodeAssistant {
  private octokit: Octokit;
  private analyzer: CodeAnalyzer;
  private fixer: CodeFixer;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
    this.analyzer = new CodeAnalyzer(octokit);
    this.fixer = new CodeFixer(octokit);
  }

  async processCodeRequest(
    owner: string,
    repo: string,
    request: AICodeRequest
  ): Promise<AICodeResponse> {
    try {
      logger.info(`Processing AI code request: ${request.type} for ${owner}/${repo}`);

      switch (request.type) {
        case 'analyze':
          return await this.analyzeCode(owner, repo, request);
        case 'fix':
          return await this.fixCode(owner, repo, request);
        case 'refactor':
          return await this.refactorCode(owner, repo, request);
        case 'optimize':
          return await this.optimizeCode(owner, repo, request);
        case 'modernize':
          return await this.modernizeCode(owner, repo, request);
        case 'document':
          return await this.documentCode(owner, repo, request);
        default:
          throw new Error(`Unknown request type: ${request.type}`);
      }
    } catch (error) {
      logger.error('AI code request failed:', error);
      return {
        success: false,
        type: request.type,
        summary: `Failed to process ${request.type} request: ${error.message}`,
        details: { error: error.message },
        actions: []
      };
    }
  }

  private async analyzeCode(owner: string, repo: string, request: AICodeRequest): Promise<AICodeResponse> {
    const analysisResult = await this.analyzer.analyzeRepository(owner, repo, request.target);
    
    const actions: CodeAction[] = [];
    
    // Generate actionable recommendations
    if (analysisResult.issues.length > 0) {
      const criticalIssues = analysisResult.issues.filter(i => i.severity === 'critical');
      const securityIssues = analysisResult.issues.filter(i => i.type === 'security');
      const performanceIssues = analysisResult.issues.filter(i => i.type === 'performance');

      if (criticalIssues.length > 0) {
        actions.push({
          type: 'fix',
          description: `Fix ${criticalIssues.length} critical issues immediately`,
          files: [...new Set(criticalIssues.map(i => analysisResult.files.find(f => f.issues.includes(i))?.path).filter(Boolean))],
          priority: 'high',
          automated: true
        });
      }

      if (securityIssues.length > 0) {
        actions.push({
          type: 'fix',
          description: `Address ${securityIssues.length} security vulnerabilities`,
          files: [...new Set(securityIssues.map(i => analysisResult.files.find(f => f.issues.includes(i))?.path).filter(Boolean))],
          priority: 'high',
          automated: true
        });
      }

      if (performanceIssues.length > 0) {
        actions.push({
          type: 'optimize',
          description: `Optimize ${performanceIssues.length} performance bottlenecks`,
          files: [...new Set(performanceIssues.map(i => analysisResult.files.find(f => f.issues.includes(i))?.path).filter(Boolean))],
          priority: 'medium',
          automated: true
        });
      }
    }

    // Check for refactoring opportunities
    if (analysisResult.complexity.cyclomaticComplexity > 10) {
      actions.push({
        type: 'refactor',
        description: 'Reduce code complexity through refactoring',
        files: analysisResult.files.filter(f => this.calculateFileComplexity(f) > 15).map(f => f.path),
        priority: 'medium',
        automated: false
      });
    }

    // Check for documentation needs
    const undocumentedFiles = analysisResult.files.filter(f => 
      f.issues.some(i => i.rule === 'missing-docs')
    );
    
    if (undocumentedFiles.length > 0) {
      actions.push({
        type: 'document',
        description: `Add documentation to ${undocumentedFiles.length} files`,
        files: undocumentedFiles.map(f => f.path),
        priority: 'low',
        automated: true
      });
    }

    return {
      success: true,
      type: 'analyze',
      summary: this.generateAnalysisSummary(analysisResult),
      details: analysisResult,
      actions,
      estimatedTime: this.estimateAnalysisTime(analysisResult)
    };
  }

  private async fixCode(owner: string, repo: string, request: AICodeRequest): Promise<AICodeResponse> {
    // First analyze the code
    const analysisResult = await this.analyzer.analyzeRepository(owner, repo, request.target);
    
    // Then fix the issues
    const fixTypes = request.options?.fixTypes || ['security', 'bug', 'performance'];
    const createPR = request.options?.createPR !== false;
    
    const fixResult = await this.fixer.fixRepository(owner, repo, analysisResult, fixTypes, createPR);

    const actions: CodeAction[] = [];
    
    if (!fixResult.success) {
      actions.push({
        type: 'fix',
        description: 'Manual intervention required for complex issues',
        files: analysisResult.files.map(f => f.path),
        priority: 'high',
        automated: false
      });
    }

    return {
      success: fixResult.success,
      type: 'fix',
      summary: fixResult.summary,
      details: fixResult,
      actions,
      pullRequestUrl: fixResult.pullRequestUrl,
      estimatedTime: this.estimateFixTime(fixResult)
    };
  }

  private async refactorCode(owner: string, repo: string, request: AICodeRequest): Promise<AICodeResponse> {
    const analysisResult = await this.analyzer.analyzeRepository(owner, repo, request.target);
    
    // Identify refactoring opportunities
    const complexFiles = analysisResult.files.filter(f => this.calculateFileComplexity(f) > 15);
    const duplicateCode = this.findDuplicateCode(analysisResult.files);
    const longMethods = this.findLongMethods(analysisResult.files);

    const actions: CodeAction[] = [];

    if (complexFiles.length > 0) {
      actions.push({
        type: 'refactor',
        description: `Simplify ${complexFiles.length} complex files`,
        files: complexFiles.map(f => f.path),
        priority: 'medium',
        automated: false
      });
    }

    if (duplicateCode.length > 0) {
      actions.push({
        type: 'refactor',
        description: `Extract ${duplicateCode.length} duplicate code blocks`,
        files: duplicateCode,
        priority: 'medium',
        automated: false
      });
    }

    if (longMethods.length > 0) {
      actions.push({
        type: 'refactor',
        description: `Break down ${longMethods.length} long methods`,
        files: longMethods,
        priority: 'low',
        automated: false
      });
    }

    return {
      success: true,
      type: 'refactor',
      summary: `Identified ${actions.length} refactoring opportunities`,
      details: { complexFiles, duplicateCode, longMethods },
      actions,
      estimatedTime: '2-4 hours'
    };
  }

  private async optimizeCode(owner: string, repo: string, request: AICodeRequest): Promise<AICodeResponse> {
    const analysisResult = await this.analyzer.analyzeRepository(owner, repo, request.target);
    
    const performanceIssues = analysisResult.issues.filter(i => i.type === 'performance');
    const optimizationOpportunities = this.findOptimizationOpportunities(analysisResult.files);

    const actions: CodeAction[] = [];

    if (performanceIssues.length > 0) {
      actions.push({
        type: 'optimize',
        description: `Fix ${performanceIssues.length} performance issues`,
        files: [...new Set(performanceIssues.map(i => analysisResult.files.find(f => f.issues.includes(i))?.path).filter(Boolean))],
        priority: 'high',
        automated: true
      });
    }

    optimizationOpportunities.forEach(opportunity => {
      actions.push({
        type: 'optimize',
        description: opportunity.description,
        files: opportunity.files,
        priority: opportunity.priority,
        automated: opportunity.automated
      });
    });

    return {
      success: true,
      type: 'optimize',
      summary: `Found ${actions.length} optimization opportunities`,
      details: { performanceIssues, optimizationOpportunities },
      actions,
      estimatedTime: '1-3 hours'
    };
  }

  private async modernizeCode(owner: string, repo: string, request: AICodeRequest): Promise<AICodeResponse> {
    const analysisResult = await this.analyzer.analyzeRepository(owner, repo, request.target);
    
    const modernizationOpportunities = this.findModernizationOpportunities(analysisResult.files);
    
    const actions: CodeAction[] = modernizationOpportunities.map(opportunity => ({
      type: 'refactor',
      description: opportunity.description,
      files: opportunity.files,
      priority: 'medium',
      automated: opportunity.automated
    }));

    return {
      success: true,
      type: 'modernize',
      summary: `Found ${actions.length} modernization opportunities`,
      details: { modernizationOpportunities },
      actions,
      estimatedTime: '4-8 hours'
    };
  }

  private async documentCode(owner: string, repo: string, request: AICodeRequest): Promise<AICodeResponse> {
    const analysisResult = await this.analyzer.analyzeRepository(owner, repo, request.target);
    
    const undocumentedFunctions = analysisResult.files.filter(f => 
      f.issues.some(i => i.rule === 'missing-docs')
    );

    const actions: CodeAction[] = [];

    if (undocumentedFunctions.length > 0) {
      actions.push({
        type: 'document',
        description: `Add documentation to ${undocumentedFunctions.length} files`,
        files: undocumentedFunctions.map(f => f.path),
        priority: 'low',
        automated: true
      });
    }

    // Generate documentation automatically
    const documentationResult = await this.generateDocumentation(owner, repo, undocumentedFunctions);

    return {
      success: true,
      type: 'document',
      summary: `Generated documentation for ${undocumentedFunctions.length} files`,
      details: documentationResult,
      actions,
      pullRequestUrl: documentationResult.pullRequestUrl,
      estimatedTime: '30 minutes'
    };
  }

  // Helper methods
  private calculateFileComplexity(file: any): number {
    const lines = file.content.split('\n');
    let complexity = 1;

    for (const line of lines) {
      if (/if\s*\(|while\s*\(|for\s*\(|switch\s*\(/.test(line)) {
        complexity++;
      }
    }

    return complexity;
  }

  private findDuplicateCode(files: any[]): string[] {
    // Simplified duplicate detection
    const codeBlocks = new Map<string, string[]>();
    
    files.forEach(file => {
      const lines = file.content.split('\n');
      for (let i = 0; i < lines.length - 5; i++) {
        const block = lines.slice(i, i + 5).join('\n').trim();
        if (block.length > 50) {
          if (!codeBlocks.has(block)) {
            codeBlocks.set(block, []);
          }
          codeBlocks.get(block)!.push(file.path);
        }
      }
    });

    const duplicateFiles = new Set<string>();
    codeBlocks.forEach((filePaths, block) => {
      if (filePaths.length > 1) {
        filePaths.forEach(path => duplicateFiles.add(path));
      }
    });

    return Array.from(duplicateFiles);
  }

  private findLongMethods(files: any[]): string[] {
    const longMethodFiles: string[] = [];
    
    files.forEach(file => {
      const lines = file.content.split('\n');
      let inFunction = false;
      let functionLength = 0;
      
      for (const line of lines) {
        if (/function\s+\w+|const\s+\w+\s*=\s*\(/.test(line)) {
          inFunction = true;
          functionLength = 0;
        } else if (inFunction && line.trim() === '}') {
          if (functionLength > 50) {
            longMethodFiles.push(file.path);
            break;
          }
          inFunction = false;
        } else if (inFunction) {
          functionLength++;
        }
      }
    });

    return longMethodFiles;
  }

  private findOptimizationOpportunities(files: any[]): any[] {
    const opportunities = [];

    // Check for inefficient algorithms
    files.forEach(file => {
      if (file.content.includes('nested loop') || /for.*for/.test(file.content)) {
        opportunities.push({
          description: 'Optimize nested loops',
          files: [file.path],
          priority: 'high' as const,
          automated: false
        });
      }

      if (file.content.includes('.map(').includes('.filter(')) {
        opportunities.push({
          description: 'Combine map and filter operations',
          files: [file.path],
          priority: 'medium' as const,
          automated: true
        });
      }
    });

    return opportunities;
  }

  private findModernizationOpportunities(files: any[]): any[] {
    const opportunities = [];

    files.forEach(file => {
      if (file.content.includes('var ')) {
        opportunities.push({
          description: 'Replace var with let/const',
          files: [file.path],
          automated: true
        });
      }

      if (file.content.includes('function(') && !file.content.includes('=>')) {
        opportunities.push({
          description: 'Convert to arrow functions',
          files: [file.path],
          automated: true
        });
      }

      if (file.content.includes('.indexOf(') && !file.content.includes('.includes(')) {
        opportunities.push({
          description: 'Replace indexOf with includes',
          files: [file.path],
          automated: true
        });
      }
    });

    return opportunities;
  }

  private async generateDocumentation(owner: string, repo: string, files: any[]): Promise<any> {
    // This would integrate with AI services to generate documentation
    return {
      filesDocumented: files.length,
      pullRequestUrl: undefined // Would create PR with documentation
    };
  }

  private generateAnalysisSummary(result: CodeAnalysisResult): string {
    const { files, issues, complexity } = result;
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const securityIssues = issues.filter(i => i.type === 'security').length;
    
    return `Analyzed ${files.length} files with ${issues.length} total issues. ` +
           `Found ${criticalIssues} critical issues and ${securityIssues} security vulnerabilities. ` +
           `Code complexity: ${complexity.cyclomaticComplexity.toFixed(1)}, ` +
           `Maintainability: ${complexity.maintainabilityIndex.toFixed(1)}/100`;
  }

  private estimateAnalysisTime(result: CodeAnalysisResult): string {
    const fileCount = result.files.length;
    if (fileCount < 10) return '1-2 minutes';
    if (fileCount < 50) return '5-10 minutes';
    if (fileCount < 200) return '15-30 minutes';
    return '30-60 minutes';
  }

  private estimateFixTime(result: FixResult): string {
    const issueCount = result.issuesFixed;
    if (issueCount < 5) return '5-10 minutes';
    if (issueCount < 20) return '15-30 minutes';
    if (issueCount < 50) return '30-60 minutes';
    return '1-2 hours';
  }
}