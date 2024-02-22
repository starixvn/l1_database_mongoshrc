{
    const { ls } = require("./modules/file");
    const { loadModule } = require("./modules/load");
    const { setVerbose } = require("./modules/log");

    setVerbose("debug");
    ls("./modules").forEach(loadModule.bind(global));
    setVerbose("info");
}
{
    if (global.connectionStrings) {
        global.attach(global.connectionStrings);
    }
}
