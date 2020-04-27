import { RuleTester as ESLintRuleTester } from 'eslint';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '../ts-estree';
import { ParserOptions } from './ParserOptions';
import { RuleModule } from './Rule';

interface EnvTestOptions {
  browser?: boolean;
  es6?: boolean;
}

interface ValidTestCase<TOptions extends Readonly<unknown[]>> {
  code: string;
  options?: TOptions;
  filename?: string;
  parserOptions?: ParserOptions;
  settings?: Record<string, unknown>;
  parser?: string;
  globals?: Record<string, boolean>;
  env?: EnvTestOptions;
}

interface SuggestionOutput<TMessageIds extends string> {
  messageId: TMessageIds;
  data?: Record<string, unknown>;
  /**
   * NOTE: Suggestions will be applied as a stand-alone change, without triggering multi-pass fixes.
   * Each individual error has its own suggestion, so you have to show the correct, _isolated_ output for each suggestion.
   */
  output: string;
  // we disallow this because it's much better to use messageIds for reusable errors that are easily testable
  // desc?: string;
}

interface InvalidTestCase<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>
> extends ValidTestCase<TOptions> {
  errors: TestCaseError<TMessageIds>[];
  output?: string | null;
}

interface TestCaseError<TMessageIds extends string> {
  messageId: TMessageIds;
  // we disallow this because it's much better to use messageIds for reusable errors that are easily testable
  // message?: string;
  data?: Record<string, unknown>;
  type?: AST_NODE_TYPES | AST_TOKEN_TYPES;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  suggestions?: SuggestionOutput<TMessageIds>[] | null;
}

interface RunTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>
> {
  // RuleTester.run also accepts strings for valid cases
  valid: (ValidTestCase<TOptions> | string)[];
  invalid: InvalidTestCase<TMessageIds, TOptions>[];
}
interface RuleTesterConfig {
  env?: EnvTestOptions;
  // should be require.resolve(parserPackageName)
  parser: string;
  parserOptions?: ParserOptions;
}

// the cast on the extends is so that we don't want to have the built type defs to attempt to import eslint
class RuleTester extends (ESLintRuleTester as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: unknown[]): any;
}) {
  constructor(config?: RuleTesterConfig) {
    super(config);

    // nobody will ever need watching in tests
    // so we can give everyone a perf win by disabling watching
    if (config?.parserOptions?.project) {
      config.parserOptions.noWatch =
        typeof config.parserOptions.noWatch === 'boolean' || true;
    }
  }

  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule: RuleModule<TMessageIds, TOptions>,
    tests: RunTests<TMessageIds, TOptions>,
  ): void {
    // this method is only defined here because we lazily type the eslint import with `any`
    super.run(name, rule, tests);
  }
}

export {
  EnvTestOptions,
  InvalidTestCase,
  RuleTester,
  RuleTesterConfig,
  RunTests,
  SuggestionOutput,
  TestCaseError,
  ValidTestCase,
};
