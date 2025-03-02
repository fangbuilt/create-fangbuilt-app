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

    // await write(projectPath, file(templatePath));

    copyDir(templatePath, projectPath);

    await $`bun install`.cwd(projectPath);

    if (rhf) {
        await $`bun add react-hook-form`.cwd(projectPath);
    }

    if (uiLib === "radix") {
        console.log("Radix selected");
    } else if (uiLib === "mantine") {
        console.log("Mantine selected");
    } else {
        console.log("Okay");
    }

    await $`git init && git add . && git commit -m "Init"`.cwd(projectPath);
}

main();