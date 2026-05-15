import chalk from 'chalk';
import readline from 'readline';

export class Terminal {
  static readonly rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  static displayWelcome(): void {
    console.clear();
    console.log(chalk.bold.cyan('════════════════════════════════════════'));
    console.log(chalk.bold.cyan('   VEL AI TERMINAL'));
    console.log(chalk.bold.cyan('   Multi Model AI Backend'));
    console.log(chalk.bold.cyan('════════════════════════════════════════'));
    console.log();
    console.log(chalk.gray('Type your prompt and press Enter.'));
    console.log(chalk.gray('Type "exit" or "quit" to stop.'));
    console.log();
  }

  static async promptUser(): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(chalk.cyan('> '), (answer) => {
        resolve(answer.trim());
      });
    });
  }

  static showLoading(models: string[]): void {
    models.forEach((model) => {
      console.log(chalk.yellow(`⏳ Sending request to ${model}...`));
    });
    console.log();
  }

  static close(): void {
    this.rl.close();
  }
}
