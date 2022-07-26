import type { CompletionItem, TabtabEnv } from 'tabtab';
import { options, getFilteredPorts } from './main';

export default async function completion(env: TabtabEnv): Promise<CompletionItem[] | string[] | undefined> {
  if (env.words == 2) {
    return Object.keys(options).map((key) => ({
      name: `--${key}`,
      description: options[key as keyof (typeof options)].help,
    }));
  } else if (env.prev == '--path' || env.prev == '-p') {
    return (await getFilteredPorts()).map((port) => port.path);
  }
}
