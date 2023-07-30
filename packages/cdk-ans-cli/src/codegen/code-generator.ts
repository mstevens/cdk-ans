import { CodeMaker } from 'codemaker';
import { Language } from '../import/importer';
import { snakeToPascalCase } from '../utils';

export interface GenerateOptions {
  readonly classNamePrefix?: string;
}

export abstract class CodeGenerator {
  readonly name: string;
  readonly filename: string;
  readonly targetLanguage: Language;
  readonly prefix?: string;
  readonly constructName: string;

  constructor(name: string, targetLanguage: Language, prefix?: string) {
    this.name = name;
    this.targetLanguage = targetLanguage;
    this.filename = this.determineFilename(name, targetLanguage);
    this.prefix = prefix;
    this.constructName = snakeToPascalCase(this.name);
  }

  protected abstract writeModuleImports(code: CodeMaker): void;

  protected abstract writeConstructProps(code: CodeMaker, options: GenerateOptions): void;

  protected abstract writeConstruct(code: CodeMaker, options: GenerateOptions): void;

  protected writeDocumentationHeader(code: CodeMaker, description: string | string[]) {
    const lines: string[] = [];

    if (typeof description === 'string') {
      lines.push(description);
    } else {
      lines.push(...description);
    }

    code.line('/**');
    for (const line of lines) {
      code.line(` * ${line}`);
    }
    code.line(' */');
  }

  private writeImports(code: CodeMaker) {
    code.line('// Generated by cdk-ans');
    code.line('');
  }

  protected determineFilename(name: string, language: Language): string {
    let newName = name;
    switch (language) {
      case Language.PYTHON:
      case Language.JAVA:
        newName = name.split('.').reverse().join('.');
        break;
    }
    return newName;
  }

  async generate(code: CodeMaker, options: GenerateOptions): Promise<void> {
    this.writeImports(code);
    this.writeModuleImports(code);
    this.writeConstructProps(code, options);
    this.writeConstruct(code, options);
  }
}