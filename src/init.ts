import * as fs from 'fs'
import { join } from 'path'
import * as process from 'process'
import * as Shell from 'shelljs'
import { dclone } from 'dclone'

const { red, green } = require('chalk')
const prompts = require('prompts')
const minimist = require('minimist')

const logRed = (str: string) => {
  console.log(red(str))
}

const logGreen = (str: string) => {
  console.log(green(str))
}

interface ITemplateMap {
  [key: string]: string | undefined
}

const init = async () => {
  // 获取参数
  const argv = minimist(process.argv.slice(2))
  const targetDir = argv._[0]
  const cwd = process.cwd()

  if (!targetDir) {
    logRed('未指定项目名称 请使用格式 npm init mpc-app')
    return
  }

  const templateMap: ITemplateMap = {
    'rollup-mpc': 'https://github.com/doujianyu/mini-package-cli/tree/main/example/rollup-mpc'
  }

  if (fs.existsSync(targetDir)) {
    logRed(`${targetDir}文件夹已存在，请先删除`)
    return
  }

  let template = argv.template

  if (!template) {
    const answers = await prompts(
      {
        type: 'select',
        name: 'template',
        message: 'Select a framework:',
        choices: [
          { title: 'rollup-mpc', value: 'rollup-mpc' }
        ]
      },
      {
        onCancel: () => {
          red('退出选择')
          process.exit(0)
        }
      }
    )
    
    template = answers.template
  }

  logGreen(`${template} 应用创建中...`)

  const dir = templateMap[template]

  if (!dir) {
    logRed('请选择使用的模板')
    return
  }

  await dclone({
    dir
  })

  console.log(cwd)
  console.log(`${join(cwd, `./example/${template}`)}`)
  console.log(`${join(cwd, `./${targetDir}`)}`)
  
  Shell.cp('-r', `${join(cwd, `./example/${template}`)}`, `${join(cwd, `./${targetDir}`)}`)
  Shell.rm('-rf', `${join(cwd, './example')}`)

  logGreen(`${template} 应用创建完成`)

  console.log(`  cd ${targetDir}`)
  console.log('  npm install (or `yarn`)')
  console.log('  npm run dev (or `yarn dev`)')
  console.log()
}

export {
  init
}
