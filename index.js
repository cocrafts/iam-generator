const Mustache = require('mustache');
const readlineSync = require('readline-sync');
const fs = require('fs')

const getFlag = (name, withValue = false) => {
  const flag = `--${name}` 
  const flagIndex = process.argv.findIndex(arg => arg === flag)
  if (flagIndex === -1) return false
  if (withValue) {
    if (flagIndex + 1 >= process.argv.length) throw Error("Missing value for flag: " + flag)
    return process.argv[flagIndex + 1]
  } else {
    return true
  }
}

const templates = [
    "sst_update_stack"
]

const templateFromFlag = getFlag("template", true)

let templateName
if (templateFromFlag) {
  if (!templates.includes(templateFromFlag)) throw Error(`Invalid template: ${templateFromFlag}, required: ${templates}`)
  templateName = templateFromFlag
} else {
  const templateIndex = readlineSync.keyInSelect(templates, "Choose a template: ")
  templateName = templates[templateIndex]
}

switch (templateName) {
  case "sst_update_stack": {
    const template = fs.readFileSync(`templates/sst_update_stack.json`, 'utf8')
    const configFile = getFlag("config", true)
    if (configFile) {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'))
      const account_id = config.account_id
      const region = config.region
      const project = config.sst_update_stack.project
      const stages = config.sst_update_stack.stages
      const stacks = config.sst_update_stack.stacks
      for (const stage of stages) {
        for (const stack of stacks) {
          const output = Mustache.render(template, {
            project, stage, stack_name: stack, stack_short_name: stack.substring(0, 6), account_id, region
          })
          fs.writeFileSync(`./output/sst_update_stack_${project}_${stage}_${stack}.json`, output)
        }
      }
    }
    else {
      const account_id = readlineSync.question("AWS Account ID: ")
      const region = readlineSync.question("Region: ")
      const project = readlineSync.question("Project: ")
      const stage = readlineSync.question("Stage: ")
      const stack = readlineSync.question("Stack: ")
      const output = Mustache.render(template, {
        project, stage, stack_name: stack, stack_short_name: stack.substring(0, 6), account_id, region
      })
      fs.writeFileSync(`./output/sst_update_stack_${project}_${stage}_${stack}.json`, output)
    }
    break
  }
}

