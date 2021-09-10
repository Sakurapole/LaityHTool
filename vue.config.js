module.exports = {
    pluginsOptions: {
        electronBuilder: {
            builderOptions: {
                nsis: {
                    // 一键安装，如果设为true，nsis设置就无意义请直接删除 nsis 配置
                    oneClick: false,
                    // true全用户安装【目录为：C:\Program Files (x86)】，false安装到当前用户
                    perMachine: true,
                    // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                    allowElevation: true,
                    // 允许修改安装目录
                    allowToChangeInstallationDirectory: true,
                    // 创建桌面图标
                    createDesktopShortcut: true,
                    // 创建开始菜单图标
                    createStartMenuShortcut: true,
                    // 快捷方式的名称,默认为应用程序名称
                    // shortcutName: 'HX',
                    // 安装图标
                    installerIcon: './icons/icon.ico',
                    // 卸载图标
                    uninstallerIcon: './icons/icon.ico',
                    // 安装时头部图标
                    installerHeaderIcon: './icons/icon.ico',
                    // 配置 nsn 如修改默认安装目录
                    include: './installer.nsh'
                }
            }
        }
    }
}