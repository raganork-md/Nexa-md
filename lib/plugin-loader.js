'use strict';

const fs = require('fs');
const path = require('path');

class PluginLoader {
    constructor(pluginsDir) {
        this.pluginsDir = pluginsDir;
        this.plugins = {};
    }

    loadPlugins() {
        const pluginFiles = fs.readdirSync(this.pluginsDir);
        pluginFiles.forEach(file => {
            const pluginPath = path.join(this.pluginsDir, file);
            const plugin = require(pluginPath);
            this.plugins[plugin.pattern] = plugin.execute;
        });
    }

    executePlugin(message) {
        for (const pattern in this.plugins) {
            if (new RegExp(pattern).test(message)) {
                return this.plugins[pattern](message);
            }
        }
        return null;
    }
}

module.exports = PluginLoader;
