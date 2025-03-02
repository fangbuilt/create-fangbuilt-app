#!/usr/bin/env bun

import { confirm, input, select } from "@inquirer/prompts";
import { $, file, write } from "bun";
import path from "path";
import fs from "fs";

function copyDir(src: string, dest: string) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    for (const file of fs.readdirSync(src)) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function main() {
    console.log("Pass here 2", path.resolve(import.meta.dir, "../template"));
    const projectName = await input({ message: "Enter your project name:" });

    const rhf = await confirm({ message: "Include React Hook Form?" });
    const uiLib = await select({
        message: "Choose a UI library",
        choices: [
            { name: "Radix UI", value: "radix" },
            { name: "Mantine", value: "mantine" },
            { name: "None, just TailwindCSS", value: "none" },
        ],
    });

    const projectPath = path.resolve(process.cwd(), projectName);
    const templatePath = path.resolve(import.meta.dir, "../template");

    copyDir(templatePath, projectPath);

    try {
        console.log("Installing core dependencies...");
        await $`bun install`.cwd(projectPath);
        console.log("✅ Core dependencies installed");
    } catch (error) {
        console.error("❌ Installation error", error);
    }

    if (rhf) {
        try {
            console.log("Adding React Hook Form...");
            await $`bun add react-hook-form`.cwd(projectPath);
            console.log("✅ React Hook Form installed");
        } catch (error) {
            console.warn("⚠️ Failed to add React Hook Form", error);
        }
    }

    if (uiLib === "radix") {
        console.log("Radix selected");
    } else if (uiLib === "mantine") {
        console.log("Mantine selected");
    } else {
        console.log("TailwindCSS only");
    }

    try {
        console.log("Initializing Git...");
        await $`git init`.cwd(projectPath);
        console.log("✅ Git initialized");

        console.log("Staging files...");
        await $`git add . `.cwd(projectPath);
        console.log("✅ Files staged");

        console.log("Creating first commit message...");
        await $`git commit -m "Init"`.cwd(projectPath);
        console.log("✅ Initial commit created");
    } catch (error) {
        console.warn("⚠️ Git setup failed", error);
    }

    console.log("✅ Done! Try:");
    console.log(`cd ${projectPath}`);
    console.log("bun run dev");
}

main();