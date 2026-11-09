const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo support
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// The Expo app never imports from these sibling projects, and watching their
// node_modules makes Metro crash when another workspace runs an install.
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const blockedWorkspaces = ["apps/student-web", "web-dashboard", "contact-us", "backend"];
config.resolver.blockList = blockedWorkspaces.map(
  (workspace) =>
    new RegExp(`^${escapeRegExp(path.resolve(monorepoRoot, workspace))}[/\\\\].*$`)
);

module.exports = withNativeWind(config, {
  input: path.resolve(projectRoot, "global.css"),
  configPath: path.resolve(projectRoot, "tailwind.config.js"),
});
