import { confirm, input } from "@inquirer/prompts";
import { $, resolveSync, write } from "bun";

async function main() {
    console.log("papi");
    const projectName = await input({ message: "Enter your project name:" });

    const rhf = await confirm({ message: "Include React Hook Form?" });
    // const uiLib = await select({
    //     message: "Choose a UI library",
    //     choices: [
    //         { name: "Radix UI", value: "radix" },
    //         { name: "Mantine", value: "mantine" },
    //     ],
    // });

    const projectPath = resolveSync(projectName, process.cwd());
    const templatePath = resolveSync("../template", import.meta.dir);

    console.log("smack");
    await write(projectPath, templatePath);

    console.log("my");
    await $`cd ${projectPath} && bun install`

    if (rhf) {
        await $`cd ${projectPath} && bun add react-hook-form`
    }

    console.log("ass");
    await $`cd ${projectPath} && git init && git add . && git commot -m "Initial Commit"`

    console.log("Like a drum");
}

main();