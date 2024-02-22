{
    const { ls, isFile } = require("./modules/file");
    const { loadModule } = require("./modules/load");

    ls("./modules", isFile).forEach(loadModule.bind(global));
}
