/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import tallyTasks from './tally'
import atemTasks from './atem'
import mixerTasks from './mixer'

/**
 * @type {Cypress.PluginConfig}
 */
const tasks = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on('task', {
    ...tallyTasks(config),
    ...atemTasks(config),
    ...mixerTasks(config)
  })
}

export default tasks