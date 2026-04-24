const fs = require('fs');
const path = require('path');

class PluginLoader {
    constructor(bot) {
        this.bot = bot;
        this.plugins = [];
    }

    loadPlugins(pluginsDir) {
        const pluginFiles = fs.readdirSync(pluginsDir);
        pluginFiles.forEach(file => {
            const filePath = path.join(pluginsDir, file);
            if (fs.statSync(filePath).isFile() && filePath.endsWith('.js')) {
                const plugin = require(filePath);
                this.plugins.push(plugin);
                if (typeof plugin.register === 'function') {
                    plugin.register(this.bot);
                }
            }
        });
    }
}

module.exports = PluginLoader;