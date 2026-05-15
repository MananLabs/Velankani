import chalk from 'chalk';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private static readonly colors = {
    debug: chalk.gray,
    info: chalk.cyan,
    warn: chalk.yellow,
    error: chalk.red,
  };

  static debug(message: string): void {
    console.log(Logger.colors.debug(`[DEBUG] ${message}`));
  }

  static info(message: string): void {
    console.log(Logger.colors.info(`[INFO] ${message}`));
  }

  static warn(message: string): void {
    console.log(Logger.colors.warn(`[WARN] ${message}`));
  }

  static error(message: string): void {
    console.log(Logger.colors.error(`[ERROR] ${message}`));
  }

  static success(message: string): void {
    console.log(chalk.green(`✓ ${message}`));
  }

  static gptResponse(
    content: string,
    responseTime: number,
    reasoningTokens?: number,
  ): void {
    console.log('\n' + chalk.green.bold('════════════════════════════════════════'));
    console.log(
      chalk.green.bold('GPT RESPONSE') +
        chalk.gray(` (${responseTime.toFixed(2)}s)`),
    );
    console.log(chalk.green.bold('════════════════════════════════════════'));
    if (reasoningTokens !== undefined) {
      console.log(chalk.gray(`Reasoning tokens: ${reasoningTokens}`));
      console.log();
    }
    console.log(content);
    console.log();
  }

  static geminiResponse(
    content: string,
    responseTime: number,
    reasoningTokens?: number,
  ): void {
    console.log('\n' + chalk.blue.bold('════════════════════════════════════════'));
    console.log(
      chalk.blue.bold('GEMINI RESPONSE') +
        chalk.gray(` (${responseTime.toFixed(2)}s)`),
    );
    console.log(chalk.blue.bold('════════════════════════════════════════'));
    if (reasoningTokens !== undefined) {
      console.log(chalk.gray(`Reasoning tokens: ${reasoningTokens}`));
      console.log();
    }
    console.log(content);
    console.log();
  }

  static claudeResponse(
    content: string,
    responseTime: number,
    reasoningTokens?: number,
  ): void {
    console.log('\n' + chalk.magenta.bold('════════════════════════════════════════'));
    console.log(
      chalk.magenta.bold('CLAUDE RESPONSE') +
        chalk.gray(` (${responseTime.toFixed(2)}s)`),
    );
    console.log(chalk.magenta.bold('════════════════════════════════════════'));
    if (reasoningTokens !== undefined) {
      console.log(chalk.gray(`Reasoning tokens: ${reasoningTokens}`));
      console.log();
    }
    console.log(content);
    console.log();
  }

  static errorResponse(
    modelName: string,
    errorMessage: string,
    responseTime: number,
  ): void {
    const color =
      modelName === 'GPT' ? chalk.red : modelName === 'Gemini' ? chalk.red : chalk.red;
    console.log('\n' + color.bold('════════════════════════════════════════'));
    console.log(color.bold(`${modelName} ERROR`) + chalk.gray(` (${responseTime.toFixed(2)}s)`));
    console.log(color.bold('════════════════════════════════════════'));
    console.log(chalk.red(`✗ ${errorMessage}`));
  }
}
