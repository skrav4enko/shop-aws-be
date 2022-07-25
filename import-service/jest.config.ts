import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.paths.json";
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};

module.exports = config;
