import { resolve, sep } from 'path';

/**
 * getProjectDirectory
 *
 * @param {string} filename
 * @returns {string}
 */
function getProjectDirectory(filename) {
  const root = `${process.cwd()}${sep}`;
  const path = filename.replace(root, '');
  const directories = path.split(sep).slice(0, -1);
  const directory = directories.slice(0, 2).join(sep);
  const exclude = ['.vscode', '.github', 'node_modules'];
  const empty = directory.length === 0;
  const excluded = exclude.some((folder) => directory.startsWith(folder));

  if (empty || excluded) return resolve('./');

  return resolve(directory);
}

/**
 * getProjectDirectories
 *
 * @param {string[]} filenames
 * @returns {string[]}
 */
function getProjectDirectories(filenames) {
  const projects = new Set(filenames.map(getProjectDirectory));

  return Array.from(projects).filter(
    (filename) => filename !== import.meta.dirname,
  );
}

/**
 * getProjectDirectories
 *
 * @param {string[]} filenames
 * @returns {string[]}
 */
function getProjects(filenames) {
  const directories = getProjectDirectories(filenames);
  const projects = directories.map((project) => project.split(sep).pop());

  return projects;
}

/**
 * getProjectCommands
 *
 * @param {string[]} commands
 * @returns {string[]}
 */
function getProjectCommands(commands) {
  return ({ filenames }) => {
    const projects = getProjects(filenames);

    return commands.flatMap((command) =>
      projects.map((project) => `pnpm use ${project} ${command}`),
    );
  };
}

export default {
  '**/*.{js,mjs,cjs,ts,mts,cts,json,md,md}': () => [
    'pnpm lint',
    'pnpm format',
    'pnpm check:types:tsc',
  ],
  '**/*.{js,mjs,cjs,ts,mts,cts,json,md}': getProjectCommands([
    'check:types',
    'test',
  ]),
};
